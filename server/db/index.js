const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const isProduction = process.env.NODE_ENV === "production";

console.log("[DB] Initializing pool...");
if (process.env.DATABASE_URL) {
  console.log("[DB] DATABASE_URL detected (length: " + process.env.DATABASE_URL.length + ")");
} else {
  console.log("[DB] DATABASE_URL NOT FOUND, using individual variables");
}

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    })
  : new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
    });

// Helper to query DB
const query = (text, params) =>
  pool.query(text, params).catch((err) => {
    console.error("[DB ERROR] Full Error:", err);
    console.error("[DB ERROR] Message:", err.message);
    throw err;
  });

// Ensure sensor exists
const ensureSensor = async (sensor, ownerId) => {
  // Check if ID exists for this owner specifically
  const check = await query("SELECT id FROM sensors WHERE id = $1 AND owner_id = $2", [sensor.id, ownerId]);
  if (check.rowCount === 0) {
    await query("INSERT INTO sensors (id, owner_id, name, type, unit, threshold) VALUES ($1, $2, $3, $4, $5, $6)", [sensor.id, ownerId, sensor.name, sensor.type, sensor.unit, sensor.threshold]);
  }
};

// Save reading
const saveReading = async (sensorId, value, ownerId, status = "normal") => {
  try {
    await query("INSERT INTO readings (sensor_id, value, owner_id, status) VALUES ($1, $2, $3, $4)", [sensorId, value, ownerId, status]);
  } catch (err) {
    console.error("Error saving reading:", err.message);
  }
};

// Get history
const getHistory = async (sensorId, ownerId, limit = 50) => {
  const res = await query("SELECT * FROM readings WHERE sensor_id = $1 AND owner_id = $2 ORDER BY timestamp DESC LIMIT $3", [sensorId, ownerId, limit]);
  return res.rows.reverse(); // Return oldest to newest for charts
};

// Create Alert
const createAlert = async (sensorId, ownerId, type, message) => {
  try {
    // Prevent duplicate active alerts for same sensor/type/owner
    const check = await query("SELECT id FROM alerts WHERE sensor_id = $1 AND owner_id = $2 AND type = $3 AND status = 'active'", [sensorId, ownerId, type]);

    if (check.rowCount === 0) {
      console.log(`[DEBUG] Inserting alert for ${sensorId} (User: ${ownerId})...`);
      const res = await query("INSERT INTO alerts (sensor_id, owner_id, type, message, status) VALUES ($1, $2, $3, $4, 'active') RETURNING *", [sensorId, ownerId, type, message]);

      // Fetch sensor name for UI convenience
      const sensorRes = await query("SELECT name FROM sensors WHERE id = $1 AND owner_id = $2", [sensorId, ownerId]);
      const alert = res.rows[0];
      alert.sensor_name = sensorRes.rows[0]?.name || sensorId;

      return alert;
    } else {
      return null;
    }
  } catch (err) {
    console.error("Error creating alert:", err.message);
    return null;
  }
};

// Get Alerts
const getAlerts = async (ownerId, limit = 20) => {
  const res = await query(
    `SELECT a.*, s.name as sensor_name 
         FROM alerts a 
         JOIN sensors s ON a.sensor_id = s.id AND a.owner_id = s.owner_id
         WHERE a.owner_id = $1
         ORDER BY a.created_at DESC 
         LIMIT $2`,
    [ownerId, limit],
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
const autoResolveAlerts = async (sensorId, ownerId) => {
  try {
    const res = await query("UPDATE alerts SET status = 'resolved', resolved_at = NOW() WHERE sensor_id = $1 AND owner_id = $2 AND status = 'active' RETURNING *", [sensorId, ownerId]);
    if (res.rowCount > 0) {
      console.log(`[ALERT] Auto-resolved ${res.rowCount} alert(s) for ${sensorId} / User ${ownerId} (Status Normal)`);
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
const getSensors = async (ownerId) => {
  const res = await query("SELECT * FROM sensors WHERE owner_id = $1 ORDER BY id ASC", [ownerId]);
  return res.rows;
};

// Update Sensor
const updateSensor = async (id, ownerId, data) => {
  const text = "UPDATE sensors SET name = $1, threshold = $2, unit = $3 WHERE id = $4 AND owner_id = $5";
  await query(text, [data.name, data.threshold, data.unit, id, ownerId]);
};

// Delete Sensor
const deleteSensor = async (id, ownerId) => {
  await query("DELETE FROM alerts WHERE sensor_id = $1 AND owner_id = $2", [id, ownerId]);
  await query("DELETE FROM readings WHERE sensor_id = $1 AND owner_id = $2", [id, ownerId]);
  await query("DELETE FROM sensors WHERE id = $1 AND owner_id = $2", [id, ownerId]);
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
  autoResolveAlerts,
  getSensors,
  updateSensor,
  deleteSensor,
};
