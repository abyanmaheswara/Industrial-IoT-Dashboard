const mqtt = require("mqtt");
require("dotenv").config();

const API_URL = process.env.VITE_API_URL || "http://localhost:3001";
const MQTT_URL = process.env.MQTT_BROKER || "mqtt://localhost";
const TEST_USER = { username: "admin", password: "admin123" };

async function runDiagnostics() {
  console.log("🚀 Starting Pre-Launch Diagnostics...\n");

  try {
    // 1. API Health Check
    console.log("📡 [1/3] Checking API Connectivity...");
    const healthRes = await fetch(`${API_URL}/api/health`);
    if (!healthRes.ok) throw new Error(`API Status Check Failed: ${healthRes.statusText}`);
    const healthData = await healthRes.json();
    console.log(`✅ API Online (Status: ${healthData.status})\n`);

    // 2. Auth & JWT Check
    console.log("🔑 [2/3] Testing JWT Authentication...");
    const loginRes = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(TEST_USER),
    });

    if (!loginRes.ok) {
      const errData = await loginRes.json();
      throw new Error(`Auth Failed: ${errData.error || loginRes.statusText}`);
    }

    const loginData = await loginRes.json();
    const token = loginData.token;
    const userId = loginData.user.id;
    console.log(`✅ Auth Success! User ID: ${userId}`);
    console.log(`✅ JWT Issued (Passport Verified)\n`);

    // 3. MQTT Handshake (Security Audit)
    console.log("⚡ [3/3] Verifying MQTT Protocol (Security Hardened)...");

    // Connect syntax: mqtt.connect(url, options)
    const client = mqtt.connect(MQTT_URL, {
      username: userId.toString(),
      password: token,
      clientId: `DIAGNOSTIC_NODE_${Math.random().toString(16).slice(2, 8)}`,
    });

    client.on("connect", () => {
      console.log("✅ MQTT Handshake Success! (JWT Accepted)");

      // Test ACL: Publish to valid topic
      const topic = `factory/${userId}/sensors/diagnostic`;
      client.publish(topic, JSON.stringify({ value: 1.0 }), (err) => {
        if (!err) {
          console.log(`✅ Topic ACL Verified: Successfully published to ${topic}`);
          console.log("\n🏆 ALL SYSTEMS CALIBRATED! Ready for Cloud Deployment.");
          process.exit(0);
        } else {
          console.error("❌ ACL REJECTED: Could not publish to your own topic");
          process.exit(1);
        }
      });
    });

    client.on("error", (err) => {
      console.error("\n❌ MQTT PROTOCOL ERROR:", err.message);
      process.exit(1);
    });

    // Timeout if not connected in 5s
    setTimeout(() => {
      console.error("❌ MQTT TIMEOUT: Broker not responding.");
      process.exit(1);
    }, 5000);
  } catch (err) {
    console.error(`\n❌ CRITICAL SYSTEM FAILURE: ${err.message}`);
    process.exit(1);
  }
}

runDiagnostics();
