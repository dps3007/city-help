import User from "../models/user.model.js";

/// GLOBAL LEADERBOARD
export const getGlobalLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ role: "CITIZEN" })
      .select("name municipalId communityPoints")
      .sort({ communityPoints: -1 })
      .limit(50);

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch global leaderboard" });
  }
};

/// LOCAL LEADERBOARD
export const getLocalLeaderboard = async (req, res) => {
  try {
    const { municipalId } = req.params;

    const users = await User.find({ municipalId, role: "CITIZEN" })
      .select("name municipalId communityPoints")
      .sort({ communityPoints: -1 })
      .limit(50);

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch local leaderboard" });
  }
};
