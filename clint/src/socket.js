import { io } from "socket.io-client";

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io("http://localhost:8000", {
      withCredentials: true,
      autoConnect: true,
    });
  }
  return socket;
};



"http://localhost:8000"