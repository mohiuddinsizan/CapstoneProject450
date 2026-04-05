const Joi = require('joi');

const accessDecisionSchema = Joi.object({
  lockerId: Joi.string().uuid().required(),
  userId: Joi.string().uuid().required(),
  nonce: Joi.number().integer().min(0).required()
});

module.exports = {
  accessDecisionSchema
};