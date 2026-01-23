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

      if (index !== -1) {
        setRank(index + 1);
      }
    } catch (err) {
      console.error("Failed to fetch rank", err);
    }
  };

  if (user?._id) {
    fetchRank();
  }
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
        const data = await getMyRewards(); // ✅ BACKEND SOURCE
        setPoints(data.totalPoints || 0);
        setRewards(data.rewards || []);
      } catch (error) {
        console.error("Failed to load rewards", error);
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
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Rewards & Points
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Earn points by contributing to your community
        </p>
      </div>

      
{/* Total Points Card */}
<div className="bg-linear-to-r from-blue-600 to-purple-600 rounded shadow-lg p-8 text-white flex items-center justify-between">
  
  {/* Left */}
  <div>
    <p className="text-sm font-semibold opacity-90">
      Total Points
    </p>
    <h2 className="text-5xl font-bold">{points}</h2>
    <p className="text-sm mt-2 opacity-90">
      Community contribution score
    </p>
  </div>

  {/* Right */}
  <div className="text-right">
    <p className="text-sm opacity-90">
      Your Rank
    </p>
    <p className="text-3xl font-bold mt-1">
      {rank !== null ? `#${rank}` : "—"}
    </p>

    <Link
      to="/leaderboard"
      className="inline-block mt-3 text-sm font-medium underline opacity-90 hover:opacity-100"
    >
      View Leaderboard →
    </Link>
  </div>

</div>


      {/* Progress to Next Milestone */}
      {nextMilestone && (
        <div className="bg-white rounded shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              Next Milestone
            </h3>
            <span className="text-sm text-gray-500">
              {points} / {nextMilestone.points} points
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-linear-to-r from-blue-500 to-purple-500 h-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
            <p className="text-lg font-semibold text-blue-600">
              {nextMilestone.badge} {nextMilestone.level}
            </p>
            <p className="text-sm text-blue-700">
              {nextMilestone.description}
            </p>
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="bg-white rounded shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">
          Achievements
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {MILESTONES.map((milestone, idx) => {
            const achieved = points >= milestone.points;
            return (
              <div
                key={idx}
                className={`p-4 rounded border text-center transition ${
                  achieved
                    ? "bg-amber-50 border-amber-300"
                    : "bg-gray-50 border-gray-300 opacity-50"
                }`}
              >
                <div className="text-3xl mb-2">
                  {milestone.badge}
                </div>
                <p className="font-semibold text-gray-800 text-sm">
                  {milestone.level}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {milestone.points} pts
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

      {/* Reward History */}
      <RewardHistory history={rewards} />

      {/* How It Works */}
      <div className="bg-blue-50 rounded shadow-sm p-6 border border-blue-200">
        <h3 className="font-semibold text-gray-800 mb-3">
          How It Works
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✓ Complaint verified: +3 points</li>
          <li>✓ Complaint resolved: +4 points</li>
          <li>✓ Feedback submitted: +3 points</li>
          <li className="font-semibold">
            Total per resolved complaint: 10 points
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Rewards;
