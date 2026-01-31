const pool = require("../Config/dbConfig");
class BooksModel {
  //get all books from the Database
  getBooks = async () => {
    const q = "SELECT * FROM books";
    const [rows] = await pool.query(q);
    return rows;
  };

  // API to get the title of the book from the Book Accession Number
  // Call this API Also When the Book is issuing to get the Title of the Books
  getTitle = async (acc_no) => {
    const q = `SELECT Title, Available_copies,id FROM \`books\` WHERE Accession_no = ?`;

    const [data] = await pool.query(q, [acc_no]);
    return data;
  };

  // API for the Total Books Present In the Database
  getTotalBooksCount = async () => {
    let q = "SELECT COUNT(*) AS total FROM books";
    const data = await pool.query(q);
    console.log("Data", data);
    return data[0];
  };

  //This is to get the Total Issued Books Count only where the status is issued or due
  getTotalIssuedBooksCount = async () => {
    const q = `SELECT COUNT(*) AS issued_books FROM issued_books where status = 'issued' OR status ='due'`;
    const data = await pool.query(q);
    return data[0];
  };

  //This is to get the All Time Issued Books Count
  getAllIssuedCount = async () => {
    const q = "SELECT COUNT(*) AS all_time_issue FROM issued_books";
    const data = await pool.query(q);
    return data[0];
  };

  //this is to add the Book
  addBook = async (data) => {
    console.log("data", data);

    // First, check if book with same Accession_no already exists
    const checkQuery = `SELECT id, Title FROM books WHERE Accession_no = ?`;
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

    const result = await pool.query(checkQuery, [data.Accession_no]);

    //checking if the book already exists or not if not execute the else block
    if (result[0].length) {
      return {
        success: false,
        message: "Books Already Exists",
      };
    } else {
      const res = await pool.query(insertQuery, newData);
      //check whether the error comes in record insertion or not
      if (res[0].length) {
        return {
          success: false,
          message: "Insert Error In DB",
        };
      }
      // if any error does not comes then execute the else block and send the response of the true to the client
      else {
        return {
          success: true,
          message: "Books Added SuccessFully",
        };
      }
    }
  };

  //this function is for the Updating the Book
  updateBook = async (book) => {
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

    const newData = [
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
      const result = await pool.query(q, newData);
      return {
        success: true,
        message: "Book Updated Successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: "Update Error In DB",
      };
    }
  };
  //this Function For the Checking the Whether the Book exists or not used in the While
  //Adding the Book To check for its existance
  isBookExists = async (acc_no) => {
    let q = `SELECT * FROM books where Accession_no =?`;
    try {
      const [book] = await pool.query(q, [acc_no]);
      console.log("Data In Model Book ::", book);

      return {
        book: book[0],
      };
    } catch (error) {
      console.log("Error In isBookExists", error);
      return {
        success: false,
        message: "Internal Server Error",
      };
    }
  };

  //this function is for the Returning the Book Back to the Librarian
  fileReturnBook = async (acc_no, book_id, stu_id) => {
    let q = `UPDATE \`books\` SET Available_copies = Available_copies + 1 WHERE Accession_no = ?`;
    let q2 = `UPDATE issued_books SET status = 'returned', returned_on = CURDATE() WHERE book_id = ? AND student_id = ? AND (status='due' OR status='issued') LIMIT 1`;

    console.log("Book Id , Stu_id ", book_id, stu_id);
    try {
      //const [updated] = await pool.query(q, [acc_no]);
      const [returned] = await pool.query(q2, [book_id, stu_id]);
      console.log("Returnd", returned);
      if (returned.affectedRows == 0) {
        return {
          success: false,
          message: "No Issued Record Found For Book",
        };
      } else {
        await pool.query(q, [acc_no]);
        return {
          success: true,
        };
      }
      console.log("updated:;", updated);
      console.log("returned", returned);
    } catch (error) {
      console.log("Error In the isBookExists Model ", error);
      return {
        success: false,
        message: "Error fileReturnBook",
      };
    }
  };

  //This AFunction for the Issue Book to the Student
  // Based On the Accession Number And Roll No of the Student And Book
  issueBook = async (
    book_id,
    stu_id,
    available_copies,
    issue_date,
    actual_return_date,
  ) => {
    let q = `INSERT INTO \`issued_books\` (book_id,student_id,issue_date,actual_return_date) VALUES (?,?,?,?)`;
    let q2 = `UPDATE \`books\` SET Available_copies = Available_copies - 1 WHERE id = ?`;

    try {
      const [bookIssue] = await pool.query(q, [
        book_id,
        stu_id,
        issue_date,
        actual_return_date,
      ]);
      if (bookIssue.length == 0) {
        return {
          success: false,
          message: "Falied To Issue Book",
        };
      } else {
        const [result] = await pool.query(q2, [book_id]);

        return {
          success: true,
        };
      }
    } catch (error) {
      console.log("Error In Issue Book ", error);
      return {
        success: false,
        message: error.message || "Error In Issue Book Model",
      };
    }
  };

  //get all the issued book data to show on the return page in table form 
  //to show only the issued or the due books
  //this is also used for the return page where the librarian enters the accession number and auto fills the data 
  getAllIssuedBooks = async () =>{
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
WHERE ib.status IN ('issued', 'due')`;
    try {
      const [issuedBooks] = await pool.query(q);
      console.log("Issued Books (due/issued)",issuedBooks);
      console.log("Issued Books (due/issued)",issuedBooks.length);
      if(issuedBooks.length == 0){
        return {
          success: true,
          count:issuedBooks.length,
          message:"No Issued Books Found"
        };
      }
      return {
        success: true,
        issuedBooks,
        count : issuedBooks.length
      };
    } catch (error) {
      console.log("Error In the getAllissuedBooks Model " , error)
      return{
        success:false
      }
      
    }
  }

  //this Function is for getting the data to auto fill the fields in the return book page
  // where the librarian just need to enter the Accession Number And the Data Will Be Auto-filled 
  getDataOfIssuedBooks = async (acc_no) =>{
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
WHERE ib.status IN ('issued', 'due') AND b.Accession_no = ?`;
    try {
      const [issuedBooks] = await pool.query(q, [acc_no]);
      console.log("Issued Books (due/issued)",issuedBooks);
      console.log("Issued Books (due/issued)",issuedBooks.length);
      if(issuedBooks.length == 0){
        return {
          success: true,
          message:"No Issued Books Found"
        };
      }
      return {
        success: true,
        issuedBooks,
      };
    } catch (error) {
      console.log("Error In the getDataOfIssuedBooks Model " , error)
      return{
        success:false
      }
      
    }
  }

  //API for searching books by term
  searchBooks = async (term) => {
    const q = `SELECT * FROM \`books\` WHERE \`Title\` LIKE ? OR \`Author\` LIKE ? OR \`Accession_no\` LIKE ? OR \`Department\` LIKE ? OR \`Publisher\` LIKE ? OR \`Language_code\` LIKE ? OR \`Edition\` LIKE ? LIMIT 600`;
    const search = `%${term}%`;

    try {
      const [books] = await pool.query(q, [search, search, search, search, search, search, search]);
      
      if (books.length > 0) {
        return {
          success: true,
          data: books,
          count: books.length
        };
      } else {
        return {
          success: false,
          message: "No books found",
        };
      }
    } catch (error) {
      console.log("Error In searchBooks Model", error);
      return {
        success: false,
        message: "Error searching books",
      };
    }
  };
}
module.exports = { BooksModel };
