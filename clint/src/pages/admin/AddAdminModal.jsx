import { useState } from "react";
import { createAdmin } from "../../services/admin.service";
import { toast } from "react-toastify";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/common/Button";

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
  toast.success("Admin created");
};

  return (
    <Modal open={open} onClose={onClose} title="Add new admin" description="Provision a new staff account with role-based access.">
      <div className="space-y-5">
        <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} label="Name" />
        <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} label="Email" />
        <Select value={role} onChange={(e) => setRole(e.target.value)} label="Role">
          <option value="OFFICER">Officer</option>
          <option value="DEPT_HEAD">Dept Head</option>
          <option value="DISTRICT_ADMIN">District Admin</option>
          <option value="STATE_ADMIN">State Admin</option>
          <option value="CENTRAL_ADMIN">Central Admin</option>
        </Select>

        {role === "DEPT_HEAD" && (
          <Input placeholder="Department" value={department} onChange={(e) => setDepartment(e.target.value)} label="Department" />
        )}

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={submit}>Create admin</Button>
        </div>
      </div>
    </Modal>
  );
}

export default AddAdminModal;
