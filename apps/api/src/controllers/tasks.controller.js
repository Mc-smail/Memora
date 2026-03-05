"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTask = exports.createTask = void 0;
exports.getTasks = getTasks;
exports.deleteTask = deleteTask;
const db_1 = require("../db");
const express_1 = require("express");
const db_2 = __importDefault(require("../db"));
const asyncHandler_1 = require("../middleware/asyncHandler");
async function getTasks(req, res) {
    const userId = req.userId;
    const tasks = await db_1.prisma.task.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });
    return res.json({ tasks });
}
exports.createTask = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { title, subject, dueDate, priority, notes } = req.body;
    const task = await db_1.prisma.task.create({
        data: {
            title,
            subject,
            priority: priority || "medium",
            notes,
            dueDate: dueDate ? new Date(dueDate) : null,
            userId: req.userId,
        },
    });
    res.status(201).json(task);
});
exports.updateTask = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { title, completed, subject, dueDate, priority, notes } = req.body;
    const task = await db_1.prisma.task.findUnique({
        where: { id },
    });
    if (!task || task.userId !== req.userId) {
        return res.status(404).json({ message: "Task not found" });
    }
    const updated = await db_1.prisma.task.update({
        where: { id },
        data: {
            title,
            completed,
            subject,
            priority,
            notes,
            dueDate: dueDate ? new Date(dueDate) : null,
        },
    });
    res.json(updated);
});
async function deleteTask(req, res) {
    const userId = req.userId;
    const { id } = req.params;
    const deleted = await db_1.prisma.task.deleteMany({
        where: { id, userId },
    });
    if (deleted.count === 0) {
        return res.status(404).json({ error: "Task not found" });
    }
    return res.json({ message: "Task deleted" });
}
//# sourceMappingURL=tasks.controller.js.map