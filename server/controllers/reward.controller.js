import Reward from "../models/reward.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";


export const getMyRewards = asyncHandler(async (req, res) => {
  const rewards = await Reward.find({
    userId: req.user._id,
  }).sort({ createdAt: -1 });

  const totalPoints = rewards.reduce(
    (sum, r) => sum + r.points,
    0
  );

  return res.status(200).json(
    new ApiResponse({
      data: { rewards, totalPoints },
      message: "User rewards fetched successfully",
    })
  );
});

export const getUserRewards = asyncHandler(async (req, res) => {
  const rewards = await Reward.find({
    userId: req.params.userId,
  }).sort({ createdAt: -1 });

  if (rewards.length === 0) {
    throw new ApiError(404, "No rewards found for user");
  }

  const totalPoints = rewards.reduce(
    (sum, r) => sum + r.points,
    0
  );

  return res.status(200).json(
    new ApiResponse({
      data: { rewards, totalPoints },
      message: "User rewards fetched successfully",
    })
  );
});

export const addRewardPoints = async ({
  userId,
  points,
  reason,
  complaintId = null,
}) => {
  if (!userId || !points || !reason) {
    throw new Error("Invalid reward data");
  }

  if (points <= 0) {
    throw new Error("Reward points must be positive");
  }

  const exists = await Reward.findOne({
    userId,
    reason,
    complaintId,
  });

  if (exists) {
    return; 
  }

  await Reward.create({
    userId,
    points,
    reason,
    complaintId,
  });
};

