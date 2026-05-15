import { useEffect, useState } from "react";
import { getAllComplaints } from "../../services/complaint.service";
import { useAuth } from "../../context/AuthContext";
import { getMyRewards } from "../../services/reward.service";
import Badge from "../../components/common/Badge";
import StatsCard from "../../components/common/StatsCard";
import Card from "../../components/common/Card";
import Skeleton from "../../components/common/Skeleton";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { FileText, AlertCircle, CheckCircle, Zap } from "lucide-react";

function CitizenDashboard() {
  const { user } = useAuth();
  const [rewardPoints, setRewardPoints] = useState(0);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;
    fetchComplaints();
  }, [user]);

  useEffect(() => {
    const loadRewards = async () => {
      try {
        const res = await getMyRewards();
        setRewardPoints(res.totalPoints);
      } catch (e) {
        console.error(e);
      }
    };
    loadRewards();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = await getAllComplaints();
      setComplaints(data || []);
    } catch (error) {
      console.error("Failed to fetch complaints", error);
    } finally {
      setLoading(false);
    }
  };

  const total = complaints.length;
  const active = complaints.filter((c) => !["RESOLVED", "CLOSED"].includes(c.status)).length;
  const resolved = complaints.filter((c) => ["RESOLVED", "CLOSED"].includes(c.status)).length;
  const verified = complaints.filter((c) => c.status === "VERIFIED").length;

  // Generate chart data
  const statusData = [
    { name: "Active", value: active, fill: "#f97316" },
    { name: "Resolved", value: resolved, fill: "#22c55e" },
    { name: "Verified", value: verified, fill: "#3b82f6" },
  ].filter(d => d.value > 0);

  const categoryData = complaints.reduce((acc, c) => {
    const existing = acc.find(item => item.name === c.category);
    if (existing) existing.count++;
    else acc.push({ name: c.category, count: 1 });
    return acc;
  }, []).slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton count={4} className="h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Track and manage your complaints</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatsCard
          title="Total Complaints"
          value={total}
          icon={FileText}
          variant="primary"
        />
        <StatsCard
          title="Active"
          value={active}
          icon={AlertCircle}
          variant="warning"
        />
        <StatsCard
          title="Resolved"
          value={resolved}
          icon={CheckCircle}
          variant="success"
        />
        <StatsCard
          title="Reward Points"
          value={rewardPoints}
          icon={Zap}
          variant="accent"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Status Distribution</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </Card>

        {/* Top Categories */}
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Complaints by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }} />
                <Bar dataKey="count" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </Card>
      </div>

      {/* Recent Complaints Table */}
      <Card className="overflow-hidden">
        <div className="border-b border-border px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-bold text-foreground">Recent Complaints</h3>
          <p className="text-sm text-muted-foreground">Last 5 complaints</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-foreground">ID</th>
                <th className="px-6 py-3 text-left font-semibold text-foreground">Category</th>
                <th className="px-6 py-3 text-left font-semibold text-foreground">Status</th>
                <th className="px-6 py-3 text-left font-semibold text-foreground">Upvotes</th>
                <th className="px-6 py-3 text-left font-semibold text-foreground">Date</th>
              </tr>
            </thead>

            <tbody>
              {complaints.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">
                    <p className="font-medium">No complaints filed yet</p>
                    <p className="text-xs mt-1">Start by filing your first complaint</p>
                  </td>
                </tr>
              )}

              {complaints.slice(0, 5).map((c) => (
                <tr key={c._id} className="border-t border-border hover:bg-muted transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">#{c._id.slice(-6).toUpperCase()}</td>
                  <td className="px-6 py-4 text-foreground font-medium">{c.category}</td>
                  <td className="px-6 py-4">
                    <Badge status={c.status} />
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent-100 text-accent-700 text-xs font-medium">
                      👍 {c.upvotes?.length || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">
                    {new Date(c.createdAt).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default CitizenDashboard;
