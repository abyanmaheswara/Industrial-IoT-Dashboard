const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

const migrate = async () => {
  try {
    console.log("Running migration: Adding profile columns...");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(100)");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(100)");
    console.log("Migration complete!");
  } catch (err) {
    console.error("Migration failed:", err.message);
  } finally {
    pool.end();
  }
};

migrate();
