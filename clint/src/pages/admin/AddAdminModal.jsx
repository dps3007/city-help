import { useState } from "react";
import { createAdmin } from "../../services/admin.service";

function AddAdminModal({ open, onClose, refresh }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("OFFICER");
  const [department, setDepartment] = useState("");


  if (!open) return null;

  const submit = async () => {
  const payload = {
    name,
    email,
    role,
  };

  if (role === "DEPT_HEAD") {
    payload.department = department;
  }

  await createAdmin(payload);
  refresh();
  onClose();
};

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[420px] rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold">Add New Admin</h2>

        <input
          placeholder="Name"
          className="w-full border px-3 py-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Email"
          className="w-full border px-3 py-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="OFFICER">Officer</option>
          <option value="DEPT_HEAD">Dept Head</option>
          <option value="DISTRICT_ADMIN">District Admin</option>
          <option value="STATE_ADMIN">State Admin</option>
          <option value="CENTRAL_ADMIN">Central Admin</option>
        </select>

          {role === "DEPT_HEAD" && (
            <input
              placeholder="Department"
              className="w-full border px-3 py-2 rounded"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          )}


        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={submit}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Create Admin
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddAdminModal;
