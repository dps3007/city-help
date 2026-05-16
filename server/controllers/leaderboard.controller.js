import { redis } from "../config/redis.js";
import User from "../models/user.model.js";

const getCachedLeaderboard = async (cacheKey) => {
  try {
    const cached = await redis.get(cacheKey);
    if (!cached) return null;

    if (typeof cached === "string") {
      try {
        return JSON.parse(cached);
      } catch {
        return cached;
      }
    }

    return cached;
  } catch (error) {
    console.warn(`Leaderboard cache read failed for ${cacheKey}:`, error.message);
    return null;
  }
};

const setCachedLeaderboard = async (cacheKey, users) => {
  try {
    await redis.set(cacheKey, JSON.stringify(users), { ex: 120 });
  } catch (error) {
    console.warn(`Leaderboard cache write failed for ${cacheKey}:`, error.message);
  }
};

export const getGlobalLeaderboard = async (req, res) => {
  const cacheKey = "leaderboard:global";

  const cached = await getCachedLeaderboard(cacheKey);
  if (Array.isArray(cached)) {
    return res.status(200).json(cached);
  }

  const users = await User.find({ role: "CITIZEN" })
    .select("name municipalId communityPoints")
    .sort({ communityPoints: -1 })
    .limit(50)
    .lean();

  await setCachedLeaderboard(cacheKey, users);

  res.status(200).json(users);
};

export const getLocalLeaderboard = async (req, res) => {
  const { municipalId } = req.params;
  const cacheKey = `leaderboard:local:${municipalId}`;

  const cached = await getCachedLeaderboard(cacheKey);
  if (Array.isArray(cached)) {
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

  await setCachedLeaderboard(cacheKey, users);

  res.status(200).json(users);
};
