import api from "./api";

export const getGlobalLeaderboard = async () => {
  const res = await api.get("/leaderboard/global");
  return res.data;
};

export const getLocalLeaderboard = async (municipalId) => {
  const res = await api.get(`/leaderboard/local/${municipalId}`);
  return res.data;
};
