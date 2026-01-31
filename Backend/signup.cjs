const fs = require("fs");
const path = require("path");
const { app } = require("electron");

// Path to config.json (outside EXE)
const configPath = path.join(app.getPath("userData"), "config.json");

// Read config safely with fallback
let config = {
  PASSWORD_PAPPER: "Library_secret_by_kartik_2025",
};

try {
  if (fs.existsSync(configPath)) {
    const fileConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    config = { ...config, ...fileConfig };
  }
} catch (error) {
  console.error(
    "Error reading config in signup.cjs, using defaults:",
    error.message,
  );
}

const bcrypt = require("bcryptjs");
const connection = require("./models/db");

let papper = config.PASSWORD_PAPPER;
async function signUser(username, password) {
  try {
    const q = `INSERT INTO users (username,password, hashed_password) VALUES (?, ? , ?)`;

    let hashed_password = await bcrypt.hash(password + papper, 10);
    let status = await new Promise((resolve, reject) => {
      connection.query(
        q,
        [username, password, hashed_password],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        },
      );
    });
    console.log("User Signed ", status);

    return {
      success: true,
      message: "User Signed Up Successfully",
      role: "student",
    };
  } catch (err) {
    return {
      success: false,
      message: "Username Already Exists",
    };
  }
}

module.exports = signUser;
