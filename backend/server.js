const http = require('http');
const createApp = require('./src/app');
const env = require('./src/config/env');
const { testDbConnection } = require('./src/config/db');
const { startBookingExpiryJob } = require('./src/jobs/bookingExpiry.job');

async function bootstrap() {
  await testDbConnection();
  const app = createApp();
  const server = http.createServer(app);
  const bookingExpiryJob = startBookingExpiryJob();

  server.listen(env.PORT, () => {
    console.log(`OmniLock backend running on port ${env.PORT}`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down...`);
    bookingExpiryJob.stop();
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});