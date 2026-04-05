const authService = require('../services/auth.service');

async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function refresh(req, res, next) {
  try {
    const result = await authService.refresh(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    const user = await authService.getMe(req.user.userId);
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  refresh,
  me
};