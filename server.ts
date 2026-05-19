import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { apiRouter } from "./api/routes";

export const app = express();
const PORT = 3000;

app.use(express.json());

// Mount the API router
app.use("/api", apiRouter);
app.use(apiRouter); // Fallback to handle different path styles

// Fallback for API routes (prevent HTML response)
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// --- VITE MIDDLEWARE ---

async function startServer() {
  // On Vercel, we don't need to serve static files or the SPA fallback via Express
  // because vercel.json handles it more efficiently.
  if (process.env.VERCEL) {
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
