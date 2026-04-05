const env = require('../config/env');

function deviceAuth(req, _res, next) {
  const deviceSecret = req.headers['x-device-secret'];

  if (!deviceSecret || deviceSecret !== env.DEVICE_SHARED_SECRET) {
    const error = new Error('Unauthorized device');
    error.statusCode = 401;
    return next(error);
  }

  return next();
}

module.exports = {
  deviceAuth
};