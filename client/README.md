# 🏭 FactoryForge - Industrial IoT Dashboard

FactoryForge is a premium, high-performance Industrial IoT Dashboard designed for real-time monitoring, analytics, and alerting of factory sensors. Built with a modern tech stack and featuring a sophisticated "Obsidian Glass" design, it provides operators and admins with immediate insights into machine health.

![Dashboard Preview](client/src/assets/dashboard_preview.png)
*(Note: Screenshots to be added after deployment)*

## 🚀 Features

### Core Modules
*   **Real-time Monitoring**: Live updates via WebSocket/MQTT (Temperature, Pressure, Vibration, Power).
*   **Analytics Dashboard**: Interactive charts with historical data analysis (24h, 7d, 30d zoom).
*   **Alert System**: Critical alert tracking with "Active" and "Resolved" states.
*   **Reporting**: Direct PDF and Excel export functionality for compliance and analysis.

### Security & Roles
*   **Role-Based Access Control (RBAC)**:
    *   **Viewer**: Read-only access to dashboard.
    *   **Operator**: Can manage alerts and view reports.
    *   **Admin**: Full system configuration access.
*   **Secure Authentication**: JWT-based session management.

### Advanced Tech
*   **AI Anomaly Detection**: Statistical Z-Score algorithms to detect sensor irregularities before failure.
*   **Internal MQTT Broker**: Built-in Aedes broker for handling thousands of sensor messages.
*   **PostgreSQL Persistence**: Robust time-series data storage.

## 🛠️ Tech Stack

**Frontend:**
*   React 19 + TypeScript
*   Vite (Build Tool)
*   Tailwind CSS v4 (Styling)
*   Recharts (Visualization)
*   Lucide React (Icons)
*   Socket.io Client

**Backend:**
*   Node.js + Express
*   PostgreSQL (Database)
*   Socket.io (Real-time)
*   Aedes (MQTT Broker)
*   JWT (Authentication)
*   PDFKit & ExcelJS (Reporting)

## 📦 Installation Guide

### Prerequisites
*   Node.js (v18+)
*   PostgreSQL (v14+)
*   Docker (Optional, for DB)

### Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-repo/factoryforge.git
    cd factoryforge
    ```

2.  **Database Setup**
    *   Ensure PostgreSQL is running.
    *   Create a database named `industrial_iot`.
    *   Import schema from `server/db/schema.sql`.

3.  **Backend Setup**
    ```bash
    cd server
    npm install
    cp .env.example .env  # Configure DB credentials
    npm start
    ```

4.  **Frontend Setup**
    ```bash
    cd client
    npm install
    npm run dev
    ```

5.  **Access**
    *   Dashboard: `http://localhost:5173`
    *   Server API: `http://localhost:3001`

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user |
| `GET` | `/api/sensors` | Get all sensor configurations |
| `GET` | `/api/history/:id` | Get historical data for a sensor |
| `GET` | `/api/alerts` | Get active and resolved alerts |
| `GET` | `/api/export/pdf` | Download system report PDF |

## 🤝 Contributing

Please read `CONTRIBUTING.md` for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
