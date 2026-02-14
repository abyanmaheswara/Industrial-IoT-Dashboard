<div align="center">
  <img src="./client/public/favicon.svg" width="120" height="120" alt="FactoryForge Logo">
  
  # 🏭 FactoryForge
  
  **Industrial IoT Monitoring Platform**
  
  Real-time sensor monitoring, analytics, and intelligent alerts for modern manufacturing
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](https://opensource.org/licenses/MIT)
  [![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
  
</div>

---

## 🔥 Features

### Phase 2 (Current) ✅
- **Real-time Monitoring**: Live sensor data streaming via Socket.io
- **Multi-page Navigation**: Overview, Analytics, Alerts, Settings
- **Interactive Visualizations**: Charts for trends, comparisons, and analysis
- **Alert Management**: Comprehensive alert history and filtering
- **Sensor Configuration**: Manage and configure sensors
- **Modern UI/UX**: Professional design with light/dark theme support
- **Responsive Design**: Works on desktop and tablet

## 🎨 Color Palette

- **Metallic Brown**: `#8B4513` - Primary brand color
- **Industrial Orange**: `#FF6B35` - Accent & highlights
- **Dark Bronze**: `#4A2C2A` - Shadows & depth
- **Bright Orange**: `#FF8C42` - Interactive elements

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
