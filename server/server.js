import "./config/env.js";
import app from "./app.js";
import connectDB from "./config/db.js";
import { allowedOrigins } from "./config/cors.js";

import http from "http";
import { Server } from "socket.io";
import { setIO } from "./socket.js";

const PORT = process.env.PORT || 8000;

// create http server
const server = http.createServer(app);

// create socket.io server
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

setIO(io);

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

    // Listen and handle errors (EADDRINUSE) gracefully
    server.listen(PORT, () => {
      console.log(`🚀 Server + Socket.IO running on port ${PORT}`);
    });

    server.on("error", (err) => {
      if (err && err.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} is already in use. Another process is listening on this port.`);
        console.error("Kill the other process or change PORT and restart the server.");
        // Exit with non-zero so process manager / nodemon knows it failed
        process.exit(1);
      }
      console.error("Server error:", err);
    });
  } catch (err) {
    console.error("❌ Server startup failed", err);
    process.exit(1);
  }
};

startServer();
