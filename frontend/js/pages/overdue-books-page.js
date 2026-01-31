import { showMessage } from "../utils/ui-helpers.js";

export function initOverdueBooksPage(loadPageCallback) {
  const dbError = localStorage.getItem("DBERROR");

  if (dbError) {
    showMessage("error", "Database Error", dbError);
    return;
  }

  const userRole = window.userRole;

  if (userRole !== "librarian") {
    showMessage(
      "error",
      "Unauthorized",
      "You are not authorized to access this page",
    );
    return;
  }

  // Fetch and display overdue books
  window.BOOKS.calculateFine().then((res) => {
    if (res.success) {
      if (res.data.length > 0) {
        const tbody = document.getElementById("overdue-table-body");
        tbody.innerHTML = "";

        res.data.forEach((book) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
                        <td>${book.book_title}</td>
                        <td>${book.book_accession}</td>
                        <td>${book.student_name}</td>
                        <td>${book.student_enrollment}</td>
                        <td>${book.student_dept}</td>
                        <td>${book.student_year}</td>
                        <td style="color: #dc2626; font-weight: 700;">₹${book.fine}</td>
                        <td style="color: #dc2626; font-weight: 700;">${book.fineDays} days</td>
                    `;
          tbody.appendChild(tr);
        });
      } else {
        showMessage("error", "No Overdue Books", "No Overdue Books Found");
      }
    }

    if (res.error) {
      showMessage("error", "No Overdue Books", "No Overdue Books Found");
    }
  });
}
