
const axios = require("axios");

class Student {

//API implementation is Done
  async updateStudent(student) {
    if (!student) {
      return {
        success: false,
        error: "Student ID is required",
      };
    }
    if(!student.id){
      return {
        success: false,
        error: "Student ID is required",
      };
    }
    if(!student.enrollment_no){
      return {
        success: false,
        error: "Student ID is required",
      };
    }
    if(!student.name){
      return {
        success: false,
        error: "Student ID is required",
      };
    }
    if(!student.email){
      return {
        success: false,
        error: "Student ID is required",
      };
    }
    if(!student.department){
      return {
        success: false,
        error: "Student ID is required",
      };
    }
    if(!student.year){
      return {
        success: false,
        error: "Student ID is required",
      };
    }
    if(!student.phone){
      return {
        success: false,
        error: "Student ID is required",
      };
    }
    if(!student.id){
      return {
        success: false,
        error: "Student ID is required",
      };
    }



    const data = [
      student.enrollment_no,
      student.name,
      student.email,
      student.department,
      student.year,
      student.phone,
      student.id,
    ];

    try {
        const result = await axios.put("http://localhost:2150/api/student/update", data);
        return result.data;
    } catch (error) {
      return {
        success: false,
        error: error || "Failed to update student from Student Model",
      };
    }
  }

  async searchStudent(term) {
    if (!term) {
      return {
        success: false,
        error: "Student not found",
      };
    }

    //query to get the like only searched data from the DB
    let q = `select * from \`students\` where name LIKE ? OR enrollment_no LIKE ? OR year LIKE ? OR department LIKE ? OR email LIKE ? OR phone LIKE ?  LIMIT 600 `;
    const search = `%${term}%`;
    try {
      let found_data = await new Promise((resolve, reject) => {
        connection.query(
          q,
          [search, search, search, search, search, search],
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
    } catch (error) {
      return {
        success: false,
        error: error || "Failed to search student from Student Model",
      };
    }
  }

  //API Implementation Is Done
  async addStudent(student) {
    let data = Object.values(student);

    // Fixed SQL syntax: VALUES needs parentheses around placeholders
    let q = `INSERT INTO \`students\` (name, enrollment_no, department, year, email, phone) VALUES (?,?,?,?,?,?)`;

    try {
      let stu = await new Promise((resolve, reject) => {
        connection.query(q, data, (err, result) => {
          if (err) reject(err);
          else resolve(JSON.parse(JSON.stringify(result)));
        });
      });

      return {
        success: true,
        message: "Student Added Successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: error || "Failed to add student from Student Model",
      };
    }
  }
  async deleteBookOrStudent(book_id, stu_id) {
    let q = `DELETE FROM \`books\` WHERE id = ?`;
    try {
      if (stu_id) {
        q = `DELETE FROM \`students\` WHERE id = ?`;

        return await new Promise((resolve, reject) => {
          connection.query(q, [stu_id], (err, res) => {
            if (err) {
              reject(err);
            } else {
              if (res.affectedRows === 0) {
                resolve({
                  success: false,
                  error: "Student not found or no changes made",
                });
              } else {
                resolve({
                  success: true,
                  message: "Student Deleted successfully",
                });
              }
            }
          });
        });
      } else {
        return await new Promise((resolve, reject) => {
          connection.query(q, [book_id], (err, res) => {
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
                  message: "Book Deleted successfully",
                });
              }
            }
          });
        });
      }
    } catch (error) {
      return {
        success: false,
        error: error || "Failed to delete student from Student Model",
      };
    }
  }

  //API Creation And implementation IS Done 
  //This Function Is Used To Get The Data Of The Student From The API 
  //Called In the issue-book-page.js at line 79 just to get the name and the department of the student to issue book
  async getStudentData(roll_no) {
    console.log("Roll No :::",roll_no);
    
    try {
      const response = await axios.get(`http://localhost:2150/student/getStudentData/${roll_no}`);
      console.log("Result :::",response);
      console.log("Result :::",response.data);
      
      const result = response.data;
      if (result.success) {
        return {
          success: true,
          data: result.data,
        };
      }
      else{
        return {
          success: false,
          message: "Stundet Not Found"
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error || "Failed to get student data from Student Model",
      };
    }
  }
}
module.exports = Student;
