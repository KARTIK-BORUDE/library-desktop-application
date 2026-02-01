import { showMessage } from "../utils/ui-helpers.js";
import { setDate } from "../components/book-forms.js";

/**
 * Initialize the Issue Book page
 */
export function initIssueBookPage(loadPageCallback) {
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

  // Set issue and return dates
  setDate(
    document.getElementById("issue_date"),
    document.getElementById("return_date"),
  );

  const accession_no = document.getElementById("accession_no");
  const enrollment_no = document.getElementById("enrollment_no");
  const issue_btn = document.getElementById("issue-btn");

  let accession_no_value;
  let interval;

  // Accession number input handler - check if book exists
  accession_no.oninput = (e) => {
    clearInterval(interval);
    interval = setTimeout(() => {
      accession_no_value = e.target.value.trim();

      if (accession_no_value == "") {
        return;
      }
      window.BOOKS.getTitle(accession_no_value.trim()).then((res) => {
        console.log(res.data);
        if (!res.success) {
          setTimeout(() => {
            showMessage(
              "error",
              "Book Not Found",
              res.error || "Failed to fetch book",
            );
          }, 200);
          
        } else {
          showMessage("success", "Book Found", "Book Found");
          document.getElementById("title").value = res.data[0].Title;
          document.getElementById("available_copies").value =
            res.data[0].Available_copies;
        }
      });
    }, 1000);
  };

  let enrollment_no_value;

  // Enrollment number input handler - check if student exists
  enrollment_no.oninput = (e) => {
    clearInterval(interval);
    interval = setTimeout(() => {
      enrollment_no_value = e.target.value.trim();

      if (enrollment_no_value == "") {
        return;
      }
      window.BOOKS.getStudentData(enrollment_no_value).then((res) => {
        if (!res.success) {
          showMessage(
            "error",
            "Invalid Enrollment No",
            "Please Enter Valid Roll Number",
          );
          return;
        } else {
          showMessage("success", "Student Found", "Student Found");
          document.getElementById("name").value = res.data[0].name;
          document.getElementById("year").value = res.data[0].year;
        }
      });
    }, 1000);
  };

  // Issue button click handler
  issue_btn.onclick = (e) => {
    // Get values
    const accession_no = document.getElementById("accession_no").value.trim();
    const enrollment_no = document.getElementById("enrollment_no").value.trim();
    const return_date = document.getElementById("return_date").value;

    // Validate each field
    if (!accession_no || accession_no == "") {
      showMessage(
        "error",
        "Accession No Required",
        "Please enter accession number",
      );
      return;
    }
    if (!enrollment_no || enrollment_no == "") {
      showMessage(
        "error",
        "Enrollment No Required",
        "Please enter enrollment number",
      );
      return;
    }
    if (!return_date || return_date == "") {
      showMessage("error", "Return Date Required", "Please select return date");
      return;
    }

    // Disable button and show processing state
    issue_btn.disabled = true;
    issue_btn.style.backgroundColor = "#6c757d";
    issue_btn.textContent = "Processing...";

    // Issue the book
    window.BOOKS.issueBook({
      accession_no: accession_no,
      enrollment_no: enrollment_no,
      issue_date: document.getElementById("issue_date").value,
      return_date: return_date,
    }).then((res) => {
      if (!res.success) {
        issue_btn.style.backgroundColor = "#dc3545";
        issue_btn.textContent = "✕ Failed!";
        showMessage(
          "error",
          "Book Not Available",
          res.error || "Book Not Available",
        );

        setTimeout(() => {
          issue_btn.style.backgroundColor = "";
          issue_btn.textContent = "Issue";
          issue_btn.disabled = false;
        }, 2000);
        return;
      }

      if (
        !res.book_data ||
        !res.stu_data ||
        res.book_data.length == 0 ||
        res.stu_data.length == 0
      ) {
        showMessage("error", "Book Not Found", "Book or student not found");
        issue_btn.style.backgroundColor = "#dc3545";
        issue_btn.textContent = "✕ Failed!";

        setTimeout(() => {
          issue_btn.style.backgroundColor = "";
          issue_btn.textContent = "Issue";
          issue_btn.disabled = false;
        }, 2000);
        return;
      }

      // Success
      issue_btn.style.backgroundColor = "#28a745";
      issue_btn.textContent = "✓ Issued!";

      document.getElementById("name").value = res.stu_data[0].name;
      document.getElementById("year").value = res.stu_data[0].year;
      document.getElementById("title").value = res.book_data[0].title;

      showMessage(
        "success",
        "Book Issued Successfully",
        "Book Issued Successfully",
      );

      // Clear form
      document.getElementById("issue_date").value = "";
      document.getElementById("return_date").value = "";
      document.getElementById("accession_no").value = "";
      document.getElementById("enrollment_no").value = "";
      document.getElementById("name").value = "";
      document.getElementById("year").value = "";
      document.getElementById("title").value = "";
      document.getElementById("available_copies").value = "";

      // Reset button after 2 seconds
      setTimeout(() => {
        issue_btn.style.backgroundColor = "";
        issue_btn.textContent = "Issue";
        issue_btn.disabled = false;
        setDate(
          document.getElementById("issue_date"),
          document.getElementById("return_date"),
        );
      }, 2000);
    });
  };
}
