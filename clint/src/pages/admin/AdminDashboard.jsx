import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardStats } from "../../services/admin.service";
import { getAllAdminComplaints } from "../../services/complaint.service";
import { useRole } from "../../hooks/useRole";
import { useAuth } from "../../context/AuthContext";
import DepartmentComplaintsDrawer from "./DepartmentComplaintsDrawer";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import StatsCard from "../../components/common/StatsCard";
import Skeleton from "../../components/common/Skeleton";
import { Users, CheckCircle, Clock, MapPin, Folder, Eye } from "lucide-react";

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
    return (
      <div className="space-y-6 p-6">
        <Skeleton count={6} className="h-32" />
      </div>
    );
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

  const GroupSection = ({ title, groups, icon: Icon }) => (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5 text-primary-600" />}
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Object.entries(groups).map(([key, list]) => (
          <button
            key={key}
            onClick={() => {
              setOpenGroup(key);
              setGroupTitle(`${title}: ${formatLabel(key)}`);
              setGroupedComplaints(list);
            }}
            className="relative group rounded-lg p-4 bg-muted border-2 border-border hover:border-primary-400 transition-all hover:shadow-md cursor-pointer text-left"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-semibold text-foreground group-hover:text-primary-600 transition-colors">
                  {formatLabel(key)}
                </p>
              </div>
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-primary-100 text-primary-700 font-bold text-sm">
                {list.length}
              </span>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-8 p-6">

      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <Badge status={role} variant="default" />
          {user?.department && (
            <div className="px-3 py-1 bg-muted rounded-lg">
              <p className="text-xs font-medium text-muted-foreground">Department: <span className="text-foreground font-semibold">{user.department}</span></p>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Complaints"
          value={stats?.totalComplaints || 0}
          icon={Users}
          variant="primary"
        />
        <StatsCard
          title="Pending"
          value={stats?.pendingComplaints || 0}
          icon={Clock}
          variant="warning"
        />
        <StatsCard
          title="Resolved"
          value={stats?.resolvedComplaints || 0}
          icon={CheckCircle}
          variant="success"
        />
        <StatsCard
          title="Closed"
          value={stats?.closedComplaints || 0}
          icon={Folder}
          variant="accent"
        />
      </div>

      {/* Officer Recent */}
      {role === "OFFICER" && (
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary-600" />
            Your Recent Complaints
          </h2>

          {recentOfficerComplaints.length === 0 ? (
            <p className="text-muted-foreground text-sm py-6 text-center">
              No complaints assigned to you yet.
            </p>
          ) : (
            <div className="space-y-3">
              {recentOfficerComplaints.map((c) => (
                <div
                  key={c._id}
                  className="flex justify-between items-start rounded-lg p-4 bg-muted hover:bg-muted border-l-4 border-primary-400 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      #{c._id.slice(-6).toUpperCase()} · {c.category}
                    </p>
                    <div className="mt-2">
                      <Badge status={c.status} />
                    </div>
                  </div>

                  <Link
                    to={`/complaints/${c._id}`}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-semibold text-primary-600 hover:bg-primary-50 transition-colors"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Groups */}
      {hasGroups(departmentGroups) && (
        <GroupSection title="Complaints by Department" groups={departmentGroups} icon={Folder} />
      )}

      {["SUPER_ADMIN", "CENTRAL_ADMIN"].includes(role) &&
        hasGroups(stateGroups) && (
          <GroupSection title="Complaints by State" groups={stateGroups} icon={MapPin} />
      )}

      {["SUPER_ADMIN", "CENTRAL_ADMIN", "STATE_ADMIN"].includes(role) &&
        hasGroups(districtGroups) && (
          <GroupSection title="Complaints by District" groups={districtGroups} icon={MapPin} />
      )}

      {["SUPER_ADMIN", "CENTRAL_ADMIN", "STATE_ADMIN", "DISTRICT_ADMIN"].includes(role) &&
        hasGroups(cityGroups) && (
          <GroupSection title="Complaints by City" groups={cityGroups} icon={MapPin} />
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

export default AdminDashboard;
