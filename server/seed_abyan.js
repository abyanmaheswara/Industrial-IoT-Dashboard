const db = require("./db");
const bcrypt = require("bcryptjs");

async function run() {
  try {
    // 1. Ensure user 'abyan' exists
    let user = await db.findUserByUsername("abyan");
    if (!user) {
      const hashed = await bcrypt.hash("abyan123", 10);
      user = await db.createUser("abyan", hashed, "admin");
      console.log("✅ User abyan created (pass: abyan123)");
    } else {
      console.log("ℹ️ User abyan already exists");
    }
    const userId = user.id;

    // 2. Define sensor suite
    const sensors = [
      { id: "dht_temp", name: "Ambient Temperature", type: "temperature", unit: "°C", threshold: 40 },
      { id: "dht_humid", name: "Air Humidity", type: "humidity", unit: "%", threshold: 75 },
      { id: "vibration", name: "Motor Vibration", type: "vibration", unit: "mm/s", threshold: 5.0 },
      { id: "pressure", name: "Boiler Pressure", type: "pressure", unit: "bar", threshold: 12.0 },
      { id: "power", name: "Substation Load", type: "power", unit: "kW", threshold: 50.0 },
      { id: "relay_main", name: "Primary Contactor", type: "relay", unit: "Status", threshold: 1 },
    ];

    // 3. Provision sensors using composite key logic
    for (const s of sensors) {
      const sql = `
        INSERT INTO sensors (id, owner_id, name, type, unit, threshold) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        ON CONFLICT (id, owner_id) 
        DO UPDATE SET name = $3, type = $4, unit = $5, threshold = $6
      `;
      await db.query(sql, [s.id, userId, s.name, s.type, s.unit, s.threshold]);
      console.log(`📡 Sensor [${s.id}] provisioned for user ${userId}`);
    }

    console.log("🚀 Seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
}

run();
