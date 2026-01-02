const ROLE_LEVEL = {
  CITIZEN: 1,
  OFFICER: 2,
  DEPT_HEAD: 3,
  DISTRICT_ADMIN: 4,
  STATE_ADMIN: 5,
  CENTRAL_ADMIN: 6,
  SUPER_ADMIN: 7,
};

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
