let io;

export const setIO = (socketServer) => {
  io = socketServer;
};

export { io };
