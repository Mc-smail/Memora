"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTasks = getTasks;
exports.createTask = createTask;
exports.updateTask = updateTask;
exports.deleteTask = deleteTask;
const db_1 = require("../db");
async function getTasks(req, res) {
    const userId = req.userId;
    const tasks = await db_1.prisma.task.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });
    res.json(tasks);
}
async function createTask(req, res) {
    const userId = req.userId;
    const { title, subject, priority, notes, dueDate } = req.body;
    if (!title || !String(title).trim()) {
        return res.status(400).json({ message: "Title is required" });
    }
    const task = await db_1.prisma.task.create({
        data: {
            title: String(title).trim(),
            subject: subject ? String(subject).trim() : null,
            priority: priority ? String(priority) : "medium",
            notes: notes ? String(notes).trim() : null,
            dueDate: dueDate ? new Date(dueDate) : null,
            userId,
        },
    });
    res.status(201).json(task);
}
async function updateTask(req, res) {
    const userId = req.userId;
    const { id } = req.params;
    const existing = await db_1.prisma.task.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
        return res.status(404).json({ message: "Task not found" });
    }
    const { title, completed, subject, priority, notes, dueDate } = req.body;
    const updated = await db_1.prisma.task.update({
        where: { id },
        data: {
            title: title !== undefined ? String(title).trim() : undefined,
            completed: completed !== undefined ? Boolean(completed) : undefined,
            subject: subject !== undefined ? (subject ? String(subject).trim() : null) : undefined,
            priority: priority !== undefined ? String(priority) : undefined,
            notes: notes !== undefined ? (notes ? String(notes).trim() : null) : undefined,
            dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
        },
    });
    res.json(updated);
}
async function deleteTask(req, res) {
    const userId = req.userId;
    const { id } = req.params;
    const existing = await db_1.prisma.task.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
        return res.status(404).json({ message: "Task not found" });
    }
    await db_1.prisma.task.delete({ where: { id } });
    res.json({ ok: true });
}
