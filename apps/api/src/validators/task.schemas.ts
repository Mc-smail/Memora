import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich"),
  subject: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  priority: z.enum(["low", "medium", "high"]).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich").optional(),
  completed: z.boolean().optional(),
  subject: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  priority: z.enum(["low", "medium", "high"]).optional().nullable(),
  notes: z.string().optional().nullable(),
});