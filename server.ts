import express, { Request, Response, NextFunction } from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { connectToMongo } from "./server/config/db";
import { extractUserRole } from "./server/middleware/authMiddleware";
import apiRouter from "./server/routes";
import { errorHandler } from "./server/middleware/errorHandler";

// Extend Express Request type to support role-based info
declare global {
  namespace Express {
    interface Request {
      userRole?: string;
      userId?: string;
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Global Middlewares
  app.use(cors());
  app.use(express.json());
  app.use(extractUserRole);

  // Connect to MongoDB (with automatic local db.json fallback)
  await connectToMongo();

  // ================= MOUNT API ROUTER =================
  app.use("/api", apiRouter);

  // Global Centralized Error Handler (resolves validations, casts, and general server errors)
  app.use(errorHandler);

  // Vite Integration for Asset Serving / SPA Router fallback
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
