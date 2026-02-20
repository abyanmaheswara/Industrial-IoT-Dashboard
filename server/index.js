require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const db = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mqtt = require("./mqtt");

const app = express();
const server = http.createServer(app);

// Rate Limiting Configuration
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: "Too many requests from this IP, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS Configuration (Relaxed for dev, but prepared for production origins)
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://localhost:3000", "http://127.0.0.1:3000"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Access denied by Security Protocol (CORS)"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use("/api/", apiLimiter); // Apply rate limiting to all API routes

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
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1];
  if (!token && req.query.token) token = req.query.token;

  if (!token) {
    return res.status(401).json({ error: "Access token missing. Please login again." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Session expired or invalid. Please login again." });
    }
    req.user = user;
    next();
  });
};

const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ error: "Administrative clearance required for this operation." });
  }
};

// Initialize MQTT Broker
mqtt.startBroker(io, (id, value, userId) => {
  // Pass real data to AI/Alert logic (Logic from previous steps preserved)
  processSensorData(id, value, userId);
});

// ===== CORE LOGIC (AI & Alerting) =====
const SENSORS = [
  { id: "dht_temp", name: "ESP32 Temp", type: "temperature", unit: "°C", min: 0, max: 50, threshold: 40, baseline: 25 },
  { id: "dht_humid", name: "ESP32 Humidity", type: "humidity", unit: "%", min: 0, max: 100, threshold: 80, baseline: 50 },
];

// Register sensors in DB on startup (Default for Admin/Demo)
const DEFAULT_OWNER_ID = 1;
SENSORS.forEach((sensor) => {
  db.ensureSensor(sensor, DEFAULT_OWNER_ID).catch((err) => console.error(`Error ensuring sensor ${sensor.id}:`, err.message));
});

const healthState = {}; // Global health state (in memory)
const sensorHistory = {}; // Global history (in memory)

const processSensorData = async (sensorId, value, userId) => {
  try {
    // 1. Fetch sensor definition from DB (since global SENSORS is now per-user)
    const sensors = await db.getSensors(userId);
    const sensor = sensors.find((s) => s.id === sensorId);
    if (!sensor) return;

    const threshold = sensor.threshold;
    const status = value >= threshold ? "critical" : value >= threshold * 0.8 ? "warning" : "normal";

    // Update in-memory state for immediate AI feedback
    const key = `${userId}_${sensorId}`;
    if (!sensorHistory[key]) sensorHistory[key] = [];
    sensorHistory[key].push(value);
    if (sensorHistory[key].length > 20) sensorHistory[key].shift();

    healthState[key] = status === "critical" ? 80 : 100;

    if (status !== "normal") {
      const message = `${sensor.name} value ${value}${sensor.unit || ""} is ${status.toUpperCase()}`;
      const newAlert = await db.createAlert(sensor.id, userId, status, message);
      if (newAlert) {
        // Emit only to the specific user's room
        io.to(`user_${userId}`).emit("newAlert", newAlert);
      }
    } else {
      const resolvedAlerts = await db.autoResolveAlerts(sensor.id, userId);
      if (resolvedAlerts) {
        resolvedAlerts.forEach((a) => io.to(`user_${userId}`).emit("alertUpdated", a));
      }
    }
  } catch (err) {
    console.error(`Error processing sensor data for ${sensorId}:`, err.message);
  }
};

// ===== SOCKET.IO HANDLERS =====
io.on("connection", (socket) => {
  console.log("[Socket.io] Client connected:", socket.id);

  socket.on("authenticate", (token) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return;
      // Join a room specific to this user
      socket.join(`user_${user.id}`);
      socket.userId = user.id; // Store for command attribution
      console.log(`[Socket.io] User ${user.id} joined room user_${user.id}`);
    });
  });

  socket.on("deviceCommand", async (data) => {
    const { deviceId, value } = data;
    const userId = socket.userId; // We need to store this on authentication

    if (!userId) return;

    console.log(`[Socket] ⌨️ Command from User ${userId} for ${deviceId}: ${value}`);

    // 1. Save to DB immediately (as current state)
    await db.saveReading(deviceId, value, userId, "normal");

    // 2. Publish to MQTT for the actual hardware
    const topic = `factory/${userId}/commands/${deviceId}`;
    const payload = JSON.stringify({ value });
    mqtt.publish(topic, payload);

    // 3. Broadcast update to the user's room for instant UI feedback
    io.to(`user_${userId}`).emit("hardwareSensorData", {
      id: deviceId,
      value: value,
      timestamp: new Date().toISOString(),
    });
  });

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
    const sensors = await db.getSensors(req.user.id);
    res.json(sensors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post(
  "/api/sensors",
  authenticateToken,
  authorizeAdmin,
  [body("id").isLength({ min: 3, max: 20 }).trim().escape(), body("name").isString().isLength({ min: 3, max: 50 }).trim().escape(), body("type").isString().notEmpty(), body("unit").isString().notEmpty(), body("threshold").isNumeric()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() });
      }

      const sensor = req.body;
      await db.ensureSensor(sensor, req.user.id);
      res.status(201).json({ message: "Sensor provisioned", sensor });
    } catch (err) {
      next(err);
    }
  },
);

app.put(
  "/api/sensors/:id",
  authenticateToken,
  authorizeAdmin,
  [body("name").optional().isString().isLength({ min: 3, max: 50 }).trim().escape(), body("threshold").optional().isNumeric(), body("unit").optional().isString()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() });
      }

      const { id } = req.params;
      const updatedData = req.body;
      await db.updateSensor(id, req.user.id, updatedData);
      res.json({ message: "Sensor logic updated" });
    } catch (err) {
      next(err);
    }
  },
);

app.delete("/api/sensors/:id", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteSensor(id, req.user.id);
    res.json({ message: "Sensor decommissioned" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/alerts", authenticateToken, async (req, res) => {
  try {
    const alerts = await db.getAlerts(req.user.id);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/alerts/:id", authenticateToken, [body("status").isIn(["active", "acknowledged", "resolved"])], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Validation failed", details: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;
    await db.updateAlertStatus(id, status);

    // Notify frontend via Socket.io room
    io.to(`user_${req.user.id}`).emit("alertUpdated", { id: parseInt(id), status });

    res.json({ message: "Alert updated" });
  } catch (err) {
    next(err);
  }
});

app.get("/api/mqtt/status", authenticateToken, (req, res) => {
  const clients = mqtt.getClientCount();
  res.json({ connected: clients > 0, clients: clients });
});

app.get("/api/sensors/history", authenticateToken, async (req, res) => {
  try {
    const { sensorId } = req.query;
    if (!sensorId) return res.status(400).json({ error: "Sensor ID required" });
    const history = await db.getHistory(sensorId, req.user.id, 100);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auth Middleware

// Health Check (Unauthenticated)
app.get("/api/health", (req, res) => {
  res.json({ status: "ONLINE", timestamp: new Date().toISOString() });
});

// Auth Routes
app.post("/api/auth/register", [body("username").isLength({ min: 3 }).trim().escape(), body("password").isLength({ min: 6 }), body("role").isIn(["admin", "operator", "viewer"])], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Validation failed", details: errors.array() });
    }

    const { username, password, role, secretKey } = req.body;

    // Admin/Operator Secret Key Verification
    if (role === "admin" || role === "operator") {
      const systemSecret = process.env.ADMIN_SECRET_KEY || "factory_forge_2026";
      if (secretKey !== systemSecret) {
        return res.status(403).json({ error: "Invalid system access key for requested clearance level." });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.createUser(username, hashedPassword, role);

    res.status(201).json({ message: "User created", user });
  } catch (err) {
    next(err);
  }
});

app.post("/api/auth/demo", async (req, res) => {
  try {
    // Demo/Guest credentials (does not check DB, just issues a restricted token)
    const token = jwt.sign({ id: 999, username: "guest_operator", role: "viewer" }, process.env.JWT_SECRET, { expiresIn: "2h" });

    res.json({
      token,
      user: {
        id: 999,
        username: "GUEST_OPER",
        role: "viewer",
        full_name: "GUEST ACCESS MODE",
        email: "demo@factoryforge.io",
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/login", [body("username").notEmpty().trim().escape(), body("password").notEmpty()], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const { username, password } = req.body;
    console.log(`[AUTH] Login attempt for: ${username}`);

    const user = await db.findUserByUsername(username);

    if (!user) {
      console.log(`[AUTH] ❌ User not found: ${username}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (await bcrypt.compare(password, user.password_hash)) {
      console.log(`[AUTH] ✅ Login successful: ${username}`);
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
      console.log(`[AUTH] ❌ Invalid password for: ${username}`);
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    next(err);
  }
});

app.put("/api/auth/profile", authenticateToken, [body("full_name").isString().isLength({ max: 100 }).trim().escape(), body("email").isEmail().normalizeEmail()], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Validation failed", details: errors.array() });
    }

    const { full_name, email } = req.body;
    const updatedUser = await db.updateUserProfile(req.user.id, full_name, email);
    if (!updatedUser) return res.status(404).json({ error: "User not found" });
    res.json({ message: "Profile updated", user: updatedUser });
  } catch (err) {
    next(err);
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

// Hardware-only mode: Simulation loop removed.

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

// Global Error Handler (Last middleware)
app.use((err, req, res, next) => {
  console.error(`[SERVER ERROR] ${err.stack}`);
  const status = err.status || 500;
  const message = process.env.NODE_ENV === "production" ? "Internal Server Error" : err.message;
  res.status(status).json({ error: message, protocol_violation: true });
});

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
