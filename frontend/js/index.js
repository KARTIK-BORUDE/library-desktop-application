// ============================================================================
// REFACTORED INDEX.JS - Main Entry Point
// Reduced from 2039 lines to ~200 lines by extracting logic into modules
// ============================================================================

// Import utilities
import {
  formatDateForInput,
  showMessage,
  showLoading,
  hideLoading,
} from "./utils/ui-helpers.js";
import { initializeNavigation } from "./utils/navigation.js";

// Import page modules
import { initBooksPage } from "./pages/books-page.js";
import { initAddBookPage } from "./pages/add-book-page.js";
import { initStudentsPage } from "./pages/students-page.js";
import { initAddStudentPage } from "./pages/add-student-page.js";
import { initDashboardPage } from "./pages/dashboard-page.js";
import { initUploadExcelPage } from "./pages/upload-excel-page.js";
import { initUploadStudentPage } from "./pages/upload-student-page.js";
import { initIssueBookPage } from "./pages/issue-book-page.js";
import { initReturnPage } from "./pages/return-page.js";
import { initReturnBookPage } from "./pages/return-book-page.js";
import { initEditBookPage } from "./pages/edit-book-page.js";
import { initUpdateStudentPage } from "./pages/update-student-page.js";
import { initImportPage } from "./pages/import-page.js";
import { initOverdueBooksPage } from "./pages/overdue-books-page.js";

// Make utilities globally available
window.formatDateForInput = formatDateForInput;
window.showMessage = showMessage;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
// Get role directly (no JSON.parse needed, stored as plain string)
window.userRole = localStorage.getItem("userRole") || "";

// ============================================================================
// MAIN APPLICATION
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  const contentArea = document.getElementById("content-area");
  const navItems = document.querySelectorAll(".nav-item");

  // ========================================================================
  // PAGE REGISTRY - Maps page names to their initialization functions
  // ========================================================================
  const pageHandlers = {
    Books: initBooksPage,
    Add_Book: initAddBookPage,
    Students: initStudentsPage,
    add_student: initAddStudentPage,
    dashboard: initDashboardPage,
    "Upload-Excel": initUploadExcelPage,
    upload_student: initUploadStudentPage,
    Issue_Book: initIssueBookPage,
    Return: initReturnPage,
    return_book: initReturnBookPage,
    "edit-book": initEditBookPage,
    Update_Student: initUpdateStudentPage,
    Import: initImportPage,
    Overdue_Books: initOverdueBooksPage,
  };

  // ========================================================================
  // LOAD PAGE FUNCTION - Dynamically loads HTML and initializes page logic
  // ========================================================================
  async function loadPage(page) {
    try {
      // Fetch the HTML content for the page
      const response = await fetch(`./pages/${page}.html`);
      if (!response.ok) {
        throw new Error(`Failed to load ${page}`);
      }

      const html = await response.text();
      contentArea.innerHTML = html;

      // Initialize page-specific logic if handler exists
      if (pageHandlers[page]) {
        pageHandlers[page](loadPage); // Pass loadPage as callback for navigation
      } else {
      }
    } catch (err) {
      contentArea.innerHTML = `
                <div class="page-header">
                    <h2>Error</h2>
                </div>
                <p>Failed to load page: ${page}</p>
            `;
    }
  }

  // ========================================================================
  // INITIALIZATION
  // ========================================================================

  // Load default page (Books)
  loadPage("dashboard");

  // Initialize sidebar navigation
  initializeNavigation(navItems, loadPage);

  // ========================================================================
  // EVENT DELEGATION - Handle dynamic content clicks
  // ========================================================================
  contentArea.addEventListener("click", (e) => {
    const target = e.target;

    // View Books button
    if (target.id === "view-books") {
      loadPage("Books");
    }
    // Add Book button
    else if (
      target.classList.contains("add-book-btn") ||
      target.closest(".add-book-btn")
    ) {
      loadPage("Add_Book");
    }
    // New Student button
    else if (
      target.classList.contains("new-student") ||
      target.closest(".new-student")
    ) {
      loadPage("add_student");
    }
    // Upload Student button
    else if (
      target.classList.contains("upload-student") ||
      target.closest(".upload-student")
    ) {
      loadPage("upload_student");
    }
    // Return Book button
    else if (
      target.classList.contains("return-btn") ||
      target.closest(".return-btn")
    ) {
      loadPage("return_book");
    }
  });
});

// ============================================================================
// END OF REFACTORED INDEX.JS
// ============================================================================

/*
 * REFACTORING SUMMARY:
 *
 * Original: 2039 lines
 * New: ~150 lines
 * Reduction: ~92%
 *
 * Code Organization:
 * ├── utils/
 * │   ├── ui-helpers.js (formatDateForInput, showMessage, showLoading, hideLoading)
 * │   ├── validators.js (validateBookForm, validateStudentForm, showValidationErrors)
 * │   └── navigation.js (initializeNavigation)
 * ├── components/
 * │   ├── book-table.js (displayBooks, searchBooks)
 * │   ├── student-table.js (displayStudents, searchStudents, editStudent)
 * │   └── book-forms.js (editBook, updateBook, deleteBookOrStudent, setDate)
 * └── pages/
 *     ├── books-page.js
 *     ├── add-book-page.js
 *     ├── students-page.js
 *     ├── add-student-page.js
 *     ├── dashboard-page.js
 *     ├── upload-excel-page.js
 *     └── upload-student-page.js
 */
