const express = require("express");
const app = express();

const port = 2150;

app.use(express.json());
app.use("/books", require("./Routes/booksRoutes"));

app.get("/", (req, res) => {
  res.json({ message: "Library Management System Working !!!!" });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// // connection.connect((err) => {
// //   if (err) {
// //     console.error("Error connecting to database:", err);
// //     process.exit(1); // Exit if database connection fails
// //   }
// //   console.log("Connected to database");

//   // Start server only after successful database connection
//   app.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}`);
//   });

// app.get("/getBooks", (req, res) => {
//   const q = "SELECT * FROM books WHERE Accession_no = ?";
//   const accessionNo = req.body.Accession_no;

//   pool.query(q, [accessionNo], (err, results) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).json({ error: "DB error" });
//     }

//     res.json({ message: "Books Data", data: results });
//   });
// });

// app.get("/getAllBooks", (req, res) => {
//   const q = "SELECT * FROM books";
//   try {
//     pool.query(q, (err, results) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({ error: "DB error" });
//       }

//       res.json({ message: "Books Data", data: results });
//     });
//   } catch (error) {
//     console.log("Error : ", error);
//   }
// });
