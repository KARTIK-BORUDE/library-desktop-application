import { deleteBookOrStudent } from "./book-forms.js";

/**
 * Display students in the table
 * @param {Array} data - Array of student objects to display
 */
export function displayStudents(data, loadPageCallback) {
  let table_body = document.getElementById("table-body");
  table_body.innerHTML = "";

  if (!data) {
    table_body.innerHTML =
      '<tr><td colspan="7" class="text-center">No Record To Display</td></tr>';
    return;
  }

  if (data.length > 0) {
    data.forEach((student) => {
      const row = document.createElement("tr");

      row.innerHTML = `
                <td>${student.name}</td>
                <td>${student.enrollment_no}</td>
                <td>${student.Department}</td>
                <td>${student.year}</td>
                <td>${student.phone}</td>
                <td>${student.email}</td>
                <td>
                    <button 
                        class="btn btn-sm btn-primary edit-student-btn" 
                        data-student-data='${JSON.stringify(student)}'>
                        <span class="btn-icon">&nbsp;✏️</span>Edit
                    </button>
                </td>
                <td>
                    <button type="button" class="btn btn-danger delete-student-btn" student_id='${JSON.stringify(student.id)}'>
                        <span class="btn-icon">🗑️</span> Delete
                    </button>
                </td>
            `;

      table_body.appendChild(row);
    });

    // Add click event listeners to all edit buttons
    document.querySelectorAll(".edit-student-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const studentData = JSON.parse(this.getAttribute("data-student-data"));
        editStudent(studentData, loadPageCallback);
      });
    });
  } else {
    table_body.innerHTML =
      '<tr><td colspan="7" class="text-center">NO Student Present</td></tr>';
  }

  // Add click event listeners to all delete buttons
  document.querySelectorAll(".delete-student-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const studentId = JSON.parse(this.getAttribute("student_id"));
      deleteBookOrStudent(undefined, studentId, loadPageCallback);
    });
  });
}

/**
 * Edit student - navigate to edit page
 * @param {Object} studentData - Student data to edit
 * @param {Function} loadPageCallback - Callback to load edit page
 */
export function editStudent(studentData, loadPageCallback) {
  localStorage.setItem("studentData", JSON.stringify(studentData));
  loadPageCallback("Update_Student");
}

/**
 * Search students functionality with debouncing
 * @param {Array} allstudents - All students to search through
 */
export function searchStudents(allstudents, loadPageCallback) {
  const searchInput = document.getElementById("search-input");
  if (!searchInput) return;

  let debounceTimer;

  searchInput.oninput = (e) => {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      const filterValue = e.target.value.toLowerCase().trim();

      if (filterValue === "") {
        displayStudents(allstudents, loadPageCallback);
        return;
      }

      const filteredStudents = allstudents.filter((student) => {
        return (
          (student.name && student.name.toLowerCase().includes(filterValue)) ||
          (student.enrollment_no &&
            student.enrollment_no.toString().includes(filterValue)) ||
          (student.Department &&
            student.Department.toLowerCase().includes(filterValue)) ||
          (student.email &&
            student.email.toLowerCase().includes(filterValue)) ||
          (student.phone && student.phone.toString().includes(filterValue))
        );
      });

      displayStudents(filteredStudents, loadPageCallback);
    }, 300);
  };
}
