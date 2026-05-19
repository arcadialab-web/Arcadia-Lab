import express from "express";
import { apiRouter } from "./routes";

const app = express();
app.use(express.json());

// Mount the API router
// On Vercel, requests to /api/auth/signup are rewritten to this function.
// Express might see the full path or a relative path depending on the rewrite.
app.use("/api", apiRouter);
app.use(apiRouter); // Fallback to handle relative paths

export default app;
