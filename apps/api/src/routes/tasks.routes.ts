import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/asyncHandler";
import { createTask, deleteTask, getTasks, updateTask } from "../controllers/tasks.controller";

export const tasksRouter = Router();

tasksRouter.get("/tasks", authMiddleware, asyncHandler(getTasks));
tasksRouter.post("/tasks", authMiddleware, asyncHandler(createTask));
tasksRouter.patch("/tasks/:id", authMiddleware, asyncHandler(updateTask));
tasksRouter.delete("/tasks/:id", authMiddleware, asyncHandler(deleteTask));