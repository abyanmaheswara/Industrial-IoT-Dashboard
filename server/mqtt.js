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
    // Count current clients - simple implementation
    const clientCount = Object.keys(aedes.clients).length;
    io.emit("mqttStatus", { connected: true, clients: clientCount });
  });

  // MQTT Client Disconnected
  aedes.on("clientDisconnect", (client) => {
    console.log("[MQTT] ❌ Client DISCONNECTED:", client.id);
    const clientCount = Math.max(0, Object.keys(aedes.clients).length - 1);
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

        // 1. Save to Database
        await db.saveReading(data.id, val);

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

module.exports = { startBroker };
