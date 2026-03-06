"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../lib/api";

type User = {
  id: string;
  name: string;
  email: string;
};

type Task = {
  id: string;
  title: string;
  completed: boolean;
  subject?: string | null;
  dueDate?: string | null;
  priority?: "low" | "medium" | "high";
  notes?: string | null;
};

type Filter = "all" | "open" | "done";
type Sort = "newest" | "oldest" | "title";

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [notes, setNotes] = useState("");

  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");

  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("newest");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  function logout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  function getGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) return "Guten Morgen";
    if (hour < 18) return "Guten Tag";
    return "Guten Abend";
  }

  async function loadData() {
    try {
      const userData = await apiFetch("/me");
      const tasksData = await apiFetch("/tasks");

      setUser(userData);
      setTasks(tasksData);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const subjects = useMemo(() => {
    const set = new Set<string>();

    tasks.forEach((t) => {
      if (t.subject) set.add(t.subject);
    });

    return Array.from(set);
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let list = [...tasks];

    if (filter === "open") list = list.filter((t) => !t.completed);
    if (filter === "done") list = list.filter((t) => t.completed);

    if (search.trim()) {
      const q = search.toLowerCase();

      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.subject?.toLowerCase().includes(q) ||
          t.notes?.toLowerCase().includes(q)
      );
    }

    if (subjectFilter !== "all") {
      list = list.filter((t) => t.subject === subjectFilter);
    }

    if (sort === "title") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    if (sort === "oldest") {
      list.reverse();
    }

    return list;
  }, [tasks, filter, sort, search, subjectFilter]);

  async function createTask(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) return;

    setCreating(true);

    try {
      const newTask = await apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify({
          title,
          subject,
          dueDate,
          priority,
          notes,
        }),
      });

      setTasks((prev) => [newTask, ...prev]);

      setTitle("");
      setSubject("");
      setDueDate("");
      setNotes("");
    } finally {
      setCreating(false);
    }
  }

  async function toggleTask(id: string, completed: boolean) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !completed } : t))
    );

    await apiFetch(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ completed: !completed }),
    });
  }

  async function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));

    await apiFetch(`/tasks/${id}`, {
      method: "DELETE",
    });
  }

  if (loading) {
    return <p style={{ padding: 20 }}>Lade Dashboard...</p>;
  }

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontWeight: 900 }}>
            {getGreeting()} {user?.name} 👋
          </h1>
          <p>{user?.email}</p>
        </div>

        <button onClick={logout}>Logout</button>
      </div>

      <h2 style={{ marginTop: 30 }}>Neue Task</h2>

      <form onSubmit={createTask} style={{ display: "grid", gap: 10 }}>
        <input
          placeholder="Titel"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          placeholder="Fach"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as any)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <textarea
          placeholder="Notizen"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <button disabled={creating}>
          {creating ? "Erstelle..." : "Add Task"}
        </button>
      </form>

      <input
        placeholder="🔍 Suche Tasks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginTop: 20, width: "100%", padding: 10 }}
      />

      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <button
          onClick={() => setSubjectFilter("all")}
        >
          Alle
        </button>

        {subjects.map((s) => (
          <button key={s} onClick={() => setSubjectFilter(s)}>
            {s}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 30 }}>
        {filteredTasks.length === 0 ? (
          <p>Keine Tasks gefunden</p>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              style={{
                border: "1px solid #ddd",
                padding: 10,
                marginBottom: 10,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() =>
                      toggleTask(task.id, task.completed)
                    }
                  />

                  <strong style={{ marginLeft: 10 }}>
                    {task.title}
                  </strong>

                  {task.subject && (
                    <span style={{ marginLeft: 10 }}>
                      ({task.subject})
                    </span>
                  )}
                </div>

                <button onClick={() => deleteTask(task.id)}>
                  Delete
                </button>
              </div>

              {task.notes && <p>{task.notes}</p>}
            </div>
          ))
        )}
      </div>
    </main>
  );
}