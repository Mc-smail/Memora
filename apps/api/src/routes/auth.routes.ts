import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/asyncHandler";
import { login, me, register } from "../controllers/auth.controller";
import { authRateLimit } from "../middleware/rateLimit";

export const authRouter = Router();

router.post("/auth/register", authRateLimit, register);
router.post("/auth/login", authRateLimit, login);
authRouter.get("/me", authMiddleware, asyncHandler(me));