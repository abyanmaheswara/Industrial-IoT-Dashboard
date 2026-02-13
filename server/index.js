const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (development only!)
    methods: ["GET", "POST"]
  }
});

// Sensor Configurations
const SENSORS = [
  { id: 'temp_01', name: 'Temperature A', type: 'temperature', unit: '°C', min: 20, max: 80, threshold: 75, baseline: 45 },
  { id: 'press_01', name: 'Pressure Main', type: 'pressure', unit: 'bar', min: 1, max: 10, threshold: 8, baseline: 5 },
  { id: 'vib_01', name: 'Vibration Motor', type: 'vibration', unit: 'mm/s', min: 0, max: 15, threshold: 12, baseline: 2 },
  { id: 'pwr_01', name: 'Power Consumption', type: 'power', unit: 'kW', min: 10, max: 100, threshold: 90, baseline: 45 }
];

// Simulation State
const sensorState = {};

// Initialize sensor state
SENSORS.forEach(sensor => {
  sensorState[sensor.id] = {
    value: sensor.baseline,
    trend: 0 // -1 (down), 0 (stable), 1 (up)
  };
});

function generateValue(sensor) {
  const state = sensorState[sensor.id];
  let change = (Math.random() - 0.5) * 2; // Random change between -1 and 1
  
  // Smooth fluctuation logic
  // If trend is up, more likely to go up, but with regression to mean
  if (state.trend === 1) change += 0.5;
  if (state.trend === -1) change -= 0.5;
  
  // Occasional Spike (5% chance)
  if (Math.random() < 0.05) {
     change += (Math.random() > 0.5 ? 5 : -5);
  }

  // Update value
  let newValue = state.value + change;

  // Keep within bounds but allow slight overflow for alerts
  if (newValue < sensor.min) newValue = sensor.min + Math.random();
  if (newValue > sensor.max) newValue = sensor.max - Math.random();

  // Update trend occasionally
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

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Data Emission Loop (2 seconds)
setInterval(() => {
  const timestamp = Date.now();
  const data = SENSORS.map(sensor => {
    const value = generateValue(sensor);
    return {
      id: sensor.id,
      name: sensor.name,
      type: sensor.type,
      value: value,
      unit: sensor.unit,
      timestamp: timestamp,
      status: getStatus(value, sensor)
    };
  });

  io.emit('sensorData', data);
  // console.log('Emitted data:', data.length, 'sensors');
}, 2000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
