const { verifyAccessToken } = require('../utils/jwt');

function authMiddleware(req, _res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error = new Error('Unauthorized');
    error.statusCode = 401;
    return next(error);
  }

  const token = authHeader.slice('Bearer '.length);

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    };
    return next();
  } catch (_error) {
    const error = new Error('Invalid or expired token');
    error.statusCode = 401;
    return next(error);
  }
}

module.exports = {
  authMiddleware
};