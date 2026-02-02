const connection = require("../db.js");
const XLSX = require("@e965/xlsx");
const dialog = require("electron").dialog;
const Store = require("electron-store");
// Use a different filename to avoid conflict with config.json
const store = new Store({ name: "app-data" });
const axios = require("axios");
const { rectangularmicroqrcode } = require("bwip-js/node");

class Book {
  /**
   * Get book title and available copies by accession number
   * @param {string} accessionNo - The accession number of the book
   * @returns {Promise<Object>} Response object with success status and data/error
   */
  //API Creation And Implementation IS DONE
  // This Function is being called in the issue-book-page.js file at line 47
  async getTitle(acc_no){
    try{
    const {data} = await axios.get(`http://localhost:2150/books/getTitle/${acc_no}`);
    console.log(data);
    if(data.success){
      return{
        success:true,
        data:data.data
      }
    }
    return{
      success:false,
      message:data.message||"Falied To Get Title"
    }}
    catch(error){
      console.log("Error in getTitle", error);
      return {
          success: false,
          error: error.response?.data?.message || error.message || "Failed to get title",
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

  //API Creation And implementation Is Done
  //This Function is being called in the add-book-page.js file at line 112
  async  AddBook(data) {
    try{
      const response = await axios.post("http://localhost:2150/books/addBook", data);
      console.log("AddBook response", response.data);
      if(response.data.success){
        return {
            success: true,
            message: response.data.message||"Book added successfully",
          };
      }
      else{
        return {
            success: false,
            error: response.data.message || "Failed to add book",
          };
      }
      

    }catch(error) {
    console.log("Error in AddBook", error);
    return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to add book",
    };
}
  }

  //API Creation And implementation Is Done
  //This Function is being called in the books-page.js at line-129
  async seeTotalBooks(){
    try {
      const {data} = await axios.get("http://localhost:2150/books/getAllBooks");
      console.log("Books In in seeTotalBooks",data.success );
      if(data.success){
        return{
          success:true,
          data
        }
      }
    } catch (error) {
      console.log("Error In the seeTotalBooks",error)
      return{
        success:false,
        message:"Falied To Load Books",
      }
    }
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
  // async searchBooks(term) {
  //   //query to get the like only searched data from the DB
  //   let q = `select * from \`books\` where Title LIKE ? OR Author LIKE ? OR Accession_no LIKE ? OR Department LIKE ? OR Publisher LIKE ? OR Language_code LIKE ? OR Edition LIKE ?  LIMIT 600 `;
  //   const search = `%${term}%`;

  //   //executing the query to get the searched data
  //   let found_data = await new Promise((resolve, reject) => {
  //     connection.query(
  //       q,
  //       [search, search, search, search, search, search, search],
  //       (err, result) => {
  //         if (err) reject(err);
  //         else resolve(JSON.parse(JSON.stringify(result)));
  //       },
  //     );
  //   });
  //   // if data found then return it else return error
  //   if (found_data.length > 0) {
  //     return {
  //       success: true,
  //       data: found_data,
  //     };
  //   } else {
  //     return {
  //       success: false,
  //       error: "No data found",
  //     };
  //   }
  // }
  async searchBooks(term){
    try {
      const {data} = await axios.get(`http://localhost:2150/books/searchBooks?term=${term}`);
      console.log("Result ::",data);
      if(data.success){
        return{
          success:data.success,
          message:data.message,
          data:data.data
        }
      }
      return{
        success:data.success,
        message:data.message||"Falied To Search Book"
      }
      
    } catch (error) {
      console.log("Error In the searchBooks model " , error)
      return{
        success:false,
        message:error.message || "Falied To Search Book"
      }
      
    }
  }
  //API Creation And Implementation IS DONE
  //This Function is being called in the book-form.js file at line-47
  async updateBook(book){
    try {
      if(!book.id){
        return{
          success:false,
          message:"Book ID is required"
        }
      }
      const {data} = await axios.put("http://localhost:2150/books/updateBook",book);
      console.log("Result in the updateBook",data );
      if(data.success){
        return{
          success:data.success,
          message:data.message,
        }
      }

      return{
        success:data.success,
        message:data.message,
      }
    } catch (error) {
      console.log("Error In The updateBook Model ", error)
      return{
        success:false,
        message:error.message||"Falied To Update The Book"
      }
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

//API Creation And Implementation Is Done 
  async getIssuedBooks() {
    try {
      const result = await axios.get("http://localhost:2150/books/getAllIssuedBooks");
    
      if(result.data.data.success){
        return {
          success: true,
          data: result.data.data.issuedBooks,
        };
      }else{
        return {
          success: false,
          error: result.data.error,
        };
      }
    } catch (error) {
      console.log("Error in getIssuedBooks",error);
      return {
        success: false,
        error: error.message || "Error ::::",
      };
    }
}


  //API Creation And Implementation Is DONE
  async getDataOfIssuedBooks(accession_no){
    try {
      const result = await axios.get(`http://localhost:2150/books/getDataOfIssuedBooks/${accession_no}`)
      console.log("Result",result);
      if(result.data.data.success){
      return{
        success:true,
        issuedBooks:result.data.data.issuedBooks,
      }
      }
    
    } catch (error) {
      console.log("Error In the getDataOfIssuedBooks ::",error)
      return{
        success:false,
        message:error.message||"Error in API Of the getDataOfIssuedBooks"
      }
    }
  }

  //API creation And Implementation  IS DONE This Api Is being called when Adding the book 
  //so that it checks for whether the Book Exists or Not 
  //This Function is being called in the add-book-page.js at line-40
  async isBookExists(acc_no){
    try {
      const result = await axios.get(`http://localhost:2150/books/isBookExists/${acc_no}`);
      console.log("result in the IsBookExists Model ",result);

      if(result.data.success){
        return{
          success:true,
          data : result.data.book,
        }
      }
      return{
        success:result.data.success,
        message:result.data.message,
      }

    } catch (error) {
      console.log("Error In the isBookExists Model",error)
      return{
        success:false,
        message:"Failed To Check The Books Existance"
      }
    }
  }
  //Api Creation And Implementation IS Done
  async fileReturnBook(data) {
    try {
      console.log("data in the fileReturnBook Model ",data);
      const result = await axios.put("http://localhost:2150/books/fileReturn",data)
      console.log("result in the fileReturnBook Model ",result);
      if(result.data.data.success){
        return{
          success:true,
        }
      }
      return{
        success:result.data.data.success,
        message:result.data.data.message,
      }

    } catch (error) {
      console.log("Error In the fileReturnBook Model",error)
      return{
        success:false,
        message:"Failed To Return The Book"
      }
    }
    
  }

}

module.exports = { Book, store };
