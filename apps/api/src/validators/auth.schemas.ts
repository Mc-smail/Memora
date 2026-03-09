import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name zu kurz"),
  email: z.string().email("Ungültige Email"),
  password: z.string().min(6, "Passwort muss mindestens 6 Zeichen haben"),
});

export const loginSchema = z.object({
  email: z.string().email("Ungültige Email"),
  password: z.string().min(6, "Passwort muss mindestens 6 Zeichen haben"),
});