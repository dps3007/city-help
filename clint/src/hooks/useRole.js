import { useAuth } from "../context/useAuth";

export const useRole = () => {
  const { user } = useAuth();
  return { role: user?.role || null };
};
