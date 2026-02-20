const aedes = require("aedes")();
const net = require("net");
const db = require("./db");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET || "factory_forge_2026_default_secret";

// Track connection attempts for debugging
aedes.on("connackSent", (client) => {
  if (client) console.log(`[MQTT] 📤 CONNACK sent to ${client.id}`);
});
const startBroker = (io, onDataReceived) => {
  const MQTT_PORT = 1883;
  const mqttServer = net.createServer(aedes.handle);

  mqttServer.listen(MQTT_PORT, "0.0.0.0", () => {
    console.log("✅ MQTT Broker started on port", MQTT_PORT);
    console.log("📍 Listening on all interfaces (0.0.0.0)");
  });

  // 1. Authentication (Verify JWT as MQTT Password)
  aedes.authenticate = (client, username, password, callback) => {
    console.log(`[MQTT] 🔑 Auth attempt from client: ${client.id}`);

    if (!password) {
      console.log(`[MQTT] ⚠️ Missing credentials for client ${client.id}`);
      return callback(null, false);
    }

    jwt.verify(password.toString(), SECRET_KEY, (err, decoded) => {
      if (err) {
        console.log(`[MQTT] ❌ Auth FAILED for client ${client.id}: ${err.message}`);
        return callback(null, false);
      }
      client.userId = decoded.id; // Store for ACL
      console.log(`[MQTT] 🔐 Auth SUCCESS for User ${decoded.id} (Client: ${client.id})`);
      callback(null, true);
    });
  };

  // 2. Authorization (ACL - Only allow user to access their own topics)
  aedes.authorizePublish = (client, packet, callback) => {
    if (!client) return callback(null); // Internal server messages

    const userId = client.userId;
    const topic = packet.topic;

    // Rule: Must start with factory/[userId]/
    if (topic.startsWith(`factory/${userId}/`)) {
      return callback(null);
    }

    console.log(`[MQTT] 🚫 ACL BLOCKED: User ${userId} tried to publish to ${topic}`);
    callback(new Error("Unauthorized topic"));
  };

  aedes.authorizeSubscribe = (client, subscription, callback) => {
    const userId = client.userId;
    const topic = subscription.topic;

    // Rule: Must start with factory/[userId]/
    if (topic.startsWith(`factory/${userId}/`)) {
      return callback(null, subscription);
    }

    console.log(`[MQTT] 🚫 ACL BLOCKED: User ${userId} tried to subscribe to ${topic}`);
    callback(new Error("Unauthorized subscription"));
  };

  // MQTT Client Connected
  aedes.on("client", (client) => {
    console.log("[MQTT] ✅ Client CONNECTED:", client.id);
    const clientCount = aedes.connectedClients;
    console.log("[MQTT] 👥 Total clients:", clientCount);
    io.emit("mqttStatus", { connected: true, clients: clientCount });
  });

  // MQTT Client Disconnected
  aedes.on("clientDisconnect", (client) => {
    console.log("[MQTT] ❌ Client DISCONNECTED:", client.id);
    const clientCount = aedes.connectedClients;
    console.log("[MQTT] 👥 Total clients remaining:", clientCount);
    io.emit("mqttStatus", { connected: clientCount > 0, clients: clientCount });
  });

  // MQTT Publish (Message Received)
  aedes.on("publish", async (packet, client) => {
    // Skip if internal message or no client
    if (!client || packet.topic.startsWith("$SYS")) return;

    const topic = packet.topic;
    const message = packet.payload.toString();

    console.log(`[MQTT] 📡 Message on ${topic}: ${message}`);

    try {
      // Expected topic: factory/[userId]/sensors/[sensorId]
      const parts = topic.split("/");
      if (parts.length < 4 || parts[0] !== "factory") {
        return console.log("[MQTT] ⚠️ Invalid topic format, skipping.");
      }

      const userId = parseInt(parts[1]);
      const sensorId = parts[3];

      // Parse JSON payload
      const data = JSON.parse(message);

      if (data.value !== undefined) {
        const val = parseFloat(data.value);

        // Calculate Status based on basic thresholds
        let status = "normal";
        if (sensorId === "dht_temp") {
          status = val >= 40 ? "critical" : val >= 32 ? "warning" : "normal";
        } else if (sensorId === "dht_humid") {
          status = val >= 80 ? "critical" : val >= 70 ? "warning" : "normal";
        } else if (sensorId === "vibration") {
          status = val >= 5.0 ? "critical" : val >= 2.5 ? "warning" : "normal";
        }

        // 1. Save to Database with Status and Owner
        await db.saveReading(sensorId, val, userId, status);

        // 2. Broadcast to specific Socket.io user room
        io.to(`user_${userId}`).emit("hardwareSensorData", {
          id: sensorId,
          value: val,
          timestamp: new Date().toISOString(),
        });

        // 3. Trigger Alert/AI Logic (Callback)
        if (onDataReceived) {
          onDataReceived(sensorId, val, userId);
        }

        console.log(`[MQTT] ✅ Forwarded to User ${userId}:`, sensorId, data.value);
      }
    } catch (err) {
      console.log("[MQTT] ⚠️ Parse error:", err.message);
    }
  });

  // Protocol Errors
  aedes.on("connectionError", (client, err) => {
    console.error("[MQTT] ⚠️ Connection ERROR:", err.message);
  });

  // MQTT Server Error
  mqttServer.on("error", (err) => {
    console.error("[MQTT] ❌ Server ERROR:", err.message);
  });
};

const getClientCount = () => {
  return aedes.connectedClients;
};

const publish = (topic, payload) => {
  aedes.publish({ topic, payload }, (err) => {
    if (err) console.error("[MQTT] ❌ Publish error:", err.message);
  });
};

module.exports = { startBroker, getClientCount, publish };
