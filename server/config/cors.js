const origins = new Set([
  "http://localhost:5173",
  "http://localhost:5174",
]);

if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL
    .split(",")
    .map(url => url.trim())
    .forEach(url => origins.add(url));
}

export const allowedOrigins = [...origins];
