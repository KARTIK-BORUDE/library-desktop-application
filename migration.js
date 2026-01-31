import bcrypt from "bcrypt";
import conn from "./Backend/models/db.js";
const mysql = require("mysql2");
let papper = process.env.PASSWORD_PAPPER;

let q = `SELECT password FROM users WHERE username ='kartik' `;

let hash = await new Promise((resolve, reject) => {
  conn.query(q, (err, res) => {
    if (err) reject(err);
    else return resolve(res);
  });
});
let hashedpass = hashPassword(hash[0].password);

function hashPassword(password) {
  return bcrypt.hash(password + papper, 11);
}
let q1 = `
  UPDATE users
  SET hashed_password = ?
  WHERE username = 'kartik'
`;
let pass = await new Promise((resolve, reject) => {
  conn.query(q1, [hashedpass], (err, res) => {
    if (err) reject(err);
    else return resolve(res);
  });
});
// let compare = await bcrypt.compareSync("kartik" + papper, hashedpass);
// 

// BOOKS TABLE
connection.query(
  `
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    Accession_no VARCHAR(255) UNIQUE NOT NULL,
    Title VARCHAR(255) NOT NULL,
    Author VARCHAR(255),
    Edition INT DEFAULT 1,
    Publisher VARCHAR(255),
    Pub_location VARCHAR(255),
    Pages INT DEFAULT 100,
    Language_code VARCHAR(10),
    Bill_no VARCHAR(255),
    Bill_date DATE,
    Department ENUM('CO','EE','ME','DDGM','AUTO','ELE','CIVIL','AI','IT','NOT PRESENT') DEFAULT 'NOT PRESENT',
    Purchase_Date DATE,
    Cost INT DEFAULT 1,
    Location VARCHAR(255) DEFAULT NULL,
    Total_copies INT DEFAULT 1,
    Available_copies INT DEFAULT 1,
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
`,
  (err) => {
    if (err) 
    else 
  },
);

// STUDENTS TABLE
connection.query(
  `
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    enrollment_no INT UNIQUE NOT NULL,
    Department ENUM('CO','EE','ME','DDGM','AUTO','ELE','CIVIL','AI','IT','NOT PRESENT') DEFAULT 'NOT PRESENT',
    year ENUM('1','2','3') DEFAULT '1',
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`,
  (err) => {
    if (err) 
    else 
  },
);

// ISSUED BOOKS TABLE
connection.query(
  `
CREATE TABLE IF NOT EXISTS issued_books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    book_id INT NOT NULL,
    issue_date DATE,
    due_date DATE,
    return_date DATE,
    status ENUM('issued','returned','due') DEFAULT 'issued',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_issued_student
        FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_issued_book
        FOREIGN KEY (book_id)
        REFERENCES books(id)
        ON DELETE CASCADE
);
`,
  (err) => {
    if (err) 
    else 
  },
);

// connection.end();
