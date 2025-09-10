const roleCheck = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not authenticated.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

// Middleware for admin only access
const adminOnly = roleCheck(['admin']);

// Middleware for student or admin access
const studentOrAdmin = roleCheck(['student', 'admin']);

module.exports = {
  roleCheck,
  adminOnly,
  studentOrAdmin
};
