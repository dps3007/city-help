export const checkHierarchy = (allowedLevels = []) => {
  return (req, res, next) => {
    if (!req.user || !allowedLevels.includes(req.user.level)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied due to hierarchy restrictions',
      });
    }
    next();
  };
};
