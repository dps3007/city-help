import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Medal, Sparkles } from "lucide-react";

import { getMyRewards } from "../../services/reward.service";
import RewardHistory from "./RewardHistory";
import { getGlobalLeaderboard } from "../../services/leaderboard.service";
import { useAuth } from "../../context/useAuth";
import SectionHeader from "../../components/ui/SectionHeader";
import Card, { CardBody, CardHeader } from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";

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
        const index = leaderboard.findIndex((u) => u._id === user?._id);
        if (index !== -1) setRank(index + 1);
      } catch (err) {
        console.error(err);
      }
    };

    if (user?._id) fetchRank();
  }, [user]);

  const milestones = [
    { points: 50, badge: "🌟", level: "Novice" },
    { points: 100, badge: "⭐", level: "Expert" },
    { points: 250, badge: "💎", level: "Master" },
    { points: 500, badge: "👑", level: "Legendary" },
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

  const nextMilestone = milestones.find((milestone) => milestone.points > points);
  const progressPercent = nextMilestone ? Math.min((points / nextMilestone.points) * 100, 100) : 100;

  if (loading) {
    return <div className="surface p-8 text-slate-300">Loading rewards...</div>;
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Rewards"
        title="Community points and achievements"
        description="Track your civic contributions, milestone progress, and leaderboard standing in one polished view."
        action={<Link to="/leaderboard" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"><Trophy size={16} /> Leaderboard</Link>}
      />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="surface overflow-hidden p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300/80">Total points</p>
              <h2 className="mt-3 text-6xl font-semibold text-white">{points}</h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">Every verified complaint, resolved issue, and thoughtful feedback submission contributes to your community score.</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-right">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Your rank</p>
              <p className="mt-2 text-4xl font-semibold text-white">{rank !== null ? `#${rank}` : "—"}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <StatCard title="Points earned" value={points} delta="Current contribution balance" icon={<Sparkles size={18} />} tone="cyan" />
            <StatCard title="Current rank" value={rank !== null ? `#${rank}` : "—"} delta="Across the global leaderboard" icon={<Medal size={18} />} tone="amber" />
            <StatCard title="Milestones" value={milestones.filter((milestone) => points >= milestone.points).length} delta="Achievements unlocked" icon={<Trophy size={18} />} tone="emerald" />
          </div>
        </div>

        {nextMilestone && (
          <Card>
            <CardHeader>
              <p className="text-sm font-semibold text-white">Next milestone</p>
              <p className="text-sm text-slate-400">{points} / {nextMilestone.points} points</p>
            </CardHeader>
            <CardBody className="space-y-5">
              <div className="h-3 overflow-hidden rounded-full bg-white/8">
                <div className="h-full rounded-full bg-linear-to-r from-cyan-400 to-blue-600 transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="rounded-3xl border border-cyan-400/15 bg-cyan-400/10 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200/80">{nextMilestone.level}</p>
                <p className="mt-2 text-sm leading-6 text-cyan-50/90">Reach {nextMilestone.points} points to unlock the next civic achievement tier.</p>
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white">Achievements</h3>
        </CardHeader>
        <CardBody>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {milestones.map((milestone) => {
              const achieved = points >= milestone.points;
              return (
                <div key={milestone.level} className={`rounded-3xl border p-5 text-center ${achieved ? "border-cyan-400/20 bg-cyan-400/10" : "border-white/10 bg-white/5 opacity-80"}`}>
                  <div className="text-4xl">{milestone.badge}</div>
                  <p className="mt-3 text-lg font-semibold text-white">{milestone.level}</p>
                  <p className="mt-1 text-sm text-slate-400">{milestone.points} points</p>
                  {achieved && <p className="mt-3 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Achieved</p>}
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      <RewardHistory history={rewards} totalPoints={points} />

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white">How it works</h3>
        </CardHeader>
        <CardBody>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["Complaint verified", "+3 points"],
              ["Complaint resolved", "+4 points"],
              ["Feedback submitted", "+3 points"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-300">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default Rewards;
