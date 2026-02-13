# Industrial IoT Dashboard

Real-time Industrial IoT monitoring dashboard with sensor data visualization, analytics, and alert management.

## Features

### Phase 2 (Current) ✅
- **Real-time Monitoring**: Live sensor data streaming via Socket.io
- **Multi-page Navigation**: Overview, Analytics, Alerts, Settings
- **Interactive Visualizations**: Charts for trends, comparisons, and analysis
- **Alert Management**: Comprehensive alert history and filtering
- **Sensor Configuration**: Manage and configure sensors
- **Dark Theme UI**: Professional industrial control room aesthetics
- **Responsive Design**: Works on desktop and tablet

## Tech Stack

**Frontend:**
- React + Vite
- TypeScript
- TailwindCSS
- Recharts
- Lucide React
- Socket.io Client
- React Router

**Backend:**
- Node.js
- Express
- Socket.io
- CORS

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup
```bash
cd server
npm install
node index.js
```

Server runs on `http://localhost:3000`

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## Usage

1. Start the backend server first
2. Start the frontend development server
3. Navigate to `http://localhost:5173`
4. Dashboard should show "SYSTEM ONLINE" status

## Project Structure
```
Industrial-IoT-Dashboard/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   └── App.tsx        # Main app component
│   └── package.json
├── server/                # Backend Node.js server
│   ├── index.js          # Server entry point
│   └── package.json
└── README.md
```

## Screenshots

### Overview Page
Real-time sensor monitoring with live updates

### Analytics Page
Historical trends and KPI metrics

### Alerts Page
Alert management and history

### Settings Page
User profile and system configuration

## Roadmap

### Phase 3 (Planned)
- [ ] Database Integration (PostgreSQL/TimescaleDB)
- [ ] Authentication & User Management
- [ ] AI/ML Features (Anomaly Detection)
- [ ] Real MQTT Sensor Integration
- [ ] PDF Report Generation
- [ ] Email Notifications

## Contributing

Pull requests are welcome! For major changes, please open an issue first.

## License

MIT

## Author

Abyan Maheswara
