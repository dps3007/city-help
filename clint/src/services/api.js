import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

// Attach JWT to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("cityhelp_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Auto logout on token expiry / unauthorized
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("cityhelp_token");
      localStorage.removeItem("cityhelp_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
