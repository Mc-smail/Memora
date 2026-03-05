"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const db_1 = require("./db");
const tasks_routes_1 = require("./routes/tasks.routes");
const auth_routes_1 = require("./routes/auth.routes");
const errorMiddleware_1 = require("./middleware/errorMiddleware");
const app = (0, express_1.default)();
/* ✅ CORS FIX (TypeScript-safe) */
const allowedOrigins = [
    "http://localhost:3000",
    process.env.WEB_ORIGIN,
].filter((v) => Boolean(v));
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express_1.default.json());
// Router mounts
app.use(auth_routes_1.authRouter);
app.use(tasks_routes_1.tasksRouter);
// Health Routes
app.get("/health", (_req, res) => {
    res.json({ status: "API is running" });
});
app.get("/db-health", async (_req, res) => {
    try {
        const userCount = await db_1.prisma.user.count();
        res.json({ ok: true, userCount });
    }
    catch {
        res.status(500).json({ ok: false, error: "DB query failed" });
    }
});
// Error middleware IMMER nach allen Routes
app.use(errorMiddleware_1.errorMiddleware);
// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
