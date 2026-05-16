const origins = new Set([
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:5177",
  "http://localhost:5178",
  "http://localhost:5179",
]);

if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL
    .split(",")
    .map(url => url.trim())
    .forEach(url => origins.add(url));
}

export const allowedOrigins = [...origins];
