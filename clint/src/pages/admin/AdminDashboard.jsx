import { useEffect, useState } from "react";
import { getDashboardStats } from "../../services/admin.service";
import { getAllAdminComplaints } from "../../services/complaint.service";
import { useRole } from "../../hooks/useRole";
import { useAuth } from "../../context/AuthContext";
import DepartmentComplaintsDrawer from "./DepartmentComplaintsDrawer";

/* ---------------- helpers ---------------- */

const normalize = (v) =>
  typeof v === "string" && v.trim() ? v.trim().toLowerCase() : "unknown";

const formatLabel = (v) =>
  v === "unknown"
    ? "Unknown"
    : v.replace(/\b\w/g, (c) => c.toUpperCase());

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

  /* ---------------- ROLE + CATEGORY FILTER ---------------- */

 const visibleComplaints = complaints.filter((c) => {
  const cState = normalize(c.location?.state);
  const cDistrict = normalize(c.location?.district);
  const cCategory = normalize(c.category);          

  const uState = normalize(user?.location?.state);
  const uDistrict = normalize(user?.location?.district);
  const uDepartment = normalize(user?.department);   
  // SUPER / CENTRAL
  if (["SUPER_ADMIN", "CENTRAL_ADMIN"].includes(role)) {
    return true;
  }

  // STATE ADMIN
  if (role === "STATE_ADMIN") {
    return cState === uState;
  }

  // DISTRICT ADMIN
  if (role === "DISTRICT_ADMIN") {
    return cState === uState && cDistrict === uDistrict;
  }

  // ✅ DEPT_HEAD / OFFICER / WORKER (FINAL FIX)
  if (["DEPT_HEAD", "OFFICER", "WORKER"].includes(role)) {
    
    return (
      cState === uState && 
      cDistrict === uDistrict &&
      cCategory === uDepartment
    );
  }

  return false;
});


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

  const stateGroups =
    ["SUPER_ADMIN", "CENTRAL_ADMIN"].includes(role)
      ? groupBy(visibleComplaints, "state")
      : {};

  const districtGroups =
    ["SUPER_ADMIN", "CENTRAL_ADMIN", "STATE_ADMIN"].includes(role)
      ? groupBy(visibleComplaints, "district")
      : {};

  const cityGroups =
    ["SUPER_ADMIN", "CENTRAL_ADMIN", "STATE_ADMIN", "DISTRICT_ADMIN"].includes(
      role
    )
      ? groupBy(visibleComplaints, "city")
      : {};

  const hasGroups = (obj) => Object.keys(obj).length > 0;

  const GroupSection = ({ title, groups }) => (
    <div className="bg-white rounded shadow-sm p-4">
      <h3 className="font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(groups).map(([key, list]) => (
          <div
            key={key}
            onClick={() => {
              setOpenGroup(key);
              setGroupTitle(`${title}: ${formatLabel(key)}`);
              setGroupedComplaints(list);
            }}
            className="cursor-pointer border rounded p-3 flex justify-between hover:bg-blue-50"
          >
            <span>{formatLabel(key)}</span>
            <span className="font-semibold">{list.length}</span>
          </div>
        ))}
      </div>
    </div>
  );

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold">Admin Dashboard</h2>
      <p className="text-sm text-gray-500">
        Role: <b>{role}</b>
        {["DEPT_HEAD", "OFFICER", "WORKER"].includes(role) && user?.department && (
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

      {/* Department */}
      {hasGroups(departmentGroups) && (
        <GroupSection
          title="Department-wise Complaints"
          groups={departmentGroups}
        />
      )}

      {/* State */}
      {["SUPER_ADMIN", "CENTRAL_ADMIN"].includes(role) &&
        hasGroups(stateGroups) && (
          <GroupSection title="State-wise Complaints" groups={stateGroups} />
        )}

      {/* District */}
      {["SUPER_ADMIN", "CENTRAL_ADMIN", "STATE_ADMIN"].includes(role) &&
        hasGroups(districtGroups) && (
          <GroupSection title="District-wise Complaints" groups={districtGroups} />
        )}

      {/* City */}
      {["SUPER_ADMIN", "CENTRAL_ADMIN", "STATE_ADMIN", "DISTRICT_ADMIN"].includes(
        role
      ) &&
        hasGroups(cityGroups) && (
          <GroupSection title="City-wise Complaints" groups={cityGroups} />
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
    <div className="bg-white rounded shadow-sm p-4">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

export default AdminDashboard;
