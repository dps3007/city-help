import { io } from "socket.io-client";

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io("https://cityhelp-backend-pngm.onrender.com/api/v1", {
      withCredentials: true,
      autoConnect: true,
    });
  }
  return socket;
};



