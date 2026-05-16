import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, UserPlus, UsersRound } from "lucide-react";
import api from "../../services/api";
import ManageUserModal from "./ManageUserModal";
import AddAdminModal from "./AddAdminModal";
import SectionHeader from "../../components/ui/SectionHeader";
import StatCard from "../../components/ui/StatCard";
import Card, { CardBody, CardHeader } from "../../components/ui/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import EmptyState from "../../components/ui/EmptyState";
import { TableSkeleton } from "../../components/ui/Skeleton";

const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "CENTRAL_ADMIN",
  "STATE_ADMIN",
  "DISTRICT_ADMIN",
  "DEPT_HEAD",
  "OFFICER",
];

const ROLE_LABELS = {
  SUPER_ADMIN: "Super Admin",
  CENTRAL_ADMIN: "Central Admin",
  STATE_ADMIN: "State Admin",
  DISTRICT_ADMIN: "District Admin",
  DEPT_HEAD: "Department Head",
  OFFICER: "Officer",
};

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users");
      const adminsOnly = (res.data.data.users || []).filter((user) =>
        ADMIN_ROLES.includes(user.role)
      );
      setUsers(adminsOnly);
    } catch (err) {
      console.error("Failed to load admins", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const metrics = useMemo(() => {
    const active = users.filter((user) => user.isActive).length;
    const disabled = users.length - active;
    const departmentUsers = users.filter((user) =>
      ["DEPT_HEAD", "OFFICER"].includes(user.role)
    ).length;

    return { total: users.length, active, disabled, departmentUsers };
  }, [users]);

  const openManageModal = (user) => {
    setSelectedUser(user);
    setManageOpen(true);
  };

  if (loading) return <TableSkeleton rows={6} />;

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Access control"
        title="Admin management"
        description="Provision staff, review operational roles, and keep officer access aligned with city responsibilities."
        action={
          <Button
            onClick={() => setAddOpen(true)}
            leadingIcon={<UserPlus size={16} />}
          >
            Add admin
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total staff"
          value={metrics.total}
          delta="Admins and officers"
          icon={<UsersRound size={18} />}
          tone="blue"
        />
        <StatCard
          title="Active"
          value={metrics.active}
          delta="Able to access dashboards"
          icon={<ShieldCheck size={18} />}
          tone="emerald"
        />
        <StatCard
          title="Disabled"
          value={metrics.disabled}
          delta="Access currently restricted"
          icon={<ShieldCheck size={18} />}
          tone="rose"
        />
        <StatCard
          title="Department users"
          value={metrics.departmentUsers}
          delta="Heads and field officers"
          icon={<UsersRound size={18} />}
          tone="cyan"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Admins and officers</h3>
            <p className="mt-1 text-sm text-slate-400">
              Manage role assignments for non-citizen accounts.
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
            {metrics.total} accounts
          </span>
        </CardHeader>

        <CardBody className="overflow-x-auto p-0">
          {users.length === 0 ? (
            <EmptyState
              title="No staff accounts found"
              description="Create the first admin or officer account to begin assigning operational access."
              icon={<UsersRound size={22} />}
              action={
                <Button
                  onClick={() => setAddOpen(true)}
                  leadingIcon={<UserPlus size={16} />}
                >
                  Add admin
                </Button>
              }
            />
          ) : (
            <table className="min-w-full divide-y divide-white/10 text-sm">
              <thead className="bg-white/5 text-left text-slate-300">
                <tr>
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Department</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.map((user) => (
                  <tr key={user._id} className="transition hover:bg-white/5">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-sm font-bold text-cyan-100">
                          {user.name?.[0]?.toUpperCase() || "A"}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{user.name || "Unnamed staff"}</p>
                          <p className="mt-1 text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge label={ROLE_LABELS[user.role] || user.role} />
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      {user.department || "Not assigned"}
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      {formatLocation(user)}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        label={user.isActive ? "Active" : "Disabled"}
                        tone={user.isActive ? "RESOLVED" : "default"}
                      />
                    </td>
                    <td className="px-5 py-4 text-right">
                      {user.role === "SUPER_ADMIN" ? (
                        <span className="text-xs font-medium text-slate-500">Locked</span>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openManageModal(user)}
                        >
                          Manage
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      <ManageUserModal
        open={manageOpen}
        user={selectedUser}
        onClose={() => setManageOpen(false)}
        refresh={fetchUsers}
      />

      <AddAdminModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        refresh={fetchUsers}
      />
    </div>
  );
}

function formatLocation(user) {
  const parts = [user.location?.district, user.location?.state].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Not scoped";
}

export default AdminUsers;
