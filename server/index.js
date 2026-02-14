const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const db = require('./db'); // Import DB module
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json()); // Enable JSON body parsing

// Auth Middleware
app.get('/', (req, res) => {
  res.send('Industrial IoT Server is Running');
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"], // Allow all origins for development
    methods: ["GET", "POST"]
  }
});

// Sensor Configurations
// Sensor Configurations
const SENSORS = [
  // Simulated Sensors (Disabled for Production)
  // { id: 'temp_01', name: 'Temperature A', type: 'temperature', unit: '°C', min: 20, max: 80, threshold: 50, baseline: 45 },
  // { id: 'press_01', name: 'Pressure Main', type: 'pressure', unit: 'bar', min: 1, max: 10, threshold: 8, baseline: 5 },
  // { id: 'vib_01', name: 'Vibration Motor', type: 'vibration', unit: 'mm/s', min: 0, max: 15, threshold: 12, baseline: 2 },
  // { id: 'pwr_01', name: 'Power Consumption', type: 'power', unit: 'kW', min: 10, max: 100, threshold: 90, baseline: 45 },
  
  // Hardware Sensors (ESP32)
  { id: 'dht_temp', name: 'ESP32 Temp', type: 'temperature', unit: '°C', min: 0, max: 50, threshold: 40, baseline: 25 },
  { id: 'dht_humid', name: 'ESP32 Humidity', type: 'humidity', unit: '%', min: 0, max: 100, threshold: 80, baseline: 50 }
];

// Initialize sensors in DB
SENSORS.forEach(sensor => {
    db.ensureSensor(sensor).catch(err => console.error('Error ensuring sensor:', err.message));
});

const ai = require('./ai'); // Import AI module
const mqtt = require('./mqtt'); // Import MQTT module

// Simulation State
const sensorState = {};
const sensorHistory = {}; // Store recent history for Z-Score
const healthState = {}; // Store machine health

// Initialize states
SENSORS.forEach(sensor => {
  sensorState[sensor.id] = {
    value: sensor.baseline,
    trend: 0
  };
  sensorHistory[sensor.id] = [];
  healthState[sensor.id] = 100; // Start at 100% health
});

// --- REUSABLE ALERT & AI LOGIC ---
const processSensorData = (sensorId, value) => {
    const sensor = SENSORS.find(s => s.id === sensorId);
    if (!sensor) return;

    const status = getStatus(value, sensor);
    
    // --- AI Logic Start ---
    
    // 1. Update History Buffer (Keep last 20 points)
    if (!sensorHistory[sensor.id]) sensorHistory[sensor.id] = [];
    sensorHistory[sensor.id].push(value);
    if (sensorHistory[sensor.id].length > 20) sensorHistory[sensor.id].shift();

    // 2. Detect Anomaly
    const { isAnomaly, zScore } = ai.detectAnomaly(value, sensorHistory[sensor.id]);

    // 3. Update Health Score
    if (healthState[sensor.id] === undefined) healthState[sensor.id] = 100;
    healthState[sensor.id] = ai.updateHealthScore(healthState[sensor.id], value, sensor.threshold);
    
    // --- AI Logic End ---

    // Check for alerts
    if (status === 'critical' || status === 'warning') {
        const type = status;
        const message = `${sensor.name} value ${value} ${sensor.unit} is ${status.toUpperCase()}`;
        
        db.createAlert(sensor.id, type, message).then(newAlert => {
           if (newAlert) {
               io.emit('newAlert', newAlert);
               console.log(`[ALERT] New ${type} alert for ${sensor.id}: ${message}`);
           }
        });
    } else if (status === 'normal') {
        // Auto-resolve any active alerts
        db.autoResolveAlerts(sensor.id).then(resolvedAlerts => {
            if (resolvedAlerts && resolvedAlerts.length > 0) {
                console.log(`[ALERT] Auto-resolved ${resolvedAlerts.length} alert(s) for ${sensor.id} (Status Normal)`);
                resolvedAlerts.forEach(alert => {
                    io.emit('alertUpdated', alert);
                });
            }
        });
    }
    
    return { status, isAnomaly, zScore, health: healthState[sensor.id] };
};

// Initialize MQTT Broker with Alert Logic Callback
mqtt.startBroker(io, (id, value) => {
    processSensorData(id, value);
});

function generateValue(sensor) {
  // ... (existing generateValue code is fine, minimal changes needed, but I need to keep it inside the replacement or assumes it is outside)
  // Actually, I can just keep generateValue as is.
  const state = sensorState[sensor.id];
  let change = (Math.random() - 0.5) * 2; 
  
  if (state.trend === 1) change += 0.5;
  if (state.trend === -1) change -= 0.5;
  
  if (Math.random() < 0.05) {
     change += (Math.random() > 0.5 ? 5 : -5);
  }

  let newValue = state.value + change;

  if (newValue < sensor.min) newValue = sensor.min + Math.random();
  if (newValue > sensor.max) newValue = sensor.max - Math.random();

  if (Math.random() < 0.1) {
    state.trend = Math.floor(Math.random() * 3) - 1;
  }
  
  state.value = parseFloat(newValue.toFixed(1));
  return state.value;
}

function getStatus(value, sensor) {
  if (value >= sensor.threshold) return 'critical';
  if (value >= sensor.threshold * 0.8) return 'warning';
  return 'normal';
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  // Send initial health data
  socket.emit('healthUpdate', healthState);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Data Emission Loop (2 seconds)
setInterval(() => {
  const timestamp = Date.now();
  const data = [];

  SENSORS.forEach(sensor => {
    // SKIP Hardware Sensors (Let MQTT handle them)
    if (sensor.id === 'dht_temp' || sensor.id === 'dht_humid') return;
      
    const value = generateValue(sensor);
    const processed = processSensorData(sensor.id, value); // Run Alert Logic
    
    // Safety check if processed returns undefined (e.g. sensor not found)
    if (!processed) return;

    const status = processed.status;
    const isAnomaly = processed.isAnomaly;
    const zScore = processed.zScore;
    const health = processed.health;

    // Save to Database
    db.saveReading(sensor.id, value, status);

    data.push({
      id: sensor.id,
      name: sensor.name,
      type: sensor.type,
      value: value,
      unit: sensor.unit,
      timestamp: timestamp,
      status: status,
      isAnomaly: isAnomaly,
      zScore: typeof zScore === 'number' ? zScore.toFixed(2) : zScore,
      health: parseFloat(health.toFixed(1))
    });
  });

  // Only emit if we have simulated data (otherwise dashboard relies on MQTT events or we should emit mixed? 
  // Frontend likely expects full array. But MQTT emits 'sensorUpdate'.
  // Ideally we should emit everything. But since hardware sensors are async updates, 
  // we can just emit the simulated ones here.)
  if (data.length > 0) {
      io.emit('sensorData', data);
  }
}, 2000);

// API Endpoints
app.get('/api/sensors', (req, res) => {
    res.json(SENSORS);
});

app.post('/api/sensors', async (req, res) => {
    try {
        const { id, name, type, unit, threshold } = req.body;
        if (!id || !name) return res.status(400).json({ error: "ID and Name required" });

        // Check if exists
        if (SENSORS.find(s => s.id === id)) {
            return res.status(400).json({ error: "Sensor ID already exists" });
        }

        const newSensor = {
            id, 
            name, 
            type: type || 'generic', 
            unit: unit || '', 
            min: 0, 
            max: 100, 
            threshold: parseFloat(threshold) || 80, 
            baseline: 50,
            status: 'active'
        };

        // Add to memory for simulation
        SENSORS.push(newSensor);
        
        // Initialize state
        sensorState[id] = { value: newSensor.baseline, trend: 0 };
        sensorHistory[id] = [];
        healthState[id] = 100;

        // Persist to DB
        await db.ensureSensor(newSensor);

        res.status(201).json(newSensor);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/sensors/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, threshold, unit, status } = req.body;
        
        const sensor = SENSORS.find(s => s.id === id);
        if (!sensor) return res.status(404).json({ error: "Sensor not found" });

        if (name) sensor.name = name;
        if (threshold) sensor.threshold = parseFloat(threshold);
        if (unit) sensor.unit = unit;
        if (status) sensor.status = status;

        // Update DB
        // Using direct query here as db.ensureSensor is for creation.
        // Ideally we should add updateSensor to db module, but for now exact query works.
        await db.query('UPDATE sensors SET name=$1, unit=$2, threshold=$3, status=$4 WHERE id=$5', 
            [sensor.name, sensor.unit, sensor.threshold, sensor.status, id]);

        res.json({ success: true, sensor });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/sensors/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const index = SENSORS.findIndex(s => s.id === id);
        
        if (index !== -1) {
            SENSORS.splice(index, 1); // Remove from simulation
            
            // Clean up states
            delete sensorState[id];
            delete sensorHistory[id];
            delete healthState[id];

            // Remove from DB (Optional: Soft delete? User asked to remove, so hard delete)
            await db.query('DELETE FROM sensors WHERE id = $1', [id]);
            
            res.json({ success: true });
        } else {
            res.status(404).json({ error: "Sensor not found" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/sensors', async (req, res) => {
    try {
        const { id, name, type, unit, threshold } = req.body;
        if (!id || !name) return res.status(400).json({ error: "ID and Name required" });

        // Check if exists
        if (SENSORS.find(s => s.id === id)) {
            return res.status(400).json({ error: "Sensor ID already exists" });
        }

        const newSensor = {
            id, 
            name, 
            type: type || 'generic', 
            unit: unit || '', 
            min: 0, 
            max: 100, 
            threshold: parseFloat(threshold) || 80, 
            baseline: 50,
            status: 'active'
        };

        // Add to memory for simulation
        SENSORS.push(newSensor);
        
        // Initialize state
        sensorState[id] = { value: newSensor.baseline, trend: 0 };
        sensorHistory[id] = [];
        healthState[id] = 100;

        // Persist to DB
        await db.ensureSensor(newSensor);

        res.status(201).json(newSensor);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/sensors/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, threshold, unit, status } = req.body;
        
        const sensor = SENSORS.find(s => s.id === id);
        if (!sensor) return res.status(404).json({ error: "Sensor not found" });

        if (name) sensor.name = name;
        if (threshold) sensor.threshold = parseFloat(threshold);
        if (unit) sensor.unit = unit;
        if (status) sensor.status = status;

        // Update DB (We might need a proper update function in db module, but ensureSensor implies create if not exists. 
        // Let's add specific update query here or just rely on memory for MVP if DB update is complex without new function.
        // Actually for polish, let's try to update DB too.
        await db.query('UPDATE sensors SET name=$1, unit=$2, threshold=$3, status=$4 WHERE id=$5', 
            [sensor.name, sensor.unit, sensor.threshold, sensor.status, id]);

        res.json({ success: true, sensor });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/sensors/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const index = SENSORS.findIndex(s => s.id === id);
        
        if (index !== -1) {
            SENSORS.splice(index, 1); // Remove from simulation
            
            // Clean up states
            delete sensorState[id];
            delete sensorHistory[id];
            delete healthState[id];

            // Remove from DB
            await db.query('DELETE FROM sensors WHERE id = $1', [id]);
            
            res.json({ success: true });
        } else {
            res.status(404).json({ error: "Sensor not found" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/history/:sensorId', async (req, res) => {
    try {
        const { sensorId } = req.params;
        const limit = req.query.limit || 50;
        const history = await db.getHistory(sensorId, limit);
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/alerts', async (req, res) => {
    try {
        const alerts = await db.getAlerts();
        res.json(alerts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/alerts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await db.updateAlertStatus(id, status);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Auth Middleware


// Auth Routes
app.post('/api/auth/register', async (req, res) => {
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

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await db.findUserByUsername(username);

        if (!user) return res.status(400).json({ error: "User not found" });

        if (await bcrypt.compare(password, user.password_hash)) {
            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
        } else {
            res.status(403).json({ error: "Invalid password" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// AI Endpoints
app.get('/api/ai/health', authenticateToken, (req, res) => {
    // Return current health state logic (Assuming healthState is available globally in scope, checking scope...)
    // Wait, healthState is defined in the previous block.
    // I need to ensure healthState is accessible here. 
    // It is defined in the top scope of index.js in my previous edit, so it should be fine.
    
    // Construct a nice response
    const response = SENSORS.map(s => ({
        id: s.id,
        name: s.name,
        health: healthState[s.id] || 100,
        status: (healthState[s.id] || 100) > 70 ? 'Good' : (healthState[s.id] || 100) > 30 ? 'Fair' : 'Critical'
    }));
    res.json(response);
});

// Export Endpoints
const exporter = require('./export');

app.get('/api/export/csv/:sensorId', authenticateToken, (req, res) => {
    exporter.exportToExcel(req.params.sensorId, res);
});

app.get('/api/export/pdf/report', authenticateToken, (req, res) => {
    exporter.exportPDFReport(res);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
