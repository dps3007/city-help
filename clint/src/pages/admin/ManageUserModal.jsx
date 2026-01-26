import { useEffect, useState } from "react";
import { updateUserRole } from "../../services/admin.service";

function ManageUserModal({ open, user, onClose, refresh }) {
  const [role, setRole] = useState("");

  useEffect(() => {
    if (user) setRole(user.role);
  }, [user]);

  if (!open || !user) return null;

  const save = async () => {
    if (role === user.role) {
      alert("Role unchanged");
      return;
    }

    await updateUserRole(user._id, role);
    await refresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-[400px] p-6 rounded space-y-4">
        <h2 className="text-lg font-semibold">Change Role</h2>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="CITIZEN">Citizen</option>
          <option value="OFFICER">Officer</option>
          <option value="DEPT_HEAD">Dept Head</option>
          <option value="DISTRICT_ADMIN">District Admin</option>
          <option value="STATE_ADMIN">State Admin</option>
          <option value="CENTRAL_ADMIN">Central Admin</option>
        </select>



        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={save}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManageUserModal;
