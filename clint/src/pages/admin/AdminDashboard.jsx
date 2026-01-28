import { useEffect, useState } from "react";
import {
  getDashboardStats,
  getAdminComplaints,
} from "../../services/admin.service";
import { useRole } from "../../hooks/useRole";
import { useNavigate } from "react-router-dom";
import DepartmentComplaintsDrawer from "./DepartmentComplaintsDrawer";


/* ---------------- constants ---------------- */

const DEPARTMENTS = [
  "GARBAGE",
  "ROADS",
  "WATER",
  "STREETLIGHT",
  "ELECTRICITY",
  "OTHER",
];

const PENDING_STATUSES = [
  "SUBMITTED",
  "VERIFIED",
  "ASSIGNED",
  "IN_PROGRESS",
];

/* ---------------- component ---------------- */

function AdminDashboard() {
  const { role } = useRole();
  const navigate = useNavigate();

  const [openDept, setOpenDept] = useState(null); 
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsData, complaintsData] = await Promise.all([
          getDashboardStats(),      // backend aggregated stats
          getAdminComplaints(),     // all admin complaints
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

  /* ---------------- helpers ---------------- */

  const getDepartmentComplaints = (dept) =>
    complaints.filter((c) => c.category === dept);

  const getStatusCount = (status) =>
    complaints.filter((c) => c.status === status).length;

  const getPendingCount = (list) =>
    list.filter((c) => PENDING_STATUSES.includes(c.status)).length;

  if (loading) {
    return <p className="text-gray-600">Loading admin dashboard...</p>;
  }

  return (
    <div className="space-y-8">
      {/* ---------------- Header ---------------- */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          Admin Dashboard
        </h2>
        <p className="text-sm text-gray-500">
          Role: <span className="font-medium">{role}</span>
        </p>
      </div>

      {/* ---------------- Overall Metrics ---------------- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Metric title="Total Complaints" value={stats.totalComplaints} />
        <Metric title="Pending" value={stats.pendingComplaints} />
        <Metric title="Resolved" value={stats.resolvedComplaints} />
        <Metric title="Closed" value={stats.closedComplaints} />
      </div>

      {/* ---------------- Department Summary ---------------- */}
      <div className="bg-white rounded shadow-sm p-4">
        <h3 className="font-semibold text-gray-800 mb-4">
          Department-wise Complaints
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {DEPARTMENTS.map((dept) => (
            <div
              key={dept}
              onClick={() =>
                 setOpenDept(dept)
              }
              className="cursor-pointer rounded border p-3 hover:bg-blue-50 flex justify-between"
            >
              <span className="font-medium">{dept}</span>
              <span className="font-semibold">
                {getDepartmentComplaints(dept).length}
              </span>
            </div>
          ))}
        </div>
      </div>

      

      {/* ---------------- Department-wise Report Table ---------------- */}
      <div className="bg-white rounded shadow-sm overflow-x-auto">
        <div className="border-b px-6 py-4">
          <h3 className="font-semibold text-gray-800">
            Department-wise Report
          </h3>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-6 py-3 text-left">Department</th>
              <th className="px-6 py-3 text-left">Total</th>
              <th className="px-6 py-3 text-left">Resolved</th>
              <th className="px-6 py-3 text-left">Pending</th>
              <th className="px-6 py-3 text-left">Closed</th>
            </tr>
          </thead>

          <tbody>
            {DEPARTMENTS.map((dept) => {
              const deptComplaints = getDepartmentComplaints(dept);

              return (
                <tr key={dept} className="border-t">
                  <td className="px-6 py-3">{dept}</td>
                  <td className="px-6 py-3">{deptComplaints.length}</td>
                  <td className="px-6 py-3">
                    {deptComplaints.filter(
                      (c) => c.status === "RESOLVED"
                    ).length}
                  </td>
                  <td className="px-6 py-3">
                    {getPendingCount(deptComplaints)}
                  </td>
                  <td className="px-6 py-3">
                    {deptComplaints.filter(
                      (c) => c.status === "CLOSED"
                    ).length}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ---------------- Recent Complaints ---------------- */}
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
            {complaints.slice(0, 8).map((c) => (
              <tr key={c._id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-3">{c._id.slice(-6)}</td>
                <td className="px-6 py-3">{c.category}</td>
                <td className="px-6 py-3">
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-6 py-3">{c.upvoteCount}</td>
                <td className="px-6 py-3">
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/*--Department Complaints Drawer*/}
      <DepartmentComplaintsDrawer
        department={openDept}
        complaints={
          openDept
            ? complaints.filter(
                (c) => c.category === openDept
              )
            : []
        }
        onClose={() => setOpenDept(null)}
      />
    </div>
  );
}

/* ---------------- helpers ---------------- */

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
