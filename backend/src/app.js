const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const authRoutes = require('./routes/auth.routes');
const discoveryRoutes = require('./routes/discovery.routes');
const bookingsRoutes = require('./routes/bookings.routes');
const paymentsRoutes = require('./routes/payments.routes');
const otpRoutes = require('./routes/otp.routes');
const accessRoutes = require('./routes/access.routes');
const deviceRoutes = require('./routes/device.routes');
const adminRoutes = require('./routes/admin.routes');
const biometricRoutes = require('./routes/biometric.routes');
const { authMiddleware } = require('./middleware/auth');
const authController = require('./controllers/auth.controller');

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(compression());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/auth', authRoutes);
  app.use(discoveryRoutes);
  app.use(bookingsRoutes);
  app.use(paymentsRoutes);
  app.use(otpRoutes);
  app.use(accessRoutes);
  app.use(deviceRoutes);
  app.use('/admin', adminRoutes);
  app.use(biometricRoutes);

  app.get('/me', authMiddleware, authController.me);

  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  app.use((error, _req, res, _next) => {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal server error';
    res.status(statusCode).json({ message });
  });

  return app;
}

module.exports = createApp;