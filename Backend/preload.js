const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("BOOKS", {
  showDialogForExcel: () => ipcRenderer.invoke("show-dialog-for-excel"),
  onUploadProgress: (callback) => {
    ipcRenderer.on("upload-progress", (event, data) => callback(data));
  },
  onUploadError: (callback) => {
    ipcRenderer.on("upload-error", (event, data) => callback(data));
  },
  AddBook: (book) => ipcRenderer.invoke("AddBook", book),
  getTotalBooks: () => ipcRenderer.invoke("get-total-books"),
  seeTotalBooks: () => ipcRenderer.invoke("see-total-books"),
  searchBooks: (searchTerm) => ipcRenderer.invoke("search-books", searchTerm),
  addStudent: (student) => ipcRenderer.invoke("add-student", student),
  getStudents: () => ipcRenderer.invoke("get-students"),
  searchStudent: (searchTerm) =>
    ipcRenderer.invoke("search-student", searchTerm),
  issueBook: (issue_book) => ipcRenderer.invoke("issue-book", issue_book),
  getIssuedBooks: () => ipcRenderer.invoke("get-issued-books"),
  getDataOfIssuedBook: (data) =>
    ipcRenderer.invoke("get-data-of-issued-book", data),
  getTitle: (number) => ipcRenderer.invoke("get-title", number),
  //used in issue book get the only data of the single user

  getStudentData: (ac_no) => ipcRenderer.invoke("get-student-data", ac_no),
  //used in return book
  fileReturn: (book_data) => ipcRenderer.invoke("file-return", book_data),
  //calculate fine
  calculateFine: () => ipcRenderer.invoke("calculate-fine"),
  //login
  login: (username, password) =>
    ipcRenderer.invoke("login", username, password),
  //signup
  signup: (username, password) =>
    ipcRenderer.invoke("signup", username, password),
  //update student
  updateStudent: (student) => ipcRenderer.invoke("update-student", student),
  //update book
  updateBook: (book) => ipcRenderer.invoke("update-book", book),
  //delete book
  deleteBookOrStudent: (book_id, stu_id) => ipcRenderer.invoke("delete-book-or-student", book_id, stu_id),
});
