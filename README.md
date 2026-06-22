# ShopForge

A full-stack e-commerce platform built with NestJS and React.

## Tech Stack

- **Backend:** NestJS (TypeScript)
- **Frontend:** React (TypeScript) + Vite
- **Database:** MySQL 8.0
- **Cache:** Redis 7

## Getting Started

### Prerequisites

- Node.js >= 18
- Docker & Docker Compose
- npm

### Setup

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd shopforge
   ```

2. Start infrastructure services:
   ```bash
   docker-compose up -d
   ```

3. Install and run the backend:
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```

4. Install and run the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Architecture

<!-- TODO: Add architecture diagram and detailed description -->

This section will document the system architecture, including:

- High-level system diagram
- Service communication patterns
- Database schema overview
- Caching strategy
- Authentication flow

## Project Structure

```
shopforge/
├── backend/          # NestJS API server
├── frontend/         # React + Vite SPA
├── docs/
│   └── adr/          # Architecture Decision Records
├── docker-compose.yml
├── CHANGELOG.md
└── README.md
```

## License

MIT
