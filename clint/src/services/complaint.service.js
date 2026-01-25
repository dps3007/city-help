import api from "./api.js";

export const getAllComplaints = async () => {
  const res = await api.get("/complaints");
  return res.data.data;
};

export const createComplaint = async (body) => {
  const res = await api.post("/complaints", body);
  return res.data.data;
};

export const verifyComplaint = async (id) => {
  const res = await api.patch(`/complaints/${id}/verify`);
  return res.data.data;
};

export const assignComplaint = async (id, body) => {
  const res = await api.patch(`/complaints/${id}/assign`, body);
  return res.data.data;
};

export const startWork = async (id) => {
  const res = await api.patch(`/complaints/${id}/start-work`);
  return res.data.data;
};

export const resolveComplaint = async (id) => {
  const res = await api.patch(`/complaints/${id}/resolve`);
  return res.data.data;
};

export const closeComplaint = async (id) => {
  const res = await api.patch(`/complaints/${id}/close`);
  return res.data.data;
};

export const submitFeedback = async (id, data) => {
  const res = await api.post(`/complaints/${id}/feedback`, data);
  return res.data;
};

export const upvoteComplaint = async (id) => {
  const res = await api.post(`/complaints/${id}/upvote`);
  return res.data.data;
};

export const getMyComplaints = async () => {
  const res = await api.get("/complaints");
  return res.data.data;
};

export const getComplaintById = async (id) => {
  const res = await api.get(`/complaints/${id}`);
  return res.data.data;
};
