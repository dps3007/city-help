export const ROLE_LEVEL = {
  CITIZEN: 1,
  WORKER: 2,
  OFFICER: 3,
  DEPT_HEAD: 4,
  DISTRICT_ADMIN: 5,
  STATE_ADMIN: 6,
  CENTRAL_ADMIN: 7,
  SUPER_ADMIN: 8,
};

// Middleware to check if user has one of the allowed roles
export const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    const userRoleLevel = ROLE_LEVEL[req.user.role];
    const allowedRoleLevels = allowedRoles.map(r => ROLE_LEVEL[r]);

    const hasAccess = allowedRoleLevels.some(
      level => userRoleLevel >= level
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      });
    }

    next();
  };
};
