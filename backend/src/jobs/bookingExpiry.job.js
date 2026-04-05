const cron = require('node-cron');
const schedulerService = require('../services/scheduler.service');

function startBookingExpiryJob() {
  return cron.schedule('* * * * *', async () => {
    try {
      const result = await schedulerService.processExpiredBookings();
      if (result.processed > 0) {
        console.log(`Expired bookings processed: ${result.processed}`);
      }
    } catch (error) {
      console.error('Booking expiry job failed:', error.message);
    }
  });
}

module.exports = {
  startBookingExpiryJob
};