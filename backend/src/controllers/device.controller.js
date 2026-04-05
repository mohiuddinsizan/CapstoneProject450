const deviceService = require('../services/device.service');

async function events(req, res, next) {
  try {
    const event = await deviceService.logEvent(req.body);
    res.status(201).json({ event });
  } catch (error) {
    next(error);
  }
}

async function telemetry(req, res, next) {
  try {
    const metric = await deviceService.logTelemetry(req.body);
    res.status(201).json({ telemetry: metric });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  events,
  telemetry
};