const http = require('http');
const createApp = require('./src/app');
const env = require('./src/config/env');
const { testDbConnection } = require('./src/config/db');
const { startBookingExpiryJob } = require('./src/jobs/bookingExpiry.job');

function listenWithFallback(server, startPort, maxAttempts = 10) {
  return new Promise((resolve, reject) => {
    let attempt = 0;

    const tryListen = () => {
      const port = Number(startPort) + attempt;

      const onError = (error) => {
        server.off('listening', onListening);
        if (error.code === 'EADDRINUSE' && attempt < maxAttempts - 1) {
          attempt += 1;
          console.warn(`Port ${port} in use, retrying on ${Number(startPort) + attempt}...`);
          setImmediate(tryListen);
          return;
        }

        reject(error);
      };

      const onListening = () => {
        server.off('error', onError);
        resolve(port);
      };

      server.once('error', onError);
      server.once('listening', onListening);
      server.listen(port);
    };

    tryListen();
  });
}

async function bootstrap() {
  await testDbConnection();
  const app = createApp();
  const server = http.createServer(app);
  const bookingExpiryJob = startBookingExpiryJob();

  const activePort = await listenWithFallback(server, env.PORT);
  console.log(`OmniLock backend running on port ${activePort}`);

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