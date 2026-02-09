import { showMessage } from "../utils/ui-helpers.js";

/**
 * Delete a book or student
 * @param {number} book_id - Book ID to delete
 * @param {number} stu_id - Student ID to delete
 * @param {Function} loadPageCallback - Callback to reload the page
 */
export function deleteBookOrStudent(book_id, stu_id, loadPageCallback) {
  if (book_id) {
    window.BOOKS.deleteBookOrStudent(book_id, stu_id).then((res) => {
      if (res.success) {
        showMessage("success", "Book Deleted", "Book deleted successfully");
        setTimeout(() => {
          loadPageCallback("Books");
        }, 1000);
      } else {
        showMessage("error", "Book Not Deleted", res.error);
      }
    });
  }

  if (stu_id) {
    window.BOOKS.deleteBookOrStudent(book_id, stu_id).then((res) => {
      if (res.success) {
        showMessage(
          "success",
          "Student Deleted",
          "Student deleted successfully",
        );
        setTimeout(() => {
          loadPageCallback("Students");
        }, 1000);
      } else {
        showMessage("error", "Student Not Deleted", res.error);
      }
    });
  }
}

/**
 * Update book data in the database
 * @param {Object} bookData - Book data to update
 * @param {HTMLElement} update_btn - Update button element
 * @param {Function} loadPageCallback - Callback to reload the page
 */
export function updateBook(bookData, update_btn, loadPageCallback) {
  window.BOOKS.updateBook(bookData).then((res) => {
    console.log("Response Of UpdateBook", res);
    if (res.success) {
      update_btn.style.backgroundColor = "#28a745";
      update_btn.style.borderColor = "#28a745";
      update_btn.textContent = "✓ Updated!";
      showMessage("success", "Book Updated", "Book updated successfully");
      setTimeout(() => {
        loadPageCallback("Books");
      }, 2000);
    } else {
      update_btn.style.backgroundColor = "#dc3545";
      update_btn.style.borderColor = "#dc3545";
      update_btn.textContent = "✕ Failed!";
      showMessage(
        "error",
        "Failed to update book",
        res.message || "Unknown error",
      );
      setTimeout(() => {
        update_btn.style.backgroundColor = "";
        update_btn.style.borderColor = "";
        update_btn.textContent = "Update Book";
      }, 2000);
    }
  });
}

/**
 * Edit book - navigate to edit page
 * @param {Object} bookData - Book data to edit
 * @param {Function} loadPageCallback - Callback to load edit page
 */
export function editBook(bookData, loadPageCallback) {
  localStorage.setItem("bookData", JSON.stringify(bookData));
  loadPageCallback("edit-book");
}

/**
 * Set date constraints for issue and return dates
 * @param {HTMLInputElement} issue_date - Issue date input element
 * @param {HTMLInputElement} return_date - Return date input element
 */
export function setDate(issue_date, return_date) {
  const today = new Date().toISOString().split("T")[0];

  issue_date.min = today;
  issue_date.max = today;
  issue_date.value = today;

  return_date.min = today;
}
