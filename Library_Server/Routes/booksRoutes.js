const express = require("express");
const {
  getBooksController,
  getTitleController,
  getTotalBooksCountController,
  getTotalIssuedBooksCountController,
  getAllIssuedCountController,
  addBookController,
  updateBookController,
  isBookExistsController,
  fileReturnBookController,
  issueBookController,
  getAllIssuedBooksController,
  getDataOfIssuedBooksController,
  searchBooksController
} = require("../Controller/booksController");
const router = express.Router();

router.get("/getAllBooks", getBooksController);
router.get("/getTitle", getTitleController);
router.get("/getTotalBookCount", getTotalBooksCountController);
router.get("/getTotalIssuedBookCount", getTotalIssuedBooksCountController);
router.get("/getAllIssuedCount", getAllIssuedCountController);
router.get("/isBookExists", isBookExistsController);
router.post("/addBook", addBookController);
router.post("/issuebook", issueBookController);
router.put("/fileReturn", fileReturnBookController);
router.put("/updateBook", updateBookController);
router.get("/getAllIssuedBooks", getAllIssuedBooksController);
router.get("/getDataOfIssuedBooks", getDataOfIssuedBooksController);
router.get("/searchBooks", searchBooksController);

module.exports = router;

