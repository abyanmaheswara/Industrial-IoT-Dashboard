require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const db = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mqtt = require("./mqtt");

const app = express();
const server = http.createServer(app);

// CORS Configuration
app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  if (req.url.startsWith("/api")) {
    console.log(`[API] ${req.method} ${req.url}`);
  }
  next();
});

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
  },
});

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1];
  if (!token && req.query.token) token = req.query.token;
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Initialize MQTT Broker
mqtt.startBroker(io, (id, value) => {
  // Pass real data to AI/Alert logic (Logic from previous steps preserved)
  processSensorData(id, value);
});

// ===== CORE LOGIC (AI & Alerting) =====
const SENSORS = [
  { id: "dht_temp", name: "ESP32 Temp", type: "temperature", unit: "°C", min: 0, max: 50, threshold: 40, baseline: 25 },
  { id: "dht_humid", name: "ESP32 Humidity", type: "humidity", unit: "%", min: 0, max: 100, threshold: 80, baseline: 50 },
];

// Register sensors in DB on startup
SENSORS.forEach((sensor) => {
  db.ensureSensor(sensor).catch((err) => console.error(`Error ensuring sensor ${sensor.id}:`, err.message));
});

const healthState = {};
const sensorHistory = {};

const processSensorData = (sensorId, value) => {
  const sensor = SENSORS.find((s) => s.id === sensorId);
  if (!sensor) return;

  const threshold = sensor.threshold;
  const status = value >= threshold ? "critical" : value >= threshold * 0.8 ? "warning" : "normal";

  // AI Logic Simulation
  if (!sensorHistory[sensor.id]) sensorHistory[sensor.id] = [];
  sensorHistory[sensor.id].push(value);
  if (sensorHistory[sensor.id].length > 20) sensorHistory[sensor.id].shift();

  healthState[sensor.id] = status === "critical" ? 80 : 100;

  if (status !== "normal") {
    const message = `${sensor.name} value ${value}${sensor.unit} is ${status.toUpperCase()}`;
    db.createAlert(sensor.id, status, message).then((newAlert) => {
      if (newAlert) io.emit("newAlert", newAlert);
    });
  } else {
    db.autoResolveAlerts(sensor.id).then((resolvedAlerts) => {
      if (resolvedAlerts) resolvedAlerts.forEach((a) => io.emit("alertUpdated", a));
    });
  }
};

// ===== SOCKET.IO HANDLERS =====
io.on("connection", (socket) => {
  console.log("[Socket.io] Client connected:", socket.id);
  socket.emit("healthUpdate", healthState);
  socket.on("disconnect", () => {
    console.log("[Socket.io] Client disconnected:", socket.id);
  });
});

// ===== REST API ROUTES =====
app.get("/", (req, res) => res.send("Factory Forge Industrial IoT Server is Running"));

app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    mqtt: "running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/sensors", authenticateToken, async (req, res) => {
  try {
    const sensors = await db.getSensors();
    res.json(sensors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/alerts", authenticateToken, async (req, res) => {
  try {
    const alerts = await db.getAlerts();
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/alerts/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await db.updateAlertStatus(id, status);

    // Notify frontend via Socket.io
    io.emit("alertUpdated", { id: parseInt(id), status });

    res.json({ message: "Alert updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/mqtt/status", authenticateToken, (req, res) => {
  const clients = mqtt.getClientCount();
  res.json({ connected: clients > 0, clients: clients });
});

app.get("/api/sensors/history", authenticateToken, async (req, res) => {
  try {
    const { sensorId, range } = req.query;
    if (!sensorId) return res.status(400).json({ error: "Sensor ID required" });
    const id = sensorId === "all" || sensorId === undefined ? "dht_temp" : sensorId;
    const history = await db.getHistory(id, 100);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auth Middleware

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and password required" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.createUser(username, hashedPassword, role);

    res.status(201).json({ message: "User created", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await db.findUserByUsername(username);

    if (!user) return res.status(400).json({ error: "User not found" });

    if (await bcrypt.compare(password, user.password_hash)) {
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: "24h" });
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          full_name: user.full_name,
          email: user.email,
        },
      });
    } else {
      res.status(403).json({ error: "Invalid password" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/auth/profile", authenticateToken, async (req, res) => {
  try {
    const { full_name, email } = req.body;
    const updatedUser = await db.updateUserProfile(req.user.id, full_name, email);
    if (!updatedUser) return res.status(404).json({ error: "User not found" });
    res.json({ message: "Profile updated", user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Endpoints
app.get("/api/ai/health", authenticateToken, (req, res) => {
  // Return current health state logic (Assuming healthState is available globally in scope, checking scope...)
  // Wait, healthState is defined in the previous block.
  // I need to ensure healthState is accessible here.
  // It is defined in the top scope of index.js in my previous edit, so it should be fine.

  // Construct a nice response
  const response = SENSORS.map((s) => ({
    id: s.id,
    name: s.name,
    health: healthState[s.id] || 100,
    status: (healthState[s.id] || 100) > 70 ? "Good" : (healthState[s.id] || 100) > 30 ? "Fair" : "Critical",
  }));
  res.json(response);
});

// Data Emission Loop (Simulation for completeness, though hardware is primary)
setInterval(() => {
  const data = SENSORS.map((sensor) => {
    // We only simulate if there's no real hardware update in a while,
    // but for now let's just keep it simple and only rely on hardware data
    // Or we keep a very subtle background data for UI stability
    return null;
  }).filter((s) => s !== null);

  if (data.length > 0) io.emit("sensorData", data);
}, 2000);

// Report Endpoints
const exporter = require("./export");

app.get("/api/reports/download/pdf", authenticateToken, (req, res) => {
  exporter.exportPDFReport(res);
});

app.get("/api/reports/download/excel", authenticateToken, (req, res) => {
  exporter.exportToExcel(null, res, "xlsx");
});

app.get("/api/reports/download/csv", authenticateToken, (req, res) => {
  exporter.exportToExcel(null, res, "csv");
});

// Legacy Export Endpoints (Redirect to new ones or keep for compatibility)
app.get("/api/export/csv/:sensorId", authenticateToken, (req, res) => {
  exporter.exportToExcel(req.params.sensorId, res, "xlsx");
});

app.get("/api/export/pdf/report", authenticateToken, (req, res) => {
  exporter.exportPDFReport(res);
});

app.get("/favicon.ico", (req, res) => res.status(204).end());

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log("\n╔═══════════════════════════════════════╗");
  console.log("║   FACTORYFORGE BACKEND SERVER         ║");
  console.log("╠═══════════════════════════════════════╣");
  console.log(`║   HTTP Server: Port ${PORT}              ║`);
  console.log(`║   MQTT Broker: Port 1883              ║`);
  console.log("║   Socket.io: ONLINE                   ║");
  console.log("║   Status: READY ✅                    ║");
  console.log("╚═══════════════════════════════════════╝\n");
});
