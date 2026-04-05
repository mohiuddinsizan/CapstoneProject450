const { httpError } = require('../utils/httpError');
const lockerRepo = require('../repositories/locker.repo');
const planRepo = require('../repositories/plan.repo');
const bookingRepo = require('../repositories/booking.repo');

function computeEndAt(startAtIso, durationMinutes) {
  const start = new Date(startAtIso);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  return end.toISOString();
}

async function quote({ lockerId, planId, startAt }) {
  const locker = await lockerRepo.findLockerById(lockerId);
  if (!locker) {
    throw httpError(404, 'Locker not found');
  }

  if (locker.status !== 'AVAILABLE') {
    throw httpError(400, 'Locker is not available');
  }

  const plan = await planRepo.findActivePlanById(planId);
  if (!plan) {
    throw httpError(404, 'Subscription plan not found or inactive');
  }

  const endAt = computeEndAt(startAt, plan.duration_minutes);

  return {
    lockerId,
    planId,
    startAt,
    endAt,
    durationMinutes: plan.duration_minutes,
    totalAmount: Number(plan.price)
  };
}

async function createBooking({ userId, lockerId, planId, startAt }) {
  const quoteResult = await quote({ lockerId, planId, startAt });

  return bookingRepo.createBooking({
    userId,
    lockerId,
    planId,
    totalAmount: quoteResult.totalAmount,
    startAt: quoteResult.startAt,
    endAt: quoteResult.endAt
  });
}

async function getUserBookings(userId) {
  return bookingRepo.findBookingsByUser(userId);
}

async function getBookingDetails(bookingId, userId) {
  const booking = await bookingRepo.findBookingByIdForUser(bookingId, userId);
  if (!booking) {
    throw httpError(404, 'Booking not found');
  }

  return booking;
}

async function extendSubscription({ userId, bookingId, planId }) {
  const activeBooking = await bookingRepo.findActiveBookingByIdForUser(bookingId, userId);
  if (!activeBooking) {
    throw httpError(404, 'Active booking not found');
  }

  const plan = await planRepo.findActivePlanById(planId);
  if (!plan) {
    throw httpError(404, 'Subscription plan not found or inactive');
  }

  const extensionStartAt = activeBooking.end_at || new Date().toISOString();
  const endAt = computeEndAt(extensionStartAt, plan.duration_minutes);

  return bookingRepo.createBooking({
    userId,
    lockerId: activeBooking.locker_id,
    planId,
    totalAmount: Number(plan.price),
    startAt: extensionStartAt,
    endAt
  });
}

module.exports = {
  quote,
  createBooking,
  getUserBookings,
  getBookingDetails,
  extendSubscription
};