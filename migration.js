const bcrypt = require("bcryptjs");
const conn = require("./Backend/models/db.js");

const PASSWORD_PAPPER =
  process.env.PASSWORD_PAPPER || "Library_secret_by_kartik_2025";

async function runMigration() {
  try {
    console.log("Starting migration...");

    // 1. Update User Password Logic
    console.log("Checking user 'kartik'...");
    const [users] = await conn
      .promise()
      .query("SELECT password FROM users WHERE username = 'kartik'");

    if (users.length > 0) {
      const user = users[0];
      // Note: This logic assumes 'password' field currently holds the plain text or old hash to be re-hashed
      // If password is already hashed with bcrypt, this might be redundant or incorrect,
      // but following the original script's intent to update 'hashed_password'.
      if (user.password) {
        const hashedpass = await bcrypt.hash(
          user.password + PASSWORD_PAPPER,
          10,
        );
        await conn
          .promise()
          .query(
            "UPDATE users SET hashed_password = ? WHERE username = 'kartik'",
            [hashedpass],
          );
        console.log("User 'kartik' password hashed and updated.");
      }
    } else {
      console.log("User 'kartik' not found, skipping password update.");
    }

    // 2. Create Books Table
    console.log("Creating/Checking books table...");
    await conn.promise().query(`
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
      )
    `);

    // 3. Create Students Table
    console.log("Creating/Checking students table...");
    await conn.promise().query(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        enrollment_no INT UNIQUE NOT NULL,
        Department ENUM('CO','EE','ME','DDGM','AUTO','ELE','CIVIL','AI','IT','NOT PRESENT') DEFAULT 'NOT PRESENT',
        year ENUM('1','2','3') DEFAULT '1',
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Create Issued Books Table
    console.log("Creating/Checking issued_books table...");
    await conn.promise().query(`
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
      )
    `);

    console.log("Migration completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    conn.end();
    // process.exit() might be needed if script doesn't hang, but let's let node handle it naturally mostly
    process.exit(0);
  }
}

runMigration();
