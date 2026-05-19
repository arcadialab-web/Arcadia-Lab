import express from "express";
import { apiRouter } from "./routes";

const app = express();
app.use(express.json());

// Logging middleware for Vercel (visible in Function Logs)
app.use((req, res, next) => {
  console.log(`[Vercel API Request] ${req.method} ${req.originalUrl || req.url}`);
  next();
});

// Mount the API router
// Using both prefixes to ensure compatibility with Vercel rewrites
app.use("/api", apiRouter);
app.use("/", apiRouter);

// Fallback for all other routes to ensure JSON error
app.use((req, res) => {
  res.status(404).json({ 
    error: `Route ${req.url} not found`,
    method: req.method,
    path: req.path
  });
});

export default app;
