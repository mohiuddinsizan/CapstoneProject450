const bcrypt = require('bcryptjs');
const env = require('../config/env');

function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function hashOTP(otp) {
  return bcrypt.hash(otp, env.BCRYPT_ROUNDS);
}

async function verifyOTP(otp, otpHash) {
  return bcrypt.compare(otp, otpHash);
}

module.exports = {
  generateOTP,
  hashOTP,
  verifyOTP
};