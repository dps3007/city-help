import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { BarChart3, BellRing, ClipboardList, Gauge, Star, TrendingUp } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";

import { getAllComplaints } from "../../services/complaint.service";
import { useAuth } from "../../context/useAuth";
import { getMyRewards } from "../../services/reward.service";
import StatCard from "../../components/ui/StatCard";
import Card, { CardBody, CardHeader } from "../../components/ui/Card";
import SectionHeader from "../../components/ui/SectionHeader";
import Badge from "../../components/common/Badge";
import { TableSkeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";

function CitizenDashboard() {
  const { user } = useAuth();
  const [rewardPoints, setRewardPoints] = useState(0);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user?._id) return;

      try {
        setLoading(true);
        const [complaintsData, rewardsData] = await Promise.all([getAllComplaints(), getMyRewards()]);
        setComplaints(complaintsData || []);
        setRewardPoints(rewardsData?.totalPoints || 0);
      } catch (error) {
        console.error("Failed to load dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user]);

  const stats = useMemo(() => {
    const total = complaints.length;
    const active = complaints.filter((c) => !["RESOLVED", "CLOSED"].includes(c.status)).length;
    const resolved = complaints.filter((c) => ["RESOLVED", "CLOSED"].includes(c.status)).length;
    const pending = complaints.filter((c) => ["SUBMITTED", "VERIFIED", "ASSIGNED"].includes(c.status)).length;

    return { total, active, resolved, pending };
  }, [complaints]);

  const statusChart = useMemo(() => {
    const counts = complaints.reduce((acc, complaint) => {
      acc[complaint.status] = (acc[complaint.status] || 0) + 1;
      return acc;
    }, {});

    return [
      { name: "Submitted", value: counts.SUBMITTED || 0 },
      { name: "Verified", value: counts.VERIFIED || 0 },
      { name: "Assigned", value: counts.ASSIGNED || 0 },
      { name: "In Progress", value: counts.IN_PROGRESS || 0 },
      { name: "Resolved", value: counts.RESOLVED || 0 },
    ];
  }, [complaints]);

  const monthlyTrend = useMemo(() => {
    const months = Array.from({ length: 6 }).map((_, index) => {
      const month = dayjs().subtract(5 - index, "month");
      return { label: month.format("MMM"), value: 0 };
    });

    complaints.forEach((complaint) => {
      const label = dayjs(complaint.createdAt).format("MMM");
      const bucket = months.find((item) => item.label === label);
      if (bucket) bucket.value += 1;
    });

    return months;
  }, [complaints]);

  if (loading) {
    return <TableSkeleton rows={5} />;
  }

  const recentComplaints = [...complaints]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Citizen dashboard"
        title={`Welcome back, ${user?.name || "citizen"}`}
        description="Monitor active complaints, reward points, and recent platform activity from a clean command center."
        action={
          <Link to="/complaints/new" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:translate-y-[-1px]">
            <ClipboardList size={16} /> File complaint
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total complaints" value={stats.total} delta="All complaints submitted by you" icon={<ClipboardList size={18} />} tone="blue" />
        <StatCard title="Active cases" value={stats.active} delta="Open or in progress" icon={<Gauge size={18} />} tone="amber" />
        <StatCard title="Resolved cases" value={stats.resolved} delta="Closed or completed" icon={<TrendingUp size={18} />} tone="emerald" />
        <StatCard title="Reward points" value={rewardPoints} delta="Community participation score" icon={<Star size={18} />} tone="cyan" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Complaint trend</h3>
                <p className="text-sm text-slate-400">Submission volume across the last six months</p>
              </div>
              <BarChart3 className="text-cyan-300" size={18} />
            </div>
          </CardHeader>
          <CardBody className="h-72 px-3 sm:px-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }} />
                <Line type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Status breakdown</h3>
                <p className="text-sm text-slate-400">Distribution of your current complaint states</p>
              </div>
              <BellRing className="text-cyan-300" size={18} />
            </div>
          </CardHeader>
          <CardBody className="h-72 px-3 sm:px-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} interval={0} angle={-18} textAnchor="end" height={48} />
                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }} />
                <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="#38bdf8" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Recent complaints</h3>
                <p className="text-sm text-slate-400">Latest issue updates from your account</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {recentComplaints.length === 0 ? (
              <EmptyState
                title="No complaints yet"
                description="Start by filing your first complaint. The dashboard will populate once your cases are live."
                action={<Link to="/complaints/new" className="inline-flex items-center rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white">File your first complaint</Link>}
              />
            ) : (
              <div className="divide-y divide-white/10">
                {recentComplaints.map((complaint) => (
                  <Link key={complaint._id} to={`/complaints/${complaint._id}`} className="flex items-center gap-4 px-6 py-4 transition hover:bg-white/5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-sm font-semibold text-cyan-200">
                      #{complaint._id.slice(-4)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-white">{complaint.category}</p>
                        <Badge status={complaint.status} />
                      </div>
                      <p className="mt-1 truncate text-sm text-slate-400">{complaint.description}</p>
                    </div>
                    <div className="text-right text-xs text-slate-400">
                      <p>{dayjs(complaint.createdAt).format("DD MMM")}</p>
                      <p>{complaint.upvoteCount || complaint.upvotes?.length || 0} upvotes</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Activity feed</h3>
                <p className="text-sm text-slate-400">A quick summary of your civic engagement</p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {[
                ["Reward balance", `${rewardPoints} points earned`, "emerald"],
                ["Open action items", `${stats.pending} items waiting on departments`, "amber"],
                ["Resolved cases", `${stats.resolved} cases successfully closed`, "cyan"],
              ].map(([label, value, tone]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">{label}</p>
                  <p className="mt-2 text-sm text-white">{value}</p>
                  <div className={`mt-3 h-1.5 rounded-full ${tone === "emerald" ? "bg-emerald-400/20" : tone === "amber" ? "bg-amber-400/20" : "bg-cyan-400/20"}`}>
                    <div className={`h-full rounded-full ${tone === "emerald" ? "bg-emerald-400" : tone === "amber" ? "bg-amber-400" : "bg-cyan-400"}`} style={{ width: tone === "emerald" ? "82%" : tone === "amber" ? "58%" : "90%" }} />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default CitizenDashboard;
