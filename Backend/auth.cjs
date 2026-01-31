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
    "Error reading config in auth.cjs, using defaults:",
    error.message,
  );
}

const bcrypt = require("bcryptjs");
const connection = require("./models/db");

let papper = config.PASSWORD_PAPPER;
async function validateUser(username, password) {
  const q = `SELECT username, role, hashed_password FROM users WHERE username = ?`;

  const user = await new Promise((resolve, reject) => {
    connection.query(q, [username], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });

  if (user.length === 0) {
    return { success: false, message: "User Not Found" };
  }

  const isValid = await bcrypt.compare(
    password + papper,
    user[0].hashed_password,
  );

  if (!isValid) {
    return { success: false, message: "Invalid Password" };
  }

  return {
    success: true,
    message: "Login Successful",
    role: user[0].role,
    username: user[0].username,
  };
}

module.exports = validateUser;
