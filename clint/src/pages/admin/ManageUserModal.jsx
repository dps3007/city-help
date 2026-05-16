import { useEffect, useState } from "react";
import { updateUserRole } from "../../services/admin.service";
import { toast } from "react-toastify";
import Modal from "../../components/ui/Modal";
import Select from "../../components/ui/Select";
import Button from "../../components/common/Button";

function ManageUserModal({ open, user, onClose, refresh }) {
  const [role, setRole] = useState("");

  useEffect(() => {
    if (user) setRole(user.role);
  }, [user]);

  if (!open || !user) return null;

  const save = async () => {
    if (role === user.role) {
      toast.info("Role unchanged");
      return;
    }

    await updateUserRole(user._id, role);
    await refresh();
    onClose();
    toast.success("User role updated");
  };

  return (
    <Modal open={open} onClose={onClose} title="Change role" description={`Update permissions for ${user.name}`}>
      <div className="space-y-5">
        <Select value={role} onChange={(e) => setRole(e.target.value)} label="Role">
          <option value="CITIZEN">Citizen</option>
          <option value="OFFICER">Officer</option>
          <option value="DEPT_HEAD">Dept Head</option>
          <option value="DISTRICT_ADMIN">District Admin</option>
          <option value="STATE_ADMIN">State Admin</option>
          <option value="CENTRAL_ADMIN">Central Admin</option>
        </Select>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={save}>Save changes</Button>
        </div>
      </div>
    </Modal>
  );
}

export default ManageUserModal;
