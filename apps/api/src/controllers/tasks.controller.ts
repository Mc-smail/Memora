import type { Request, Response } from "express";
import { prisma } from "../db";
import { createTaskSchema, updateTaskSchema } from "../validators/task.schemas";

export async function getTasks(req: Request, res: Response) {
  const userId = req.userId!;

  const tasks = await prisma.task.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  res.json(tasks);
}
export async function createTask(req: Request, res: Response) {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const parsed = createTaskSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.issues[0]?.message || "Ungültige Eingaben",
    });
  }

  const { title, subject, dueDate, priority, notes } = parsed.data;

  const task = await prisma.task.create({
    data: {
      title,
      completed: false,
      userId,
      subject: subject ?? null,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority ?? "medium",
      notes: notes ?? null,
    },
  });

  return res.status(201).json(task);
}

export async function updateTask(req: Request, res: Response) {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;

  const parsed = updateTaskSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.issues[0]?.message || "Ungültige Eingaben",
    });
  }

  const data = parsed.data;

  const existingTask = await prisma.task.findFirst({
    where: { id, userId },
  });

  if (!existingTask) {
    return res.status(404).json({ error: "Task not found" });
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.completed !== undefined ? { completed: data.completed } : {}),
      ...(data.subject !== undefined ? { subject: data.subject ?? null } : {}),
      ...(data.dueDate !== undefined
        ? { dueDate: data.dueDate ? new Date(data.dueDate) : null }
        : {}),
      ...(data.priority !== undefined ? { priority: data.priority ?? "medium" } : {}),
      ...(data.notes !== undefined ? { notes: data.notes ?? null } : {}),
    },
  });

  return res.json(updatedTask);
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