"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const registered = params.get("registered") === "1";

  const [email, setEmail] = useState("test@mail.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Login</h1>

      {/* ✅ Registrierung erfolgreich Hinweis */}
      {registered && (
        <div
          style={{
            background: "#e8fff1",
            border: "1px solid #a7f3c6",
            padding: 10,
            borderRadius: 8,
            marginTop: 12,
          }}
        >
          ✅ Registrierung erfolgreich! Bitte jetzt einloggen.
        </div>
      )}

      <form
        onSubmit={onSubmit}
        style={{ marginTop: 16, display: "grid", gap: 12 }}
      >
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 10 }}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 10 }}
        />
        <button disabled={loading} style={{ padding: 10 }}>
          {loading ? "..." : "Login"}
        </button>
      </form>

      {error && (
        <p style={{ marginTop: 12, color: "crimson" }}>{error}</p>
      )}

      {/* ✅ Link zur Register-Seite */}
      <p style={{ marginTop: 16 }}>
        Noch kein Account?{" "}
        <a href="/register" style={{ textDecoration: "underline" }}>
          Register
        </a>
      </p>
    </main>
  );
}