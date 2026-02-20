-- Sensors Table
CREATE TABLE IF NOT EXISTS sensors (
  id VARCHAR(50) PRIMARY KEY,
  owner_id INT REFERENCES users(id),
  name VARCHAR(100),
  type VARCHAR(50),
  unit VARCHAR(20),
  threshold DECIMAL,
  status VARCHAR(20) DEFAULT 'active'
);

-- Readings Table (Time-series data)
CREATE TABLE IF NOT EXISTS readings (
  id SERIAL PRIMARY KEY,
  sensor_id VARCHAR(50) REFERENCES sensors(id),
  owner_id INT REFERENCES users(id),
  value DECIMAL,
  status VARCHAR(20), -- 'normal', 'warning', 'critical'
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  sensor_id VARCHAR(50) REFERENCES sensors(id),
  owner_id INT REFERENCES users(id),
  type VARCHAR(20), -- 'warning', 'critical'
  message TEXT,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'acknowledged', 'resolved'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(100),
    role VARCHAR(20) DEFAULT 'viewer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
