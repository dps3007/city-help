import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardStats } from "../../services/admin.service";
import { getAllAdminComplaints } from "../../services/complaint.service";
import { useRole } from "../../hooks/useRole";
import { useAuth } from "../../context/AuthContext";
import DepartmentComplaintsDrawer from "./DepartmentComplaintsDrawer";

/* ---------------- helpers ---------------- */

const normalize = (v) =>
  typeof v === "string" && v.trim()
    ? v.trim().toLowerCase()
    : "unknown";

const formatLabel = (v) =>
  v === "unknown"
    ? "Unknown"
    : v.replace(/\b\w/g, (c) => c.toUpperCase());

const STATUS_STYLES = {
  SUBMITTED: "bg-gray-100 text-gray-700",
  VERIFIED: "bg-blue-100 text-blue-700",
  ASSIGNED: "bg-yellow-100 text-yellow-700",
  IN_PROGRESS: "bg-orange-100 text-orange-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-purple-100 text-purple-700",
};

/* ---------------- component ---------------- */

function AdminDashboard() {
  const { role } = useRole();
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openGroup, setOpenGroup] = useState(null);
  const [groupTitle, setGroupTitle] = useState("");
  const [groupedComplaints, setGroupedComplaints] = useState([]);

  /* ---------------- FETCH ---------------- */

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [statsData, complaintsData] = await Promise.all([
          getDashboardStats(),
          getAllAdminComplaints(),
        ]);
        setStats(statsData || null);
        setComplaints(complaintsData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [
    role,
    user?.location?.state,
    user?.location?.district,
    user?.department,
  ]);

  if (loading) {
    return <p className="text-gray-600">Loading admin dashboard...</p>;
  }

  /* ---------------- ROLE FILTER ---------------- */

  const visibleComplaints = complaints.filter((c) => {
    const cState = normalize(c.location?.state);
    const cDistrict = normalize(c.location?.district);
    const cCategory = normalize(c.category);

    const uState = normalize(user?.location?.state);
    const uDistrict = normalize(user?.location?.district);
    const uDepartment = normalize(user?.department);

    if (["SUPER_ADMIN", "CENTRAL_ADMIN"].includes(role)) return true;
    if (role === "STATE_ADMIN") return cState === uState;
    if (role === "DISTRICT_ADMIN")
      return cState === uState && cDistrict === uDistrict;
    if (role === "DEPT_HEAD")
      return cDistrict === uDistrict && cCategory === uDepartment;
    if (role === "OFFICER")
      return (
        cCategory === uDepartment &&
        (c.assignedTo === user._id ||
          c.assignedTo?._id === user._id)
      );

    return false;
  });

  /* ---------------- RECENT OFFICER ---------------- */

  const recentOfficerComplaints =
    role === "OFFICER"
      ? [...visibleComplaints]
          .sort(
            (a, b) =>
              new Date(b.updatedAt || b.createdAt) -
              new Date(a.updatedAt || a.createdAt)
          )
          .slice(0, 5)
      : [];

  /* ---------------- GROUPING ---------------- */

  const groupBy = (list, key) =>
    list.reduce((acc, item) => {
      const value =
        key === "category"
          ? normalize(item.category)
          : normalize(item.location?.[key]);
      if (!acc[value]) acc[value] = [];
      acc[value].push(item);
      return acc;
    }, {});

  const departmentGroups = groupBy(visibleComplaints, "category");
  const stateGroups = groupBy(visibleComplaints, "state");
  const districtGroups = groupBy(visibleComplaints, "district");
  const cityGroups = groupBy(visibleComplaints, "city");

  const hasGroups = (obj) => Object.keys(obj).length > 0;

  const GroupSection = ({ title, groups }) => (
    <div className="bg-white/90 backdrop-blur rounded-xl shadow-md p-5">
      <h3 className="text-sm font-bold uppercase tracking-wide
                     text-transparent bg-clip-text
                     bg-gradient-to-r from-blue-600 to-purple-600">
        {title}
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {Object.entries(groups).map(([key, list]) => (
          <div
            key={key}
            onClick={() => {
              setOpenGroup(key);
              setGroupTitle(`${title}: ${formatLabel(key)}`);
              setGroupedComplaints(list);
            }}
            className="cursor-pointer rounded-xl p-3 flex justify-between
                       bg-gradient-to-r from-blue-50 to-purple-50
                       hover:shadow-md hover:-translate-y-0.5 transition"
          >
            <span>{formatLabel(key)}</span>
            <span className="font-bold">{list.length}</span>
          </div>
        ))}
      </div>
    </div>
  );

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 rounded-lg">

      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          Admin Dashboard
        </h2>
        <p className="text-sm text-gray-500">
          Role: <b>{role}</b>
          {user?.department && (
            <span className="ml-2">
              | Department: <b>{user.department}</b>
            </span>
          )}
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Metric title="Total Complaints" value={stats?.totalComplaints || 0} />
        <Metric title="Pending" value={stats?.pendingComplaints || 0} />
        <Metric title="Resolved" value={stats?.resolvedComplaints || 0} />
        <Metric title="Closed" value={stats?.closedComplaints || 0} />
      </div>

      {/* Officer Recent */}
      {role === "OFFICER" && (
        <div className="bg-white/90 backdrop-blur rounded-xl shadow-md p-5">
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700">
            My Recent Complaints
          </h3>

          {recentOfficerComplaints.length === 0 ? (
            <p className="text-sm text-gray-500 mt-3">
              No complaints assigned to you yet.
            </p>
          ) : (
            <div className="space-y-3 mt-4">
              {recentOfficerComplaints.map((c) => (
                <div
                  key={c._id}
                  className={`flex justify-between items-center rounded-xl px-4 py-3 text-sm
                    transition hover:scale-[1.01]
                    ${c.status === "RESOLVED" && "bg-green-50 border-l-4 border-green-500"}
                    ${c.status === "CLOSED" && "bg-purple-50 border-l-4 border-purple-500"}
                    ${c.status === "ASSIGNED" && "bg-yellow-50 border-l-4 border-yellow-500"}
                    ${c.status === "IN_PROGRESS" && "bg-orange-50 border-l-4 border-orange-500"}
                    ${c.status === "SUBMITTED" && "bg-gray-50 border-l-4 border-gray-400"}
                  `}
                >
                  <div>
                    <p className="font-medium">
                      #{c._id.slice(-6)} · {c.category}
                    </p>
                    <span
                      className={`inline-block mt-2 px-3 py-0.5 text-xs font-semibold rounded-full
                        ${STATUS_STYLES[c.status]}`}
                    >
                      {c.status.replace("_", " ")}
                    </span>
                  </div>

                  <Link
                    to={`/complaints/${c._id}`}
                    className="text-blue-600 font-medium hover:underline"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Groups */}
      {hasGroups(departmentGroups) && (
        <GroupSection title="Complaints by Department" groups={departmentGroups} />
      )}

      {["SUPER_ADMIN", "CENTRAL_ADMIN"].includes(role) &&
        hasGroups(stateGroups) && (
          <GroupSection title="Complaints by State" groups={stateGroups} />
      )}

      {["SUPER_ADMIN", "CENTRAL_ADMIN", "STATE_ADMIN"].includes(role) &&
        hasGroups(districtGroups) && (
          <GroupSection title="Complaints by District" groups={districtGroups} />
      )}

      {["SUPER_ADMIN", "CENTRAL_ADMIN", "STATE_ADMIN", "DISTRICT_ADMIN"].includes(role) &&
        hasGroups(cityGroups) && (
          <GroupSection title="Complaints by City" groups={cityGroups} />
      )}

      {openGroup && (
        <DepartmentComplaintsDrawer
          department={groupTitle}
          complaints={groupedComplaints}
          onClose={() => setOpenGroup(null)}
        />
      )}
    </div>
  );
}

/* ---------------- metric ---------------- */

function Metric({ title, value }) {
  return (
    <div className="rounded-xl p-4 shadow-md
      bg-gradient-to-r from-indigo-500 to-blue-500 text-white">
      <p className="text-xs uppercase tracking-wide opacity-80">
        {title}
      </p>
      <p className="text-2xl font-bold mt-1">
        {value}
      </p>
    </div>
  );
}

export default AdminDashboard;
