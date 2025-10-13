const express = require('express');
const router = express.Router();
const { createBooking, listBookings } = require('../controllers/bookingController');

router.post('/', createBooking);
router.get('/', listBookings);

module.exports = router;
