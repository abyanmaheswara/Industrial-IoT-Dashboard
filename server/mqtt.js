const aedes = require("aedes")();
const net = require("net");
const db = require("./db");

const startBroker = (io, onDataReceived) => {
  const MQTT_PORT = 1883;
  const mqttServer = net.createServer(aedes.handle);

  mqttServer.listen(MQTT_PORT, "0.0.0.0", () => {
    console.log("✅ MQTT Broker started on port", MQTT_PORT);
    console.log("📍 Listening on all interfaces (0.0.0.0)");
  });

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
      // Parse JSON payload
      const data = JSON.parse(message);

      if (data.id && data.value !== undefined) {
        const val = parseFloat(data.value);

        // Calculate Status based on basic thresholds (consistent with index.js logic)
        // Note: In a production app, we'd fetch actual thresholds from the DB
        let status = "normal";
        if (data.id === "dht_temp") {
          status = val >= 40 ? "critical" : val >= 32 ? "warning" : "normal";
        } else if (data.id === "dht_humid") {
          status = val >= 80 ? "critical" : val >= 70 ? "warning" : "normal";
        }

        // 1. Save to Database with Status
        await db.saveReading(data.id, val, status);

        // 2. Broadcast to frontend via Socket.io
        io.emit("hardwareSensorData", {
          id: data.id,
          value: val,
          timestamp: new Date().toISOString(),
        });

        // 3. Trigger Alert/AI Logic (Callback)
        if (onDataReceived) {
          onDataReceived(data.id, val);
        }

        console.log("[MQTT] ✅ Forwarded to frontend:", data.id, data.value);
      }
    } catch (err) {
      console.log("[MQTT] ⚠️ Not JSON, skipping:", message);
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

module.exports = { startBroker, getClientCount };
