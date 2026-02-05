import { io } from "socket.io-client";

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io("https://cityhelp-backend-pngm.onrender.com", {
      path: "/socket.io",
      transports: ["websocket"],
      withCredentials: true,
      autoConnect: true,
    });
  }
  return socket;
};
