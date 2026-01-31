const fs = require("fs");
const path = require("path");
const mysql = require("mysql2");
const { app } = require("electron");

// Path to config.json (outside EXE)
// const configPath = path.join(app.getPath("userData"), "config.json");

// Read config safely with fallback to defaults
let config = {
  dbHost: "192.168.137.1",
  dbPort: 3306,
  dbUser: "student",
  dbPassword: "library123",
  dbName: "library_data",
  PASSWORD_PAPPER: "Library_secret_by_kartik_2025",
};

// Config file is guaranteed to exist because ensureConfigFile() runs before this module loads
try {
  // Path to config.json (outside EXE)
  const configPath = path.join(app.getPath("userData"), "config.json");

  if (fs.existsSync(configPath)) {
    const fileConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    config = { ...config, ...fileConfig }; // Merge with defaults
  } else {
    console.log("⚠️ Config file not found at:", configPath, "- Using defaults");
  }
} catch (error) {
  console.log("❌ Error reading config file:", error.message);
  console.log("Using default configuration");
}

// Create DB connection (PASSWORD_PAPPER is NOT a MySQL connection parameter)
const connection = mysql.createConnection({
  host: config.dbHost ?? "192.168.1.8",
  user: config.dbUser ?? "student",
  port: config.dbPort ?? 3306,
  password: config.dbPassword ?? "library123",
  database: config.dbName ?? "library_data",
});

module.exports = connection;
