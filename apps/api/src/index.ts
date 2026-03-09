import express from "express";
import cors from "cors";
import "dotenv/config";

import { prisma } from "./db";
import { tasksRouter } from "./routes/tasks.routes";
import { authRouter } from "./routes/auth.routes";
import { errorMiddleware } from "./middleware/errorMiddleware";
import helmet from "helmet";

const app = express();
app.use(helmet());

/* ✅ CORS FIX (TypeScript-safe) */
const allowedOrigins = [
  "http://localhost:3000",
  process.env.WEB_ORIGIN,
].filter((v): v is string => Boolean(v));

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

// Router mounts
app.use(authRouter);
app.use(tasksRouter);

// Health Routes
app.get("/health", (_req, res) => {
  res.json({ status: "API is running" });
});

app.get("/db-health", async (_req, res) => {
  try {
    const userCount = await prisma.user.count();
    res.json({ ok: true, userCount });
  } catch {
    res.status(500).json({ ok: false, error: "DB query failed" });
  }
});

// Error middleware IMMER nach allen Routes
app.use(errorMiddleware);

// Start server
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});