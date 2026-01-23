import api from "./api";

/**
 * Login user
 * @param {Object} payload { email, password }
 * @returns {Promise<{ token: string, user: Object }>}
 */
export const loginUser = async (payload) => {
  const response = await api.post("/auth/login", payload);
  return response.data;
};

/**
 * Register user
 * @param {Object} payload { name, email, password, role }
 * @returns {Promise<{ token: string, user: Object }>}
 */
export const registerUser = async (payload) => {
  const response = await api.post("/auth/register", payload);
  return response.data;
};

/**
 * Logout user (client-side only)
 */
export const logoutUser = async () => {
  // Optional: call backend logout endpoint if you add one later
  return Promise.resolve();
};
