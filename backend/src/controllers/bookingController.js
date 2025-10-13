const { prisma } = require('../config/db');

const createBooking = async (req, res, next) => {
  try {
    const { customerName, customerPhone, serviceId, date, notes } = req.body;
    const booking = await prisma.booking.create({
      data: { customerName, customerPhone, serviceId, date: new Date(date), notes }
    });
    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

const listBookings = async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({ include: { service: true } });
    res.json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
};

module.exports = { createBooking, listBookings };
