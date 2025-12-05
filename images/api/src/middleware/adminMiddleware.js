const { HTTP_STATUS } = require('./errorHandler');

/**
 * Middleware to check if user is an admin
 * Must be used after decodeToken middleware
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!req.user.is_admin) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
}

module.exports = { requireAdmin };
