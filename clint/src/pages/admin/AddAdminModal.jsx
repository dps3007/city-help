import { useState } from "react";
import { createAdmin } from "../../services/admin.service";

function AddAdminModal({ open, onClose, refresh }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("OFFICER");

  if (!open) return null;

  const submit = async () => {
    await createAdmin({ email, role });
    await refresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[420px] rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold">Add New Admin</h2>

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
          <option>OFFICER</option>
          <option>DISTRICT_ADMIN</option>
          <option>STATE_ADMIN</option>
          <option>CENTRAL_ADMIN</option>
        </select>

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
