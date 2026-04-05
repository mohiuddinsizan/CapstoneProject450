const bookingRepo = require('../repositories/booking.repo');
const accessGrantRepo = require('../repositories/accessGrant.repo');
const lockerRepo = require('../repositories/locker.repo');
const { publishLockCommand } = require('../utils/mqttPublish');

async function processExpiredBookings() {
  const expiredBookings = await bookingRepo.findExpiredActiveBookings();

  for (const booking of expiredBookings) {
    await bookingRepo.markBookingExpired(booking.id);
    await accessGrantRepo.expireByBookingId(booking.id);
    await lockerRepo.updateLockerStatus(booking.locker_id, 'LOCKED_EXPIRED');
    publishLockCommand(booking.locker_id);
  }

  return { processed: expiredBookings.length };
}

module.exports = {
  processExpiredBookings
};