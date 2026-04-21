import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/asyncHandler";
import { login, me, register } from "../controllers/auth.controller";
import { authRateLimit } from "../middleware/rateLimit";

export const authRouter = Router();

authRouter.post("/auth/register", authRateLimit, asyncHandler(register));
authRouter.post("/auth/login", authRateLimit, asyncHandler(login));
authRouter.get("/me", authMiddleware, asyncHandler(me));