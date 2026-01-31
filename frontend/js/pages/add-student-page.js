import { showMessage } from "../utils/ui-helpers.js";
import {
  validateStudentForm,
  showValidationErrors,
} from "../utils/validators.js";

/**
 * Initialize the Add Student page
 */
export function initAddStudentPage() {
  const userRole = window.userRole;
  const dbError = localStorage.getItem("DBERROR");

  if (dbError) {
    showMessage("error", "Database Error", dbError);
    return;
  }
  if (userRole !== "librarian") {
    showMessage(
      "error",
      "Unauthorised Access",
      "Only librarians can add students",
    );
    return;
  }

  let add_stu_btn = document.getElementById("add-student-btn");

  if (add_stu_btn) {
    add_stu_btn.addEventListener("click", (e) => {
      // Collect form data
      const student = {
        name: document.getElementById("name").value.trim(),
        enrollment_no: Number(
          document.getElementById("enrollment_no").value.trim(),
        ),
        department: document.getElementById("department").value.trim(),
        year: Number(document.getElementById("year").value.trim()),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
      };

      // Validate form
      const validation = validateStudentForm(student);
      if (!validation.isValid) {
        showValidationErrors(validation.errors);
        return;
      }

      // Clear form
      document.getElementById("name").value = "";
      document.getElementById("enrollment_no").value = "";
      document.getElementById("department").value = "";
      document.getElementById("year").value = "";
      document.getElementById("email").value = "";
      document.getElementById("phone").value = "";

      // Add student
      window.BOOKS.addStudent(student).then((res) => {
        if (!res.success) {
          showMessage(
            "error",
            "Error Occurred While Adding Student",
            res.error,
          );
        } else {
          showMessage(
            "success",
            "Student Added Successfully",
            "Student Added Successfully",
          );
        }
      });
    });
  }
}
