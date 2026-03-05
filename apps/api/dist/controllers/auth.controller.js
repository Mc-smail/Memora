"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.me = me;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../db");
const auth_1 = require("../auth");
async function register(req, res) {
    const { email, password, name } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "email and password are required" });
    }
    const existing = await db_1.prisma.user.findUnique({ where: { email } });
    if (existing) {
        return res.status(409).json({ error: "email already in use" });
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const user = await db_1.prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name: name ?? null,
        },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
        },
    });
    return res.status(201).json({ user });
}
async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "email and password are required" });
    }
    const user = await db_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        return res.status(401).json({ error: "invalid credentials" });
    }
    const isValid = await bcrypt_1.default.compare(password, user.password);
    if (!isValid) {
        return res.status(401).json({ error: "invalid credentials" });
    }
    const token = (0, auth_1.signToken)({ userId: user.id });
    return res.json({
        token,
        user: { id: user.id, email: user.email, name: user.name },
    });
}
async function me(req, res) {
    const userId = req.userId;
    const user = await db_1.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, createdAt: true },
    });
    if (!user)
        return res.status(404).json({ error: "user not found" });
    return res.json({ user });
}
