// UI Helper Functions - Available globally
import { showLoading, hideLoading, showMessage } from "./utils/ui-helpers.js";

//import disply book page 
import { displayBooks } from "./pages/display-book-page.js";
import { editBook } from "./pages/edit-book-page.js";
// Helper function to format dates for HTML5 date inputs (yyyy-MM-dd)
function formatDateForInput(dateValue) {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return ''; // Invalid date

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// function showLoading() {
//   const overlay = document.getElementById("upload-loading-overlay");
//   if (overlay) overlay.classList.remove("hidden");
// }

// function hideLoading() {
//   const overlay = document.getElementById("upload-loading-overlay");
//   if (overlay) overlay.classList.add("hidden");
// }

// function showMessage(type, title, description) {
//   const messageBox = document.getElementById("upload-message");
//   const icon = document.getElementById("message-icon");
//   const titleEl = document.getElementById("message-title");
//   const descEl = document.getElementById("message-description");

//   if (!messageBox || !icon || !titleEl || !descEl) return;

//   // Set content
//   titleEl.textContent = title;
//   descEl.textContent = description;

//   // Set icon
//   if (type === "success") {
//     icon.textContent = "✓";
//     icon.className = "message-icon success";
//   } else {
//     icon.textContent = "✕";
//     icon.className = "message-icon error";
//   }

//   // Show message
//   messageBox.classList.remove("hidden");

//   // Auto-hide after 5 seconds
//   setTimeout(() => {
//     messageBox.classList.add("hidden");
//   }, 5000);
// }

// Make functions available globally for use in other scripts
window.showMessage = showMessage;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.userRole = JSON.parse(localStorage.getItem("userRole"));

document.addEventListener("DOMContentLoaded", () => {
  const contentArea = document.getElementById("content-area");
  const navItems = document.querySelectorAll(".nav-item");

  // Load default page (Books - the active nav item)
  loadPage("Books");

  // Load pages dynamically
  async function loadPage(page) {
    try {
      const response = await fetch(`./pages/${page}.html`);
      if (!response.ok) {
        throw new Error(`Failed to load ${page}`);
      }
      const html = await response.text();
      contentArea.innerHTML = html;
    } catch (err) {
      
      contentArea.innerHTML = `
            <div class="page-header">
               <h2>Error</h2>
            </div>
            <p>Failed to load page: ${page}</p>
         `;
    }

    // Page-specific JS initialization upload-excel
    if (page == "Add_Book") {
      const dbError = localStorage.getItem("DBERROR");

      if (dbError) {
        showMessage("error", "Database Error", dbError);
        return;
      }
      );
      let book;
      
      let interval;
      const acc_input = document.getElementById("Accession_no");
      acc_input.oninput = (e) => {
        clearInterval(interval);
        if (e.target.value.trim() === "") {
          return;
        }
        interval = setTimeout(() => {
          accession_no_value = e.target.value.trim();
          
          window.BOOKS.isBookExists(accession_no_value).then((res) => {
            
            if (!res.success) {
              
              setTimeout(() => {
                showMessage(
                  "error",
                  "Book Not Found",
                  res.error || "Failed to fetch students"
                );
              }, 200);
              // return;
            } else {
              // Book found - show loader and success message
              showLoading();
              showMessage("success", "Book Found!", "Loading edit page...");

              // Store book data and navigate to edit page
              setTimeout(() => {
                localStorage.setItem("bookData", JSON.stringify(res.data[0]));
                loadPage("edit-book");
                hideLoading();
              }, 2000);
            }
          });
        }, 1000);

      };
      const addBtn = document.getElementById("add-btn");
      if (addBtn) {
        addBtn.addEventListener("click", async () => {

          const accession_no = document.getElementById("Accession_no").value.trim();
          const title = document.getElementById("title").value.trim();
          const Author = document.getElementById("Author").value.trim();
          const edition = document.getElementById("edition").value.trim();
          const publisher = document.getElementById("publisher").value.trim();
          const pub_location = document.getElementById("Pub_location").value.trim();
          const pages = document.getElementById("Pages").value.trim();
          const language_code = document.getElementById("Language_code").value.trim();
          const bill_no = document.getElementById("Bill_no").value.trim();
          const bill_date = document.getElementById("Bill_date").value.trim();
          const purchase_date = document.getElementById("Purchase_Date").value.trim();
          const location = document.getElementById("location").value.trim();
          const total_copies = document.getElementById("Total_copies").value.trim();
          const available_copies =
            document.getElementById("Available_copies").value.trim();
          const department = document.getElementById("department").value.trim();
          const cost = document.getElementById("Cost").value.trim();

          try {
            // Validate all required fields
            if (
              !accession_no ||
              !title ||
              !Author ||
              !edition ||
              !publisher ||
              !pub_location ||
              !pages ||
              !language_code ||
              !bill_no ||
              !bill_date ||
              !purchase_date ||
              !location ||
              !total_copies ||
              !available_copies ||
              !department ||
              !cost
            ) {
              showMessage(
                "error",
                "Missing Fields",
                "Please fill all the required fields"
              );
              return;
            }

            // Collect book data
            book = {
              Accession_no: accession_no,
              Title: title,
              Author: Author,
              Edition: Number(edition),
              Publisher: publisher,
              Pub_location: pub_location,
              Pages: Number(pages),
              Language_code: language_code,
              Bill_no: bill_no,
              Bill_date: new Date(bill_date).toISOString().split("T")[0],
              Department: department,
              Purchase_Date: new Date(purchase_date)
                .toISOString()
                .split("T")[0],
              Cost: Number(cost),
              Location: location,
              Total_copies: Number(total_copies),
              Available_copies: Number(available_copies),
            };

            // Disable button during processing
            addBtn.disabled = true;
            addBtn.textContent = "Adding...";
            
            // Call AddBook and wait for response
            const result = await window.BOOKS.AddBook(book);

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
                result?.error || "Unknown error"
              );
              // 

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

    // Excel Upload page initialization
    if (page == "Upload-Excel") {
      const dbError = localStorage.getItem("DBERROR");

      if (dbError) {
        showMessage("error", "Database Error", dbError);
        return;
      }
      if (userRole == "librarian") {

        // Set up progress listener
        window.BOOKS.onUploadProgress((data) => {
          const statusText = document.getElementById("upload-status-text");
          const progressText = document.getElementById("upload-progress-text");

          if (statusText)
            statusText.textContent = data.status || "Processing...";
          if (progressText)
            progressText.textContent = `Progress: ${data.progress || 0}%`;
        });

        // Set up error listener
        window.BOOKS.onUploadError((data) => {
          hideLoading();
          showMessage(
            "error",
            "Upload Failed",
            data.message || "An error occurred during upload"
          );
        });

        // Add click event to the excel file selector
        const excelFileBtn = document.getElementById("excel-file");
        if (excelFileBtn) {
          excelFileBtn.addEventListener("click", async () => {

            try {
              showLoading();

              // Call the IPC handler to show dialog and process file
              const result = await window.BOOKS.showDialogForExcel();

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
                  result.error || "An error occurred"
                );
              }
            } catch (error) {
              hideLoading();
              
              showMessage(
                "error",
                "Upload Failed",
                error.message || "An unexpected error occurred"
              );
            }
          });
        }
      } else {
        showMessage(
          "error",
          "Unauthorized",
          "You are not authorized to access this page"
        );
      }
    }

    if (page == "upload_student") {
      const dbError = localStorage.getItem("DBERROR");

      if (dbError) {
        showMessage("error", "Database Error", dbError);
        return;
      }
      if (userRole == "librarian") {

        // Set up progress listener
        window.BOOKS.onUploadProgress((data) => {
          const statusText = document.getElementById("upload-status-text");
          const progressText = document.getElementById("upload-progress-text");

          if (statusText)
            statusText.textContent = data.status || "Processing...";
          if (progressText)
            progressText.textContent = `Progress: ${data.progress || 0}%`;
        });

        // Set up error listener
        window.BOOKS.onUploadError((data) => {
          hideLoading();
          showMessage(
            "error",
            "Upload Failed",
            data.message || "An error occurred during upload"
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
                  result.error || "An error occurred"
                );
              }
            } catch (error) {
              hideLoading();
              
              showMessage(
                "error",
                "Upload Failed",
                error.message || "An unexpected error occurred"
              );
            }
          });
        }
      } else {
        showMessage(
          "error",
          "Unauthorized",
          "You are not authorized to access this page"
        );
      }
    }

    if (page == "dashboard") {
      try {
        let totalBooks = window.BOOKS.getTotalBooks().then((res) => {

          if (res.success) {
            document.getElementById("Total_Books").innerText =
              res.total_books.toLocaleString();
            document.getElementById("Books_Issued").innerText =
              res.issue_books.toLocaleString();
            document.getElementById("Total_Students").innerText =
              res.total_students.toLocaleString();
            document.getElementById("Overdue_Books").innerText =
              res.due.toLocaleString();

            //setting the file to view the all data about the over due books in details
            const container = document.getElementById("overdue_books_details");
            container.addEventListener("click", () => {
              
              loadPage("Overdue_Books");
            });

            const container2 = document.getElementById("books_issued_details");
            container2.addEventListener("click", () => {
              
              loadPage("Return");
            });

            const container3 = document.getElementById("total_students_details");
            container3.addEventListener("click", () => {
              
              loadPage("Students");
            });
            const container4 = document.getElementById("total_books_details");
            container4.addEventListener("click", () => {
              
              loadPage("Books");
            });

            //=========================================================================
          } else {
            
            localStorage.setItem("DBERROR", res.error);
            );
            setTimeout(() => {
              showMessage(
                "error",
                "Failed To Load Data",
                res.error || "Failed To Load Data"
              );
            }, 500);

            document.getElementById("Total_Books").innerText = res.error;
            document.getElementById("Books_Issued").innerText = res.error;
            document.getElementById("Total_Students").innerText = res.error;
            document.getElementById("Overdue_Books").innerText = res.error;
          }
        });

      } catch (error) {
        showMessage("error", "Falied To Execute", error)

      }

    }

    //loading the Books Page and its Related Books Data that can be shown to the user

    if (page == "Books") {
      //getting the Data from the DB from The main.js file
      window.BOOKS.seeTotalBooks().then((res) => {
        // 

        localStorage.removeItem("DBERROR");

        // books = res.books;

        let table_body = document.getElementById("table-body");
        table_body.innerHTML = "";
        if (res.success) {
          if (res.All_books.length == 0) {
            table_body.innerHTML =
              '<tr><td colspan="11" class="text-center">No Record To Display</td></tr>';
            return;
          }
          //creating the row for the each data present in the Data from the main file (DB)
          // 
          // 
          displayBooks(res.All_books.slice(0, 50));

          searchBooks(res.All_books);
        } else {
          table_body.innerHTML =
            '<tr><td colspan="11" class="text-center text-muted py-4">Failed To Load Data</td></tr>';

          setTimeout(() => {
            showMessage(
              "error",
              "Failed To Load Data",
              res.error || "Failed To Load Data"
            );
          }, 500);
          return;
        }
      });

      const prev = document.getElementById("prev");
      const next = document.getElementById("next");

      next.addEventListener("click", function () {
        const current = document.querySelector(".page.active");
        let next_sib = null;

        if (!current) return;

        let temp = current.nextElementSibling;

        while (temp && !temp.classList.contains("page")) {
          temp = temp.nextElementSibling;
        }

        next_sib = temp;

        if (next_sib) {
          current.classList.remove("active");
          next_sib.classList.add("active");
        } else {
          showMessage("error", "Feature Is Comming Soon", "Keep Adding Books");
        }
      });

      prev.addEventListener("click", function () {
        const current = document.querySelector(".page.active");
        let prev_sib = null;

        if (!current) return;

        let temp = current.previousElementSibling;

        while (temp && !temp.classList.contains("page")) {
          temp = temp.previousElementSibling;
        }

        prev_sib = temp;

        if (prev_sib) {
          current.classList.remove("active");
          prev_sib.classList.add("active");
        } else {
          showMessage("error", "Feature Is Comming Soon", "Keep Adding Books");
        }
      });

      const page_btns = document.querySelectorAll(".page");
      page_btns.forEach((btn) => {
        btn.addEventListener("click", function () {
          if (this.classList.contains("active")) {
            return;
          }
          const current = document.querySelector(".page.active");
          if (current) {
            current.classList.remove("active");
          }
          this.classList.add("active");
        });
      });

      //Handling the EXPORT function 

      const export_btn = document.getElementById("export-btn");
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
            showMessage("success", "Books Exported Successfully", "Books Exported Successfully");
          }
          else {
            export_btn.disabled = false;
            export_btn.innerHTML = exportIcon;
            showMessage("error", "Failed To Export Books", res.error || "Failed To Export Books");
          }
        })

      })
    }
    if (page === "add_student") {
      const dbError = localStorage.getItem("DBERROR");

      if (dbError) {
        showMessage("error", "Database Error", dbError);
        return;
      }

      let add_stu_btn = document.getElementById("add-student-btn");

      if (add_stu_btn) {
        add_stu_btn.addEventListener("click", (e) => {
          // 
          const name = document.getElementById("name").value.trim();
          const enrollment_no = document
            .getElementById("enrollment_no")
            .value.trim();
          const department = document.getElementById("department").value.trim();
          const year = document.getElementById("year").value.trim();
          const email = document.getElementById("email").value.trim();
          const phone = document.getElementById("phone").value.trim();
          if (
            name != "" &&
            enrollment_no != "" &&
            department != "" &&
            year != "" &&
            email != "" &&
            phone != ""
          ) {
            student = {
              name: name,
              enrollment_no: Number(enrollment_no),
              department: department,
              year: Number(year),
              email: email,
              phone: phone,
            };
          } else {
            if (
              name == "" &&
              enrollment_no == "" &&
              department == "" &&
              year == "" &&
              email == "" &&
              phone == ""
            ) {
              showMessage(
                "error",
                "All Fields Are Required",
                "All Fields Are Required"
              );
              return;
            }
            if (name == "") {
              showMessage("error", "Name Is Required", "Name Is Required");
              return;
            }
            if (enrollment_no == "") {
              showMessage(
                "error",
                "Enrollment Number Is Required",
                "Enrollment Number Is Required"
              );
              return;
            }
            if (department == "") {
              showMessage(
                "error",
                "Department Is Required",
                "Department Is Required"
              );
              return;
            }
            if (year == "") {
              showMessage("error", "Year Is Required", "Year Is Required");
              return;
            }
            if (email == "") {
              showMessage("error", "Email Is Required", "Email Is Required");
              return;
            }
            if (phone == "") {
              showMessage(
                "error",
                "Phone Number Is Required",
                "Phone Number Is Required"
              );
              return;
            }
            return;
          }
          document.getElementById("name").value = "";
          document.getElementById("enrollment_no").value = "";
          document.getElementById("department").value = "";
          document.getElementById("year").value = "";
          document.getElementById("email").value = "";
          document.getElementById("phone").value = "";
          
          window.BOOKS.addStudent(student).then((res) => {
            if (!res.success) {
              
              showMessage(
                "error",
                "Error Occurred While Adding Student",
                res.error
              );
            } else {
              
              showMessage(
                "success",
                "Student Added Successfully",
                "Student Added Successfully"
              );
            }
          })

        });
      }
    }

    if (page == "Students") {
      if (userRole == "librarian") {
        window.BOOKS.getStudents().then((res) => {

          if (!res.success) {
            
            setTimeout(() => {
              showMessage(
                "error",
                "Database Error",
                res.error || "Failed to fetch students"
              );
            }, 500);
            // return;
          }

          displayStudents(res.data);
          
          searchStudents(res.data);
        });
      } else {
        showMessage(
          "error",
          "Unauthorized",
          "You are not authorized to access this page"
        );
      }
    }
    //end of students

    if (page == "Issue_Book") {
      const dbError = localStorage.getItem("DBERROR");
      // localStorage.removeItem("DBERROR");

      if (dbError) {
        showMessage("error", "Database Error", dbError);
        return;
      }
      if (userRole == "librarian") {
        
        setDate(
          document.getElementById("issue_date"),
          document.getElementById("return_date")
        );

        const accession_no = document.getElementById("accession_no");
        const enrollment_no = document.getElementById("enrollment_no");
        const issue_btn = document.getElementById("issue-btn");

        let accession_no_value;
        let interval;
        accession_no.oninput = (e) => {
          clearInterval(interval);
          interval = setTimeout(() => {
            accession_no_value = e.target.value.trim();
            
            window.BOOKS.getTitle(accession_no_value).then((res) => {
              
              if (!res.success) {
                
                setTimeout(() => {
                  showMessage(
                    "error",
                    "Book Not Found",
                    res.error || "Failed to fetch students"
                  );
                }, 200);
                // return;
              } else {
                showMessage("success", "Book Found", "Book Found");
                document.getElementById("title").value = res.data.Title;
                document.getElementById("available_copies").value =
                  res.data.Available_copies;

              }
              //    
              //    displayStudents(res.data);
              //    
              //    searchStudents(res.data);
            });
          }, 1000);
        };
        let enrollment_no_value;

        enrollment_no.oninput = (e) => {
          clearInterval(interval);
          interval = setTimeout(() => {
            enrollment_no_value = e.target.value.trim();

            // if (!res.success) {
            //    
            //    setTimeout(() => {
            //       showMessage('error', 'Database Error', res.error || 'Failed to fetch students');
            //    }, 200);
            //    // return;
            // }
            // else {
            //    showMessage('success', 'Student Found', 'Student Found');
            //    document.getElementById('name').value = res.data[0].Name;
            //    
            // }
            //    
            //    displayStudents(res.data);
            //    
            //    searchStudents(res.data);
            window.BOOKS.getStudentData(enrollment_no_value).then((res) => {
              
              if (!res.success) {

                showMessage(
                  "error",
                  "Invalid Enrollment No",
                  "Please Enter Valid Roll Number"
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

        issue_btn.onclick = (e) => {
          // .value);

          // Get values once
          const accession_no = document
            .getElementById("accession_no")
            .value.trim();
          const enrollment_no = document
            .getElementById("enrollment_no")
            .value.trim();
          const return_date = document.getElementById("return_date").value;

          // Validate each field
          if (!accession_no) {
            showMessage(
              "error",
              "Accession No Required",
              "Please enter accession number"
            );
            return;
          }
          if (!enrollment_no) {
            showMessage(
              "error",
              "Enrollment No Required",
              "Please enter enrollment number"
            );
            return;
          }
          if (!return_date) {
            showMessage(
              "error",
              "Return Date Required",
              "Please select return date"
            );
            return;
          }
          issue_btn.disabled = true;
          issue_btn.style.backgroundColor = "#6c757d";
          issue_btn.textContent = "Processing...";

          window.BOOKS.issueBook({
            accession_no: accession_no,
            enrollment_no: enrollment_no,
            issue_date: document.getElementById("issue_date").value,
            return_date: return_date,
          }).then((res) => {
            if (!res.success) {
              
              issue_btn.style.backgroundColor = "#dc3545";
              issue_btn.textContent = "✕ Failed!";
              showMessage("error", "Book Not Available", "Book Not Available");
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
              showMessage(
                "error",
                "Book Not Found",
                "Book or student not found"
              );
              issue_btn.style.backgroundColor = "#dc3545";
              issue_btn.textContent = "✕ Failed!";
              setTimeout(() => {
                issue_btn.style.backgroundColor = "";
                issue_btn.textContent = "Issue";
                issue_btn.disabled = false;
              }, 2000);
              return;
            }
            issue_btn.style.backgroundColor = "#28a745";
            issue_btn.textContent = "✓ Issued!";

            document.getElementById("name").value = res.stu_data[0].name;
            document.getElementById("year").value = res.stu_data[0].year;
            document.getElementById("title").value = res.book_data[0].title;
            showMessage(
              "success",
              "Book Issued Successfully",
              "Book Issued Successfully"
            );

            document.getElementById("issue_date").value = "";
            document.getElementById("return_date").value = "";
            document.getElementById("accession_no").value = "";
            document.getElementById("enrollment_no").value = "";
            document.getElementById("name").value = "";
            document.getElementById("year").value = "";
            document.getElementById("title").value = "";
            document.getElementById("available_copies").value = "";

            setTimeout(() => {
              issue_btn.style.backgroundColor = "";
              issue_btn.textContent = "Issue";
              issue_btn.disabled = false;
            }, 2000);
            
          });
        };
      } else {
        showMessage(
          "error",
          "Unauthorized",
          "You are not authorized to access this page"
        );
        return;
      }
    }

    if (page == "Return") {
      const dbError = localStorage.getItem("DBERROR");

      if (dbError) {
        showMessage("error", "Database Error", dbError);
        return;
      }
      if (userRole == "librarian") {

        window.BOOKS.getIssuedBooks().then((res) => {

          // displayStudents(res.data);
          // 
          // searchStudents(res.data);
          const tbody = document.getElementById("return-data");
          if (!res.data) {
            tbody.innerHTML = "<tr><td colspan='8' style='text-align: center;'><b> No Issued Books Found</b> </td></tr>";
          } else {
            tbody.innerHTML = "";
            res.data.forEach((book) => {
              const row = document.createElement("tr");

              row.innerHTML = `
                  <td>${book.book_title}</td>
                  <td>${book.student_name}</td>
                  <td>${book.enrollment_no}</td>
                  <td>${book.student_year}</td>
                  <td>${book.student_department}</td>
                  <td>${new Date(book.issue_date).toISOString().split("T")[0]
                }</td>
                  <td>${new Date(book.actual_return_date)
                  .toISOString()
                  .split("T")[0]
                }</td>
                  <td class="status">${book.status}</td>
                  `;
              tbody.appendChild(row);

            });
            let status = document.querySelectorAll(".status");
            
            status.forEach((status) => {
              if (status.textContent == "due") {
                status.style.color = "#dc2626";
                status.style.fontWeight = "700";
              } else if (status.textContent == "returned") {
                status.style.color = "#28a745";
                status.style.fontWeight = "700";
              } else {
                status.style.color = "#e0ae09e1";
                status.style.fontWeight = "700";
              }
            });
          }
        });
      } else {
        showMessage(
          "error",
          "Unauthorized",
          "You are not authorized to access this page"
        );
        return;
      }
    }

    if (page == "return_book") {
      const dbError = localStorage.getItem("DBERROR");

      if (dbError) {
        showMessage("error", "Database Error", dbError);
        return;
      }
      if (userRole == "librarian") {
        
        //setting the book_id so that we can update the status of the book After clicking the return button
        let book_id;
        let student_id;
        //setting the backend color dark to make as the Blocked Fields
        // so user can't change the values
        const return_btn = document.getElementById("file-return");
        document.getElementById("return_date").value = new Date()
          .toISOString()
          .split("T")[0];
        document.getElementById("title").style.backgroundColor = "#F8F9FB";
        document.getElementById("stu_nm").style.backgroundColor = "#F8F9FB";
        document.getElementById("stu_yr").style.backgroundColor = "#F8F9FB";
        document.getElementById("stu_dpt").style.backgroundColor = "#F8F9FB";
        document.getElementById("return_date").style.backgroundColor =
          "#F8F9FB";
        document.getElementById("issued_date").style.backgroundColor =
          "#F8F9FB";

        const accession_no = document.getElementById("accession_no");
        let accession_no_value;
        let interval;
        let issued_data = [];
        //setting the accession number event listener so that each time the user types the accession number
        // the list of students will be updated
        accession_no.oninput = (e) => {
          clearInterval(interval);
          const list = document.getElementById("stu_enroll");

          list.innerHTML = "";

          list.onchange = (e) => {

            //setting the student data(populating the student data in proper fields)
            issued_data.forEach((stu) => {
              if (stu.stu_enroll == e.target.value) {
                document.getElementById("title").value = stu.book_title;
                document.getElementById("stu_nm").value = stu.stu_nm;
                document.getElementById("stu_yr").value = stu.stu_yr;
                document.getElementById("stu_dpt").value = stu.dept;
                document.getElementById("stu_enroll").value = stu.stu_enroll;
                document.getElementById("issued_date").value = new Date(
                  stu.issue_date
                )
                  .toISOString()
                  .split("T")[0];
              }
            });
          };

          //setting the accession number event listener so that each time the user types the accession number
          // the list of students will be updated  and the DATABASE call is made to get the student data
          // after each 300ms of typing to take some char as input to pass to the DATABASE call
          interval = setTimeout(() => {
            accession_no_value = e.target.value.trim();

            //if the accession number is empty then clear the list
            if (accession_no_value == "") {
              list.innerHTML = "<option value=''>Select Student</option>";
              return;
            }

            //DATABASE call to get the student data
            window.BOOKS.getDataOfIssuedBook(accession_no_value).then((res) => {
              //setting data in the another [] so that it can be used in the onchange event of the list
              issued_data = res.data;

              //if the data is found then populate the list and dispatch the change event
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

                // here it helps to populate the list and dispatch the change event
                // so that the onchange event can be triggered on the every input of the accession number
                list.selectedIndex = 0;
                list.dispatchEvent(new Event("change"));
                showMessage("success", "Data Found", "Data Found");
              }
              // if the data is not found then clear the list and show the message
              if (res.error) {
                showMessage(
                  "error",
                  "No Data Found",
                  "No issued book found with this accession number"
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
            });
          }, 1000);
        };

        return_btn.onclick = (e) => {

          // Get current accession number value from input
          const currentAccessionValue = accession_no.value.trim();

          if (!currentAccessionValue || currentAccessionValue === "" || !accession_no_value) {
            showMessage("error", "Error", "Please enter accession number");
            return;
          }
          window.BOOKS.fileReturn({
            ac_no: accession_no_value,
            stu_id: student_id,
            book_id: book_id,
            //  book_id: book_id,
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
              showMessage(
                "success",
                "Book Returned",
                "Book Returned Successfully"
              );
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
              showMessage(
                "error",
                "Book Not Returned",
                "Book Returned Failed"
              );
              setTimeout(() => {
                return_btn.style.backgroundColor = "";
                return_btn.textContent = "Return Book";
                return_btn.disabled = false;
              }, 2000);
            }
          });
        };
      } else {
        showMessage(
          "error",
          "Unauthorized",
          "You are not authorized to access this page"
        );
        return;
      }
    }

    if (page == "Overdue_Books") {
      if (userRole == "librarian") {
        window.BOOKS.calculateFine().then((res) => {
          
          if (res.success) {
            if (res.data.length > 0) {
              const tbody = document.getElementById("overdue-table-body");
              tbody.innerHTML = "";
              res.data.forEach((book) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                <td>${book.book_title}</td>
                <td>${book.book_accession}</td>
                <td>${book.student_name}</td>
                <td>${book.student_enrollment}</td>
                <td>${book.student_dept}</td>
                <td>${book.student_year}</td>
                <td style="color: #dc2626; font-weight: 700;">₹${book.fine}</td>
                <td style="color: #dc2626; font-weight: 700;">${book.fineDays} days</td>
              `;
                tbody.appendChild(tr);
              });
            }
          }
          if (res.error) {
            showMessage("error", "No Overdue Books", "No Overdue Books Found");
          }
        });
      } else {
        showMessage(
          "error",
          "Unauthorized",
          "You are not authorized to access this page"
        );
      }
    }
    if (page == "Update_Student") {
      if (userRole == "librarian") {

        let currentStudentData = null; // Store current student being edited

        // Check if we're editing a student from the table
        const editingStudent = localStorage.getItem("editingStudent");

        if (editingStudent) {
          try {
            // Pre-fill the form with student data
            const student = JSON.parse(editingStudent);
            currentStudentData = student;

            // Populate form fields
            document.getElementById("stu_roll").value =
              student.enrollment_no || "";
            document.getElementById("stu_name").value = student.name || "";
            document.getElementById("stu_email").value = student.email || "";
            document.getElementById("stu_yr").value = student.year || "";
            document.getElementById("stu_dpt").value =
              student.Department || student.department || "";
            document.getElementById("stu_ph").value = student.phone || "";

            // Enable all fields for editing
            document.getElementById("stu_roll").removeAttribute("disabled");
            document.getElementById("stu_name").removeAttribute("disabled");
            document.getElementById("stu_email").removeAttribute("disabled");
            document.getElementById("stu_yr").removeAttribute("disabled");
            document.getElementById("stu_dpt").removeAttribute("disabled");
            document.getElementById("stu_ph").removeAttribute("disabled");

            // Clear the localStorage
            localStorage.removeItem("editingStudent");

            showMessage("success", "Student Loaded", `Editing ${student.name}`);
          } catch (error) {
            
            showMessage("error", "Error", "Failed to load student data");
          }
        }

        // Update student button click handler
        const update_student = document.getElementById("update-student");

        if (update_student) {
          update_student.onclick = (e) => {

            if (!currentStudentData) {
              showMessage(
                "error",
                "No Student Selected",
                "Please select a student to edit from the Students page"
              );
              return;
            }

            // Get updated values from form
            const updatedStudent = {
              id: currentStudentData.id,
              enrollment_no: document.getElementById("stu_roll").value.trim(),
              name: document.getElementById("stu_name").value.trim(),
              email: document.getElementById("stu_email").value.trim(),
              year: document.getElementById("stu_yr").value.trim(),
              department: document.getElementById("stu_dpt").value.trim(),
              phone: document.getElementById("stu_ph").value.trim(),
            };

            // Validate required fields
            if (
              !updatedStudent.enrollment_no ||
              !updatedStudent.name ||
              !updatedStudent.email ||
              !updatedStudent.year ||
              !updatedStudent.department ||
              !updatedStudent.phone
            ) {
              showMessage(
                "error",
                "Missing Fields",
                "Please fill all required fields"
              );
              return;
            }

            // Disable button during update
            update_student.disabled = true;
            update_student.textContent = "Updating...";

            // Call update API
            window.BOOKS.updateStudent(updatedStudent)
              .then((res) => {
                
                if (res.success) {
                  update_student.style.backgroundColor = "#28a745";
                  update_student.textContent = "✓ Updated!";

                  showMessage(
                    "success",
                    "Student Updated",
                    "Student information updated successfully"
                  );

                  // Navigate back to Students page after 1.5 seconds
                  setTimeout(() => {
                    loadPage("Students");
                  }, 1500);
                } else {
                  update_student.style.backgroundColor = "#dc3545";
                  update_student.textContent = "✕ Failed!";

                  showMessage(
                    "error",
                    "Update Failed",
                    res.error || "Failed to update student"
                  );

                  // Reset button after 2 seconds
                  setTimeout(() => {
                    update_student.style.backgroundColor = "";
                    update_student.textContent = "Update";
                    update_student.disabled = false;
                  }, 2000);
                }
              })
              .catch((error) => {
                
                update_student.style.backgroundColor = "#dc3545";
                update_student.textContent = "✕ Error!";

                showMessage("error", "Error", "An unexpected error occurred");

                setTimeout(() => {
                  update_student.style.backgroundColor = "";
                  update_student.textContent = "Update";
                  update_student.disabled = false;
                }, 2000);
              });
          };
        }
      } else {
        showMessage(
          "error",
          "Unauthorized",
          "You are not authorized to access this page"
        );
      }
    }
    if (page == "edit-book") {
      if (userRole == "librarian") {
        let currentBookData = null;

        // getting the data from the localStorage
        const editingBookData = localStorage.getItem("bookData");

        if (editingBookData) {
          try {
            currentBookData = JSON.parse(editingBookData);

            //filling the form data into the required fields (matching database column names)
            document.getElementById("title").value =
              currentBookData.Title || "";
            document.getElementById("Accession_no").value =
              currentBookData.Accession_no || "";
            document.getElementById("Author").value =
              currentBookData.Author || "";
            document.getElementById("publisher").value =
              currentBookData.Publisher || "";
            document.getElementById("Pub_location").value =
              currentBookData.Pub_location || "";
            document.getElementById("Language_code").value =
              currentBookData.Language_code || "";
            document.getElementById("Bill_no").value =
              currentBookData.Bill_no || "";
            document.getElementById("department").value =
              currentBookData.Department || "";
            document.getElementById("location").value =
              currentBookData.Location || "";
            document.getElementById("edition").value =
              currentBookData.Edition || 1;
            document.getElementById("Cost").value = currentBookData.Cost || 0;
            document.getElementById("Pages").value = currentBookData.Pages || 1;
            document.getElementById("Total_copies").value =
              currentBookData.Total_copies || 1;
            document.getElementById("Available_copies").value =
              currentBookData.Available_copies || 1;
            document.getElementById("Bill_date").value =
              currentBookData.Bill_date
                ? currentBookData.Bill_date.split("T")[0]
                : "";
            document.getElementById("Purchase_Date").value =
              currentBookData.Purchase_Date
                ? currentBookData.Purchase_Date.split("T")[0]
                : "";

            // Clear localStorage after loading
            localStorage.removeItem("bookData");

            showMessage(
              "success",
              "Book Loaded",
              `Editing ${currentBookData.Title}`
            );
          } catch (error) {
            
            showMessage("error", "Error", "Failed to load book data");
          }

          const update_btn = document.getElementById("update-book-btn");
          if (update_btn) {
            update_btn.onclick = (e) => {
              if (document.getElementById("title").value == "") {
                showMessage("error", "Error", "Title is required");
              } else if (document.getElementById("Accession_no").value == "") {
                showMessage("error", "Error", "Accession Number is required");
              } else if (document.getElementById("Author").value == "") {
                showMessage("error", "Error", "Author is required");
              } else if (document.getElementById("publisher").value == "") {
                showMessage("error", "Error", "Publisher is required");
              } else if (document.getElementById("Pub_location").value == "") {
                showMessage(
                  "error",
                  "Error",
                  "Publication Location is required"
                );
              } else if (document.getElementById("Language_code").value == "") {
                showMessage("error", "Error", "Language Code is required");
              } else if (document.getElementById("department").value == "") {
                showMessage("error", "Error", "Department is required");
              } else if (document.getElementById("location").value == "") {
                showMessage("error", "Error", "Location is required");
              } else if (document.getElementById("edition").value == "") {
                showMessage("error", "Error", "Edition is required");
              } else if (document.getElementById("Cost").value == "") {
                showMessage("error", "Error", "Cost is required");
              } else if (document.getElementById("Pages").value == "") {
                showMessage("error", "Error", "Pages is required");
              } else if (document.getElementById("Total_copies").value == "") {
                showMessage("error", "Error", "Total Copies is required");
              } else if (
                document.getElementById("Available_copies").value == ""
              ) {
                showMessage("error", "Error", "Available Copies is required");
              } else if (document.getElementById("Purchase_Date").value == "") {
                showMessage("error", "Error", "Purchase Date is required");
              } else {
                //Creating the object to pass it to the Edit Book Handler so that it can update the book data in the database
                const updatedBookData = {
                  id: currentBookData.id,
                  Title: document.getElementById("title").value.trim(),
                  Accession_no: document
                    .getElementById("Accession_no")
                    .value.trim(),
                  Author: document.getElementById("Author").value.trim(),
                  Publisher: document.getElementById("publisher").value.trim(),
                  Pub_location: document
                    .getElementById("Pub_location")
                    .value.trim(),
                  Language_code: document
                    .getElementById("Language_code")
                    .value.trim(),
                  Bill_no:
                    document.getElementById("Bill_no").value.trim() ||
                    "NOT PRESENT",
                  Department: document
                    .getElementById("department")
                    .value.trim(),
                  Location: document.getElementById("location").value.trim(),
                  Edition:
                    parseInt(document.getElementById("edition").value.trim()) ||
                    1,
                  Cost:
                    parseFloat(document.getElementById("Cost").value.trim()) ||
                    0,
                  Pages:
                    parseInt(document.getElementById("Pages").value.trim()) ||
                    1,
                  Total_copies:
                    parseInt(
                      document.getElementById("Total_copies").value.trim()
                    ) || 1,
                  Available_copies:
                    parseInt(
                      document.getElementById("Available_copies").value.trim()
                    ) || 1,
                  Bill_date: document.getElementById("Bill_date").value,
                  Purchase_Date: document.getElementById("Purchase_Date").value,
                };
                // Disable button during update
                update_btn.disabled = true;
                update_btn.textContent = "Updating...";

                updateBook(updatedBookData, update_btn);
              }
            };
          }
        }
      } else {
        showMessage(
          "error",
          "Unauthorized",
          "You are not authorized to access this page"
        );
      }
    }
  }

  // Sidebar navigation
  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();

      // Remove active class from all
      navItems.forEach((i) => i.classList.remove("active"));

      // Add active to clicked
      item.classList.add("active");

      // Load the page
      const page = item.getAttribute("data-page");
      loadPage(page);
    });
  });

  // Event delegation for dynamic content (e.g., Add Book button)
  //here we add the event listener to the content area i.e parent so click event is not lost and captured
  contentArea.addEventListener("click", (e) => {
    if (e.target.id === "view-books") {
      //here we check if the clicked element is add-book or its parent

      loadPage("Books"); // if it is then load the Books page
    } else if (
      e.target.classList.contains("return-book") ||
      e.target.closest(".return-book")
    ) {
      //here we check if the clicked element is add-book or its parent
      // 
      loadPage("Return"); // if it is then load the Add_Book page
    } else if (
      e.target.classList.contains("Upload-Excel") ||
      e.target.closest(".upload-Excel")
    ) {
      //here we check if the clicked element is add-book or its parent
      
      loadPage("Upload-Excel"); // if it is then load the Add_Book page
      // window.BOOKS.uploadExcel();
    } else if (
      e.target.classList.contains("issue-book") ||
      e.target.closest(".issue-book")
    ) {
      
      loadPage("Issue_Book");
    } else if (
      e.target.classList.contains("new-student") ||
      e.target.closest(".new-student")
    ) {
      // 
      loadPage("add_student");
    } else if (
      e.target.classList.contains("upload-student") ||
      e.target.closest(".upload-student")
    ) {
      // 
      loadPage("upload_student");
    } else if (
      e.target.classList.contains("return-btn") ||
      e.target.closest(".return-btn")
    ) {
      // 
      loadPage("return_book");
    }
  });

  //Function to Display the Books in the Table
  // function displayBooks(booksToDisplay) {
  //   const tbody = document.getElementById("table-body");
  //   tbody.innerHTML = "";

  //   if (booksToDisplay.length === 0) {
  //     tbody.innerHTML =
  //       '<tr><td colspan="12" class="text-center">No books found</td></tr>';
  //     return;
  //   }

  //   booksToDisplay.forEach((book) => {
  //     const row = document.createElement("tr");

  //     row.innerHTML = `
  //        <td>${book.id}</td>
  //        <td>${book.Accession_no}</td>
  //        <td>${book.Title}</td>
  //        <td>${book.Author}</td>
  //        <td>${book.Edition}</td>
  //        <td>${book.Pages}</td>
  //        <td>${book.Language_code}</td>
  //        <td>${book.Department}</td>
  //        <td>${book.Cost}</td>
  //        <td>${book.Location}</td>
  //        <td>${book.Available_copies}</td>
  //        <td>
  //            <button type="button" class="btn btn-primary" book-data='${JSON.stringify(book)}' id="edit-book-btn"><span class="btn-icon">✏️&nbsp;</span>Edit</button>
  //        </td>
  //        <td>
  //            <button type="button" class="btn btn-danger delete-book-btn" book_id='${JSON.stringify(book.id)}'>
  //              <span class="btn-icon">🗑️</span> Delete
  //            </button>
  //        </td>

  //     `;

  //     tbody.appendChild(row);
  //   });
  //   document.querySelectorAll("#edit-book-btn").forEach((btn) => {
  //     btn.addEventListener("click", function () {
  //       const bookData = JSON.parse(this.getAttribute("book-data"));
  //       editBook(bookData);
  //     });
  //   });
  //   document.querySelectorAll(".delete-book-btn").forEach((btn) => {
  //     btn.addEventListener("click", function () {
  //       const bookId = JSON.parse(this.getAttribute("book_id"));
  //       deleteBookOrStudent(bookId);
  //     });
  //   });
  // }

  // displayBooks(booksToDisplay);
  //editBook Function
  // editBook(bookData);
  // function editBook(bookData) {
  //   
  //   //accepting the Student Data in data variable

  //   //setting the data in local Storage so that the data can be used in the edit_book.html page
  //   localStorage.setItem("bookData", JSON.stringify(bookData));

  //   //redirecting to the edit_book.html page
  //   loadPage("edit-book");
  // }
  function deleteBookOrStudent(book_id, stu_id) {
    
    if (book_id) {
      window.BOOKS.deleteBookOrStudent(book_id, stu_id).then(res => {
        if (res.success) {
          showMessage("success", "Book Deleted", "Book deleted successfully");
          setTimeout(() => {
            loadPage("Books");
          }, 1000)

        } else {
          showMessage("error", "Book Not Deleted", res.error);
        }
      });

    }
    if (stu_id) {
      window.BOOKS.deleteBookOrStudent(book_id, stu_id).then(res => {
        if (res.success) {
          showMessage("success", "Student Deleted", "Student deleted successfully");
          setTimeout(() => {
            loadPage("Students");
          }, 1000)

        } else {
          showMessage("error", "Student Not Deleted", res.error);
        }
      });

    }

  }

  //Updatebook function that calls to the ipcMain to update the book data in the database
  function updateBook(bookData, update_btn) {

    //accepting the Student Data in data variable

    if (bookData) {
      window.BOOKS.updateBook(bookData)
        .then((res) => {
          if (res.success) {
            update_btn.style.backgroundColor = "#28a745";
            update_btn.textContent = "✓ Updated!";

            showMessage(
              "success",
              "Book Updated",
              "Book information updated successfully"
            );

            // Navigate back to Students page after 1.5 seconds
            setTimeout(() => {
              loadPage("Books");
            }, 1500);
          } else {
            update_btn.style.backgroundColor = "#dc3545";
            update_btn.textContent = "✕ Failed!";

            showMessage(
              "error",
              "Update Failed",
              res.error || "Failed to update book"
            );

            // Reset button after 2 seconds
            setTimeout(() => {
              update_btn.style.backgroundColor = "";
              update_btn.textContent = "Update";
              update_btn.disabled = false;
            }, 2000);
          }
        })
        .catch((error) => {
          
          update_btn.style.backgroundColor = "#dc3545";
          update_btn.textContent = "✕ Error!";

          showMessage("error", "Error", "An unexpected error occurred");

          setTimeout(() => {
            update_btn.style.backgroundColor = "";
            update_btn.textContent = "Update";
            update_btn.disabled = false;
          }, 2000);
        });
    } else {
      showMessage("error", "Error", "Error While Sending The Data");
    }
  }

  // Function to search books in the table with debouncing
  function searchBooks(allbooks) {
    const searchInput = document.getElementById("search"); // Get search input element
    let searchTimeout; // Store timeout ID for debouncing

    if (!searchInput) return; // Exit if search input doesn't exist

    // Handle input events with debouncing to prevent excessive queries
    searchInput.oninput = (e) => {
      clearTimeout(searchTimeout); // Cancel previous search timer

      const searchTerm = e.target.value.trim();

      // Show first 100 books when search is empty
      if (searchTerm === "") {
        displayBooks(allbooks.slice(0, 100));
        return;
      }

      // Require minimum 3 characters to reduce lag and improve relevance
      if (searchTerm.length < 1) {
        return;
      }

      // Execute database search after 300ms delay (debouncing)
      // This ensures search only fires after user stops typing
      searchTimeout = setTimeout(() => {
        window.BOOKS.searchBooks(searchTerm).then((res) => {
          if (res.success) {
            // showMessage("success", "Book Found", "Book Found")
            displayBooks(res.data);
          } else if (res.error || res.data == undefined) {
            showMessage("error", "No Such Book Found", "No Such Book Found");
            
          }
        });
      }, 300);
    };
  }

  //function to Display the Students

  function displayStudents(data) {
    //accepting the Student Data in data variable

    let table_body = document.getElementById("table-body");
    table_body.innerHTML = "";

    if (!data) {
      table_body.innerHTML =
        '<tr><td colspan="7" class="text-center">No Record To Display</td></tr>';
      return;
    }
    if (data.length > 0) {
      data.forEach((student) => {
        
        const row = document.createElement("tr");

        row.innerHTML = `
         <td>${student.name}</td>
         <td>${student.enrollment_no}</td>
         <td>${student.Department}</td>
         <td>${student.year}</td>
         <td>${student.phone}</td>
         <td>${student.email}</td>
         <td>
           <button 
             class="btn btn-sm btn-primary edit-student-btn" 
             data-student-data='${JSON.stringify(student)}'>
              <span class="btn-icon">&nbsp;✏️</span>Edit
           </button>
           </td>
          <td>
            <button type="button" class="btn btn-danger delete-student-btn" student_id='${JSON.stringify(student.id)}'>
              <span class="btn-icon">🗑️</span> Delete
            </button>
          </td>

         `;

        table_body.appendChild(row);
      });

      // Add click event listeners to all edit buttons
      document.querySelectorAll(".edit-student-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
          const studentData = JSON.parse(
            this.getAttribute("data-student-data")
          );
          editStudent(studentData);
        });
      });
    } else {
      
      table_body.innerHTML =
        '<tr ><td colspan="7" class="text-center">NO Student Present </td></tr>';
    }

    // Add click event listeners to all delete buttons
    document.querySelectorAll(".delete-student-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const studentId = JSON.parse(this.getAttribute("student_id"));
        deleteBookOrStudent(undefined, studentId);
      });
    });
  }

  // Function to handle editing a student
  function editStudent(studentData) {

    // Store student data in localStorage to pass to Update_Student page
    localStorage.setItem("editingStudent", JSON.stringify(studentData));

    // Navigate to Update_Student page
    loadPage("Update_Student");
  }

  //function for searching the students
  function searchStudents(allstudents) {
    const searchInput = document.getElementById("search-input");
    
    let searchTimeout; // Store timeout ID for debouncing
    if (!searchInput) return;

    searchInput.oninput = (e) => {
      clearTimeout(searchTimeout);

      const searchTerm = e.target.value.trim();
      // Show first 100 students when search is empty

      if (searchTerm == "") {
        displayStudents(allstudents.slice(0, 100));
        return;
      }
      // Require minimum 3 characters to reduce lag and improve relevance

      if (searchTerm.length < 2) {
        return;
      }
      // Execute database search after 300ms delay (debouncing)
      // This ensures search only fires after user stops typing
      searchTimeout = setTimeout(() => {
        window.BOOKS.searchStudent(searchTerm).then((res) => {
          if (res.success) {
            displayStudents(res.data);
          } else {
            showMessage(
              "error",
              "No Such Student Found",
              "No Such Student Found"
            );
            
          }
        });
      }, 300);
    };

  }

  function setDate(issue_date, return_date) {
    const today = new Date().toISOString().split("T")[0];

    issue_date.min = today;
    issue_date.max = today;
    issue_date.value = today;

    return_date.min = today;
  }
});

