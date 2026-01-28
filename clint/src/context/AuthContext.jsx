import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  try {
    const storedToken = localStorage.getItem("cityhelp_token");
    const storedUser = localStorage.getItem("cityhelp_user");

    if (storedToken && storedUser && storedUser !== "undefined") {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  } catch (err) {
    console.error("Auth load failed", err);
    localStorage.removeItem("cityhelp_user");
  } finally {
    setLoading(false);
  }
}, []);

  const login = ({ token, user }) => {
    localStorage.setItem("cityhelp_token", token);
    localStorage.setItem("cityhelp_user", JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const updateUser = (updatedUser) => {
  if (!updatedUser) return; // 🛑 VERY IMPORTANT

  localStorage.setItem(
    "cityhelp_user",
    JSON.stringify(updatedUser)
  );
  setUser(updatedUser);
};


  const logout = () => {
    localStorage.clear();
    setUser(null);
    setToken(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        logout,
        updateUser, // 🔥 IMPORTANT
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
