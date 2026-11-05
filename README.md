# LoanTrack — MERN Loan Tracking System

Full-stack loan management for **microfinance** (small tickets, daily/weekly, flat interest, groups) and **macrofinance** (large tickets, monthly, reducing balance, businesses).

## Requirements
- Node.js >= 18
- MongoDB >= 6 (Atlas works out of the box; local: run `mongod`)

## Quick Start (development)

### 1. Server
```bash
cd server
cp .env.example .env      # edit MONGO_URI / JWT_SECRET
npm install
npm run seed              # creates demo users, products, clients, loans
npm run dev               # -> http://localhost:5000
```

### 2. Client
```bash
cd client
cp .env.example .env
npm install
npm run dev               # -> http://localhost:5173
```

`VITE_API_URL=/api` is recommended: the Vite dev server proxies `/api` to `:5000` and in production the API is served from the same origin.

### Demo logins (from seed)
- `admin@loantrack.io` / `admin123`  (admin)
- `officer@loantrack.io` / `officer123`  (officer)
- `collector@loantrack.io` / `collector123`  (collector)

## Single-port production build

The Express API serves the compiled React app itself, so the whole system runs as one HTTP service on `$PORT`:

```bash
npm install               # npm workspaces install both packages
npm run build             # vite build + copy client/dist -> server/public
npm start                 # -> http://localhost:5000 (API + SPA)
```

`server/public/` is the compiled web root and is committed so hosting only needs `npm install && npm start`.
`npm run seed` can be run from the repo root as well.

## Architecture
- **Backend**: Express + Mongoose, JWT auth, RBAC, service layer for schedule generation & payment allocation.
- **Frontend**: React (Vite) + Tailwind + Axios + React Router v6.

## Notes
- Payment recording is **sequential** (not transactional). For production, run MongoDB as a replica set and wrap `paymentService.applyPayment` in a transaction.
- Penalties are computed **on-the-fly** for display; charging them can be added via a cron job.
- Secrets live in `server/.env` (git-ignored). Never commit real credentials.
