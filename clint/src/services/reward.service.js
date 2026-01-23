import api from "./api";

export const getMyRewards = async () => {
  const res = await api.get("/rewards");
  return res.data.data; // { rewards, totalPoints }
};

