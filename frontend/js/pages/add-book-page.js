import { showMessage, showLoading, hideLoading } from "../utils/ui-helpers.js";
import { validateBookForm, showValidationErrors } from "../utils/validators.js";

/**
 * Initialize the Add Book page
 */
export function initAddBookPage(loadPageCallback) {
  const dbError = localStorage.getItem("DBERROR");

  if (dbError) {
    showMessage("error", "Database Error", dbError);
    return;
  }

  let interval;

  // Set max date for Bill Date and Purchase Date to today
  const today = new Date().toISOString().split("T")[0];
  const billDateInput = document.getElementById("Bill_date");
  const purchaseDateInput = document.getElementById("Purchase_Date");

  if (billDateInput) {
    billDateInput.setAttribute("max", today);
  }

  if (purchaseDateInput) {
    purchaseDateInput.setAttribute("max", today);
  }

  // Accession number check
  const acc_input = document.getElementById("Accession_no");
  if (acc_input) {
    acc_input.oninput = (e) => {
      clearInterval(interval);
      if (e.target.value.trim() === "") return;

      interval = setTimeout(() => {
        const accession_no_value = e.target.value.trim();

        window.BOOKS.isBookExists(accession_no_value)
          .then((res) => {
            if (!res.success) {
              setTimeout(() => {
                showMessage(
                  "error",
                  "Book Don't Exists",
                  res.error || "Failed to fetch book",
                );
              }, 200);
            } else {
              // Book found - show loader and success message
              //showLoading();
              showConfirmationPopUp(res.data[0], loadPageCallback);

              // Store book data and navigate to edit page
              // setTimeout(() => {
              //     localStorage.setItem("bookData", JSON.stringify(res.data[0]));
              //     loadPageCallback("edit-book");
              //     //hideLoading();
              // }, 2000);
            }
          })
          .catch((error) => {
            setTimeout(() => {
              showMessage("error", "Book Not Found", "Failed to fetch book");
            }, 200);
          });
      }, 1000);
    };
  }

  // Add book button handler
  const addBtn = document.getElementById("add-btn");
  if (addBtn) {
    addBtn.addEventListener("click", async () => {
      // Get date values with validation
      const billDateValue = document.getElementById("Bill_date").value;
      const purchaseDateValue = document.getElementById("Purchase_Date").value;

      // Collect form data
      const bookData = {
        Accession_no: document.getElementById("Accession_no").value.trim(),
        Title: document.getElementById("title").value.trim(),
        Author: document.getElementById("Author").value.trim(),
        Edition: Number(document.getElementById("edition").value.trim()),
        Publisher: document.getElementById("publisher").value.trim(),
        Pub_location: document.getElementById("Pub_location").value.trim(),
        Pages: Number(document.getElementById("Pages").value.trim()),
        Language_code: document.getElementById("Language_code").value.trim(),
        Bill_no: document.getElementById("Bill_no").value.trim(),
        Bill_date: billDateValue
          ? new Date(billDateValue).toISOString().split("T")[0]
          : null,
        Purchase_Date: purchaseDateValue
          ? new Date(purchaseDateValue).toISOString().split("T")[0]
          : null,
        Location: document.getElementById("location").value.trim(),
        Total_copies: Number(document.getElementById("Total_copies").value),
        Available_copies: Number(
          document.getElementById("Available_copies").value,
        ),
        Department: document.getElementById("department").value,
        Cost: Number(document.getElementById("Cost").value),
      };

      // Validate form
      const validation = validateBookForm(bookData);
      if (!validation.isValid) {
        showValidationErrors(validation.errors);
        return;
      }

      try {
        // Disable button during processing
        addBtn.disabled = true;
        addBtn.textContent = "Adding...";

        // Call AddBook and wait for response
        const result = await window.BOOKS.AddBook(bookData);

        if (result && result.success) {
          // Success - turn button green
          addBtn.style.backgroundColor = "#28a745";
          addBtn.style.borderColor = "#28a745";
          addBtn.textContent = "✓ Book Added!";

          showMessage("success", "Book Added", "Book Added Successfully");

          // Reset form after success
          setTimeout(() => {
            document.querySelector("form").reset();
            addBtn.style.backgroundColor = "";
            addBtn.style.borderColor = "";
            addBtn.textContent = "Add Book";
            addBtn.disabled = false;
          }, 2000);
        } else {
          // Error - turn button red
          addBtn.style.backgroundColor = "#dc3545";
          addBtn.style.borderColor = "#dc3545";
          addBtn.textContent = "✕ Failed!";
          showMessage(
            "error",
            "Failed to add book",
            result?.error || "Unknown error",
          );

          // Reset button after 2 seconds
          setTimeout(() => {
            addBtn.style.backgroundColor = "";
            addBtn.style.borderColor = "";
            addBtn.textContent = "Add Book";
            addBtn.disabled = false;
          }, 2000);
        }
      } catch (error) {
        // Error - turn button red
        addBtn.style.backgroundColor = "#dc3545";
        addBtn.style.borderColor = "#dc3545";
        addBtn.textContent = "✕ Error!";

        showMessage("error", "Error", error.message || "Failed to add book");

        // Reset button after 2 seconds
        setTimeout(() => {
          addBtn.style.backgroundColor = "";
          addBtn.style.borderColor = "";
          addBtn.textContent = "Add Book";
          addBtn.disabled = false;
        }, 2000);
      }
    });
  }
}

function showConfirmationPopUp(data, loadPageCallback) {
  const overlay = document.getElementById("confirmation-overlay");
  overlay.classList.remove("hidden");

  const yesBtn = document.getElementById("confirm-yes-btn");

  const noBtn = document.getElementById("confirm-no-btn");

  // Use onclick instead of addEventListener to prevent event listener accumulation
  // onclick automatically replaces the previous handler, preventing multiple firings
  if (yesBtn) {
    yesBtn.onclick = () => {
      removeConfirmationPopUp();
      showMessage("success", "Book Found!", "Loading edit page...");
      showLoading();
      setTimeout(() => {
        localStorage.setItem("bookData", JSON.stringify(data));
        hideLoading();
        loadPageCallback("edit-book");
      }, 500);
    };
  }

  if (noBtn) {
    noBtn.onclick = () => {
      removeConfirmationPopUp();
      const accession_no = document.getElementById("Accession_no");
      if (accession_no) {
        accession_no.value = "";
        accession_no.focus();
      }
    };
  }
}
function removeConfirmationPopUp() {
  const overlay = document.getElementById("confirmation-overlay");
  overlay.classList.add("hidden");
  return;
}
