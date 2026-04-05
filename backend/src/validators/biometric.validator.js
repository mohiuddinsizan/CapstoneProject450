const Joi = require('joi');

const registerBiometricSchema = Joi.object({
  lockerId: Joi.string().uuid().required(),
  deviceId: Joi.string().uuid().optional(),
  templateHash: Joi.string().min(16).required()
});

module.exports = {
  registerBiometricSchema
};