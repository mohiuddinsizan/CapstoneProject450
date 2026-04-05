const { httpError } = require('../utils/httpError');
const accessGrantRepo = require('../repositories/accessGrant.repo');
const biometricRepo = require('../repositories/biometric.repo');

async function register({ userId, lockerId, deviceId, templateHash }) {
  const grant = await accessGrantRepo.findActiveGrant(userId, lockerId);
  if (!grant) {
    throw httpError(403, 'No active grant for biometric registration');
  }

  return biometricRepo.createEnrollment({ userId, lockerId, deviceId, templateHash });
}

module.exports = {
  register
};