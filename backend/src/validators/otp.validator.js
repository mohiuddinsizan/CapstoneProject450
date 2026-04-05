const Joi = require('joi');

const requestOtpSchema = Joi.object({
  lockerId: Joi.string().uuid().required()
});

const verifyOtpSchema = Joi.object({
  lockerId: Joi.string().uuid().required(),
  otp: Joi.string().length(6).pattern(/^\d+$/).required()
});

module.exports = {
  requestOtpSchema,
  verifyOtpSchema
};