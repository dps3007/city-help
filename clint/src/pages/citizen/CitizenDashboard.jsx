import { useEffect, useState } from "react";
import { getAllComplaints } from "../../services/complaint.service";
import { useAuth } from "../../context/AuthContext";
import { getMyRewards } from "../../services/reward.service";



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

  const active = complaints.filter(
    (c) => !["RESOLVED", "CLOSED"].includes(c.status)
  ).length;

  const resolved = complaints.filter(
    (c) => ["RESOLVED", "CLOSED"].includes(c.status)
  ).length;

  if (loading) {
    return <p className="text-gray-600">Loading dashboard...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard title="Total Complaints" value={total} />
        <StatCard title="Active Complaints" value={active} />
        <StatCard title="Resolved Complaints" value={resolved} />
        <StatCard title="Reward Points" value={rewardPoints} />
      </div>

      {/* Recent Complaints */}
      <div className="bg-white rounded shadow-sm">
        <div className="border-b px-6 py-4">
          <h3 className="font-semibold text-gray-800">
            Recent Complaints
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-6 py-3 text-left">ID</th>
                <th className="px-6 py-3 text-left">Category</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Upvotes</th>
                <th className="px-6 py-3 text-left">Created</th>
              </tr>
            </thead>

            <tbody>
              {complaints.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-6 text-center text-gray-500"
                  >
                    No complaints filed yet
                  </td>
                </tr>
              )}

              {complaints.slice(0, 5).map((c) => (
                <tr
                  key={c._id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="px-6 py-3">
                    {c._id.slice(-6)}
                  </td>
                  <td className="px-6 py-3">{c.category}</td>
                  <td className="px-6 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-6 py-3">
                    {c.upvotes?.length || 0}
                  </td>
                  <td className="px-6 py-3">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------- Helpers ---------- */

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded shadow-sm p-4">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    SUBMITTED: "bg-gray-200 text-gray-700",
    VERIFIED: "bg-blue-100 text-blue-700",
    ASSIGNED: "bg-yellow-100 text-yellow-700",
    IN_PROGRESS: "bg-orange-100 text-orange-700",
    RESOLVED: "bg-green-100 text-green-700",
    CLOSED: "bg-green-200 text-green-800",
  };

  return (
    <span
      className={`rounded px-2 py-1 text-xs font-medium ${
        colors[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

export default CitizenDashboard;
