import RewardHistory from "../models/rewardHistory.model.js";

export const addRewardHistory = async ({
  userId,
  complaintId,
  action,
  points,
}) => {
  if (points === 0) return; // No reward to log

  await RewardHistory.create({
    userId,
    complaintId,
    action,
    points,
  });
};
