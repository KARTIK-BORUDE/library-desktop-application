import { showMessage } from "../utils/ui-helpers.js";

/**
 * Initialize the Return Book (File Return) page
 */
export function initReturnBookPage(loadPageCallback) {
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

  // Setting the book_id and student_id to update the status after clicking the return button
  let book_id;
  let student_id;

  const return_btn = document.getElementById("file-return");

  // Set initial values and styles
  document.getElementById("return_date").value = new Date()
    .toISOString()
    .split("T")[0];
  document.getElementById("title").style.backgroundColor = "#F8F9FB";
  document.getElementById("stu_nm").style.backgroundColor = "#F8F9FB";
  document.getElementById("stu_yr").style.backgroundColor = "#F8F9FB";
  document.getElementById("stu_dpt").style.backgroundColor = "#F8F9FB";
  document.getElementById("return_date").style.backgroundColor = "#F8F9FB";
  document.getElementById("issued_date").style.backgroundColor = "#F8F9FB";

  const accession_no = document.getElementById("accession_no");
  let accession_no_value;
  let interval;
  let issued_data = [];

  // Accession number input handler - fetch list of students who have this book
  accession_no.oninput = (e) => {
    clearInterval(interval);
    const list = document.getElementById("stu_enroll");
    list.innerHTML = "";

    // Handle selection change to populate student data
    list.onchange = (e) => {
      // Populate student data in proper fields
      issued_data.forEach((stu) => {
        if (stu.stu_enroll == e.target.value) {
          document.getElementById("title").value = stu.book_title;
          document.getElementById("stu_nm").value = stu.stu_nm;
          document.getElementById("stu_yr").value = stu.stu_yr;
          document.getElementById("stu_dpt").value = stu.dept;
          document.getElementById("stu_enroll").value = stu.stu_enroll;
          document.getElementById("issued_date").value = new Date(
            stu.issue_date,
          )
            .toISOString()
            .split("T")[0];
        }
      });
    };

    // Debounce the API call
    interval = setTimeout(() => {
      accession_no_value = e.target.value.trim();

      // If the accession number is empty, clear the list
      if (accession_no_value == "") {
        list.innerHTML = "<option value=''>Select Student</option>";
        return;
      }

      // Database call to get the student data who have this book issued
      window.BOOKS.getDataOfIssuedBook(accession_no_value.trim()).then(
        (res) => {
          // Store data for use in the onchange event of the list
          issued_data = res.data;

          // If the data is found, populate the list and dispatch the change event
          if (res.success) {
            if (res.data.length > 0) {
              book_id = res.data[0].book_id;
              student_id = res.data[0].student_id;
              res.data.forEach((stu) => {
                const option = document.createElement("option");
                option.value = stu.stu_enroll;
                option.textContent = stu.stu_enroll;
                list.appendChild(option);
              });
            }

            // Populate the list and dispatch the change event
            list.selectedIndex = 0;
            list.dispatchEvent(new Event("change"));
            showMessage("success", "Data Found", "Data Found");
          }
          // If the data is not found, clear the list and show the message
          if (res.error) {
            showMessage(
              "error",
              "No Data Found",
              "No issued book found with this accession number",
            );
            list.innerHTML = "<option value=''>Select Student</option>";
            document.getElementById("title").value = "";
            document.getElementById("stu_nm").value = "";
            document.getElementById("stu_yr").value = "";
            document.getElementById("stu_dpt").value = "";
            document.getElementById("stu_enroll").value = "";
            document.getElementById("issued_date").value = "";
            return;
          }
        },
      );
    }, 1000);
  };

  // Return button click handler
  return_btn.onclick = (e) => {
    // Get current accession number value from input
    const currentAccessionValue = accession_no.value.trim();

    if (
      !currentAccessionValue ||
      currentAccessionValue === "" ||
      !accession_no_value
    ) {
      showMessage("error", "Error", "Please enter accession number");
      return;
    }

    window.BOOKS.fileReturn({
      ac_no: accession_no_value,
      stu_id: student_id,
      book_id: book_id,
    }).then((res) => {
      if (res.success) {
        return_btn.style.backgroundColor = "#28a745";
        return_btn.textContent = "✓ Returned";
        return_btn.disabled = true;

        setTimeout(() => {
          return_btn.style.backgroundColor = "";
          return_btn.textContent = "Return";
          return_btn.disabled = false;
        }, 2000);

        showMessage("success", "Book Returned", "Book Returned Successfully");

        // Clear form
        document.getElementById("title").value = "";
        document.getElementById("stu_nm").value = "";
        document.getElementById("stu_yr").value = "";
        document.getElementById("stu_dpt").value = "";
        document.getElementById("stu_enroll").value = "";
        document.getElementById("issued_date").value = "";
        accession_no.value = "";
        accession_no.focus();

        // Reset the accession_no_value to prevent stale data
        accession_no_value = "";
      }
      if (res.error) {
        return_btn.style.backgroundColor = "#dc3545";
        return_btn.textContent = "✕ Failed!";
        return_btn.disabled = true;
        showMessage("error", "Book Not Returned", "Book Return Failed");

        setTimeout(() => {
          return_btn.style.backgroundColor = "";
          return_btn.textContent = "Return Book";
          return_btn.disabled = false;
        }, 2000);
      }
    });
  };
}
