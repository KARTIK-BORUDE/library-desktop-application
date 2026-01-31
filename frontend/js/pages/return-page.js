import { showMessage } from "../utils/ui-helpers.js";

/**
 * Initialize the Return (Issued Books List) page
 */
export function initReturnPage(loadPageCallback) {
  const dbError = localStorage.getItem("DBERROR");
  const userRole = window.userRole;

  if (dbError) {
    showMessage("error", "Database Error", dbError);
    return;
  }

  if (userRole !== "librarian") {
    showMessage(
      "error",
      "Unauthorized",
      "You are not authorized to access this page",
    );
    return;
  }

  window.BOOKS.getIssuedBooks().then((res) => {
    const tbody = document.getElementById("return-data");

    if (!res.data || res.data.length === 0) {
      tbody.innerHTML =
        "<tr><td colspan='8' style='text-align: center;'><b> No Issued Books Found</b> </td></tr>";
    } else {
      tbody.innerHTML = "";
      res.data.forEach((book) => {
        const row = document.createElement("tr");

        row.innerHTML = `
                    <td>${book.book_title}</td>
                    <td>${book.student_name}</td>
                    <td>${book.enrollment_no}</td>
                    <td>${book.student_year}</td>
                    <td>${book.student_department}</td>
                    <td>${new Date(book.issue_date).toISOString().split("T")[0]}</td>
                    <td>${new Date(book.actual_return_date).toISOString().split("T")[0]}</td>
                    <td class="status">${book.status}</td>
                `;
        tbody.appendChild(row);
      });

      // Color code the status
      let status = document.querySelectorAll(".status");

      status.forEach((statusEl) => {
        if (statusEl.textContent == "due") {
          statusEl.style.color = "#dc2626";
          statusEl.style.fontWeight = "700";
        } else if (statusEl.textContent == "returned") {
          statusEl.style.color = "#28a745";
          statusEl.style.fontWeight = "700";
        } else {
          statusEl.style.color = "#e0ae09e1";
          statusEl.style.fontWeight = "700";
        }
      });
    }
  });
}
