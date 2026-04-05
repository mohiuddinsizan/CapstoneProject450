const deviceRepo = require('../repositories/device.repo');
const eventRepo = require('../repositories/event.repo');

async function logEvent({ lockerId, eventType }) {
  await deviceRepo.ensureDeviceForLocker(lockerId);
  return eventRepo.createDoorEvent({ lockerId, eventType });
}

async function logTelemetry({ lockerId, payload }) {
  const device = await deviceRepo.ensureDeviceForLocker(lockerId);
  return deviceRepo.createTelemetry({
    deviceId: device.id,
    lockerId,
    payload
  });
}

module.exports = {
  logEvent,
  logTelemetry
};