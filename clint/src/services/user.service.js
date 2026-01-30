import api from "./api";

export const updateAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await api.patch("/users/me/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export const updateCurrentUser = async (payload) => {
  const res = await api.patch("/users/me", payload);
  return res.data;
};
