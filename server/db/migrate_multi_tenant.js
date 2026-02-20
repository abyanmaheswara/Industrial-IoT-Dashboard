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
  console.log("🚀 Starting Multi-Tenant Migration...");

  try {
    // 1. Add owner_id to users-related tables
    // We assume the first user (usually admin) owns existing data
    const userRes = await pool.query("SELECT id FROM users ORDER BY id ASC LIMIT 1");
    const defaultOwnerId = userRes.rowCount > 0 ? userRes.rows[0].id : 1;

    console.log(`Using default Owner ID: ${defaultOwnerId} for existing data.`);

    // Sensors
    await pool.query("ALTER TABLE sensors ADD COLUMN IF NOT EXISTS owner_id INT REFERENCES users(id)");
    await pool.query("UPDATE sensors SET owner_id = $1 WHERE owner_id IS NULL", [defaultOwnerId]);
    console.log("✅ Updated sensors table.");

    // Readings
    await pool.query("ALTER TABLE readings ADD COLUMN IF NOT EXISTS owner_id INT REFERENCES users(id)");
    await pool.query("UPDATE readings SET owner_id = $1 WHERE owner_id IS NULL", [defaultOwnerId]);
    console.log("✅ Updated readings table.");

    // Alerts
    await pool.query("ALTER TABLE alerts ADD COLUMN IF NOT EXISTS owner_id INT REFERENCES users(id)");
    await pool.query("UPDATE alerts SET owner_id = $1 WHERE owner_id IS NULL", [defaultOwnerId]);
    console.log("✅ Updated alerts table.");

    console.log("✨ Migration completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  }
};

migrate();
