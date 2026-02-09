const Student = require("../models/Student/studentModel");

class StudentService {
  constructor() {
    this.studentModel = new Student();
  }
  async updateStudent(student, token) {
    if (!student) {
      return {
        success: false,
        error: "Student not found",
      };
    }
    try {
      return await this.studentModel.updateStudent(student, token);
    } catch (error) {
      return {
        success: false,
        error: error,
      };
    }
  }

  async searchStudent(term, token) {
    if (!term) {
      return {
        success: false,
        error: "Student not found",
      };
    }
    try {
      return await this.studentModel.searchStudent(term, token);
    } catch (error) {
      return {
        success: false,
        error: error || "Error in the Student Service",
      };
    }
  }

  async addStudent(student, token) {
    if (!student) {
      return {
        success: false,
        error: "Student not found",
      };
    }
    try {
      return await this.studentModel.addStudent(student, token);
    } catch (error) {
      return {
        success: false,
        error: error || "Error in the Student Service",
      };
    }
  }

  async deleteBookOrStudent(book_id, stu_id, token) {
    try {
      return await this.studentModel.deleteBookOrStudent(
        book_id,
        stu_id,
        token,
      );
    } catch (error) {
      return {
        success: false,
        error: error || "Error in the Student Service",
      };
    }
  }

  async getStudentData(ac_no, token) {
    if (!ac_no) {
      return {
        success: false,
        error: "Student not found",
      };
    }
    try {
      return await this.studentModel.getStudentData(ac_no, token);
    } catch (error) {
      return {
        success: false,
        error: error || "Error in the Student Service",
      };
    }
  }
  async getAllStudentsData(token) {
    try {
      return await this.studentModel.getAllStudentsData(token);
    } catch (error) {
      return {
        success: false,
        error: error || "Error in the Student Service",
      };
    }
  }
}

module.exports = StudentService;
