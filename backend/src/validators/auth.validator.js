const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().max(150).required(),
  password: Joi.string().min(8).max(128).required(),
  phone: Joi.string().max(20).allow('', null)
});

const loginSchema = Joi.object({
  email: Joi.string().email().max(150).required(),
  password: Joi.string().min(8).max(128).required()
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required()
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema
};