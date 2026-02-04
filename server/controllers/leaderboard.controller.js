import { redis } from "../config/redis.js";
import User from "../models/user.model.js";

export const getGlobalLeaderboard = async (req, res) => {
  const cacheKey = "leaderboard:global";

  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  const users = await User.find({ role: "CITIZEN" })
    .select("name municipalId communityPoints")
    .sort({ communityPoints: -1 })
    .limit(50)
    .lean();

  await redis.set(cacheKey, users, { ex: 120 });

  res.status(200).json(users);
};

export const getLocalLeaderboard = async (req, res) => {
  const { municipalId } = req.params;
  const cacheKey = `leaderboard:local:${municipalId}`;

  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  const users = await User.find({
    municipalId,
    role: "CITIZEN",
  })
    .select("name municipalId communityPoints")
    .sort({ communityPoints: -1 })
    .limit(50)
    .lean();

  await redis.set(cacheKey, users, { ex: 120 });

  res.status(200).json(users);
};
