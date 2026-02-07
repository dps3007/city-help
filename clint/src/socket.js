import { io } from "socket.io-client";

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io("https://cityhelp-backend-pngm.onrender.com" || "http://localhost:5173", {
      path: "/socket.io",
      transports: ["websocket"],
      withCredentials: true,
      autoConnect: true,
    });
  }
  return socket;
};
