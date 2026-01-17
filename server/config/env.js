import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);

// Resolve directory name
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({
  path: path.join(__dirname, "../.env"),
});
