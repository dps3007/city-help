import Reward from '../models/reward.model.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getMyRewards = asyncHandler(async (req, res) => {
  const rewards = await Reward.find({
    userId: req.user._id,
  });

  res.json({ success: true, data: rewards });
});
