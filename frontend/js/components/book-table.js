import { showMessage } from "../utils/ui-helpers.js";
import { editBook } from "./book-forms.js";
import { deleteBookOrStudent } from "./book-forms.js";
import { generateLabel } from "../utils/generate-label.js";
import { viewLabel } from "../utils/generate-label.js";

/**
 * Display books in the table
 * @param {Array} booksToDisplay - Array of book objects to display
 */
export function displayBooks(booksToDisplay, loadPageCallback) {
  const tbody = document.getElementById("table-body");
  tbody.innerHTML = "";

  if (booksToDisplay.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="12" class="text-center">No books found</td></tr>';
    return;
  }

  booksToDisplay.forEach((book) => {
    const row = document.createElement("tr");

    // Check user role - only librarians can delete books
    const userRole = window.userRole || "";

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
                <button type="button" class="btn btn-primary edit-book-btn" book-data='${JSON.stringify(book)}'>
                    <span class="btn-icon">✏️&nbsp;</span>Edit
                </button>
            </td>
            <td>
                <button type="button" class="btn btn-danger delete-book-btn" book_id='${JSON.stringify(book.id)}' title='${JSON.stringify(book.Title)}'>
                    <span class="btn-icon">🗑️</span> Delete
                </button>
            </td>
            <td>
                <button type="button" class="btn btn-primary label-book-btn" acc_no='${JSON.stringify(book.Accession_no)}' title='${JSON.stringify(book.Title)}'>
                    <span class="btn-icon">🏷️</span> Label
                </button>
            </td>
            <td>
                <button type="button" class="btn btn-primary view-label-book-btn" acc_no='${JSON.stringify(book.Accession_no)}'>
                    <span class="btn-icon">👁️</span> View Label
                </button>
            </td>
        `;

    tbody.appendChild(row);
  });

  // Add click event listeners to edit buttons
  document.querySelectorAll(".edit-book-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const bookData = JSON.parse(this.getAttribute("book-data"));
      editBook(bookData, loadPageCallback);
    });
  });
  document.querySelectorAll(".view-label-book-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const acc_no = JSON.parse(this.getAttribute("acc_no"));
      viewLabel(acc_no);
    });
  });

  // Add click event listeners to Generate Label buttons
  document.querySelectorAll(".label-book-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const acc_no = JSON.parse(this.getAttribute("acc_no"));
      const title = JSON.parse(this.getAttribute("title"));
      generateLabel(acc_no, title);
    });
  });

  // Add click event listeners to delete buttons
  document.querySelectorAll(".delete-book-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const bookId = JSON.parse(this.getAttribute("book_id"));
      const bookTitle = JSON.parse(this.getAttribute("title"));

      if (userRole === "librarian") {
        showConfirmationDialog(bookId, bookTitle, loadPageCallback);
      } else {
        showMessage(
          "error",
          "Unauthorised Access",
          "Only librarians can delete books",
        );
      }
      //deleteBookOrStudent(bookId, undefined, loadPageCallback);
    });
  });
}

/**
 * Search books functionality using backend API (optimized for large datasets)
 * @param {Array} allBooks - All books array for showing initial results
 * @param {Function} loadPageCallback - Callback for page navigation
 */
export function searchBooks(allBooks, loadPageCallback) {
  const searchInput = document.getElementById("search");
  if (!searchInput) return;

  let searchTimeout;

  searchInput.oninput = (e) => {
    clearTimeout(searchTimeout);

    const searchTerm = e.target.value.trim();

    // Show first 100 books when search is empty
    if (searchTerm === "") {
      if (allBooks && allBooks.length > 0) {
        displayBooks(allBooks.slice(0, 100), loadPageCallback);
      } else {
        // Fallback: reload books from API if allBooks is empty
        window.BOOKS.seeTotalBooks().then((res) => {
          if (res.success && res.All_books) {
            displayBooks(res.All_books.slice(0, 100), loadPageCallback);
          }
        });
      }
      return;
    }

    // Require minimum 1 character
    if (searchTerm.length < 1) {
      return;
    }

    // Execute database search after 300ms delay (debouncing)
    searchTimeout = setTimeout(() => {
      window.BOOKS.searchBooks(searchTerm)
        .then((res) => {
          if (res.success) {
            displayBooks(res.data, loadPageCallback);
          } else if (res.error || res.data === undefined) {
            displayBooks([], loadPageCallback);
            showMessage("error", "No Such Book Found", "No Such Book Found");
          }
        })
        .catch((error) => {
          displayBooks([], loadPageCallback);
        });
    }, 300);
  };
}

function showConfirmationDialog(bookId, title, loadPageCallback) {
  const confirmationOverlay = document.getElementById("confirmation-overlay");
  confirmationOverlay.classList.remove("hidden");
  const confirmationText = document.getElementById("confirmation-text");
  confirmationText.innerHTML = `You are about to delete <b><u>${title}</u></b>?`;

  const confirmYesBtn = document.getElementById("confirm-yes-btn");
  const confirmNoBtn = document.getElementById("confirm-no-btn");

  confirmYesBtn.onclick = () => {
    deleteBookOrStudent(bookId, undefined, loadPageCallback);
    confirmationOverlay.classList.add("hidden");
  };

  confirmNoBtn.onclick = () => {
    confirmationOverlay.classList.add("hidden");
  };
}
