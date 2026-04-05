const { generateOTP, hashOTP, verifyOTP } = require('../utils/otp');
const { sendSMS } = require('../utils/sms');
const { signUnlockToken } = require('../utils/jwt');
const { httpError } = require('../utils/httpError');
const userRepo = require('../repositories/user.repo');
const otpRepo = require('../repositories/otp.repo');
const accessGrantRepo = require('../repositories/accessGrant.repo');

async function requestOtp({ userId, lockerId, challengeType = 'ACCESS' }) {
  const grant = await accessGrantRepo.findActiveGrant(userId, lockerId);
  if (!grant) {
    throw httpError(403, 'No active access grant for this locker');
  }

  const user = await userRepo.findById(userId);
  if (!user) {
    throw httpError(404, 'User not found');
  }

  const otp = generateOTP();
  const otpHash = await hashOTP(otp);

  const ttlMinutes = challengeType === 'ENROLLMENT' ? 10 : 5;
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();

  const challenge = await otpRepo.createChallenge({
    userId,
    lockerId,
    otpHash,
    challengeType,
    expiresAt
  });

  await sendSMS(user.phone, `Your OmniLock OTP is ${otp}`);

  return {
    challengeId: challenge.id,
    expiresAt: challenge.expires_at
  };
}

async function verifyChallenge({ userId, lockerId, otp, challengeType = 'ACCESS' }) {
  const challenge = await otpRepo.findLatestActiveChallenge({ userId, lockerId, challengeType });
  if (!challenge) {
    throw httpError(404, 'OTP challenge not found');
  }

  if (new Date(challenge.expires_at) <= new Date()) {
    throw httpError(401, 'OTP challenge expired');
  }

  if (challenge.attempts >= challenge.max_attempts) {
    throw httpError(401, 'Maximum OTP attempts exceeded');
  }

  const isValid = await verifyOTP(otp, challenge.otp_hash);
  if (!isValid) {
    await otpRepo.incrementAttempts(challenge.id);
    throw httpError(401, 'Invalid OTP');
  }

  await otpRepo.markUsed(challenge.id);

  const unlockToken = signUnlockToken({
    userId,
    lockerId,
    type: 'unlock'
  });

  return {
    unlockToken,
    expiresIn: '30s'
  };
}

module.exports = {
  requestOtp,
  verifyChallenge
};