import api from "./api";

export const getDashboardStats = async () => {
  const res = await api.get("/admin/dashboard");
  return res.data.data;
};

export const getAdminComplaints = async () => {
  const res = await api.get("/admin/complaints");
  return res.data.data;
};

export const getAllUsers = async () => {
  const res = await api.get("/admin/users");
  return res.data.data;
};

export const createAdmin = async (data) => {
  const res = await api.post("/admin/users", data);
  return res.data.data;
};      

export const updateUserRole = (id, role) =>
  api.patch(`/admin/users/${id}/role`, { role });

