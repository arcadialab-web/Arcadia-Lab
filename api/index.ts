import express from "express";
import { apiRouter } from "./routes";

const app = express();
app.use(express.json());

// Logging middleware for Vercel (visible in Function Logs)
app.use((req, res, next) => {
  console.log(`[Vercel API] Method: ${req.method} | URL: ${req.url} | Path: ${req.path}`);
  next();
});

// Mount the API router
app.get("/api/health-check", (req, res) => {
  res.json({ 
    message: "API Entry point is alive", 
    env: process.env.NODE_ENV,
    hasResendKey: !!process.env.RESEND_API_KEY || !!process.env.VITE_RESEND_API_KEY,
    hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
  });
});

// Specific mount for auth routes called by frontend
app.use("/api/auth", apiRouter);

// Fallback for general API routes
app.use("/api", apiRouter);

// Fallback for all other routes to ensure JSON error
app.use((req, res) => {
  res.status(404).json({ 
    error: `Route ${req.url} not found`,
    method: req.method,
    path: req.path
  });
});

export default app;
