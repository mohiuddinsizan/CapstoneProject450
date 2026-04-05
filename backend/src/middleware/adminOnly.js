function adminOnly(req, _res, next) {
  if (!req.user || req.user.role !== 'admin') {
    const error = new Error('Forbidden: admin access required');
    error.statusCode = 403;
    return next(error);
  }

  return next();
}

module.exports = {
  adminOnly
};