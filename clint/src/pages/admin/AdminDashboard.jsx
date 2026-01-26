import { useEffect, useState } from "react";
import {
  getDashboardStats,
  getAdminComplaints,
} from "../../services/admin.service";
import { useRole } from "../../hooks/useRole";

function AdminDashboard() {
  const { role } = useRole();

  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsData, complaintsData] = await Promise.all([
          getDashboardStats(),      // 🔐 role-aware backend
          getAdminComplaints(),     // 🔐 role-aware backend
        ]);

        setStats(statsData);
        setComplaints(complaintsData || []);
      } catch (err) {
        console.error("Failed to load admin dashboard", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <p className="text-gray-600">Loading admin dashboard...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          Admin Dashboard
        </h2>
        <p className="text-sm text-gray-500">
          Role: <span className="font-medium">{role}</span>
        </p>
      </div>

      {/* Metrics (FROM BACKEND) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Metric title="Total Complaints" value={stats.totalComplaints} />
        <Metric title="Pending" value={stats.pendingComplaints} />
        <Metric title="Resolved" value={stats.resolvedComplaints} />
        <Metric title="Closed" value={stats.closedComplaints} />
      </div>

      {/* Recent Complaints */}
      <div className="bg-white rounded shadow-sm overflow-x-auto">
        <div className="border-b px-6 py-4">
          <h3 className="font-semibold text-gray-800">
            Recent Complaints
          </h3>
        </div>

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
                  No complaints found
                </td>
              </tr>
            )}

            {complaints.slice(0, 8).map((c) => (
              <tr key={c._id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-3">{c._id.slice(-6)}</td>
                <td className="px-6 py-3">{c.category}</td>
                <td className="px-6 py-3">
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-6 py-3">{c.upvotes || 0}</td>
                <td className="px-6 py-3">
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function Metric({ title, value }) {
  return (
    <div className="bg-white rounded shadow-sm p-4">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
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

export default AdminDashboard;
