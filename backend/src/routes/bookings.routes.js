const express = require('express');
const bookingsController = require('../controllers/bookings.controller');
const { authMiddleware } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { quoteSchema, createBookingSchema, extendSubscriptionSchema } = require('../validators/booking.validator');

const router = express.Router();

router.post('/bookings/quote', authMiddleware, validate(quoteSchema), bookingsController.quote);
router.post('/bookings', authMiddleware, validate(createBookingSchema), bookingsController.createBooking);
router.get('/bookings', authMiddleware, bookingsController.getBookings);
router.get('/bookings/:id', authMiddleware, bookingsController.getBookingDetails);
router.post('/subscriptions/extend', authMiddleware, validate(extendSubscriptionSchema), bookingsController.extendSubscription);

module.exports = router;