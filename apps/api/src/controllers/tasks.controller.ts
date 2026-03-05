import type { Request, Response } from "express";
import { prisma } from "../db";

export async function getTasks(req: Request, res: Response) {
  const userId = req.userId!;

  const tasks = await prisma.task.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  res.json(tasks);
}

export async function createTask(req: Request, res: Response) {
  const userId = req.userId!;

  const { title, subject, priority, notes, dueDate } = req.body;

  if (!title || !String(title).trim()) {
    return res.status(400).json({ message: "Title is required" });
  }

  const task = await prisma.task.create({
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

export async function updateTask(req: Request, res: Response) {
  const userId = req.userId!;
  const { id } = req.params;

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return res.status(404).json({ message: "Task not found" });
  }

  const { title, completed, subject, priority, notes, dueDate } = req.body;

  const updated = await prisma.task.update({
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

export async function deleteTask(req: Request, res: Response) {
  const userId = req.userId!;
  const { id } = req.params;

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return res.status(404).json({ message: "Task not found" });
  }

  await prisma.task.delete({ where: { id } });

  res.json({ ok: true });
}