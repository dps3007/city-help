import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Crown,
  Loader2,
  Medal,
  MapPinned,
  RefreshCw,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

import { getGlobalLeaderboard, getLocalLeaderboard } from "../../services/leaderboard.service";
import { useAuth } from "../../context/useAuth";
import SectionHeader from "../../components/ui/SectionHeader";
import Card, { CardBody, CardHeader } from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";

const getRankIcon = (rank) => {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return rank;
};

const formatPoints = (points) => new Intl.NumberFormat("en-US").format(points || 0);

const scopeMeta = {
  GLOBAL: {
    label: "Global",
    description: "All citizens ranked by community points.",
    icon: <Trophy size={16} />,
  },
  LOCAL: {
    label: "Local",
    description: "Citizens from your municipal community only.",
    icon: <MapPinned size={16} />,
  },
};

const getRowTone = (index) => {
  if (index === 0) return "border-amber-400/20 bg-amber-400/10";
  if (index === 1) return "border-slate-200/10 bg-white/5";
  if (index === 2) return "border-orange-400/20 bg-orange-400/10";
  return "border-white/10 bg-white/3";
};

export default function Leaderboard() {
  const { user } = useAuth();

  const [type, setType] = useState("GLOBAL"); // GLOBAL | LOCAL
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadLeaderboard = useCallback(
    async (scope) => {
      setLoading(true);
      setError("");

      try {
        const data =
          scope === "LOCAL" ? await getLocalLeaderboard(user?.municipalId) : await getGlobalLeaderboard();

        setLeaders(Array.isArray(data) ? data : []);
        setLastUpdated(new Date());
      } catch (err) {
        setLeaders([]);
        setError(err?.response?.data?.message || "Unable to load leaderboard right now.");
      } finally {
        setLoading(false);
      }
    },
    [user?.municipalId]
  );

  const currentScope = scopeMeta[type];

  const myPlacement = useMemo(() => {
    const index = leaders.findIndex((leader) => leader?._id === user?._id);
    return index === -1 ? null : index + 1;
  }, [leaders, user?._id]);

  useEffect(() => {
    if (type === "LOCAL" && !user?.municipalId) {
      setLoading(false);
      setLeaders([]);
      setError("Local leaderboard is unavailable until your profile has a municipal community.");
      return;
    }

    loadLeaderboard(type);
  }, [type, user?.municipalId, loadLeaderboard]);

  const topThree = leaders.slice(0, 3);
  const topScore = leaders[0]?.communityPoints || 0;

  const isLocalDisabled = !user?.municipalId;

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Leaderboard"
        title="Community leaderboard"
        description="Compare civic contributions across the whole city or your local municipal area."
        action={
          <button
            type="button"
            onClick={() => loadLeaderboard(type)}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="overflow-hidden">
          <CardBody className="space-y-6 p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
                  {currentScope.icon}
                  {currentScope.label} scope
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-white">{currentScope.description}</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                    Rankings are refreshed from live community point totals. If the local view is unavailable, check that your profile has a municipal community assigned.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-right">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Top score</p>
                <p className="mt-2 text-3xl font-semibold text-white">{formatPoints(topScore)}</p>
                <p className="mt-1 text-xs text-slate-400">Points in the current list</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <button
                type="button"
                onClick={() => setType("GLOBAL")}
                className={`rounded-3xl border px-4 py-4 text-left transition ${
                  type === "GLOBAL"
                    ? "border-cyan-400/30 bg-cyan-400/10 text-white"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/7"
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
                  <Trophy size={14} /> Global
                </div>
                <p className="mt-2 text-lg font-semibold text-white">City-wide ranking</p>
                <p className="mt-1 text-sm text-slate-400">All citizen contributions combined.</p>
              </button>

              <button
                type="button"
                onClick={() => setType("LOCAL")}
                disabled={isLocalDisabled}
                className={`rounded-3xl border px-4 py-4 text-left transition ${
                  type === "LOCAL"
                    ? "border-cyan-400/30 bg-cyan-400/10 text-white"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/7"
                } ${isLocalDisabled ? "cursor-not-allowed opacity-50" : ""}`}
              >
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
                  <MapPinned size={14} /> Local
                </div>
                <p className="mt-2 text-lg font-semibold text-white">Your municipality</p>
                <p className="mt-1 text-sm text-slate-400">Community peers in your area.</p>
              </button>

              <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Entries</p>
                <p className="mt-2 text-2xl font-semibold text-white">{leaders.length}</p>
                <p className="mt-1 text-sm text-slate-400">Top citizens shown</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Your place</p>
                <p className="mt-2 text-2xl font-semibold text-white">{myPlacement ? `#${myPlacement}` : "—"}</p>
                <p className="mt-1 text-sm text-slate-400">Within the current list</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Sparkles size={16} className="text-cyan-300" />
              Live status
            </div>
            <p className="text-sm text-slate-400">
              {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : "Waiting for fresh data"}
            </p>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Scope</p>
              <p className="mt-2 text-lg font-semibold text-white">{currentScope.label}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Coverage</p>
              <p className="mt-2 text-lg font-semibold text-white">Top 50 citizens</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Rank icon</p>
              <p className="mt-2 text-lg font-semibold text-white">{getRankIcon(1)} medals for the podium</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {loading ? (
        <Card>
          <CardBody className="flex items-center gap-3 p-6 text-slate-300">
            <Loader2 className="animate-spin text-cyan-300" size={18} />
            Loading leaderboard...
          </CardBody>
        </Card>
      ) : error ? (
        <EmptyState
          icon={<AlertCircle size={24} />}
          title="Leaderboard unavailable"
          description={error}
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => loadLeaderboard(type)}
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                <RefreshCw size={16} />
                Try again
              </button>
              <Link
                to="/rewards"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <Medal size={16} />
                View rewards
              </Link>
            </div>
          }
        />
      ) : leaders.length === 0 ? (
        <EmptyState
          icon={<Users size={24} />}
          title="No leaderboard data available"
          description="There are no citizens with community points for this scope yet. Check back after more complaints are resolved or feedback is submitted."
          action={
            <Link
              to="/complaints/new"
              className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              <Trophy size={16} />
              Contribute points
            </Link>
          }
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Podium</h3>
                  <p className="text-sm text-slate-400">The top three citizens in this scope.</p>
                </div>
                <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300 sm:inline-flex">
                  <Crown size={14} className="text-amber-300" />
                  Elite
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid gap-4 lg:grid-cols-3">
                {topThree.map((leader, index) => (
                  <div
                    key={leader._id}
                    className={`rounded-3xl border p-5 ${index === 0 ? "border-amber-400/20 bg-amber-400/10" : "border-white/10 bg-white/5"}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200">
                        {getRankIcon(index + 1)} Rank {index + 1}
                      </div>
                      <div className="text-2xl">{index === 0 ? "👑" : index === 1 ? "⚡" : "🔥"}</div>
                    </div>
                    <p className="mt-4 text-xl font-semibold text-white">{leader.name}</p>
                    <p className="mt-1 text-sm text-slate-400">{leader.municipalId ? leader.municipalId : "No municipal community"}</p>
                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Points</p>
                        <p className="mt-1 text-3xl font-semibold text-white">{formatPoints(leader.communityPoints)}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-cyan-100">
                        Top {index + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Full ranking</h3>
                  <p className="text-sm text-slate-400">Sorted by community points from highest to lowest.</p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                  {leaders.length} entries
                </div>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-white/10 text-slate-300">
                    <tr>
                      <th className="px-5 py-4 text-left font-semibold">Rank</th>
                      <th className="px-5 py-4 text-left font-semibold">Citizen</th>
                      <th className="px-5 py-4 text-left font-semibold">Community</th>
                      <th className="px-5 py-4 text-right font-semibold">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaders.map((leader, index) => (
                      <tr
                        key={leader._id}
                        className={`border-b border-white/8 transition hover:bg-white/5 ${getRowTone(index)}`}
                      >
                        <td className="px-5 py-4 font-semibold text-white">{getRankIcon(index + 1)}</td>
                        <td className="px-5 py-4">
                          <div className="font-medium text-white">{leader.name}</div>
                          <div className="mt-1 text-xs text-slate-400">{leader._id === user?._id ? "You" : "Citizen"}</div>
                        </td>
                        <td className="px-5 py-4 text-slate-300">{leader.municipalId || "-"}</td>
                        <td className="px-5 py-4 text-right font-semibold text-emerald-300">{formatPoints(leader.communityPoints)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
