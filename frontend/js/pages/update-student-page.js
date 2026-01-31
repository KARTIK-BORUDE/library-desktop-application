import { showMessage } from "../utils/ui-helpers.js";

/**
 * Initialize the Update Student page
 */
export function initUpdateStudentPage(loadPageCallback) {
  const userRole = window.userRole;

  if (userRole !== "librarian") {
    showMessage(
      "error",
      "Unauthorized",
      "You are not authorized to access this page",
    );
    return;
  }

  let currentStudentData = null; // Store current student being edited

  // Check if we're editing a student from the table
  const editingStudent = localStorage.getItem("studentData");

  if (editingStudent) {
    try {
      // Pre-fill the form with student data
      const student = JSON.parse(editingStudent);
      currentStudentData = student;

      // Populate form fields
      document.getElementById("stu_roll").value = student.enrollment_no || "";
      document.getElementById("stu_name").value = student.name || "";
      document.getElementById("stu_email").value = student.email || "";
      document.getElementById("stu_yr").value = student.year || "";
      const dept = student.Department || student.department || "";
      document.getElementById("stu_dpt").value = dept;
      document.getElementById("stu_ph").value = student.phone || "";

      // Enable all fields for editing
      document.getElementById("stu_roll").removeAttribute("disabled");
      document.getElementById("stu_name").removeAttribute("disabled");
      document.getElementById("stu_email").removeAttribute("disabled");
      document.getElementById("stu_yr").removeAttribute("disabled");
      document.getElementById("stu_dpt").removeAttribute("disabled");
      document.getElementById("stu_ph").removeAttribute("disabled");

      // Clear the localStorage
      localStorage.removeItem("studentData");

      showMessage("success", "Student Loaded", `Editing ${student.name}`);
    } catch (error) {
      showMessage("error", "Error", "Failed to load student data");
      return;
    }
  }

  // Update student button click handler
  const update_student = document.getElementById("update-student");

  if (update_student) {
    update_student.onclick = (e) => {
      if (!currentStudentData) {
        showMessage(
          "error",
          "No Student Selected",
          "Please select a student to edit from the Students page",
        );
        return;
      }

      // Get updated values from form
      const updatedStudent = {
        id: currentStudentData.id,
        enrollment_no: document.getElementById("stu_roll").value.trim(),
        name: document.getElementById("stu_name").value.trim(),
        email: document.getElementById("stu_email").value.trim(),
        year: document.getElementById("stu_yr").value.trim(),
        department: document.getElementById("stu_dpt").value.trim(),
        phone: document.getElementById("stu_ph").value.trim(),
      };

      // Validate required fields
      if (
        !updatedStudent.enrollment_no ||
        !updatedStudent.name ||
        !updatedStudent.email ||
        !updatedStudent.year ||
        !updatedStudent.department ||
        !updatedStudent.phone
      ) {
        showMessage(
          "error",
          "Missing Fields",
          "Please fill all required fields",
        );
        return;
      }

      // Disable button during update
      update_student.disabled = true;
      update_student.textContent = "Updating...";

      // Call update API
      window.BOOKS.updateStudent(updatedStudent)
        .then((res) => {
          if (res.success) {
            update_student.style.backgroundColor = "#28a745";
            update_student.textContent = "✓ Updated!";

            showMessage(
              "success",
              "Student Updated",
              "Student information updated successfully",
            );

            // Navigate back to Students page after 1.5 seconds
            setTimeout(() => {
              loadPageCallback("Students");
            }, 1500);
          } else {
            update_student.style.backgroundColor = "#dc3545";
            update_student.textContent = "✕ Failed!";

            showMessage(
              "error",
              "Update Failed",
              res.error || "Failed to update student",
            );

            // Reset button after 2 seconds
            setTimeout(() => {
              update_student.style.backgroundColor = "";
              update_student.textContent = "Update";
              update_student.disabled = false;
            }, 2000);
          }
        })
        .catch((error) => {
          update_student.style.backgroundColor = "#dc3545";
          update_student.textContent = "✕ Error!";

          showMessage("error", "Error", "An unexpected error occurred");

          setTimeout(() => {
            update_student.style.backgroundColor = "";
            update_student.textContent = "Update";
            update_student.disabled = false;
          }, 2000);
        });
    };
  }
}
