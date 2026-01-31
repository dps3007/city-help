import { useEffect, useState } from "react";
import { getMyRewards } from "../../services/reward.service";
import RewardHistory from "./RewardHistory";
import { Link } from "react-router-dom";
import { getGlobalLeaderboard } from "../../services/leaderboard.service";
import { useAuth } from "../../context/AuthContext";

function Rewards() {
  const [points, setPoints] = useState(0);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [rank, setRank] = useState(null);

  useEffect(() => {
    const fetchRank = async () => {
      try {
        const leaderboard = await getGlobalLeaderboard();
        const index = leaderboard.findIndex(
          (u) => u._id === user?._id
        );
        if (index !== -1) setRank(index + 1);
      } catch (err) {
        console.error(err);
      }
    };

    if (user?._id) fetchRank();
  }, [user]);

  const MILESTONES = [
    { points: 50, badge: "🌟", level: "Novice", description: "Earn 50 points" },
    { points: 100, badge: "⭐", level: "Expert", description: "Earn 100 points" },
    { points: 250, badge: "💎", level: "Master", description: "Earn 250 points" },
    { points: 500, badge: "👑", level: "Legendary", description: "Earn 500 points" },
  ];

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const data = await getMyRewards();
        setPoints(data.totalPoints || 0);
        setRewards(data.rewards || []);
      } finally {
        setLoading(false);
      }
    };
    fetchRewards();
  }, []);

  const nextMilestone = MILESTONES.find((m) => m.points > points);
  const progressPercent = nextMilestone
    ? Math.min((points / nextMilestone.points) * 100, 100)
    : 100;

  if (loading) {
    return <p className="text-gray-600">Loading rewards...</p>;
  }

  return (
    <div className="max-w-5xl space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Rewards & Points
        </h1>
        <p className="text-gray-500 mt-1">
          Track your community contributions and achievements
        </p>
      </div>

      {/* TOTAL POINTS CARD */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white shadow-lg flex flex-col sm:flex-row justify-between gap-6">
        <div>
          <p className="text-sm opacity-90">Total Points</p>
          <h2 className="text-5xl font-extrabold mt-1">{points}</h2>
          <p className="text-sm mt-2 opacity-90">
            Community contribution score
          </p>
        </div>

        <div className="sm:text-right">
          <p className="text-sm opacity-90">Your Rank</p>
          <p className="text-3xl font-bold mt-1">
            {rank !== null ? `#${rank}` : "—"}
          </p>

          <Link
            to="/leaderboard"
            className="inline-block mt-3 text-sm font-medium underline hover:opacity-100 opacity-90"
          >
            View Leaderboard →
          </Link>
        </div>
      </div>

      {/* NEXT MILESTONE */}
      {nextMilestone && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800">
              Next Milestone
            </h3>
            <span className="text-sm text-gray-500">
              {points} / {nextMilestone.points} pts
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="mt-4 flex items-center gap-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-3xl">{nextMilestone.badge}</div>
            <div>
              <p className="font-semibold text-blue-700">
                {nextMilestone.level}
              </p>
              <p className="text-sm text-blue-600">
                {nextMilestone.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ACHIEVEMENTS */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">
          Achievements
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {MILESTONES.map((m, idx) => {
            const achieved = points >= m.points;
            return (
              <div
                key={idx}
                className={`rounded-xl p-4 text-center transition ${
                  achieved
                    ? "bg-amber-50 border border-amber-300 shadow-sm"
                    : "bg-gray-50 border border-gray-200 opacity-60"
                }`}
              >
                <div className="text-4xl">{m.badge}</div>
                <p className="font-semibold mt-2">{m.level}</p>
                <p className="text-xs text-gray-600">
                  {m.points} pts
                </p>
                {achieved && (
                  <p className="text-xs text-green-600 mt-2 font-semibold">
                    ✓ Achieved
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* REWARD HISTORY */}
      <RewardHistory history={rewards} />

      {/* HOW IT WORKS */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-800 mb-3">
          How It Works
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✓ Complaint verified: <b>+3 points</b></li>
          <li>✓ Complaint resolved: <b>+4 points</b></li>
          <li>✓ Feedback submitted: <b>+3 points</b></li>
          <li className="font-semibold text-blue-700">
            Total per resolved complaint: 10 points
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Rewards;
