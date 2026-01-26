import { useEffect, useState } from "react";
import api from "../../services/api";
import ManageUserModal from "./ManageUserModal";
import AddAdminModal from "./AddAdminModal";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
const [manageOpen, setManageOpen] = useState(false);
const [selectedUser, setSelectedUser] = useState(null);


  useEffect(() => {
    fetchUsers();
  }, []);

  const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "CENTRAL_ADMIN",
  "STATE_ADMIN",
  "DISTRICT_ADMIN",
  "DEPT_HEAD",
  "OFFICER",
  "WORKER",
];

const fetchUsers = async () => {
  try {
    const res = await api.get("/admin/users");

    const adminsOnly = (res.data.data.users || []).filter(
      (u) => ADMIN_ROLES.includes(u.role)
    );

    setUsers(adminsOnly);
  } catch (err) {
    console.error("Failed to load admins", err);
  } finally {
    setLoading(false);
  }
};


  const total = users.length;
  const active = users.filter(u => u.isActive).length;
  const disabled = total - active;

  if (loading) return <p className="text-gray-600">Loading admins…</p>;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          Admin Management
        </h2>
        <p className="text-sm text-gray-500">
          Control system administrators and officers
        </p>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Metric title="Total Admins" value={total} />
        <Metric title="Active" value={active} />
        <Metric title="Disabled" value={disabled} />
      </div>

      {/* TABLE CARD */}
      <div className="bg-white rounded shadow-sm overflow-x-auto">
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">
            Admins & Officers
          </h3>

          <button 
          onClick={() => setAddOpen(true)}
          className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700">
            + Add Admin
          </button>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map(u => (
              <tr
                key={u._id}
                className="border-t hover:bg-gray-50"
              >
                {/* NAME */}
                <td className="px-6 py-3">
                  <div className="font-medium text-gray-800">
                    {u.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {u.email}
                  </div>
                </td>

                {/* ROLE */}
                <td className="px-6 py-3">
                  <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                    {u.role.replace("_", " ")}
                  </span>
                </td>

                {/* STATUS */}
                <td className="px-6 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      u.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {u.isActive ? "Active" : "Disabled"}
                  </span>
                </td>

                {/* ACTION */}
                <td className="px-6 py-3">
                  {u.role !== "SUPER_ADMIN" ? (
                    <button 
                    onClick={() => {
                      setSelectedUser(u);
                      setManageOpen(true);
                    }}
                    className="text-blue-600 hover:underline text-sm">
                      Manage
                    </button>
                  ) : (
                    <span className="text-gray-400 text-xs">
                      —
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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

function Metric({ title, value }) {
  return (
    <div className="bg-white rounded shadow-sm p-4">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

export default AdminUsers;
