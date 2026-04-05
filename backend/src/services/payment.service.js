const { v4: uuidv4 } = require('uuid');
const env = require('../config/env');
const bookingRepo = require('../repositories/booking.repo');
const paymentRepo = require('../repositories/payment.repo');
const lockerRepo = require('../repositories/locker.repo');
const accessGrantRepo = require('../repositories/accessGrant.repo');
const { httpError } = require('../utils/httpError');
const { verifyWebhookSignature } = require('../utils/webhook');

async function checkout({ userId, bookingId }) {
  const booking = await bookingRepo.findBookingById(bookingId);
  if (!booking || booking.user_id !== userId) {
    throw httpError(404, 'Booking not found');
  }

  if (booking.status !== 'PENDING') {
    throw httpError(400, 'Only pending bookings can be checked out');
  }

  const providerRef = uuidv4();
  const payment = await paymentRepo.createTransaction({
    bookingId: booking.id,
    lockerId: booking.locker_id,
    amount: booking.total_amount,
    provider: env.PAYMENT_PROVIDER || 'unknown',
    providerRef,
    status: 'PENDING'
  });

  return {
    payment,
    redirectUrl: `https://payments.example/checkout/${providerRef}`
  };
}

async function processWebhook({ rawPayload, signature, providerRef, status }) {
  const isValidSignature = verifyWebhookSignature(rawPayload, signature);
  if (!isValidSignature) {
    throw httpError(401, 'Invalid webhook signature');
  }

  const transaction = await paymentRepo.findByProviderRef(providerRef);
  if (!transaction) {
    throw httpError(404, 'Payment transaction not found');
  }

  if (transaction.status === 'SUCCESS') {
    return { processed: true, idempotent: true };
  }

  const normalizedStatus = status === 'SUCCESS' ? 'SUCCESS' : 'FAILED';
  const updatedTransaction = await paymentRepo.updateStatusByProviderRef(providerRef, normalizedStatus);

  if (normalizedStatus !== 'SUCCESS') {
    return { processed: true, idempotent: false, status: updatedTransaction.status };
  }

  const booking = await bookingRepo.findBookingById(transaction.booking_id);
  if (!booking) {
    throw httpError(404, 'Booking not found for transaction');
  }

  if (booking.status === 'ACTIVE') {
    return { processed: true, idempotent: true, status: 'ACTIVE' };
  }

  const startAt = new Date().toISOString();
  const endAt = new Date(Date.now() + Number(booking.duration_minutes) * 60 * 1000).toISOString();

  const activatedBooking = await bookingRepo.activateBooking(booking.id, startAt, endAt);
  await accessGrantRepo.createAccessGrant({
    bookingId: booking.id,
    userId: booking.user_id,
    lockerId: booking.locker_id,
    startAt,
    endAt
  });
  await lockerRepo.updateLockerStatus(booking.locker_id, 'OCCUPIED');

  return {
    processed: true,
    idempotent: false,
    status: updatedTransaction.status,
    booking: activatedBooking
  };
}

async function getHistory(userId) {
  return paymentRepo.getPaymentHistoryByUser(userId);
}

module.exports = {
  checkout,
  processWebhook,
  getHistory
};