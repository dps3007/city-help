import { redis } from "../config/redis.js";
import Reward from "../models/reward.model.js";
import User from "../models/user.model.js";

import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getMyRewards = asyncHandler(async (req, res) => {
  const rewards = await Reward.find({
    userId: req.user._id,
  })
    .populate("complaintId", "category")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse({
      data: {
        rewards,
        totalPoints: req.user.communityPoints,
      },
      message: "User rewards fetched successfully",
    })
  );
});

export const getUserRewards = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select(
    "communityPoints"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const rewards = await Reward.find({
    userId: req.params.userId,
  })
    .populate("complaintId", "category")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse({
      data: {
        rewards,
        totalPoints: user.communityPoints, 
      },
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

  const exists = await Reward.findOne({
    userId,
    reason,
    complaintId,
  });
  if (exists) return;

  await Reward.create({
    userId,
    points,
    reason,
    complaintId,
  });

  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { communityPoints: points } },
    { new: true }
  );

  //REDIS INVALIDATION 
  await redis.del("leaderboard:global");
  if (user?.municipalId) {
    await redis.del(`leaderboard:local:${user.municipalId}`);
  }
  await redis.del("dashboard:*");
};

export const getRewardHistory = asyncHandler(async (req, res) => {
  const rewards = await Reward.find({
    userId: req.user._id,
  })
    .populate("complaintId", "category")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse({
      data: rewards,
      message: "Reward history fetched successfully",
    })
  );
});
