# Backend

This folder contains the backend API for the RoyalBeauty project.

Structure

backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── index.js
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── bookingController.js
│   │   └── serviceController.js
│   ├── routes/
│   │   ├── bookingRoutes.js
│   │   └── serviceRoutes.js
│   ├── utils/
│   │   ├── sms.js
│   │   └── email.js
│   └── middlewares/
│       └── errorHandler.js
├── .env
├── package.json
└── README.md

Quick start

1. Install dependencies: npm install
2. Generate Prisma client and migrate (optional for SQLite dev): npx prisma generate
3. Start server: npm run start

Notes

- The `.env` file is used for sensitive keys and is already present in the repository.
- The Prisma schema uses SQLite by default (`prisma/dev.db`).

Local testing notes (STK Push)

This backend includes helper endpoints to test Daraja STK Push flows locally without a public callback URL.

- POST `/api/stkpush`
	- body: { phone, amount, accountNumber }
	- Initiates an STK Push and persists a pending transaction to `transactions.json`. The response includes Daraja's response with `CheckoutRequestID` which you can use to poll.

- POST `/api/simulate-callback`
	- body: { checkoutRequestID, merchantRequestID, amount, mpesaReceiptNumber, transactionDate, phoneNumber }
	- Simulates the Daraja callback and will create/update a transaction in `transactions.json` with status `COMPLETED`.

- GET `/api/transactions` and GET `/api/transactions/:id`
	- Retrieve persisted transactions (useful for verifying payment status in the frontend).

Notes:
- For real STK Push testing, ensure `CALLBACK_URL` in `.env` points to a publicly reachable URL (use ngrok or similar) so Daraja sandbox can reach your callback endpoint.
- `transactions.json` is a simple file-based store for prototyping. Use a database for production.
