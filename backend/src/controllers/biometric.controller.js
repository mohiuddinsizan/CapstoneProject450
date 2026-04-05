const biometricService = require('../services/biometric.service');

async function register(req, res, next) {
  try {
    const enrollment = await biometricService.register({
      userId: req.user.userId,
      lockerId: req.body.lockerId,
      deviceId: req.body.deviceId,
      templateHash: req.body.templateHash
    });
    res.status(201).json({ enrollment });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register
};