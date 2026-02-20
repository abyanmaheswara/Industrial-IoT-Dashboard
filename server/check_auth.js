const db = require("./db");
const bcrypt = require("bcryptjs");

async function testLogin(username, password) {
  try {
    const user = await db.findUserByUsername(username);
    if (!user) {
      console.log(`❌ User ${username} not found`);
      return;
    }
    const match = await bcrypt.compare(password, user.password_hash);
    console.log(`User: ${username}`);
    console.log(`Attempted Password: ${password}`);
    console.log(`Match: ${match ? "✅ SUCCESS" : "❌ FAILED"}`);
    console.log(`Stored Hash: ${user.password_hash}`);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

async function run() {
  await testLogin("abyan", "abyan-forge-2026!");
  await testLogin("admin", "admin123");
  process.exit(0);
}

run();
