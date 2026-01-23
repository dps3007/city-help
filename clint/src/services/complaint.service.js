import api from "./api.js";

export const getAllComplaints = async () => {
  const res = await api.get("/complaints");
  return res.data.data;
};

export const createComplaint = async (body) => {
  const res = await api.post("/complaints", body);
  return res.data.data;
};

export const verifyComplaint = (id) =>
  api.patch(`/complaints/${id}/verify`);

export const assignComplaint = (id, body) =>
  api.patch(`/complaints/${id}/assign`, body);

export const startWork = (id) =>
  api.patch(`/complaints/${id}/start-work`);

export const resolveComplaint = (id) =>
  api.patch(`/complaints/${id}/resolve`);

export const closeComplaint = (id) =>
  api.patch(`/complaints/${id}/close`);

export const submitFeedback = (id, body) =>
  api.post(`/complaints/${id}/feedback`, body);

export const upvoteComplaint = (id) =>
  api.post(`/complaints/${id}/upvote`);

export const getMyComplaints = async () => {
  const res = await api.get("/complaints");
  return res.data.data;
};

export const getComplaintById = async (id) => {
  const res = await api.get(`/complaints/${id}`);
  return res.data.data;
};
