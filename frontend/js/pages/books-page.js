import { showMessage } from "../utils/ui-helpers.js";
import { displayBooks, searchBooks } from "../components/book-table.js";

/**
 * Initialize the Books page
 */
export function initBooksPage(loadPageCallback) {
  // Show loading overlay
  const loadingOverlay = document.getElementById("books-loading-overlay");
  if (loadingOverlay) {
    loadingOverlay.classList.remove("hidden");
  }

  // Fetch and display all books
  window.BOOKS.seeTotalBooks()
    .then((res) => {
      localStorage.removeItem("DBERROR");
      console.log("All Books Result :",res);

      // Hide loading overlay
      if (loadingOverlay) {
        loadingOverlay.classList.add("hidden");
      }

      let table_body = document.getElementById("table-body");
      table_body.innerHTML = "";

      if (res.success) {
        console.log("Books DATA ::::",res)
        if (res.data.data.length == 0) {
          table_body.innerHTML =
            '<tr><td colspan="11" class="text-center">No Record To Display</td></tr>';
          return;
        }

        // Display books (first 50)
        displayBooks(res.data.data.slice(0, 50), loadPageCallback);

        // Initialize search functionality with all books
        searchBooks(res.data.data, loadPageCallback);
      } else {
        table_body.innerHTML =
          '<tr><td colspan="11" class="text-center text-muted py-4">Failed To Load Data</td></tr>';

        setTimeout(() => {
          showMessage(
            "error",
            "Failed To Load Data",
            res.error || "Failed To Load Data",
          );
        }, 500);
        return;
      }
    })
    .catch((error) => {
      // Hide loading overlay on error
      if (loadingOverlay) {
        loadingOverlay.classList.add("hidden");
      }

      showMessage(
        "error",
        "Error Loading Books",
        error.message || "Failed to load books",
      );
    });

  // Pagination handlers
  const prev = document.getElementById("prev");
  const next = document.getElementById("next");

  if (next) {
    next.addEventListener("click", function () {
      const current = document.querySelector(".page.active");
      if (!current) return;

      let temp = current.nextElementSibling;
      while (temp && !temp.classList.contains("page")) {
        temp = temp.nextElementSibling;
      }

      if (temp) {
        current.classList.remove("active");
        temp.classList.add("active");
      } else {
        showMessage("error", "Feature Is Coming Soon", "Keep Adding Books");
      }
    });
  }

  if (prev) {
    prev.addEventListener("click", function () {
      const current = document.querySelector(".page.active");
      if (!current) return;

      let temp = current.previousElementSibling;
      while (temp && !temp.classList.contains("page")) {
        temp = temp.previousElementSibling;
      }

      if (temp) {
        current.classList.remove("active");
        temp.classList.add("active");
      } else {
        showMessage("error", "Feature Is Coming Soon", "Keep Adding Books");
      }
    });
  }

  // Page button handlers
  const page_btns = document.querySelectorAll(".page");
  page_btns.forEach((btn) => {
    btn.addEventListener("click", function () {
      if (this.classList.contains("active")) return;

      const current = document.querySelector(".page.active");
      if (current) {
        current.classList.remove("active");
      }
      this.classList.add("active");
    });
  });

  // Export functionality
  const export_btn = document.getElementById("export-btn");
  if (export_btn) {
    const exportIcon = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 8 12 3 17 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg> Export`;

    export_btn.addEventListener("click", () => {
      export_btn.disabled = true;
      export_btn.innerHTML = "Exporting...";

      window.BOOKS.exportBooks().then((res) => {
        if (res.success) {
          export_btn.disabled = false;
          export_btn.innerHTML = exportIcon;
          showMessage(
            "success",
            "Books Exported Successfully",
            "Books Exported Successfully",
          );
        } else {
          export_btn.disabled = false;
          export_btn.innerHTML = exportIcon;
          showMessage(
            "error",
            "Failed To Export Books",
            res.error || "Failed To Export Books",
          );
        }
      });
    });
  }
}
