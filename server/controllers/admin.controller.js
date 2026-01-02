import asyncHandler from '../utils/asyncHandler.js';

/* ================= DASHBOARD STATS ================= */
export const getDashboardStats = asyncHandler(async (req, res) => {
  // Later: replace with real aggregation queries
  res.status(200).json({
    success: true,
    stats: {
      totalUsers: 0,
      totalComplaints: 0,
      resolvedComplaints: 0,
    },
  });
});

/* ================= USER MANAGEMENT ================= */
export const manageUser = asyncHandler(async (req, res) => {
  const { userId, action } = req.body;

  res.status(200).json({
    success: true,
    message: `User ${action} successfully`,
    userId,
  });
});
