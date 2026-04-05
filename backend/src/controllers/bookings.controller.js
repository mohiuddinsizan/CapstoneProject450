const bookingService = require('../services/booking.service');

async function quote(req, res, next) {
  try {
    const result = await bookingService.quote(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function createBooking(req, res, next) {
  try {
    const booking = await bookingService.createBooking({
      userId: req.user.userId,
      lockerId: req.body.lockerId,
      planId: req.body.planId,
      startAt: req.body.startAt
    });
    res.status(201).json({ booking });
  } catch (error) {
    next(error);
  }
}

async function getBookings(req, res, next) {
  try {
    const bookings = await bookingService.getUserBookings(req.user.userId);
    res.status(200).json({ bookings });
  } catch (error) {
    next(error);
  }
}

async function getBookingDetails(req, res, next) {
  try {
    const booking = await bookingService.getBookingDetails(req.params.id, req.user.userId);
    res.status(200).json({ booking });
  } catch (error) {
    next(error);
  }
}

async function extendSubscription(req, res, next) {
  try {
    const booking = await bookingService.extendSubscription({
      userId: req.user.userId,
      bookingId: req.body.bookingId,
      planId: req.body.planId
    });
    res.status(201).json({ booking });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  quote,
  createBooking,
  getBookings,
  getBookingDetails,
  extendSubscription
};