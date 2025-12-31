require("dotenv").config();
const { ipcMain } = require("electron");
const { app, BrowserWindow, dialog } = require("electron/main");
const XLSX = require("@e965/xlsx");
const path = require("path");

const connection = require("./Backend/models/db");
const validateUser = require("./Backend/auth.cjs");
const signUser = require("./Backend/signup.cjs");
const { resolve } = require("dns");
const { rejects } = require("assert");
// const { rejects } = require('assert');
// const { error } = require('console');
let All_Book_Data;
let win;
const createWindow = () => {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "Backend/preload.js"),
    },
  });

  win.loadFile("./frontend/html/login.html");

  win.once("ready-to-show", () => {
    win.show();
  });

  win.setMenuBarVisibility(false);
};

app
  .whenReady()
  .then(() => {
    createWindow();
    // calculateFine();

    // try {
    //   let q = `SELECT * FROM books`;
    //   All_Book_Data = await new Promise((resolve, reject) => {
    //     connection.query(q, (err, result) => {
    //       if (err) return reject(err);
    //       return resolve(JSON.parse(JSON.stringify(result)));
    //     })
    //   })
    //   console.log(":::All Book Data Promise:::", All_Book_Data.then((books) => console.log("Got All Books", books.length)));
    // } catch {
    //   console.log(":::All Book Data Promise:::", All_Book_Data);
    //   console.log("❌erroe occurred");

    // }
  })
  .catch((err) => {
    console.log(err);
  });

// Upload Books from the Excel file

ipcMain.handle("show-dialog-for-excel", async (event) => {
  //Opening the Dialogue Box to select the Excel file
  ///try {
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
    // console.log(data);

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
INSERT IGNORE INTO books (
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

    console.log(
      `Successfully inserted ${actualInsertedCount} records. Skipped ${skippedCount} duplicates.`
    );

    return {
      success: true,
      recordsInserted: actualInsertedCount,
      recordsSkipped: skippedCount,
      totalRecords: values.length,
    };
  });
  // //}
  // catch (error) {
  //   console.error('Error during Excel upload:', error);
  //   event.sender.send('upload-error', {
  //     message: error.message || 'Unknown error occurred'
  //   });
  //   return {
  //     success: false,
  //     error: error.message || 'Unknown error occurred'
  //   };
  // }
});

ipcMain.handle("AddBook", async (_event, data) => {
  return handleGlobalError(async () => {
    const q = `INSERT INTO books (
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
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    // console.log("Main process - Adding book:");
    // console.log(data);

    const newData = Object.values(data);

    // Wrap query in a Promise to properly handle async operation
    return await new Promise((resolve, reject) => {
      connection.query(q, newData, (err, res) => {
        if (err) {
          console.error("Database error:", err);
          reject(err);
        } else {
          console.log("1 record inserted successfully");
          resolve({
            success: true,
            message: "Book added successfully",
            insertId: res.insertId,
          });
        }
      });
    });
  });
});
ipcMain.handle("get-total-books", async () => {
  // try {
  // const fineData = await calculateFine();
  return handleGlobalError(async () => {
    // let overdue_books_count = await calculateFine();
    const q = `SELECT COUNT(*) AS total FROM books`;
    const q2 = `SELECT COUNT(*) AS issued_books FROM issued_books`;

    const total = await new Promise((resolve, reject) => {
      connection.query(q, (err, results) => {
        if (err) return reject(err);

        resolve(results[0].total); // Extract number
      });
    });
    console.log("TOTAL:::", total);
    const issue = await new Promise((resolve, reject) => {
      connection.query(q2, (err, results) => {
        if (err) return reject(err);
        resolve(results[0].issued_books); // Extract number
      });
    });
    const student = await new Promise((resolve, reject) => {
      connection.query(
        `SELECT COUNT(*) AS total_students FROM students`,
        (err, results) => {
          if (err) return reject(err);
          resolve(results[0].total_students);
        }
      );
    });
    console.log("STUDENT:::", student);

    const due = await new Promise((resolve, reject) => {
      connection.query(
        `SELECT COUNT(status) AS due FROM issued_books WHERE status =\'due\'`,
        (err, results) => {
          if (err) return reject(err);
          resolve(results[0].due);
        }
      );
    });
    console.log("DUE:::", due);

    if (total !== undefined || issue !== undefined || student !== undefined) {
      return {
        success: true,
        total_books: total,
        issue_books: issue,
        total_students: student,
        due: due,
      };
    } else {
      return {
        success: false,
        error: "Failed to get Data",
      };
    }
  });
  // console.log(error);

  // } catch (error) {
  //   console.error("Error in get-total-books handler:", error);
  //   return {
  //     success: false,
  //     error: "Failed To Get Data"
  //   };
  // }
});

// here we will show only specific books only to the user
ipcMain.handle("see-total-books", async (e) => {
  //try {
  return handleGlobalError(async () => {
    // Query for limited books display (first 50)
    // const limitedQuery = `SELECT id, Accession_no, Title, Author, Edition, Pages, Language_code, Department, Cost, Location, Available_copies FROM \`books\` WHERE id <= 50`;

    // Query for ALL books
    const allBooksQuery = `SELECT * FROM \`books\``;
    // if (0) {

    //   // Execute both queries
    //   const specific_book = await new Promise((resolve, reject) => {
    //     connection.query(limitedQuery, (err, result) => {
    //       if (err) {
    //         console.error("Database error in see-total-books (limited):", err);
    //         return reject(err);
    //       }
    //       resolve(JSON.parse(JSON.stringify(result)));
    //     });
    //   });
    // }

    const all_books = await new Promise((resolve, reject) => {
      connection.query(allBooksQuery, (err, result) => {
        if (err) {
          console.error("Database error in see-total-books (all):", err);
          return reject(err);
        }
        resolve(JSON.parse(JSON.stringify(result)));
      });
    });

    // console.log(`${all_books.length} total books`);

    return {
      success: true,
      All_books: all_books,
      totalCount: all_books.length,
    };
  }); // catch (error) {
  //   console.error("Error in see-total-books handler:", error);
  //   return {
  //     success: false,
  //     error: "Failed to get books"
  //   };
  // }
});

ipcMain.handle("search-books", async (e, term) => {
  //query to get the like only searched data from the DB

  return handleGlobalError(async () => {
    let q = `select * from \`books\` where Title LIKE ? OR Author LIKE ? OR Accession_no LIKE ? OR Department LIKE ? OR Publisher LIKE ? OR Language_code LIKE ? OR Edition LIKE ?  LIMIT 600 `;
    const search = `%${term}%`;
    // try {

    //executing the query to get the searched data
    let found_data = await new Promise((resolve, reject) => {
      connection.query(
        q,
        [search, search, search, search, search, search, search],
        (err, result) => {
          if (err) reject(err);
          else resolve(JSON.parse(JSON.stringify(result)));
        }
      );
    });
    // if data found then return it else return error
    if (found_data.length > 0) {
      return {
        success: true,
        data: found_data,
      };
    } else {
      return {
        success: false,
        error: "No data found",
      };
    }
  });

  // catch (err) {
  //   console.log("Error in Search Book ", err);
  //   return {
  //     success: false,
  //     error: err.message || "Failed to search books"
  //   }
  // }
});

ipcMain.handle("search-student", async (e, term) => {
  console.log("Searching Student .............");
  console.log(term);
  //query to get the like only searched data from the DB
  let q = `select * from \`students\` where name LIKE ? OR enrollment_no LIKE ? OR year LIKE ? OR department LIKE ? OR email LIKE ? OR phone LIKE ?  LIMIT 600 `;
  const search = `%${term}%`;
  // try {

  return handleGlobalError(async () => {
    //executing the query to get the searched data
    let found_data = await new Promise((resolve, reject) => {
      connection.query(
        q,
        [search, search, search, search, search, search],
        (err, result) => {
          if (err) reject(err);
          else resolve(JSON.parse(JSON.stringify(result)));
        }
      );
    });
    // if data found then return it else return error
    if (found_data.length > 0) {
      return {
        success: true,
        data: found_data,
      };
    } else {
      return {
        success: false,
        error: "No data found",
      };
    }
  });

  // catch (err) {
  //   console.log("Error in Search student ", err);
  //   return {
  //     success: false,
  //     error: err.message || "Failed to search books"
  //   }
  // }
});

ipcMain.handle("add-student", async (e, student) => {
  console.log("Adding Student .............");
  console.log(student);

  data = Object.values(student);

  // Fixed SQL syntax: VALUES needs parentheses around placeholders
  let q = `INSERT INTO \`students\` (name, enrollment_no, department, year, email, phone) VALUES (?,?,?,?,?,?)`;

  return handleGlobalError(async () => {
    console.log(data);
    console.log("******************************");
    let stu = await new Promise((resolve, reject) => {
      connection.query(q, data, (err, result) => {
        if (err) reject(err);
        else resolve(JSON.parse(JSON.stringify(result)));
      });
    });
    console.log("Student Inserted");
    return {
      success: true,
      message: "Student Added Successfully",
    };
  });
  // catch (err) {
  //   console.error("Error in add-student:", err);
  //   return {
  //     success: false,
  //     error: "Failed to add student"
  //   }
  // }
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
  console.log("Updating student...", student);

  return handleGlobalError(async () => {
    // Validate student data
    if (!student.id) {
      return {
        success: false,
        error: "Student ID is required",
      };
    }

    const q = `UPDATE \`students\` SET 
      enrollment_no = ?,
      name = ?, 
      email = ?, 
      department = ?, 
      year = ?, 
      phone = ? 
      WHERE id = ?`;

    const data = [
      student.enrollment_no,
      student.name,
      student.email,
      student.department,
      student.year,
      student.phone,
      student.id,
    ];

    return await new Promise((resolve, reject) => {
      connection.query(q, data, (err, res) => {
        if (err) {
          console.error("Update student error:", err);
          reject(err);
        } else {
          if (res.affectedRows === 0) {
            resolve({
              success: false,
              error: "Student not found or no changes made",
            });
          } else {
            console.log("Student updated successfully");
            resolve({
              success: true,
              message: "Student updated successfully",
            });
          }
        }
      });
    });
  });
});

//=============================

//*******UPDATE BOOK ***** */
ipcMain.handle("update-book", async (event, book) => {
  console.log("Updating book...", book);

  return handleGlobalError(async () => {
    // Validate book ID
    if (!book.id) {
      return {
        success: false,
        error: "Book ID is required",
      };
    }

    const q = `UPDATE \`books\` SET 
      \`Accession_no\` = ?,
      \`Title\` = ?,
      \`Author\` = ?,
      \`Edition\` = ?,
      \`Publisher\` = ?,
      \`Pub_location\` = ?,
      \`Pages\` = ?,
      \`Language_code\` = ?,
      \`Bill_no\` = ?,
      \`Bill_date\` = ?,
      \`Department\` = ?,
      \`Purchase_Date\` = ?,
      \`Cost\` = ?,
      \`Location\` = ?,
      \`Total_copies\` = ?,
      \`Available_copies\` = ?
      WHERE \`id\` = ?`;

    const data = [
      book.Accession_no,
      book.Title,
      book.Author,
      book.Edition,
      book.Publisher,
      book.Pub_location,
      book.Pages,
      book.Language_code,
      book.Bill_no || "NOT PRESENT",
      book.Bill_date,
      book.Department,
      book.Purchase_Date,
      book.Cost,
      book.Location,
      book.Total_copies,
      book.Available_copies,
      book.id,
    ];

    return await new Promise((resolve, reject) => {
      connection.query(q, data, (err, res) => {
        if (err) {
          console.error("Update book error:", err);
          reject(err);
        } else {
          if (res.affectedRows === 0) {
            resolve({
              success: false,
              error: "Book not found or no changes made",
            });
          } else {
            console.log("Book updated successfully");
            resolve({
              success: true,
              message: "Book updated successfully",
            });
          }
        }
      });
    });
  });
});

//========================

//*******Delete BOOK Or Student*********//

ipcMain.handle('delete-book-or-student', async (event, book_id, stu_id) => {
  console.log(":::Book Data Recived in deleteBookOrStudent in Main.js File:::", book_id);
  console.log(":::Student Data Recived in deleteBookOrStudent in Main.js File:::", stu_id);
  let q = `DELETE FROM \`books\` WHERE id = ?`;
  if (stu_id) {
    q = `DELETE FROM \`students\` WHERE id = ?`;
    console.log("Inside Student Delete")
    return handleGlobalError(async () => {
      return await new Promise((resolve, reject) => {
        connection.query(q, [stu_id], (err, res) => {
          if (err) {
            console.error("Delete student error:", err);
            reject(err);
          } else {
            if (res.affectedRows === 0) {
              resolve({
                success: false,
                error: "Student not found or no changes made",
              });
            } else {
              console.log("Student Deleted successfully");
              resolve({
                success: true,
                message: "Student Deleted successfully",
              });
            }
          }
        })
      })
    })
  }
  return handleGlobalError(async () => {
    return await new Promise((resolve, reject) => {
      connection.query(q, [book_id], (err, res) => {
        if (err) {
          console.error("Delete book error:", err);
          reject(err);
        } else {
          if (res.affectedRows === 0) {
            resolve({
              success: false,
              error: "Book not found or no changes made",
            });
          } else {
            console.log("Book Deleted successfully");
            resolve({
              success: true,
              message: "Book Deleted successfully",
            });
          }
        }
      })
    })
  });
})


//===================================


//*******ISSUE BOOKS*********//

ipcMain.handle("issue-book", async (event, issue_book) => {
  console.log("Issue Book .............");
  console.log(issue_book);
  let q = `Select title,id from \`books\` WHERE accession_no = ?`;
  const term = `${issue_book.accession_no}`;
  let q2 = `Select name,year,id from \`students\` WHERE  enrollment_no = ?`;
  const term2 = `${issue_book.enrollment_no}`;
  console.log(
    `Select name,year,id from \`students\` WHERE  enrollment_no = ${issue_book.enrollment_no}`
  );

  return handleGlobalError(async () => {
    const book_data = await new Promise((resolve, reject) => {
      connection.query(q, [term], (err, res) => {
        if (err) reject(err);
        else resolve(JSON.parse(JSON.stringify(res)));
      });
    });
    console.log("Book Data :::", book_data);
    const stu_data = await new Promise((resolve, reject) => {
      connection.query(q2, [term2], (err, res) => {
        if (err) reject(err);
        else resolve(JSON.parse(JSON.stringify(res)));
      });
    });
    console.log("Student Data :::", stu_data);
    if (
      book_data.length === 0 ||
      stu_data.length === 0 ||
      !book_data ||
      !stu_data
    ) {
      return {
        success: false,
        error: "Book or Student not found",
      };
    }

    // Check available copies
    const availableCopies = await new Promise((resolve, reject) => {
      connection.query(
        `SELECT Available_copies FROM \`books\` WHERE id = ?`,
        [book_data[0].id],
        (err, res) => {
          if (err) reject(err);
          else resolve(JSON.parse(JSON.stringify(res)));
        }
      );
    });

    console.log("Available Copies :::", availableCopies);

    // Check if book has available copies
    if (
      !availableCopies ||
      availableCopies.length === 0 ||
      availableCopies[0].Available_copies <= 0
    ) {
      return {
        success: false,
        error: "No copies available for this book",
      };
    }

    // Insert into issued_books
    const BOOKISSUE = await new Promise((resolve, reject) => {
      connection.query(
        `INSERT INTO \`issued_books\` (book_id,student_id,issue_date,actual_return_date) VALUES (?,?,?,?)`,
        [
          book_data[0].id,
          stu_data[0].id,
          issue_book.issue_date,
          issue_book.return_date,
        ],
        (err, res) => {
          if (err) reject(err);
          else resolve(res);
        }
      );
    });

    // Decrement available copies
    await new Promise((resolve, reject) => {
      connection.query(
        `UPDATE \`books\` SET Available_copies = Available_copies - 1 WHERE id = ?`,
        [book_data[0].id],
        (err, res) => {
          if (err) reject(err);
          else resolve(res);
        }
      );
    });

    console.log("Book Issue :::", BOOKISSUE);

    console.log("Book Data :::", book_data);
    console.log("Student Data :::", stu_data);
    return {
      success: true,
      book_data: book_data,
      stu_data: stu_data,
    };
  });
  // catch (err) {
  //   console.log("Error in issue-book:", err);
  //   return {
  //     success: false,
  //     msg: err.message || "Error ::::"
  //   }
  // }
});
//*******GET STUDENT DATA for issue book form *********//

ipcMain.handle("get-student-data", async (event, ac_no) => {
  // console.log("::::Main Getting Student DATA::::");
  let q = `SELECT year , name  FROM \`students\` WHERE enrollment_no = ?`;
  const term = `${ac_no}`;
  return handleGlobalError(async () => {
    let stu_data = await new Promise((resolve, reject) => {
      connection.query(q, [term], (err, result) => {
        if (err) reject(err);
        else resolve(JSON.parse(JSON.stringify(result)));
      });
    });

    if (!stu_data || stu_data.length === 0) {
      return {
        success: false,
        error: "Student not found",
      };
    }
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

//*******GET ISSUED BOOKS*********//

ipcMain.handle("get-issued-books", async (event) => {
  // console.log("::::Main Getting Issued Books DATA::::");
  let q = `SELECT 
    ib.id,
    ib.issue_date,
    ib.actual_return_date,
    ib.status,
    b.Title as book_title,
    b.Accession_no,
    s.name as student_name,
    s.enrollment_no,
    s.Department as student_department,
    s.year as student_year
    FROM issued_books ib
    INNER JOIN books b ON ib.book_id = b.id
    INNER JOIN students s ON ib.student_id = s.id`;

  return handleGlobalError(async () => {
    //executing the query to get Students Data
    //using promise to handle the async function
    let issued_books_data = await new Promise((resolve, reject) => {
      connection.query(q, (err, result) => {
        if (err) reject(err);
        else resolve(JSON.parse(JSON.stringify(result)));
      });
    });
    // console.log("Issued Books Data :::", issued_books_data);
    return {
      success: true,
      data: issued_books_data,
    };
  });
  // catch (err) {
  //   return {
  //     success: false,
  //     error: err.message || "Failed to Get Issued Books Data"
  //   }
  // }
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
    console.log("Due Books::::\n", dueBooks);

    dueBooks.forEach((book) => {
      const diffInDays = Math.floor(
        (curr_date - book.actual_return_date) / (1000 * 60 * 60 * 24)
      );
      console.log("Fine::::\n", diffInDays);
      book.fine = diffInDays * 10;
      book.fineDays = diffInDays;
    });

    console.log("Due Books with Fine::::\n", dueBooks);
    return {
      success: true,
      data: dueBooks,
    };
  });
});

//*********************************************************

//******* Handler For the Return Book Finding the Books Showing it in the Select Form *******/

ipcMain.handle("get-data-of-issued-book", async (event, data) => {
  console.log("::::Main Getting Issued Books DATA::::");
  console.log("Data:::::\n", data);
  return handleGlobalError(async () => {
    let q = `
    SELECT 
      b.Title as book_title,
      b.id as book_id,
      s.name as stu_nm,
      s.year as stu_yr,
      s.Department as dept,
      s.enrollment_no as stu_enroll,
      s.id as student_id,
      ib.issue_date  ,
      ib.actual_return_date as ard,
      b.id as book_id
      FROM books b ,issued_books ib ,students s
      WHERE b.id = ib.book_id AND ib.student_id = s.id
      AND b.Accession_no = ? AND ib.status = 'issued'
      `;

    const booksData = await new Promise((resolve, reject) => {
      connection.query(q, [data], (err, res) => {
        if (err) reject(err);
        else resolve(JSON.parse(JSON.stringify(res)));
      });
    });

    if (!booksData || booksData.length == 0) {
      console.log("NO ISSUED BOOK FOUND");
      return {
        success: false,
        error: "No issued book found",
      };
    } else {
      console.log("BOOK FOUND ::: \n ", booksData);
      return {
        success: true,
        data: booksData,
      };
    }
  });
});

//************ Getting the Data(title for the book) from the Accession Number ********** */
ipcMain.handle("get-title", async (event, ac_no) => {
  // console.log("::::Main Getting Title DATA::::");
  // console.log("Data:::::\n", ac_no);
  console.log("Ac No::::", ac_no);
  let q = `SELECT Title , Available_copies from \`books\` WHERE Accession_no = ?`;
  return handleGlobalError(async () => {
    const title = await new Promise((resolve, reject) => {
      connection.query(q, [ac_no], (err, res) => {
        if (err) reject(err);
        else resolve(JSON.parse(JSON.stringify(res)));
      });
    });
    console.log("Title ::::", title);
    if (!title || title.length == 0) {
      console.log("NO BOOK With This Title");
      return {
        success: false,
        error: "NO BOOK With This Title",
      };
    } else {
      console.log("BOOK FOUND ::: \n ", title);
      return {
        success: true,
        data: title,
      };
    }
  });
});
//************************************************************** */
//**************************************************************

//*************** File Return Book Handler ***************/

ipcMain.handle("file-return", async (event, data) => {
  return handleGlobalError(async () => {
    let q = `UPDATE \`books\` SET Available_copies = Available_copies + 1 WHERE Accession_no = ?`;

    let q2 = `UPDATE \`issued_books\` SET status = 'returned', returned_on = CURDATE() WHERE book_id = ? AND student_id = ?`;
    console.log("Data::::\n", [data][0].ac_no);
    let up_data = Object.values(data);
    const books = await new Promise((resolve, reject) => {
      connection.query(q, [data][0].ac_no, (err, res) => {
        if (err) reject(err);
        else resolve(JSON.parse(JSON.stringify(res)));
      });
    });

    const issue_book = await new Promise((resolve, reject) => {
      connection.query(q2, [data.book_id, data.stu_id], (err, res) => {
        if (err) reject(err);
        else resolve(JSON.parse(JSON.stringify(res)));
      });
    });

    if (books.affectedRows === 0 || issue_book.affectedRows === 0) {
      return {
        success: false,
        error: "Failed to return book - no matching record found",
      };
    } else {
      return {
        success: true,
        message: "Book returned successfully",
      };
    }
  });
});

//*******Handling the Global eror for the Database *********//

async function handleGlobalError(operation) {
  try {
    //check if the connection is established or not
    // if not then return error
    if (!connection || connection.state === "disconnected") {
      connection.connect();
      return {
        success: false,
        error: "Database connection is not established trying to connect",
      };
    }

    //execute the operation if the connection is established
    return await operation();
  } catch (err) {
    console.log("DataBase Error::", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      return {
        success: false,
        error: "Database connection is lost",
      };
    } else if (err.code === "ECONNREFUSED") {
      return {
        success: false,
        error: "Cannot Connect to the Database",
      };
    } else {
      return {
        success: false,
        error: "Database connection is not established",
      };
    }
  }
}

function normalizeDate(date) {
  date.setHours(0, 0, 0, 0);
  return date;
}
//*******Handling the Login *********/

ipcMain.handle("login", async (event, username, password) => {
  return handleGlobalError(async () => {
    console.log(":::Login:::", username, password);
    let user = await validateUser(username, password);
    console.log(":::User:::", user);
    if (user.success) {
      console.log("", user.message);
      // win.loadFile("./frontend/html/index.html");
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
    console.log(":::Signup:::", username, password);
    let user = await signUser(username, password);
    console.log(":::User:::", user);
    if (user.success) {
      console.log("", user.message);
      win.loadFile("./frontend/html/index.html");
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

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
//==================================================
