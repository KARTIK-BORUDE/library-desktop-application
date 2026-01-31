import { showMessage } from "../utils/ui-helpers.js";
import {
  displayStudents,
  searchStudents,
} from "../components/student-table.js";

/**
 * Initialize the Students page
 */
export async function initStudentsPage(loadPageCallback) {
  const userRole = window.userRole;

  if (userRole !== "librarian") {
    showMessage(
      "error",
      "Unauthorized",
      "You are not authorized to access this page",
    );
    return;
  }

  let stu_data = await window.BOOKS.getStudents(); //.then((res) => {
  //

  //     if (!res.success) {
  //
  //       setTimeout(() => {
  //         showMessage(
  //           "error",
  //           "Database Error",
  //           res.error || "Failed to fetch students",
  //         );
  //       }, 500);
  //       return;
  //     }

  //     //
  //     // displayStudents(res.data, loadPageCallback);
  //     //
  //   });
  //   displayStudents(data, loadPageCallback);
  // stu_data.success = false;
  if (!stu_data.success) {
    showMessage("error", "Failed to Fetch Students Data ", stu_data.error);
    return;
  }

  const csStudents = stu_data.data.filter((data) => data.Department === "CO");
  //only passing the data of the computer science students to the displayStudents function
  // here apssing thee array of the data get from the database to the displayStudents function
  displayStudents(csStudents, loadPageCallback);

  searchStudents(stu_data.data, loadPageCallback);
}
