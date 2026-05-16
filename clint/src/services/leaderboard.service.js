import api from "./api";

export const getGlobalLeaderboard = async () => {
  const res = await api.get("/leaderboard/global");
  return Array.isArray(res.data) ? res.data : res.data?.data || [];
};

export const getLocalLeaderboard = async (municipalId) => {
  const res = await api.get(`/leaderboard/local/${municipalId}`);
  return Array.isArray(res.data) ? res.data : res.data?.data || [];
};
