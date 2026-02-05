import { showMessage } from "../utils/ui-helpers.js";

/**
 * Initialize the Dashboard page
 */
export function initDashboardPage(loadPageCallback) {
  try {
    window.BOOKS.getTotalBooks().then((res) => {
      console.log("Data",res)
      if (res.success) {
        // Update dashboard statistics
        localStorage.removeItem("DBERROR");
        document.getElementById("Total_Books").innerText =
          res.data[0].toLocaleString();
        document.getElementById("Books_Issued").innerText =
          res.data[1].toLocaleString();
        document.getElementById("All_Time_Books_Issued").innerText =
          res.data[2].toLocaleString();
        document.getElementById("Total_Students").innerText =
          res.data[3].toLocaleString();
        document.getElementById("Online_Students").innerText =
          res.data[4].toLocaleString();
        document.getElementById("Overdue_Books").innerText =
          res.data[5].toLocaleString();

        // Set up click handlers for dashboard cards
        const container = document.getElementById("overdue_books_details");
        if (container) {
          container.addEventListener("click", () => {
            loadPageCallback("Overdue_Books");
          });
        }

        const container2 = document.getElementById("books_issued_details");
        if (container2) {
          container2.addEventListener("click", () => {
            loadPageCallback("Return");
          });
        }

        const container3 = document.getElementById("total_students_details");
        if (container3) {
          container3.addEventListener("click", () => {
            loadPageCallback("Students");
          });
        }

        const container4 = document.getElementById("total_books_details");
        if (container4) {
          container4.addEventListener("click", () => {
            loadPageCallback("Books");
          });
        }
      } else {
        localStorage.setItem("DBERROR", res.error);
        
        setTimeout(() => {
          showMessage(
            "error",
            "Failed To Load Data",
            res.error || "Failed To Load Data",
          );
        }, 500);

        document.getElementById("Total_Books").innerText = res.error;
        document.getElementById("Books_Issued").innerText = res.error;
        document.getElementById("Total_Students").innerText = res.error;
        document.getElementById("Overdue_Books").innerText = res.error;
        document.getElementById("Online_Students").innerText = res.error;
      }
    });
  } catch (error) {
    showMessage("error", "Failed To Execute", error);
  }
}
