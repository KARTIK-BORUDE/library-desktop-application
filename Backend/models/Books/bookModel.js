const connection = require("../db.js");
const XLSX = require("@e965/xlsx");
const dialog = require("electron").dialog;
const Store = require("electron-store");
// Use a different filename to avoid conflict with config.json
const store = new Store({ name: "app-data" });

class Book {
  /**
   * Get book title and available copies by accession number
   * @param {string} accessionNo - The accession number of the book
   * @returns {Promise<Object>} Response object with success status and data/error
   */
  //API Creation IS DONE
  async getTitle(accessionNo) {
    try {
      const query = `SELECT Title, Available_copies FROM \`books\` WHERE Accession_no = ?`;

      const result = await new Promise((resolve, reject) => {
        connection.query(query, [accessionNo], (err, res) => {
          if (err) {
            return reject(err);
          }
          resolve(JSON.parse(JSON.stringify(res)));
        });
      });

      // Check if book was found
      if (!result || result.length === 0) {
        return {
          success: false,
          error: `No book found with Accession Number: ${accessionNo}`,
        };
      }

      return {
        success: true,
        data: result[0], // Return single book object instead of array
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Database error occurred",
      };
    }
  }

  async getTotalBooks() {
    const q = `SELECT COUNT(*) AS total FROM books`;
    const q2 = `SELECT COUNT(*) AS issued_books FROM issued_books where status = 'issued' OR status ='due'`;
    const q4 = `SELECT COUNT(*) AS all_time_issue FROM issued_books`;
    const q3 = `SELECT COUNT(*) AS online FROM users where status = 1 AND role = 'student'`;
    try {
      const total = await new Promise((resolve, reject) => {
        connection.query(q, (err, results) => {
          if (err) return reject(err);

          resolve(results[0].total); // Extract number
        });
      });

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
          },
        );
      });

      const due = await new Promise((resolve, reject) => {
        connection.query(
          `SELECT COUNT(status) AS due FROM issued_books WHERE status =\'due\'`,
          (err, results) => {
            if (err) return reject(err);
            resolve(results[0].due);
          },
        );
      });
      const online_students = await new Promise((resolve, reject) => {
        connection.query(q3, (err, results) => {
          if (err) return reject(err);
          resolve(results[0].online);
        });
      });
      const all_time_issue = await new Promise((resolve, reject) => {
        connection.query(q4, (err, results) => {
          if (err) return reject(err);
          resolve(results[0].all_time_issue);
        });
      });

      if (
        total !== undefined ||
        issue !== undefined ||
        student !== undefined ||
        due !== undefined ||
        online_students !== undefined ||
        all_time_issue !== undefined
      ) {
        return {
          success: true,
          total_books: total,
          issue_books: issue,
          total_students: student,
          due: due,
          online_students: online_students,
          all_time_issue: all_time_issue,
        };
      } else {
        return {
          success: false,
          error: "Failed to get Data",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || "Database error occurred",
      };
    }
  }

  //API Creation IS DONE
  async AddBook(data) {
    try {
      // First, check if book with same Accession_no already exists
      const checkQuery = `SELECT id, Title FROM books WHERE Accession_no = ?`;

      const existingBook = await new Promise((resolve, reject) => {
        connection.query(checkQuery, [data.Accession_no], (err, res) => {
          if (err) reject(err);
          else resolve(res);
        });
      });

      // If book exists, return error with book details
      if (existingBook && existingBook.length > 0) {
        return {
          success: false,
          error: "Duplicate Book",
          message: `Book with Accession Number "${data.Accession_no}" already exists`,
          existingBook: {
            id: existingBook[0].id,
            title: existingBook[0].Title,
            accessionNo: data.Accession_no,
          },
        };
      }

      // If no duplicate, proceed with insert
      const insertQuery = `INSERT INTO books (
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

      // Convert empty date strings to null for optional date fields
      const newData = [
        data.Accession_no,
        data.Title,
        data.Author,
        data.Edition,
        data.Publisher,
        data.Pub_location,
        data.Pages,
        data.Language_code,
        data.Bill_no,
        data.Bill_date || null,
        data.Department,
        data.Purchase_Date || null,
        data.Cost,
        data.Location,
        data.Total_copies,
        data.Available_copies,
      ];

      return await new Promise((resolve, reject) => {
        connection.query(insertQuery, newData, (err, res) => {
          if (err) {
            // Handle duplicate key error if it still happens (race condition)
            if (err.code === "ER_DUP_ENTRY") {
              resolve({
                success: false,
                error: "Duplicate Book",
                message: `Book with Accession Number "${data.Accession_no}" was just added by another user`,
              });
            } else {
              reject(err);
            }
          } else {
            resolve({
              success: true,
              message: "Book added successfully",
              insertId: res.insertId,
            });
          }
        });
      });
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to add book",
      };
    }
  }

  async seeTotalBooks() {
    // Query for ALL books
    const allBooksQuery = `SELECT * FROM \`books\``;

    const all_books = await new Promise((resolve, reject) => {
      connection.query(allBooksQuery, (err, result) => {
        if (err) {
          console.error("Error fetching all books:", err);
          return reject(err);
        }
        resolve(JSON.parse(JSON.stringify(result)));
      });
    });

    //setting the total books data in local storage of the electron
    store.set("total_books", all_books);
    //

    return {
      success: true,
      All_books: all_books,
      totalCount: all_books.length,
    };
  }

  async exportBooks() {
    try {
      const all_books = store.get("total_books");

      // Validate data
      if (!all_books || all_books.length === 0) {
        return {
          success: false,
          error: "No books data found to export",
        };
      }

      // Create a new workbook and add the worksheet
      const worksheet = XLSX.utils.json_to_sheet(all_books);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Books Data");

      // Show save dialog
      const savePath = dialog.showSaveDialogSync({
        title: "Export Books",
        defaultPath: "Books_Data.xlsx",
        filters: [{ name: "Excel Files", extensions: ["xlsx"] }],
      });

      if (!savePath) {
        return {
          success: false,
          cancelled: true,
        };
      }

      try {
        // Write the file
        XLSX.writeFile(workbook, savePath);

        return {
          success: true,
          message: "Books exported successfully",
          filePath: savePath,
        };
      } catch (error) {
        return {
          success: false,
          error: error.message || "Failed to export books",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to export books",
      };
    }
  }

  //API Creation Is DONE
  async searchBooks(term) {
    //query to get the like only searched data from the DB
    let q = `select * from \`books\` where Title LIKE ? OR Author LIKE ? OR Accession_no LIKE ? OR Department LIKE ? OR Publisher LIKE ? OR Language_code LIKE ? OR Edition LIKE ?  LIMIT 600 `;
    const search = `%${term}%`;

    //executing the query to get the searched data
    let found_data = await new Promise((resolve, reject) => {
      connection.query(
        q,
        [search, search, search, search, search, search, search],
        (err, result) => {
          if (err) reject(err);
          else resolve(JSON.parse(JSON.stringify(result)));
        },
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
  }

  //API Creation IS DONE
  async updateBook(book) {
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
      book.Bill_date || null, // Convert empty string to NULL for optional date
      book.Department,
      book.Purchase_Date || null, // Convert empty string to NULL for optional date
      book.Cost,
      book.Location,
      book.Total_copies,
      book.Available_copies,
      book.id,
    ];
    try {
      return await new Promise((resolve, reject) => {
        connection.query(q, data, (err, res) => {
          if (err) {
            reject(err);
          } else {
            if (res.affectedRows === 0) {
              resolve({
                success: false,
                error: "Book not found or no changes made",
              });
            } else {
              resolve({
                success: true,
                message: "Book updated successfully",
              });
            }
          }
        });
      });
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to update data",
      };
    }
  }

  //API Creation IS DONE
  async issueBook(issue_book) {
    let q = `Select title,id from \`books\` WHERE accession_no = ?`;
    const term = `${issue_book.accession_no}`;
    let q2 = `Select name,year,id from \`students\` WHERE  enrollment_no = ?`;
    const term2 = `${issue_book.enrollment_no}`;

    try { 
      const book_data = await new Promise((resolve, reject) => {
        connection.query(q, [term], (err, res) => {
          if (err) reject(err);
          else resolve(JSON.parse(JSON.stringify(res)));
        });
      });

      const stu_data = await new Promise((resolve, reject) => {
        connection.query(q2, [term2], (err, res) => {
          if (err) reject(err);
          else resolve(JSON.parse(JSON.stringify(res)));
        });
      });

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
          },
        );
      });

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
          },
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
          },
        );
      });

      return {
        success: true,
        book_data: book_data,
        stu_data: stu_data,
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || "Error ::::",
      };
    }
  }

  //API Creation Is DONE 
  async getIssuedBooks() {
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
    INNER JOIN students s ON ib.student_id = s.id
    
`; //executing the query to get Students Data
    //using promise to handle the async function
    try {
      let issued_books_data = await new Promise((resolve, reject) => {
        connection.query(q, (err, result) => {
          if (err) reject(err);
          else resolve(JSON.parse(JSON.stringify(result)));
        });
      });
      //
      return {
        success: true,
        data: issued_books_data,
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || "Error ::::",
      };
    }
  }

  //API Creation Is DONE
  async getDataOfIssuedBooks(data) {
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
      AND b.Accession_no = ? AND (ib.status = 'issued' OR ib.status = 'due')
      `;

    try {
      const booksData = await new Promise((resolve, reject) => {
        connection.query(q, [data], (err, res) => {
          if (err) reject(err);
          else resolve(JSON.parse(JSON.stringify(res)));
        });
      });

      if (!booksData || booksData.length == 0) {
        return {
          success: false,
          error: "No issued book found",
        };
      } else {
        return {
          success: true,
          data: booksData,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || "Error ::::",
      };
    }
  }
  //API creation IS DONE
  async isBookExists(acc_no) {
    let q = `SELECT * FROM books where Accession_no =?`;
    try {
      let data = await new Promise((resolve, reject) => {
        connection.query(q, [acc_no], (err, res) => {
          if (err) reject(err);
          else resolve(JSON.parse(JSON.stringify(res)));
        });
      });

      if (data.length != 0) {
        return {
          success: true,
          data: data,
        };
      } else {
        return {
          success: false,
          error: "No book found",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to fetch data",
      };
    }
  }

  //Api Creation IS Done
  async fileReturnBook(data) {
    let q = `UPDATE \`books\` SET Available_copies = Available_copies + 1 WHERE Accession_no = ?`;

    let q2 = `UPDATE \`issued_books\` SET status = 'returned', returned_on = CURDATE() WHERE book_id = ? AND student_id = ?`;

    let up_data = Object.values(data);

    try {
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
    } catch (error) {
      return {
        success: false,
        error: error.message || "Error ::::",
      };
    }
  }
}

module.exports = { Book, store };
