const { verify } = require('../utils/jwt');
const { error } = require('../utils/response');

const authenticate = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return error(res, 'No token provided', 401);

  try {
    req.user = verify(token);
    next();
  } catch {
    return error(res, 'Invalid or expired token', 401);
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return error(res, 'Insufficient permissions', 403);
  }
  next();
};

module.exports = { authenticate, authorize };
