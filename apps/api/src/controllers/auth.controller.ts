import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import { prisma } from "../db";
import { signToken } from "../auth";
import type { AuthedRequest } from "../middleware/authMiddleware";
import { registerSchema, loginSchema } from "../validators/auth.schemas";

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.issues[0]?.message || "Ungültige Eingaben",
    });
  }

  const { email, password, name } = parsed.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(409).json({ error: "email already in use" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });

  return res.status(201).json({
    id: user.id,
    email: user.email,
    name: user.name,
  });
}
export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.issues[0]?.message || "Ungültige Eingaben",
    });
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "invalid credentials" });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: "invalid credentials" });
  }

  const token = signToken({ userId: user.id });

  return res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
}

export async function me(req: AuthedRequest, res: Response) {
  const userId = req.userId!;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  if (!user) return res.status(404).json({ error: "user not found" });

  return res.json({ user });
}