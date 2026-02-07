// ============================================================================
// ENVIRONMENT SETUP - Must be first!
// ============================================================================
const path = require("path");
const fs = require("fs");
// ============================================================================
// ELECTRON & APP IMPORTS
// ============================================================================
const { ipcMain } = require("electron");
const { net } = require("electron");
const { app, BrowserWindow, dialog } = require("electron/main");
const { Notification } = require("electron");
const session = require("electron").session;
let configPath = path.join(app.getPath("userData"), "config.json");

const bwipjs = require("bwip-js");

// ============================================================================
// CRITICAL: Create config file BEFORE importing db.js
// ============================================================================
function ensureConfigFile() {
  const dir = path.dirname(configPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const defaultConfig = {
    developer: "kartik",
    dbHost: "192.168.1.8",
    dbPort: 3306,
    dbUser: "student",
    dbPassword: "library123",
    dbName: "library_data",
    PASSWORD_PAPPER: "Library_secret_by_kartik_2025",
  };

  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(
      configPath,
      JSON.stringify(defaultConfig, null, 2),
      "utf-8",
    );
    return defaultConfig;
  }

  let existingConfig = {};

  try {
    existingConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  } catch {
    existingConfig = {};
  }

  if (!existingConfig.developer) {
    const upgradedConfig = {
      ...existingConfig,
      ...defaultConfig,
      developer: "kartik",
    };

    fs.writeFileSync(
      configPath,
      JSON.stringify(upgradedConfig, null, 2),
      "utf-8",
    );
  }

  return existingConfig;
}

// Create config file NOW, before db.js tries to read it
ensureConfigFile();
// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
// ============================================================================
// PROJECT IMPORTS (These can now safely use process.env)
// ============================================================================
const XLSX = require("@e965/xlsx");
const BookService = require("./Backend/service/bookService.js");
const StudentService = require("./Backend/service/studentService.js");
const UtilsService = require("./Backend/service/utilsService.js");
const authService = require("./Backend/service/authService.js");
const { store } = require("./Backend/models/Books/bookModel.js");
const validateUser = require("./Backend/auth.cjs");
const signUser = require("./Backend/signup.cjs");
const { title } = require("process");
// ============================================================================
// APPLICATION VARIABLES
// ============================================================================

let navigationHistory;
let All_Book_Data;
let win;
let connection;
let AuthToken;
const bookService = new BookService();
const studentService = new StudentService();
const utilsService = new UtilsService();
//ensureConfigFile();
const createWindow = () => {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    icon: path.join(__dirname, "Assets/icon.ico"),
    titleBarStyle: "hidden",
    ...(process.platform !== "darwin" ? { titleBarOverlay: true } : {}),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "Backend/preload.js"),
      // devTools: false,
    },
  });

  win.loadFile("./frontend/html/login.html");

  win.once("ready-to-show", () => {
    win.show();
  });

  win.setMenuBarVisibility(false);

  // win.webContents.on("devtools-opened", () => {
  //   win.webContents.closeDevTools();
  // });

  win.webContents.on("context-menu", (e) => {
    e.preventDefault();
  });

  navigationHistory = win.webContents;
};

app
  .whenReady()
  .then(() => {
    connection = require("./Backend/models/db"); // Now process.env is available!

    createWindow();
    // Spell checker disabled - language codes not supported
    session.defaultSession.setSpellCheckerLanguages(["en-US", "hi-IN"]);
  })

  .catch((err) => {
    console.log("Failed to create window:", err);
  });

//generate the Barcode for the all books barcode stores only the accession number
async function getLabel(accession_no) {
  const label = await bwipjs.toBuffer({
    bcid: "code128",
    text: String(accession_no),
    scale: 3,
    height: 12,
    includetext: true,
    textxalign: "center",
    backgroundcolor: "FFFFFF",
  });
  return label;
}

ipcMain.handle("generate-label", async (event, accession_no, title) => {
  const label = await getLabel(accession_no);
  if (label) {
    try {
      connection.query("UPDATE books SET label = ? WHERE accession_no = ?", [
        label.toString("base64"),
        accession_no,
      ]);
      return {
        success: true,
      };
    } catch (error) {
      console.log(error);
    }
  }
  return {
    success: false,
  };
});

ipcMain.handle("view-label", async (event, accession_no) => {
  const label = await getLabel(accession_no);
  if (label) {
    return {
      success: true,
      label: label.toString("base64"),
    };
  }
  return {
    success: false,
    message: "Failed to generate label",
  };
});

//Function to save the Label on Disk
async function saveLabelOnDisk(barcode, accession_no, title) {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: "Save Book Label",
    defaultPath: path.join(
      app.getPath("documents"),
      `BOOK_LABEL_${title}_${accession_no}.png`,
    ),
    filters: [{ name: "PNG Image", extensions: ["png"] }],
  });

  if (canceled || !filePath) return false;

  const buffer = Buffer.from(barcode, "base64");
  fs.writeFileSync(filePath, buffer);

  return true;
}

// Upload Books from the Excel file
ipcMain.handle("show-dialog-for-excel", async (event) => {
  //Opening the Dialogue Box to select the Excel file
  return handleGlobalError(async () => {
    const file_path = dialog.showOpenDialogSync({
      properties: ["openFile"],
      filters: [{ name: "Excel Files", extensions: ["xlsx"] }],
    });

    // Handle user cancellation
    if (!file_path || file_path.length === 0) {
      return {
        success: false,
        cancelled: true,
      };
    }

    //Reading the Excel file
    const workbook = XLSX.readFile(file_path[0]);
    const sheetname = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetname];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const requiredColumns = [
      "PAGES",
      "ACCESSION NO",
      "EDITION",
      "PUB YEAR",
      "PUB LOCATION",
      "PUBLISHER",
      "AUTHOR I",
      "LANGUAGE CODE",
      "PURCHASE DATE",
      "TITLE",
    ];
    // Map rows to include only those columns
    const filteredRows = data.map((row) => {
      let selected = {};
      requiredColumns.forEach((col) => {
        selected[col] = row[col] ?? null; // null if missing
      });
      return selected;
    });
    //maping the department to the required format
    const deptMap = {
      CO: "CO",
      COMPUTER: "CO",
      EE: "EE",
      ELECTRICAL: "EE",
      ME: "ME",
      MECHANICAL: "ME",
      AUTO: "AUTO",
      AUTOMOBILE: "AUTO",
      AI: "AI",
      IT: "IT",
      CIVIL: "CIVIL",
      DDGM: "DDGM",
      ELE: "ELE",
      ELECTRONICS: "ELE",
    };
    //Mapping the data to the required format
    const values = data.map((r) => {
      const d = (r["Department"] || "").toString().trim().toUpperCase();
      const finalDept = deptMap[d] || "NOT PRESENT";

      return [
        r["ACCESSION NO"] || null,
        r["TITLE"] || null,
        r["AUTHOR I"] || null,
        r["EDITION"] || 1,
        r["PUBLISHER"] || null,
        r["PUB LOCATION"] || null,
        r["PAGES"] || null,
        r["LANGUAGE CODE"] || null,
        r["BillNo"] || "NOT PRESENT",
        r["Bill_date"] || null,
        finalDept,
        r["PURCHASE DATE"] || null,
        r["Cost in Rupees"] || 0,
        r["Location"] || null,
        r["Total_copies"] || 1,
        r["Available_copies"] || 1,
      ];
    });
    //Inserting the data into the database
    let q = `
INSERT INTO books (
\`Accession_no\`,
\`Title\`,
\`Author\`,
\`Edition\`,
\`Publisher\`,
\`Pub_location\`,
\`Pages\`,
\`Language_code\`,
\`Bill_no\`,
\`Bill_date\`,
\`Department\`,
\`Purchase_Date\`,
\`Cost\`,
\`Location\`,
\`Total_copies\`,
\`Available_copies\`
) VALUES ?
ON DUPLICATE KEY UPDATE
\`Title\` = VALUES(\`Title\`),
\`Author\` = VALUES(\`Author\`),
\`Edition\` = VALUES(\`Edition\`),
\`Publisher\` = VALUES(\`Publisher\`),
\`Pub_location\` = VALUES(\`Pub_location\`),
\`Pages\` = VALUES(\`Pages\`),
\`Language_code\` = VALUES(\`Language_code\`),
\`Bill_no\` = VALUES(\`Bill_no\`),
\`Bill_date\` = VALUES(\`Bill_date\`),
\`Department\` = VALUES(\`Department\`),
\`Purchase_Date\` = VALUES(\`Purchase_Date\`),
\`Cost\` = VALUES(\`Cost\`),
\`Location\` = VALUES(\`Location\`),
\`Total_copies\` = VALUES(\`Total_copies\`),
\`Available_copies\` = VALUES(\`Available_copies\`)
`;
    //Inserting the data into the database in batches of 200
    const batchSize = 200;
    let processedCount = 0;
    let actualInsertedCount = 0;
    //Sending the progress to the renderer process
    event.sender.send("upload-progress", {
      status: "Inserting records into database...",
      progress: 20,
      total: values.length,
    });
    //Inserting the data into the database in batches of 200
    for (let i = 0; i < values.length; i += batchSize) {
      const chunk = values.slice(i, i + batchSize);
      //Inserting the data into the database in batches of 200
      await new Promise((resolve, reject) => {
        connection.query(q, [chunk], (err, res) => {
          if (err) return reject(err);

          // Track actual inserted rows vs skipped duplicates
          actualInsertedCount += res.affectedRows;
          processedCount += chunk.length;
          const skippedCount = processedCount - actualInsertedCount;

          // Send progress update
          const progressPercent = 20 + (processedCount / values.length) * 70; // 20-90%
          event.sender.send("upload-progress", {
            status: `Processing: ${processedCount}/${values.length} (${actualInsertedCount} inserted, ${skippedCount} duplicates skipped)`,
            progress: Math.round(progressPercent),
            inserted: actualInsertedCount,
            skipped: skippedCount,
            total: values.length,
          });

          resolve(res);
        });
      });
    }
    //Sending the progress to the renderer process
    const skippedCount = processedCount - actualInsertedCount;

    event.sender.send("upload-progress", {
      status:
        skippedCount > 0
          ? `Complete! ${actualInsertedCount} inserted, ${skippedCount} duplicates skipped.`
          : "Upload complete!",
      progress: 100,
      inserted: actualInsertedCount,
      skipped: skippedCount,
      total: values.length,
    });

    return {
      success: true,
      recordsInserted: actualInsertedCount,
      recordsSkipped: skippedCount,
      totalRecords: values.length,
    };
  });
});

//upload Student From Excel File
ipcMain.handle("upload-student-from-excel", async (event) => {
  return handleGlobalError(async () => {
    //Opening the Dialog Box for Accepting the Ecel file from the User
    const file_path = dialog.showOpenDialogSync({
      properties: ["openFile"],
      filters: [{ name: "Excel File", extensions: ["xlsx"] }],
    });

    // Handle user cancellation
    if (!file_path || file_path.length === 0) {
      return {
        success: false,
        cancelled: true,
      };
    }

    //Reading the Excel file
    const workbook = XLSX.readFile(file_path[0]);
    const sheetname = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetname];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const requiredColumns = [
      "name",
      "enrollment_no",
      "Department",
      "year",
      "phone",
      "email",
    ];
    // Map rows to include only those columns
    const filteredRows = data.map((row) => {
      let selected = {};
      requiredColumns.forEach((col) => {
        selected[col] = row[col] ?? null; // null if missing
      });
      return selected;
    });

    //maping the department to the required format
    const deptMap = {
      CO: "CO",
      COMPUTER: "CO",
      EE: "EE",
      ELECTRICAL: "EE",
      ME: "ME",
      MECHANICAL: "ME",
      AUTO: "AUTO",
      AUTOMOBILE: "AUTO",
      AI: "AI",
      IT: "IT",
      CIVIL: "CIVIL",
      DDGM: "DDGM",
      ELE: "ELE",
      ELECTRONICS: "ELE",
    };

    //Mapping the data to the required format
    const values = data.map((r) => {
      const d = (r["Department"] || "").toString().trim().toUpperCase();
      const finalDept = deptMap[d] || "NOT PRESENT";
      const ph = (r["phone"] || "").toString().trim();

      return [
        r["name"] || null,
        r["enrollment_no"] || null,
        finalDept,
        r["year"] || null,
        ph,
        r["email"] || null,
      ];
    });
    //Inserting the data into the database
    let q = `
INSERT INTO students (
\`name\`,
\`enrollment_no\`,
\`Department\`,
\`year\`,
\`phone\`,
\`email\`
) VALUES ?
ON DUPLICATE KEY UPDATE
\`name\` = VALUES(\`name\`),
\`Department\` = VALUES(\`Department\`),
\`year\` = VALUES(\`year\`),
\`phone\` = VALUES(\`phone\`),
\`email\` = VALUES(\`email\`)`;

    const batchSize = 200;
    let processedCount = 0;
    let actualInsertedCount = 0;
    //Sending the progress to the renderer process
    event.sender.send("upload-progress", {
      status: "Inserting records into database...",
      progress: 20,
      total: values.length,
    });
    //Inserting the data into the database in batches of 200
    for (let i = 0; i < values.length; i += batchSize) {
      const chunk = values.slice(i, i + batchSize);
      //Inserting the data into the database in batches of 200
      await new Promise((resolve, reject) => {
        connection.query(q, [chunk], (err, res) => {
          if (err) return reject(err);

          // Track actual inserted rows vs skipped duplicates
          actualInsertedCount += res.affectedRows;
          processedCount += chunk.length;
          const skippedCount = processedCount - actualInsertedCount;

          // Send progress update
          const progressPercent = 20 + (processedCount / values.length) * 70; // 20-90%
          event.sender.send("upload-progress", {
            status: `Processing: ${processedCount}/${values.length} (${actualInsertedCount} inserted, ${skippedCount} duplicates skipped)`,
            progress: Math.round(progressPercent),
            inserted: actualInsertedCount,
            skipped: skippedCount,
            total: values.length,
          });

          resolve(res);
        });
      });
    }
    //Sending the progress to the renderer process
    const skippedCount = processedCount - actualInsertedCount;

    event.sender.send("upload-progress", {
      status:
        skippedCount > 0
          ? `Complete! ${actualInsertedCount} inserted, ${skippedCount} duplicates skipped.`
          : "Upload complete!",
      progress: 100,
      inserted: actualInsertedCount,
      skipped: skippedCount,
      total: values.length,
    });

    return {
      success: true,
      recordsInserted: actualInsertedCount,
      recordsSkipped: skippedCount,
      totalRecords: values.length,
    };
  });
});

ipcMain.handle("isBookExists", (event, acc_no) => {
  return handleGlobalError(async () => {
    return await bookService.isBookExists(acc_no);
  });
});

//=========================
//Export books

ipcMain.handle("export-books", async () => {
  return handleGlobalError(async () => {
    return await bookService.exportBooks();
  });
});
ipcMain.handle("AddBook", async (event, data) => {
  return handleGlobalError(async () => {
    return await bookService.AddBook(data, getToken());
  });
});

ipcMain.handle("get-total-books", async () => {
  return handleGlobalError(async () => {
    return await bookService.getTotalBooks();
  });
});

// here we will show only specific books only to the user
ipcMain.handle("see-total-books", async (e) => {
  return handleGlobalError(async () => {
    return await bookService.seeTotalBooks();
  });
});

ipcMain.handle("search-books", async (e, term) => {
  //query to get the like only searched data from the DB
  return handleGlobalError(async () => {
    return await bookService.searchBooks(term);
  });
});

ipcMain.handle("search-student", async (e, term) => {
  // try {

  return handleGlobalError(async () => {
    //executing the query to get the searched data
    return await studentService.searchStudent(term, getToken());
  });
});

ipcMain.handle("add-student", async (e, student) => {
  return handleGlobalError(async () => {
    return await studentService.addStudent(student, getToken());
  });
});

ipcMain.handle("get-students", async (e) => {
  let q = `select * from \`students\``;
  return handleGlobalError(async () => {
    //executing the query to get Students Data
    //using promise to handle the async function
    let stu_data = await new Promise((resolve, reject) => {
      connection.query(q, (err, result) => {
        if (err) reject(err);
        else resolve(JSON.parse(JSON.stringify(result)));
      });
    });
    return {
      success: true,
      data: stu_data,
    };
  });
  // catch (err) {
  //   return {
  //     success: false,
  //     error: err.message || "Failed to Get Student Data"
  //   }
  // }
});

//*******UPDATE STUDENT*********//
ipcMain.handle("update-student", async (event, student) => {
  return handleGlobalError(async () => {
    // Validate student data
    return await studentService.updateStudent(student, getToken());
  });
});

//=============================

//*******UPDATE BOOK ***** */
ipcMain.handle("update-book", async (event, book) => {
  return handleGlobalError(async () => {
    return await bookService.updateBook(book, getToken());
  });
});

//========================

//*******Delete BOOK Or Student*********//

ipcMain.handle("delete-book-or-student", async (event, book_id, stu_id) => {
  return handleGlobalError(async () => {
    return await studentService.deleteBookOrStudent(
      book_id,
      stu_id,
      getToken(),
    );
  });
});
//===================================

//*******ISSUE BOOKS*********//

ipcMain.handle("issue-book", async (event, issue_book) => {
  return handleGlobalError(async () => {
    console.log("Issue Book Data :::", issue_book);
    return await bookService.issueBook(issue_book, getToken());
  });
});

//*******GET STUDENT DATA for issue book form *********//

ipcMain.handle("get-student-data", async (event, ac_no) => {
  return handleGlobalError(async () => {
    return await studentService.getStudentData(ac_no, getToken());
  });
});

//*******GET ISSUED BOOKS*********//

ipcMain.handle("get-issued-books", async (event) => {
  //

  return handleGlobalError(async () => {
    return await bookService.getIssuedBooks(getToken());
  });
});

//************************************************************************ */

//*************CALCULATING THE FINE AMMOUNT ***************

ipcMain.handle("calculate-fine", async (event) => {
  return handleGlobalError(async () => {
    let q = `
      SELECT 
        ib.actual_return_date,
        ib.book_id,
        ib.student_id,
        b.Title as book_title,
        b.Accession_no as book_accession,
        s.name as student_name,
        s.enrollment_no as student_enrollment,
        s.Department as student_dept,
        s.year as student_year
      FROM issued_books ib
      INNER JOIN books b ON ib.book_id = b.id
      INNER JOIN students s ON ib.student_id = s.id
      WHERE ib.status = 'due' AND ib.returned_on IS NULL
    `;
    let curr_date = new Date();
    curr_date.setHours(0, 0, 0, 0);

    const due_books = await new Promise((resolve, reject) => {
      connection.query(q, (err, res) => {
        if (err) reject(err);
        else resolve(JSON.parse(JSON.stringify(res)));
      });
    });

    const dueBooks = due_books.map((book) => ({
      ...book,
      actual_return_date: new Date(book.actual_return_date),
    }));

    dueBooks.forEach((book) => {
      const diffInDays = Math.floor(
        (curr_date - book.actual_return_date) / (1000 * 60 * 60 * 24),
      );

      book.fine = diffInDays * 10;
      book.fineDays = diffInDays;
    });

    return {
      success: true,
      data: dueBooks,
    };
  });
});

//*********************************************************

//******* Handler For the Return Book Finding the Books Showing it in the Select Form *******/

ipcMain.handle("get-data-of-issued-book", async (event, data) => {
  return handleGlobalError(async () => {
    return await bookService.getDataOfIssuedBooks(data, getToken());
  });
});

//************ Getting the Data(title for the book) from the Accession Number ********** */
ipcMain.handle("get-title", async (event, ac_no) => {
  //
  //

  return await bookService.getBookTitle(ac_no, getToken());
});
//************************************************************** */

//*************** File Return Book Handler ***************/

ipcMain.handle("file-return", async (event, data) => {
  return handleGlobalError(async () => {
    return await bookService.fileReturnBook(data, getToken());
  });
});

//*******Handling the Global eror for the Database *********//
function normalizeDate(date) {
  date.setHours(0, 0, 0, 0);
  return date;
}
//*******Handling the Login *********/

ipcMain.handle("login", async (event, username, password) => {
  return handleGlobalError(async () => {
    let user = await authService.signin(username, password);
    console.log("user :::: ", user);
    if (user.success) {
      setToken(user.user.token);
      // win.loadFile("./frontend/html/index.html");
      await setStatus(net.isOnline(), username);
      store.set("current_user", username);
      return {
        success: true,
        message: user.message,
        role: user.role,
      };
    } else {
      return {
        success: false,
        error: user.message,
      };
    }
  });
});
//============================================
//*******Handling the Signup *********/
ipcMain.handle("signup", async (event, username, password) => {
  return handleGlobalError(async () => {
    let user = await signUser(username, password);

    if (user.success) {
      win.loadFile("./frontend/html/index.html");
      await setStatus(net.isOnline(), username);
      store.set("current_user", username);

      return {
        success: true,
        message: user.message,
        role: user.role,
      };
    } else {
      return {
        success: false,
        message: user.message,
      };
    }
  });
});

//============================================
async function handleGlobalError(operation) {
  try {
    // Check if connection is disconnected
    if (!connection || connection.state === "disconnected") {
      console.log("Database disconnected, attempting to reconnect...");

      // Wait for connection to establish using promise
      await new Promise((resolve, reject) => {
        connection.connect((err) => {
          if (err) {
            console.log("Failed to reconnect:", err.message);
            reject(err);
          } else {
            console.log("✅ Database reconnected successfully");
            resolve();
          }
        });
      });

      // Connection succeeded, retry the operation
      return await operation();
    }

    // Connection is already established, execute operation
    return await operation();
  } catch (err) {
    // Handle specific MySQL errors
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      return {
        success: false,
        error: "Database connection was lost. Please try again.",
      };
    } else if (err.code === "ECONNREFUSED") {
      return {
        success: false,
        error: "Cannot connect to database server. Please check your network.",
      };
    } else if (err.code === "ER_ACCESS_DENIED_ERROR") {
      return {
        success: false,
        error:
          "Database access denied. Please check credentials in config.json",
      };
    } else {
      console.log("Database error:", err);
      return {
        success: false,
        error: err.message || "Database operation failed",
      };
    }
  }
}

//============================================
app.on("second-instance", () => {
  if (win) {
    if (win.isMinimized()) {
      win.restore();
    }
    win.focus();
  }
});
async function setStatus(status, username) {
  return await utilsService.setStatus(status, username);
}

//Set Token Function This function stores the token in the variable so
//that it can be used in the API requests
// Using this approach we can avoid the use of the local storage
// so that the token will not be leaked
function setToken(token) {
  if (token) {
    AuthToken = token;
  }
}

//Get Token Function This function returns the token
function getToken() {
  return AuthToken;
}

app.on("window-all-closed", async () => {
  // Set user status to offline before quitting
  const currentUser = store.get("current_user");

  if (currentUser) {
    await setStatus(false, currentUser);
  }

  store.clear();

  // Quit the app (except on macOS where apps stay open)
  if (process.platform !== "darwin") {
    app.quit();
  }
});
//==================================================
