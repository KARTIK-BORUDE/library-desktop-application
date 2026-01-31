import { showMessage } from "../utils/ui-helpers.js";
import { updateBook } from "../components/book-forms.js";

/**
 * Initialize the Edit Book page
 */
export function initEditBookPage(loadPageCallback) {
  const userRole = window.userRole;

  // if (userRole !== "librarian") {
  //     showMessage("error", "Unauthorized", "You are not authorized to access this page");
  //     return;
  // }

  let currentBookData = null;

  // Get the data from localStorage
  const editingBookData = localStorage.getItem("bookData");

  if (editingBookData) {
    try {
      currentBookData = JSON.parse(editingBookData);

      // Fill form with book data
      document.getElementById("title").value = currentBookData.Title || "";
      document.getElementById("Accession_no").value =
        currentBookData.Accession_no || "";
      document.getElementById("Author").value = currentBookData.Author || "";
      document.getElementById("publisher").value =
        currentBookData.Publisher || "";
      document.getElementById("Pub_location").value =
        currentBookData.Pub_location || "";
      document.getElementById("Language_code").value =
        currentBookData.Language_code || "";
      document.getElementById("Bill_no").value = currentBookData.Bill_no || "";
      document.getElementById("department").value =
        currentBookData.Department || "";
      document.getElementById("location").value =
        currentBookData.Location || "";
      document.getElementById("edition").value = currentBookData.Edition || 1;
      document.getElementById("Cost").value = currentBookData.Cost || 0;
      document.getElementById("Pages").value = currentBookData.Pages || 1;
      document.getElementById("Total_copies").value =
        currentBookData.Total_copies || 1;
      document.getElementById("Available_copies").value =
        currentBookData.Available_copies || 1;
      document.getElementById("Bill_date").value = currentBookData.Bill_date
        ? currentBookData.Bill_date.split("T")[0]
        : "";
      document.getElementById("Purchase_Date").value =
        currentBookData.Purchase_Date
          ? currentBookData.Purchase_Date.split("T")[0]
          : "";

      localStorage.removeItem("bookData");
      showMessage("success", "Book Loaded", `Editing ${currentBookData.Title}`);
    } catch (error) {
      showMessage("error", "Error", "Failed to load book data");
      return;
    }

    const update_btn = document.getElementById("update-book-btn");
    if (update_btn) {
      update_btn.onclick = (e) => {
        // Simple validation
        if (!document.getElementById("title").value.trim()) {
          showMessage("error", "Error", "Title is required");
          return;
        }
        if (!document.getElementById("Accession_no").value.trim()) {
          showMessage("error", "Error", "Accession Number is required");
          return;
        }

        const updatedBookData = {
          id: currentBookData.id,
          Title: document.getElementById("title").value.trim(),
          Accession_no: document.getElementById("Accession_no").value.trim(),
          Author: document.getElementById("Author").value.trim(),
          Publisher: document.getElementById("publisher").value.trim(),
          Pub_location: document.getElementById("Pub_location").value.trim(),
          Language_code: document.getElementById("Language_code").value.trim(),
          Bill_no:
            document.getElementById("Bill_no").value.trim() || "NOT PRESENT",
          Department: document.getElementById("department").value.trim(),
          Location: document.getElementById("location").value.trim(),
          Edition:
            parseInt(document.getElementById("edition").value.trim()) || 1,
          Cost: parseFloat(document.getElementById("Cost").value.trim()) || 0,
          Pages: parseInt(document.getElementById("Pages").value.trim()) || 1,
          Total_copies:
            parseInt(document.getElementById("Total_copies").value.trim()) || 1,
          Available_copies:
            parseInt(
              document.getElementById("Available_copies").value.trim(),
            ) || 1,
          Bill_date: document.getElementById("Bill_date").value,
          Purchase_Date: document.getElementById("Purchase_Date").value,
        };

        update_btn.disabled = true;
        update_btn.textContent = "Updating...";

        updateBook(updatedBookData, update_btn, loadPageCallback);
      };
    }
  } else {
    showMessage(
      "error",
      "No Book Data",
      "Please select a book to edit from the Books page",
    );
  }
}
