import express from "express";
import { apiRouter } from "./routes";

const app = express();
app.use(express.json());

// Logging middleware for Vercel
app.use((req, res, next) => {
  console.log(`[Express API] Full URL: ${req.url} | Original: ${req.originalUrl} | Path: ${req.path}`);
  next();
});

// Mount points for robustness
app.use("/api/auth", apiRouter); 
app.use("/auth", apiRouter);
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
