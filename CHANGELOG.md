# Changelog

All notable changes to the **FactoryForge** project will be documented in this file.

## [1.0.0] - 2026-02-14

### 🚀 Major Features
- **Premium Industrial Aesthetic**: Complete UI overhaul with "Obsidian Glass" theme, rich brown/copper accents, and seamless dark mode.
- **Role-Based Authentication**: Secure login/registration with JWT, supporting Viewer, Operator, and Admin roles.
- **Real-time Dashboard**: Live sensor monitoring via WebSocket/MQTT integration.
- **Analytics Module**: Historical data visualization with interactive charts and date range filtering (24h, 7d, 30d).
- **Reporting System**: Automated PDF and Excel export for sensor data capabilities.
- **AI Anomaly Detection**: Statistical Z-Score analysis for detecting sensor irregularities.

### ✨ Enhancements
- **Theme Engine**: "Industrial" color palette with locked Dark Mode (configurable for testing) and metallic gradients.
- **Profile Management**: User profile customization with avatar upload and compression.
- **Alert System**: Real-time critical alerts with visual indicators and history tracking.
- **Performance**: Optimized re-renders and efficient data fetching implementation.

### 🐛 Bug Fixes
- Fixed theme toggling consistency and enforced dark mode defaults.
- Resolved layout shift issues in Sidebar and Header.
- Fixed button visibility and contrast issues on Auth pages.
- Corrected scrollbar styling to match the industrial theme.

### 🔧 Technical
- Migrated to PostgreSQL for robust data persistence.
- Implemented internal MQTT broker (Aedes) for IoT simulation.
- modularized backend structure (`/db`, `/ai`, `/mqtt`).
