import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { BarChart3, Building2, Layers3, ShieldCheck, TrendingUp, Flame, ArrowUp } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";

import { getDashboardStats } from "../../services/admin.service";
import { getAllAdminComplaints } from "../../services/complaint.service";
import { useRole } from "../../hooks/useRole";
import { useAuth } from "../../context/useAuth";
import DepartmentComplaintsDrawer from "./DepartmentComplaintsDrawer";
import SectionHeader from "../../components/ui/SectionHeader";
import StatCard from "../../components/ui/StatCard";
import Card, { CardBody, CardHeader } from "../../components/ui/Card";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { TableSkeleton } from "../../components/ui/Skeleton";

const normalize = (value) => (typeof value === "string" && value.trim() ? value.trim().toLowerCase() : "unknown");
const formatLabel = (value) => (value === "unknown" ? "Unknown" : value.replace(/\b\w/g, (char) => char.toUpperCase()));
const COLORS = ["#22d3ee", "#3b82f6", "#14b8a6", "#f59e0b", "#8b5cf6", "#ec4899"];

function AdminDashboard() {
  const { role } = useRole();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openGroup, setOpenGroup] = useState(null);
  const [groupTitle, setGroupTitle] = useState("");
  const [groupedComplaints, setGroupedComplaints] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [statsData, complaintsData] = await Promise.all([getDashboardStats(), getAllAdminComplaints()]);
        setStats(statsData || null);
        setComplaints(complaintsData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [role, user?.location?.state, user?.location?.district, user?.department]);

  const visibleComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const complaintState = normalize(complaint.location?.state);
      const complaintDistrict = normalize(complaint.location?.district);
      const complaintCategory = normalize(complaint.category);
      const userState = normalize(user?.location?.state);
      const userDistrict = normalize(user?.location?.district);
      const userDepartment = normalize(user?.department);

      if (["SUPER_ADMIN", "CENTRAL_ADMIN"].includes(role)) return true;
      if (role === "STATE_ADMIN") return complaintState === userState;
      if (role === "DISTRICT_ADMIN") return complaintState === userState && complaintDistrict === userDistrict;
      if (role === "DEPT_HEAD") return complaintDistrict === userDistrict && complaintCategory === userDepartment;
      if (role === "OFFICER") {
        return complaintCategory === userDepartment && (complaint.assignedTo === user._id || complaint.assignedTo?._id === user._id);
      }

      return false;
    });
  }, [complaints, role, user]);

  const groupedData = useMemo(() => {
    const groupBy = (list, key) => list.reduce((acc, item) => {
      const value = key === "category" ? normalize(item.category) : normalize(item.location?.[key]);
      if (!acc[value]) acc[value] = [];
      acc[value].push(item);
      return acc;
    }, {});

    return {
      department: groupBy(visibleComplaints, "category"),
      state: groupBy(visibleComplaints, "state"),
      district: groupBy(visibleComplaints, "district"),
      city: groupBy(visibleComplaints, "city"),
    };
  }, [visibleComplaints]);

  const chartData = useMemo(() => {
    const statusCounts = visibleComplaints.reduce((acc, complaint) => {
      acc[complaint.status] = (acc[complaint.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([name, value]) => ({ name: name.replace(/_/g, " "), value }));
  }, [visibleComplaints]);

  const monthlyTrend = useMemo(() => {
    const months = Array.from({ length: 6 }).map((_, index) => ({ label: dayjs().subtract(5 - index, "month").format("MMM"), value: 0 }));
    visibleComplaints.forEach((complaint) => {
      const bucket = months.find((item) => item.label === dayjs(complaint.createdAt).format("MMM"));
      if (bucket) bucket.value += 1;
    });
    return months;
  }, [visibleComplaints]);

  const locationChart = useMemo(() => {
    const values = Object.entries(groupedData.city).map(([name, list]) => ({ name: formatLabel(name), value: list.length }));
    return values.slice(0, 6);
  }, [groupedData.city]);

  // Trending complaints: Active (not resolved/closed) sorted by upvotes
  const trendingComplaints = useMemo(() => {
    return [...visibleComplaints]
      .filter((complaint) => !["RESOLVED", "CLOSED"].includes(complaint.status))
      .sort((a, b) => (b.upvoteCount || 0) - (a.upvoteCount || 0))
      .slice(0, 8);
  }, [visibleComplaints]);

  if (loading) return <TableSkeleton rows={4} />;

  const recentOfficerComplaints = role === "OFFICER"
    ? [...visibleComplaints].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)).slice(0, 5)
    : [];

  const hasGroups = (groups) => Object.keys(groups).length > 0;
  const hasVisibleComplaints = visibleComplaints.length > 0;

  const GroupSection = ({ title, groups }) => (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-300/80">{title}</h3>
      </CardHeader>
      <CardBody>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(groups).map(([key, list]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setOpenGroup(key);
                setGroupTitle(`${title}: ${formatLabel(key)}`);
                setGroupedComplaints(list);
              }}
              className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-left transition hover:-translate-y-0.5 hover:bg-white/8"
            >
              <div>
                <p className="font-semibold text-white">{formatLabel(key)}</p>
                <p className="mt-1 text-xs text-slate-400">Open this group for a filtered complaint drawer</p>
              </div>
              <span className="rounded-2xl bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-200">{list.length}</span>
            </button>
          ))}
        </div>
      </CardBody>
    </Card>
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Admin analytics"
        title="Admin dashboard"
        description={`Role: ${role}${user?.department ? ` • Department: ${user.department}` : ""}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total complaints" value={stats?.totalComplaints || visibleComplaints.length} delta="All tracked complaints" icon={<ShieldCheck size={18} />} tone="blue" />
        <StatCard title="Pending" value={stats?.pendingComplaints || 0} delta="Awaiting action" icon={<Layers3 size={18} />} tone="amber" />
        <StatCard title="Resolved" value={stats?.resolvedComplaints || 0} delta="Completed with closure" icon={<TrendingUp size={18} />} tone="emerald" />
        <StatCard title="Closed" value={stats?.closedComplaints || 0} delta="Finalized in the system" icon={<Building2 size={18} />} tone="cyan" />
      </div>

      {hasVisibleComplaints ? (
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">Status distribution</h3>
                  <p className="text-sm text-slate-400">Current workload by complaint state</p>
                </div>
                <BarChart3 className="text-cyan-300" size={18} />
              </div>
            </CardHeader>
            <CardBody className="h-72 min-w-0">
              <div className="flex h-full min-w-0 flex-col gap-4 md:flex-row md:items-center">
                <div className="h-44 min-w-0 flex-1 md:h-full">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <PieChart>
                      <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={96} paddingAngle={4}>
                        {chartData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-2 md:w-52 md:grid-cols-1">
                  {chartData.map((item, index) => {
                    const total = chartData.reduce((sum, entry) => sum + entry.value, 0);
                    const percentage = total ? Math.round((item.value / total) * 100) : 0;

                    return (
                      <div key={`legend-${item.name}`} className="flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-xs font-medium text-slate-200">{item.name}</span>
                        </div>
                        <span className="text-xs text-slate-400">{percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white">Monthly complaint intake</h3>
            </CardHeader>
            <CardBody className="h-72 min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }} />
                  <Line type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>
      ) : (
        <EmptyState
          title="No analytics yet"
          description="This role currently has no visible complaints, so the operational charts will appear here once new cases are available."
          icon={<BarChart3 size={18} />}
        />
      )}

      {hasVisibleComplaints ? (
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white">Top city load</h3>
            </CardHeader>
            <CardBody className="h-72 min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={locationChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} interval={0} angle={-16} textAnchor="end" height={48} />
                  <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }} />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {role === "OFFICER" && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-white">My recent complaints</h3>
              </CardHeader>
              <CardBody className="space-y-3">
                {recentOfficerComplaints.length === 0 ? (
                  <p className="text-sm text-slate-400">No complaints assigned to you yet.</p>
                ) : (
                  recentOfficerComplaints.map((complaint) => (
                    <Link key={complaint._id} to={`/complaints/${complaint._id}`} className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-4 py-4 transition hover:bg-white/8">
                      <div>
                        <p className="font-semibold text-white">#{complaint._id.slice(-6)} · {complaint.category}</p>
                        <p className="mt-1 text-xs text-slate-400">{dayjs(complaint.updatedAt || complaint.createdAt).format("DD MMM YYYY")}</p>
                      </div>
                      <Badge status={complaint.status} />
                    </Link>
                  ))
                )}
              </CardBody>
            </Card>
          )}
        </div>
      ) : null}
      {(["SUPER_ADMIN", "CENTRAL_ADMIN"].includes(role)) && hasGroups(groupedData.state) && <GroupSection title="Complaints by state" groups={groupedData.state} />}
      {(["SUPER_ADMIN", "CENTRAL_ADMIN", "STATE_ADMIN"].includes(role)) && hasGroups(groupedData.district) && <GroupSection title="Complaints by district" groups={groupedData.district} />}
      {(["SUPER_ADMIN", "CENTRAL_ADMIN", "STATE_ADMIN", "DISTRICT_ADMIN"].includes(role)) && hasGroups(groupedData.city) && <GroupSection title="Complaints by city" groups={groupedData.city} />}

      {/* TRENDING COMPLAINTS - SUPER ADMIN ONLY */}
      {(["SUPER_ADMIN", "CENTRAL_ADMIN"].includes(role)) && trendingComplaints.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Flame className="text-orange-400" size={20} />
              <div>
                <h3 className="text-lg font-semibold text-white">Trending complaints</h3>
                <p className="text-sm text-slate-400">Most upvoted active issues requiring attention</p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {trendingComplaints.map((complaint) => (
                <Link
                  key={complaint._id}
                  to={`/complaints/${complaint._id}`}
                  className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden transition hover:bg-white/8 hover:border-orange-400/30"
                >
                  {/* Image */}
                  {complaint.attachments?.[0] && (
                    <img
                      src={complaint.attachments[0].url}
                      alt={complaint.category}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  
                  {/* Content */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium px-2 py-1 rounded bg-orange-500/20 text-orange-300">{complaint.category}</span>
                      <Badge status={complaint.status} />
                    </div>
                    <p className="text-sm font-semibold text-white line-clamp-2">{complaint.description.slice(0, 80)}...</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">#{complaint._id.slice(-6)}</span>
                      <div className="flex items-center gap-1">
                        <Flame size={14} className="text-orange-400" />
                        <span className="font-semibold text-orange-300">{complaint.upvoteCount || 0}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {openGroup && <DepartmentComplaintsDrawer department={groupTitle} complaints={groupedComplaints} onClose={() => setOpenGroup(null)} />}
    </div>
  );
}

export default AdminDashboard;
