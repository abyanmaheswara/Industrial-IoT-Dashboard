const db = require("./db");
const bcrypt = require("bcryptjs");

async function run() {
  try {
    const hashed = await bcrypt.hash("admin123", 10);
    // Try quoting the table name just in case
    await db.query('UPDATE "users" SET password_hash = $1 WHERE username = $2', [hashed, "admin"]);
    console.log("✅ Password for user admin reset to admin123");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

run();
