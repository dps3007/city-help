import { useEffect, useMemo, useState } from "react";
import { Award, CalendarDays, Coins, Gift, Loader2, ReceiptText, Sparkles } from "lucide-react";
import { getMyRewards } from "../../services/reward.service";
import SectionHeader from "../../components/ui/SectionHeader";
import Card, { CardBody, CardHeader } from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";

const ACTION_LABELS = {
  COMPLAINT_VERIFIED: "Complaint Verified",
  COMPLAINT_RESOLVED: "Complaint Resolved",
  FEEDBACK_GIVEN: "Feedback Given",
};

const PAGE_SIZE = 8;

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

export default function RewardHistory({
  history: historyProp,
  totalPoints: totalPointsProp,
  loading: loadingProp,
  title = "Reward history",
  description = "Track how your civic actions translated into community points.",
}) {
  const controlledHistory = historyProp !== undefined;
  const controlledLoading = loadingProp !== undefined;

  const [history, setHistory] = useState(historyProp ?? []);
  const [totalPoints, setTotalPoints] = useState(totalPointsProp ?? 0);
  const [loading, setLoading] = useState(controlledLoading ? loadingProp : !controlledHistory);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (controlledHistory) {
      setHistory(historyProp ?? []);
      if (totalPointsProp !== undefined) {
        setTotalPoints(totalPointsProp);
      }
      if (controlledLoading !== undefined) {
        setLoading(loadingProp);
      }
      return;
    }

    let active = true;

    const loadRewards = async () => {
      try {
        const res = await getMyRewards();
        if (!active) return;
        setHistory(res.rewards || []);
        setTotalPoints(res.totalPoints || 0);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadRewards();

    return () => {
      active = false;
    };
  }, [controlledHistory, controlledLoading, historyProp, loadingProp, totalPointsProp]);

  const totalPages = Math.ceil(history.length / PAGE_SIZE);
  const displayPoints = totalPoints || history.reduce((sum, item) => sum + (item.points || 0), 0);

  const paginatedHistory = useMemo(() => {
    return history.slice(
      (page - 1) * PAGE_SIZE,
      page * PAGE_SIZE
    );
  }, [history, page]);

  const summary = useMemo(() => {
    const totalEntries = history.length;
    const earnedPoints = history.reduce((sum, item) => sum + (item.points || 0), 0);
    const uniqueActions = new Set(history.map((item) => item.reason)).size;

    return [
      { label: "Entries", value: totalEntries, icon: <ReceiptText size={16} />, tone: "cyan" },
      { label: "Points earned", value: `+${totalPoints || earnedPoints}`, icon: <Coins size={16} />, tone: "emerald" },
      { label: "Action types", value: uniqueActions, icon: <Award size={16} />, tone: "amber" },
    ];
  }, [history, totalPoints]);

  if (loading) {
    return (
      <Card>
        <CardBody className="flex items-center gap-3 p-6 text-slate-300">
          <Loader2 className="animate-spin text-cyan-300" size={18} />
          Loading reward history...
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Rewards"
        title={title}
        description={description}
        action={
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Total points</p>
            <p className="mt-1 text-2xl font-semibold text-white">{displayPoints}</p>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        {summary.map((item) => (
          <Card key={item.label} interactive>
            <CardBody className="relative overflow-hidden p-5">
              <div className="absolute inset-0 bg-linear-to-br from-white/10 via-transparent to-transparent opacity-60" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{item.value}</p>
                </div>
                <div className={`rounded-2xl border border-white/10 bg-white/6 p-3 ${item.tone === "emerald" ? "text-emerald-200" : item.tone === "amber" ? "text-amber-200" : "text-cyan-200"}`}>
                  {item.icon}
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {history.length === 0 ? (
        <EmptyState
          icon={<Gift size={24} />}
          title="No rewards earned yet"
          description="Verified complaints, resolved issues, and feedback submissions will appear here once you start earning civic points."
        />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Activity timeline</h3>
                <p className="text-sm text-slate-400">Most recent reward actions are shown first.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                <Sparkles size={14} className="text-cyan-300" />
                {history.length} events
              </div>
            </div>
          </CardHeader>

          <CardBody className="space-y-4 p-5 sm:p-6">
            <div className="grid gap-4">
              {paginatedHistory.map((item) => (
                <div
                  key={item._id}
                  className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:border-white/20 hover:bg-white/7"
                >
                  <div className="absolute left-0 top-0 h-full w-1 bg-linear-to-b from-cyan-400 via-blue-500 to-indigo-500" />
                  <div className="ml-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
                          {ACTION_LABELS[item.reason] || item.reason}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                          {item.complaintId?.category || "General"}
                        </span>
                      </div>

                      <div>
                        <p className="text-lg font-semibold text-white">
                          {item.complaintId?.category ? `${item.complaintId.category} complaint` : "Reward activity"}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-300">
                          This reward was granted for {ACTION_LABELS[item.reason] || item.reason.toLowerCase()}.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                        <span className="inline-flex items-center gap-2">
                          <CalendarDays size={14} />
                          {formatDate(item.createdAt)}
                        </span>
                        <span>ID {item._id.slice(-6)}</span>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-4 text-right">
                      <p className="text-xs uppercase tracking-[0.24em] text-emerald-100/70">Points</p>
                      <p className="mt-2 text-3xl font-semibold text-white">+{item.points}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-400">
                  Page <span className="font-semibold text-white">{page}</span> of <span className="font-semibold text-white">{totalPages}</span>
                </p>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page === 1}
                    className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                      page === 1
                        ? "cursor-not-allowed border border-white/10 bg-white/5 text-slate-500"
                        : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    ← Prev
                  </button>

                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    disabled={page === totalPages}
                    className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                      page === totalPages
                        ? "cursor-not-allowed border border-white/10 bg-white/5 text-slate-500"
                        : "border border-cyan-400/20 bg-cyan-400/10 text-cyan-50 hover:bg-cyan-400/15"
                    }`}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
