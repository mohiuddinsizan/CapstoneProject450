const bcrypt = require('bcryptjs');
const env = require('../config/env');
const { httpError } = require('../utils/httpError');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const userRepo = require('../repositories/user.repo');

function buildTokens(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload)
  };
}

async function register({ name, email, password, phone }) {
  const existingUser = await userRepo.findByEmail(email);
  if (existingUser) {
    throw httpError(409, 'Email already in use');
  }

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
  const user = await userRepo.createUser({ name, email, passwordHash, phone });
  const tokens = buildTokens(user);

  return { user, ...tokens };
}

async function login({ email, password }) {
  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw httpError(401, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw httpError(401, 'Invalid email or password');
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    created_at: user.created_at
  };

  const tokens = buildTokens(safeUser);
  return { user: safeUser, ...tokens };
}

async function refresh({ refreshToken }) {
  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (_error) {
    throw httpError(401, 'Invalid or expired refresh token');
  }

  const user = await userRepo.findById(payload.userId);
  if (!user) {
    throw httpError(404, 'User not found');
  }

  const tokens = buildTokens(user);
  return { user, ...tokens };
}

async function getMe(userId) {
  const user = await userRepo.findById(userId);
  if (!user) {
    throw httpError(404, 'User not found');
  }

  return user;
}

module.exports = {
  register,
  login,
  refresh,
  getMe
};