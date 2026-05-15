import { useEffect, useState } from "react";
import { getMyRewards } from "../../services/reward.service";
import RewardHistory from "./RewardHistory";
import { Link } from "react-router-dom";
import { getGlobalLeaderboard } from "../../services/leaderboard.service";
import { useAuth } from "../../context/AuthContext";
import Card from "../../components/common/Card";
import StatsCard from "../../components/common/StatsCard";
import Skeleton from "../../components/common/Skeleton";
import { Star, Trophy, Award, TrendingUp, Zap, Target } from "lucide-react";

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
    return (
      <div className="space-y-6 p-6">
        <Skeleton count={4} className="h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Rewards & Achievements</h1>
        <p className="text-muted-foreground">Track your community contributions and earn badges</p>
      </div>

      {/* Main Points & Rank Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 p-8 bg-gradient-to-br from-primary-600 to-accent-600 text-white">
          <div className="space-y-2 mb-6">
            <p className="text-sm font-medium opacity-90">Total Points</p>
            <h2 className="text-5xl font-bold">{points}</h2>
            <p className="text-sm opacity-80">Community contribution score</p>
          </div>

          <div className="flex items-center gap-4 bg-white bg-opacity-10 rounded-lg px-4 py-3 w-fit">
            <Zap className="h-5 w-5" />
            <div>
              <p className="text-xs opacity-80">Points earned this month</p>
              <p className="font-bold">{Math.floor(points * 0.3)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Global Rank</p>
            <p className="text-4xl font-bold text-primary-600">
              {rank !== null ? `#${rank}` : "—"}
            </p>
          </div>
          <Link
            to="/leaderboard"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-primary-100 text-primary-700 hover:bg-primary-200 transition-colors text-sm font-medium"
          >
            <TrendingUp size={16} />
            View Leaderboard
          </Link>
        </Card>
      </div>

      {/* Next Milestone Progress */}
      {nextMilestone && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-bold text-foreground">Next Milestone</h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-foreground">
                {nextMilestone.level}
              </p>
              <p className="text-sm font-semibold text-primary-600">
                {points} / {nextMilestone.points} pts
              </p>
            </div>

            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center gap-4 bg-primary-50 border border-primary-200 rounded-lg p-4 mt-4">
              <div className="text-4xl">{nextMilestone.badge}</div>
              <div>
                <p className="font-bold text-primary-700">{nextMilestone.level}</p>
                <p className="text-sm text-primary-600">{nextMilestone.description}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Achievements & Badges */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-bold text-foreground">Achievements</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {MILESTONES.map((m, idx) => {
            const achieved = points >= m.points;
            return (
              <div
                key={idx}
                className={`rounded-xl p-4 text-center transition-all ${
                  achieved
                    ? "bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 shadow-md scale-105"
                    : "bg-muted border-2 border-border opacity-50"
                }`}
              >
                <div className="text-5xl mb-2">{m.badge}</div>
                <p className={`font-bold text-sm ${achieved ? "text-foreground" : "text-muted-foreground"}`}>
                  {m.level}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{m.points} pts</p>
                {achieved && (
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                    <Star size={12} className="fill-green-700" />
                    Unlocked
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Reward History */}
      <RewardHistory history={rewards} />

      {/* How It Works */}
      <Card className="p-6 bg-gradient-to-br from-primary-50 to-accent-50 border-2 border-primary-200">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-bold text-foreground">How Points Work</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="flex gap-3">
            <span className="text-2xl">✓</span>
            <div>
              <p className="font-semibold text-foreground">Complaint Verified</p>
              <p className="text-sm text-muted-foreground">+3 points</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">✓</span>
            <div>
              <p className="font-semibold text-foreground">Complaint Resolved</p>
              <p className="text-sm text-muted-foreground">+4 points</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">✓</span>
            <div>
              <p className="font-semibold text-foreground">Feedback Submitted</p>
              <p className="text-sm text-muted-foreground">+3 points</p>
            </div>
          </div>
          <div className="flex gap-3 sm:col-span-2 p-4 rounded-lg bg-white border-2 border-primary-200">
            <Trophy className="h-6 w-6 text-primary-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-primary-700">Total per Resolved Complaint</p>
              <p className="text-2xl font-bold text-primary-600">10 Points</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Rewards;
