import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/asyncHandler";
import { login, me, register } from "../controllers/auth.controller";

export const authRouter = Router();

authRouter.post("/auth/register", asyncHandler(register));
authRouter.post("/auth/login", asyncHandler(login));
authRouter.get("/me", authMiddleware, asyncHandler(me));