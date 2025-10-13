# RoyalBeauty

This repository contains a small booking and payment demo for a beauty service. It has a Vite + React + TypeScript frontend and a Node.js + Express backend that demonstrates M-PESA Daraja STK push integration in sandbox mode.

Folders

- `frontend/` — Vite + React + TypeScript app (UI, booking flow, payment modal)
- `backend/` — Express server routes for Daraja integration and transaction persistence (local JSON)

Quick start (dev)

1. Backend

```powershell
cd backend
npm install
# create a .env with CONSUMER_KEY, CONSUMER_SECRET, SHORTCODE, PASSKEY, CALLBACK_URL
node index.js
```

2. Frontend

```powershell
cd frontend
npm install
npm run dev
# open http://localhost:5176 (vite may pick a different port)
```

Notes

- The backend uses local `transactions.json` and `stkcallback.json` for persistence in development. These files are ignored via `.gitignore`.
- For real STK Push testing you need a publicly reachable HTTPS `CALLBACK_URL` (for example via ngrok) and valid Daraja sandbox credentials.
- There's a `POST /api/simulate-callback` endpoint in the backend to help with local testing of the callback flow.

License: MIT
