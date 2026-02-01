import { createContext, useContext, useEffect, useState } from "react";
import { getSocket } from "../socket";

const socket = getSocket();
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Load auth from localStorage
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

  // 🔹 Debug socket connect / disconnect
  useEffect(() => {
    socket.on("connect", () => {
      console.log("🟢 SOCKET CONNECTED:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("🔴 SOCKET DISCONNECTED");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  // 🔥 JOIN REALTIME ROOMS (CORRECT WAY)
  useEffect(() => {
    if (!user?.location) return;

    const joinRooms = () => {
      const { district, state } = user.location;

      if (district) {
        socket.emit("join:district", district.toLowerCase());
      }

      if (state) {
        socket.emit("join:state", state.toLowerCase());
      }

      // 🔥 common feed room (ALL ADMINS WHO CAN SEE FEED)
      socket.emit("join:feed");


      console.log("🟢 joined realtime rooms", {
        district,
        state,
        role: user.role,
      });
    };

    // join immediately if already connected
    if (socket.connected) {
      joinRooms();
    }

    // join again on reconnect
    socket.on("connect", joinRooms);

    return () => {
      socket.off("connect", joinRooms);
    };
  }, [user]);

  const login = ({ token, user }) => {
    localStorage.setItem("cityhelp_token", token);
    localStorage.setItem("cityhelp_user", JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const updateUser = (updatedUser) => {
    if (!updatedUser) return;
    localStorage.setItem("cityhelp_user", JSON.stringify(updatedUser));
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
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
