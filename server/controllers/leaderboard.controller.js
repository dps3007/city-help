import User from "../models/user.model.js";

/**
 * GLOBAL LEADERBOARD
 * All municipal corporation users
 */
export const getGlobalLeaderboard = async (req, res) => {
  try {
    const users = await User.find()
      .select("name municipalId communityPoints")
      .sort({ communityPoints: -1 })
      .limit(50);

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch global leaderboard" });
  }
};

/**
 * LOCAL LEADERBOARD
 * Only one municipal community / ward
 */
export const getLocalLeaderboard = async (req, res) => {
  try {
    const { municipalId } = req.params;

    const users = await User.find({ municipalId })
      .select("name municipalId communityPoints")
      .sort({ communityPoints: -1 })
      .limit(50);

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch local leaderboard" });
  }
};
