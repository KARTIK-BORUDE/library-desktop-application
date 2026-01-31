import { editBook } from "./edit-book-page.js";
import { generateLabel } from "../utils/generate-label.js";
export function displayBooks(booksToDisplay) {
  const tbody = document.getElementById("table-body");
  tbody.innerHTML = "";

  if (booksToDisplay.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="14" class="text-center">No books found</td></tr>';
    return;
  }

  booksToDisplay.forEach((book) => {
    const row = document.createElement("tr");

    row.innerHTML = `
         <td>${book.id}</td>
         <td>${book.Accession_no}</td>
         <td>${book.Title}</td>
         <td>${book.Author}</td>
         <td>${book.Edition}</td>
         <td>${book.Pages}</td>
         <td>${book.Language_code}</td>
         <td>${book.Department}</td>
         <td>${book.Cost}</td>
         <td>${book.Location}</td>
         <td>${book.Available_copies}</td>
         <td>
             <button type="button" class="btn btn-primary" book-data='${JSON.stringify(book)}' id="edit-book-btn"><span class="btn-icon">✏️&nbsp;</span>Edit</button>
         </td>
         <td>
             <button type="button" class="btn btn-danger delete-book-btn" book_id='${JSON.stringify(book.id)}'>
               <span class="btn-icon">🗑️</span> Delete
             </button>
         </td>
         <td>
             <button type="button" class="btn btn-primary label-book-btn" acc_no='${JSON.stringify(book.Accession_no)}'>
               <span class="btn-icon">🏷️</span> Label
             </button>
         </td>

      `;

    tbody.appendChild(row);
  });
  document.querySelectorAll("#edit-book-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const bookData = JSON.parse(this.getAttribute("book-data"));
      editBook(bookData);
    });
  });
  document.querySelectorAll(".delete-book-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const bookId = JSON.parse(this.getAttribute("book_id"));
      deleteBookOrStudent(bookId);
    });
  });

  document.querySelectorAll(".label-book-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const accession_no = JSON.parse(this.getAttribute("acc_no"));
      generateLabel(accession_no);
    });
  });
}

// export { displayBooks };
