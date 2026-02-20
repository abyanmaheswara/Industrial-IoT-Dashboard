const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

// Helper to query DB
const query = (text, params) =>
  pool.query(text, params).catch((err) => {
    console.error("[DB ERROR]", err.message);
    throw err;
  });

// Ensure sensor exists
const ensureSensor = async (sensor) => {
  const check = await query("SELECT id FROM sensors WHERE id = $1", [sensor.id]);
  if (check.rowCount === 0) {
    await query("INSERT INTO sensors (id, name, type, unit, threshold) VALUES ($1, $2, $3, $4, $5)", [sensor.id, sensor.name, sensor.type, sensor.unit, sensor.threshold]);
  }
};

// Save reading
const saveReading = async (sensorId, value, status = "normal") => {
  try {
    await query("INSERT INTO readings (sensor_id, value, status) VALUES ($1, $2, $3)", [sensorId, value, status]);
  } catch (err) {
    console.error("Error saving reading:", err.message);
  }
};

// Get history
const getHistory = async (sensorId, limit = 50) => {
  const res = await query("SELECT * FROM readings WHERE sensor_id = $1 ORDER BY timestamp DESC LIMIT $2", [sensorId, limit]);
  return res.rows.reverse(); // Return oldest to newest for charts
};

// Create Alert
const createAlert = async (sensorId, type, message) => {
  try {
    // Prevent duplicate active alerts for same sensor/type to avoid spam
    const check = await query("SELECT id FROM alerts WHERE sensor_id = $1 AND type = $2 AND status = 'active'", [sensorId, type]);

    if (check.rowCount === 0) {
      console.log(`[DEBUG] Inserting alert for ${sensorId}...`);
      const res = await query("INSERT INTO alerts (sensor_id, type, message, status) VALUES ($1, $2, $3, 'active') RETURNING *", [sensorId, type, message]);
      console.log(`[ALERT] New ${type} alert for ${sensorId}: ${message}`);

      // Fetch sensor name for UI convenience
      const sensorRes = await query("SELECT name FROM sensors WHERE id = $1", [sensorId]);
      const alert = res.rows[0];
      alert.sensor_name = sensorRes.rows[0]?.name || sensorId;

      return alert;
    } else {
      // console.log(`[DEBUG] Alert already active for ${sensorId}`);
      return null;
    }
  } catch (err) {
    console.error("Error creating alert:", err.message);
    return null;
  }
};

// Get Alerts
const getAlerts = async (limit = 20) => {
  const res = await query(
    `SELECT a.*, s.name as sensor_name 
         FROM alerts a 
         JOIN sensors s ON a.sensor_id = s.id 
         ORDER BY a.created_at DESC 
         LIMIT $1`,
    [limit],
  );
  return res.rows;
};

// Update Alert Status
const updateAlertStatus = async (id, status) => {
  let queryText = "UPDATE alerts SET status = $1 WHERE id = $2";
  let params = [status, id];

  if (status === "resolved") {
    queryText = "UPDATE alerts SET status = $1, resolved_at = NOW() WHERE id = $2";
  }

  await query(queryText, params);
};

// Autocheck and resolve alerts if sensor is back to normal
const autoResolveAlerts = async (sensorId) => {
  try {
    const res = await query("UPDATE alerts SET status = 'resolved', resolved_at = NOW() WHERE sensor_id = $1 AND status = 'active' RETURNING *", [sensorId]);
    if (res.rowCount > 0) {
      console.log(`[ALERT] Auto-resolved ${res.rowCount} alert(s) for ${sensorId} (Status Normal)`);
      return res.rows;
    }
    return null;
  } catch (err) {
    console.error("Error auto-resolving alerts:", err.message);
    return null;
  }
};

// User Management
const createUser = async (username, passwordHash, role = "viewer") => {
  const text = "INSERT INTO users(username, password_hash, role) VALUES($1, $2, $3) RETURNING id, username, role";
  const params = [username, passwordHash, role];
  const res = await query(text, params);
  return res.rows[0];
};

const findUserByUsername = async (username) => {
  const text = "SELECT * FROM users WHERE username = $1";
  const params = [username];
  const res = await query(text, params);
  return res.rows[0];
};

const findUserById = async (id) => {
  const text = "SELECT id, username, role, full_name, email FROM users WHERE id = $1";
  const params = [id];
  const res = await query(text, params);
  return res.rows[0];
};

const updateUserProfile = async (id, fullName, email) => {
  const text = "UPDATE users SET full_name = $1, email = $2 WHERE id = $3 RETURNING id, username, role, full_name, email";
  const params = [fullName, email, id];
  const res = await query(text, params);
  return res.rows[0];
};

// Get All Sensors
const getSensors = async () => {
  const res = await query("SELECT * FROM sensors ORDER BY id ASC");
  return res.rows;
};

module.exports = {
  query,
  ensureSensor,
  saveReading,
  getHistory,
  createAlert,
  getAlerts,
  updateAlertStatus,
  createUser,
  findUserByUsername,
  findUserById,
  updateUserProfile,
  autoResolveAlerts, // Export new function
  getSensors,
};
