import { useAuth } from "../context/AuthContext";

export const useRole = () => {
  const { user } = useAuth();
  return { role: user?.role || null };
};
