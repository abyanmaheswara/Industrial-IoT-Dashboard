const db = require("./db");
const bcrypt = require("bcryptjs");

async function run() {
  try {
    const hashed = await bcrypt.hash("abyan-forge-2026!", 10);
    const sql = "UPDATE users SET password_hash = $1 WHERE username = $2";
    await db.query(sql, [hashed, "abyan"]);
    console.log("✅ Password for user abyan updated to: abyan-forge-2026!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

run();
