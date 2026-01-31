import { showMessage, showLoading, hideLoading } from "../utils/ui-helpers.js";

/**
 * Initialize the Upload Student (from Excel) page
 */
export function initUploadStudentPage() {
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

  // Set up progress listener
  window.BOOKS.onUploadProgress((data) => {
    const statusText = document.getElementById("upload-status-text");
    const progressText = document.getElementById("upload-progress-text");

    if (statusText) statusText.textContent = data.status || "Processing...";
    if (progressText)
      progressText.textContent = `Progress: ${data.progress || 0}%`;
  });

  // Set up error listener
  window.BOOKS.onUploadError((data) => {
    hideLoading();
    showMessage(
      "error",
      "Upload Failed",
      data.message || "An error occurred during upload",
    );
  });

  // Add click event to the excel file selector
  const excelFileBtn = document.getElementById("excel-file-for-student");
  if (excelFileBtn) {
    excelFileBtn.addEventListener("click", async () => {
      try {
        showLoading();

        // Call the IPC handler to show dialog and process file
        const result = await window.BOOKS.uploadStudentfromExcel();

        hideLoading();

        if (result.cancelled) {
          // User cancelled the dialog, do nothing
          return;
        }

        if (result.success) {
          const message =
            result.recordsSkipped > 0
              ? `${result.recordsInserted} records inserted, ${result.recordsSkipped} duplicates skipped`
              : `${result.recordsInserted} records inserted successfully`;

          showMessage("success", "Upload Successful!", message);
        } else {
          showMessage(
            "error",
            "Upload Failed",
            result.error || "An error occurred",
          );
        }
      } catch (error) {
        hideLoading();

        showMessage(
          "error",
          "Upload Failed",
          error.message || "An unexpected error occurred",
        );
      }
    });
  }
}
