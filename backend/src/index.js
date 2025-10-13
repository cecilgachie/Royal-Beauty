const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
const errorHandler = require('../middlewares/errorHandler');
const { connect, prisma } = require('./config/db');

dotenv.config({ path: '../.env' });

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes (will be mounted if present)
try {
  const bookingRoutes = require('./routes/bookingRoutes');
  app.use('/api/bookings', bookingRoutes);
} catch (e) {
  // ignore if routes not yet implemented
}

try {
  const serviceRoutes = require('./routes/serviceRoutes');
  app.use('/api/services', serviceRoutes);
} catch (e) {}

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connect();
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    const shutdown = async (signal) => {
      console.log(`Received ${signal}. Shutting down...`);
      server.close(async () => {
        try {
          await prisma.$disconnect();
        } catch (e) {
          console.error('Error during Prisma disconnect', e);
        }
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
};

start();

module.exports = app;
