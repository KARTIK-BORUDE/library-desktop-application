const Student = require("../models/Student/studentModel");

class StudentService {
    constructor() {
        this.studentModel = new Student();
    }
    async updateStudent(student) {
        if (!student) {
            return {
                success: false,
                error: "Student not found"
            }
        }
        try {
            return await this.studentModel.updateStudent(student);

        } catch (error) {
            
            return {
                success: false,
                error: error
            }
        }
    }

    async searchStudent(term) {
        if (!term) {
            return {
                success: false,
                error: "Student not found"
            }
        }
        try {
            return await this.studentModel.searchStudent(term);
        } catch (error) {
            
            return {
                success: false,
                error: error || "Error in the Student Service"
            }
        }
    }

    async addStudent(student) {
        if (!student) {
            return {
                success: false,
                error: "Student not found"
            }
        }
        try {
            return await this.studentModel.addStudent(student);
        }
        catch (error) {
            
            return {
                success: false,
                error: error || "Error in the Student Service"
            }
        }
    }
    
    async deleteBookOrStudent(book_id, stu_id) {
        try {
            return await this.studentModel.deleteBookOrStudent(book_id, stu_id);
        }
        catch (error) {
            
            return {
                success: false,
                error: error || "Error in the Student Service"
            }
        }
    }

    async getStudentData(ac_no) {
        if (!ac_no) {
            return {
                success: false,
                error: "Student not found"
            }
        }
        try {
            return await this.studentModel.getStudentData(ac_no);
        } catch (error) {
            
            return {
                success: false,
                error: error || "Error in the Student Service"
            }
        }
    }
}

module.exports = StudentService;