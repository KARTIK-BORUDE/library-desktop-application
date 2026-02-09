import { showMessage } from "./ui-helpers.js";

/**
 * Validates book form data
 * @param {Object} bookData - Book form data to validate
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export function validateBookForm(bookData) {
  const errors = [];
  const requiredFields = [
    { key: "Accession_no", label: "Accession Number" },
    { key: "Title", label: "Title" },
    { key: "Author", label: "Author" },
    { key: "Edition", label: "Edition" },
    { key: "Publisher", label: "Publisher" },
    { key: "Pub_location", label: "Publication Location" },
    { key: "Pages", label: "Pages" },
    { key: "Language_code", label: "Language Code" },
    { key: "Bill_no", label: "Bill Number" },
    { key: "Bill_date", label: "Bill Date" },
    { key: "Location", label: "Location" },
    { key: "Total_copies", label: "Total Copies" },
    { key: "Available_copies", label: "Available Copies" },
    { key: "Department", label: "Department" },
    { key: "Cost", label: "Cost" },
  ];

  for (const field of requiredFields) {
    if (!bookData[field.key] || String(bookData[field.key]).trim() === "") {
      errors.push(`${field.label} is required`);
    }
  }

  // Conditional validation for Wind Up By
  if (
    bookData.is_windup === "Yes" &&
    (!bookData.windup_by || String(bookData.windup_by).trim() === "")
  ) {
    errors.push("Wind Up By is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates student form data
 * @param {Object} studentData - Student form data to validate
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export function validateStudentForm(studentData) {
  const errors = [];
  const requiredFields = [
    { key: "name", label: "Name" },
    { key: "enrollment_no", label: "Enrollment Number" },
    { key: "department", label: "Department" },
    { key: "year", label: "Year" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone Number" },
  ];

  for (const field of requiredFields) {
    if (
      !studentData[field.key] ||
      String(studentData[field.key]).trim() === ""
    ) {
      errors.push(`${field.label} is required`);
    }
  }

  // Email validation
  if (
    studentData.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentData.email)
  ) {
    errors.push("Invalid email format");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Shows validation errors to the user
 * @param {string[]} errors - Array of error messages
 */
export function showValidationErrors(errors) {
  if (errors.length === 1) {
    showMessage("error", "Validation Error", errors[0]);
  } else {
    const errorList = errors.join(", ");
    showMessage("error", "Validation Errors", errorList);
  }
}
