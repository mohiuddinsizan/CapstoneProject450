const Joi = require('joi');

const checkoutSchema = Joi.object({
  bookingId: Joi.string().uuid().required()
});

const webhookSchema = Joi.object({
  providerRef: Joi.string().required(),
  status: Joi.string().valid('SUCCESS', 'FAILED', 'PENDING').required()
});

module.exports = {
  checkoutSchema,
  webhookSchema
};