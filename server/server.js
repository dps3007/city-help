import "./config/env.js"; 
import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 8000;

// Start the server after connecting to the database
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server startup failed", err);
    process.exit(1);
  }
};

// Invoke the server start function
startServer();
