const otpService = require('../services/otp.service');

async function request(req, res, next) {
  try {
    const result = await otpService.requestOtp({
      userId: req.user.userId,
      lockerId: req.body.lockerId,
      challengeType: 'ACCESS'
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function verify(req, res, next) {
  try {
    const result = await otpService.verifyChallenge({
      userId: req.user.userId,
      lockerId: req.body.lockerId,
      otp: req.body.otp,
      challengeType: 'ACCESS'
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function enrollment(req, res, next) {
  try {
    const result = await otpService.requestOtp({
      userId: req.user.userId,
      lockerId: req.body.lockerId,
      challengeType: 'ENROLLMENT'
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function verifyEnrollment(req, res, next) {
  try {
    const result = await otpService.verifyChallenge({
      userId: req.user.userId,
      lockerId: req.body.lockerId,
      otp: req.body.otp,
      challengeType: 'ENROLLMENT'
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  request,
  verify,
  enrollment,
  verifyEnrollment
};