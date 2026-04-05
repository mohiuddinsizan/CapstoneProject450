const { signUnlockToken } = require('../utils/jwt');
const { publishUnlockToken } = require('../utils/mqttPublish');
const { httpError } = require('../utils/httpError');
const accessGrantRepo = require('../repositories/accessGrant.repo');
const deviceRepo = require('../repositories/device.repo');
const eventRepo = require('../repositories/event.repo');

async function decision({ lockerId, userId, nonce }) {
  const grant = await accessGrantRepo.findActiveGrant(userId, lockerId);
  if (!grant) {
    await eventRepo.createAccessAttempt({
      userId,
      lockerId,
      method: 'BIOMETRIC',
      result: 'FAILED',
      reason: 'No active grant'
    });
    throw httpError(403, 'No active grant for this locker');
  }

  const device = await deviceRepo.ensureDeviceForLocker(lockerId);

  if (Number(nonce) !== Number(device.nonce)) {
    await eventRepo.createAccessAttempt({
      userId,
      lockerId,
      deviceId: device.id,
      method: 'BIOMETRIC',
      result: 'FAILED',
      reason: 'Nonce mismatch'
    });
    throw httpError(401, 'Invalid nonce');
  }

  const unlockToken = signUnlockToken({
    userId,
    lockerId,
    type: 'unlock'
  });

  publishUnlockToken(lockerId, {
    unlockToken,
    issuedAt: new Date().toISOString()
  });

  await deviceRepo.incrementNonce(device.id);
  await eventRepo.createAccessAttempt({
    userId,
    lockerId,
    deviceId: device.id,
    method: 'BIOMETRIC',
    result: 'SUCCESS'
  });

  return {
    granted: true,
    unlockToken,
    expiresIn: '30s'
  };
}

module.exports = {
  decision
};