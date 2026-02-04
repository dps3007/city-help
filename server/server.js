import "./config/env.js";
import app from "./app.js";
import connectDB from "./config/db.js";
import { allowedOrigins } from "./config/cors.js";

import http from "http";
import { Server } from "socket.io";

const PORT = process.env.PORT || 8000;

// create http server
const server = http.createServer(app);

// create socket.io server
export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// socket connection handler
io.on("connection", (socket) => {

  socket.on("join:district", (district) => {
    socket.join(`district:${district.toLowerCase()}`);
  });

  socket.on("join:state", (state) => {
    socket.join(`state:${state.toLowerCase()}`);
  });

  // 🔥 GLOBAL FEED ROOM
  socket.on("join:feed", () => {
    socket.join("feed:all");
  });

});


// Start server after DB connection
const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`🚀 Server + Socket.IO running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server startup failed", err);
    process.exit(1);
  }
};

startServer();
