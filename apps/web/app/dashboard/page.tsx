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
  priority?: "low" | "medium" | "high" | string;
  notes?: string | null;
};

type Filter = "all" | "open" | "done" | "today" | "week" | "overdue";
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

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("newest");

  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");

  const [editing, setEditing] = useState<Task | null>(null);
  const [eTitle, setETitle] = useState("");
  const [eSubject, setESubject] = useState("");
  const [eDueDate, setEDueDate] = useState("");
  const [ePriority, setEPriority] = useState<"low" | "medium" | "high">("medium");
  const [eNotes, setENotes] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const isDark = theme === "dark";

  const pageStyle: React.CSSProperties = {
    maxWidth: 760,
    margin: "40px auto",
    padding: 16,
    minHeight: "100vh",
    background: isDark ? "black" : "#f7f7f7",
    color: isDark ? "white" : "black",
  };

  const inputStyle: React.CSSProperties = {
    padding: 10,
    border: isDark ? "1px solid #333" : "1px solid #ddd",
    borderRadius: 10,
    background: isDark ? "#0b0b0b" : "white",
    color: isDark ? "white" : "black",
  };

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Guten Morgen";
    if (hour < 18) return "Guten Tag";
    return "Guten Abend";
  }

  function logout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
  }

  async function loadData() {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setError(null);

      const userData = await apiFetch<User>("/me");
      const tasksData = await apiFetch<any>("/tasks");

      const tasksList: Task[] = Array.isArray(tasksData)
        ? tasksData
        : (tasksData?.tasks ?? tasksData?.data ?? []);

      setUser(userData);
      setTasks(tasksList);
    } catch (err: any) {
      setError(err.message || "Dashboard konnte nicht geladen werden");
      localStorage.removeItem("token");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && editing && !savingEdit) {
        closeEdit();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editing, savingEdit]);

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = title.trim();
    if (!trimmed) return;

    setCreating(true);
    try {
      const created = await apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: trimmed,
          subject: subject.trim() || null,
          dueDate: dueDate || null,
          priority,
          notes: notes.trim() || null,
        }),
      });

      const newTask: Task = created?.task ?? created;
      setTasks((prev) => [newTask, ...prev]);

      setTitle("");
      setSubject("");
      setDueDate("");
      setPriority("medium");
      setNotes("");
    } catch (err: any) {
      setError(err.message || "Task erstellen fehlgeschlagen");
    } finally {
      setCreating(false);
    }
  }

  async function toggleTask(taskId: string, current: boolean) {
    setError(null);

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !current } : t))
    );

    try {
      await apiFetch(`/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ completed: !current }),
      });
    } catch (err: any) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: current } : t))
      );
      setError(err.message || "Toggle fehlgeschlagen");
    }
  }

  async function deleteTask(taskId: string) {
    setError(null);

    const old = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      await apiFetch(`/tasks/${taskId}`, { method: "DELETE" });
    } catch (err: any) {
      setTasks(old);
      setError(err.message || "Löschen fehlgeschlagen");
    }
  }

  function isoToInputDate(isoOrNull?: string | null) {
    if (!isoOrNull) return "";
    const d = new Date(isoOrNull);
    if (Number.isNaN(d.getTime())) return "";
    const yyyy = String(d.getFullYear());
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function formatDueDate(isoOrNull?: string | null) {
    if (!isoOrNull) return null;
    const d = new Date(isoOrNull);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString();
  }

  function startOfDay(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function isSameDay(a: Date, b: Date) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function isInNext7Days(date: Date) {
    const today = startOfDay(new Date());
    const in7 = new Date(today);
    in7.setDate(in7.getDate() + 7);
    return date >= today && date <= in7;
  }

  const subjects = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.subject) set.add(t.subject);
    });
    return Array.from(set);
  }, [tasks]);

  const upcoming = useMemo(() => {
    const today = startOfDay(new Date());

    const toDate = (t: Task) => {
      if (!t.dueDate) return null;
      const d = new Date(t.dueDate);
      if (Number.isNaN(d.getTime())) return null;
      return startOfDay(d);
    };

    const notDone = tasks.filter((t) => !t.completed);

    const overdue = notDone
      .filter((t) => {
        const d = toDate(t);
        return d ? d < today : false;
      })
      .sort((a, b) => toDate(a)!.getTime() - toDate(b)!.getTime());

    const todayList = notDone
      .filter((t) => {
        const d = toDate(t);
        return d ? isSameDay(d, today) : false;
      })
      .sort((a, b) => toDate(a)!.getTime() - toDate(b)!.getTime());

    const week = notDone
      .filter((t) => {
        const d = toDate(t);
        return d ? isInNext7Days(d) && !isSameDay(d, today) : false;
      })
      .sort((a, b) => toDate(a)!.getTime() - toDate(b)!.getTime());

    const later = notDone
      .filter((t) => {
        const d = toDate(t);
        if (!d) return false;
        const in7 = new Date(today);
        in7.setDate(in7.getDate() + 7);
        return d > in7;
      })
      .sort((a, b) => toDate(a)!.getTime() - toDate(b)!.getTime());

    const noDate = notDone.filter((t) => !toDate(t));

    return { overdue, todayList, week, later, noDate };
  }, [tasks]);

  const filteredSortedTasks = useMemo(() => {
    let list = [...tasks];

    if (filter === "open") list = list.filter((t) => !t.completed);
    if (filter === "done") list = list.filter((t) => t.completed);

    if (filter === "today") {
      const today = startOfDay(new Date());
      list = list.filter((t) => {
        if (!t.dueDate) return false;
        const d = startOfDay(new Date(t.dueDate));
        return isSameDay(d, today);
      });
    }

    if (filter === "week") {
      list = list.filter((t) => {
        if (!t.dueDate) return false;
        const d = startOfDay(new Date(t.dueDate));
        return isInNext7Days(d);
      });
    }

    if (filter === "overdue") {
      const today = startOfDay(new Date());
      list = list.filter((t) => {
        if (!t.dueDate) return false;
        const d = startOfDay(new Date(t.dueDate));
        return d < today && !t.completed;
      });
    }

    if (search.trim()) {
      const q = search.toLowerCase();

      list = list.filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.subject?.toLowerCase().includes(q) ||
          t.notes?.toLowerCase().includes(q)
      );
    }

    if (subjectFilter !== "all") {
      list = list.filter((t) => t.subject === subjectFilter);
    }

    if (sort === "title") {
      list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sort === "oldest") {
      list.reverse();
    }

    return list;
  }, [tasks, filter, sort, search, subjectFilter]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.completed).length;
    const open = total - done;
    return { total, done, open };
  }, [tasks]);

  function openEdit(task: Task) {
    setEditing(task);
    setETitle(task.title || "");
    setESubject(task.subject || "");
    setEDueDate(isoToInputDate(task.dueDate));
    setEPriority(
      (task.priority === "low" || task.priority === "high" ? task.priority : "medium") as
        | "low"
        | "medium"
        | "high"
    );
    setENotes(task.notes || "");
  }

  function closeEdit() {
    setEditing(null);
    setSavingEdit(false);
  }

  async function saveEdit() {
    if (!editing) return;

    setSavingEdit(true);
    setError(null);

    const trimmed = eTitle.trim();
    if (!trimmed) {
      setSavingEdit(false);
      setError("Titel darf nicht leer sein");
      return;
    }

    const old = tasks;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === editing.id
          ? {
              ...t,
              title: trimmed,
              subject: eSubject.trim() || null,
              dueDate: eDueDate || null,
              priority: ePriority,
              notes: eNotes.trim() || null,
            }
          : t
      )
    );

    try {
      const updated = await apiFetch(`/tasks/${editing.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: trimmed,
          subject: eSubject.trim() || null,
          dueDate: eDueDate || null,
          priority: ePriority,
          notes: eNotes.trim() || null,
        }),
      });

      const updatedTask: Task = updated?.task ?? updated;
      setTasks((prev) =>
        prev.map((t) => (t.id === editing.id ? { ...t, ...updatedTask } : t))
      );

      closeEdit();
    } catch (err: any) {
      setTasks(old);
      setSavingEdit(false);
      setError(err.message || "Speichern fehlgeschlagen");
    }
  }

  if (loading) {
    return <p style={{ padding: 20, color: isDark ? "white" : "black" }}>Lade Dashboard...</p>;
  }

  return (
    <main style={pageStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: isDark ? "white" : "black" }}>
            {getGreeting()} {user?.name || "Lernender"} 👋
          </h1>
          <p style={{ marginTop: 6, opacity: 0.7, color: isDark ? "white" : "#444" }}>
            {user?.email}
          </p>

          <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Badge label={`Total: ${stats.total}`} theme={theme} />
            <Badge label={`Offen: ${stats.open}`} theme={theme} />
            <Badge label={`Erledigt: ${stats.done}`} theme={theme} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={toggleTheme}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: isDark ? "1px solid #333" : "1px solid #ddd",
              background: isDark ? "#111" : "white",
              color: isDark ? "white" : "black",
              cursor: "pointer",
              fontWeight: 800,
              height: 40,
            }}
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>

          <button
            onClick={logout}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: isDark ? "1px solid #333" : "1px solid #ddd",
              background: isDark ? "#111" : "white",
              color: isDark ? "white" : "black",
              cursor: "pointer",
              fontWeight: 800,
              height: 40,
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <h2 style={{ fontWeight: 900, color: isDark ? "white" : "black", marginBottom: 10 }}>
          Upcoming
        </h2>

        <UpcomingSection title="Überfällig" tone="high" tasks={upcoming.overdue} onOpen={openEdit} theme={theme} />
        <UpcomingSection title="Heute" tone="medium" tasks={upcoming.todayList} onOpen={openEdit} theme={theme} />
        <UpcomingSection title="Diese Woche" tone="low" tasks={upcoming.week} onOpen={openEdit} theme={theme} />
        <UpcomingSection title="Später" tone="neutral" tasks={upcoming.later} onOpen={openEdit} theme={theme} />
        <UpcomingSection title="Ohne Datum" tone="neutral" tasks={upcoming.noDate} onOpen={openEdit} theme={theme} />
      </div>

      <hr style={{ margin: "24px 0", borderColor: isDark ? "#222" : "#ddd" }} />

      <h2 style={{ marginBottom: 10, fontWeight: 900, color: isDark ? "white" : "black" }}>
        Neue Study Task
      </h2>

      <form onSubmit={createTask} style={{ display: "grid", gap: 10 }}>
        <input
          placeholder="Titel (z.B. Kapitel 3 lernen)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Fach (z.B. Mathe)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={inputStyle}
        />

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            style={inputStyle}
          />

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            style={inputStyle}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <textarea
          placeholder="Notizen (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          style={inputStyle}
        />

        <button
          disabled={creating}
          style={{
            padding: 12,
            borderRadius: 12,
            border: isDark ? "1px solid #333" : "1px solid #ddd",
            background: creating ? (isDark ? "#111" : "#eee") : isDark ? "white" : "black",
            color: creating ? "#888" : isDark ? "black" : "white",
            cursor: creating ? "not-allowed" : "pointer",
            fontWeight: 900,
          }}
        >
          {creating ? "..." : "Add Task"}
        </button>
      </form>

      <input
        placeholder="🔍 Suche Tasks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          ...inputStyle,
          width: "100%",
          marginTop: 16,
        }}
      />

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
        <Chip
          label="Alle Fächer"
          active={subjectFilter === "all"}
          onClick={() => setSubjectFilter("all")}
          theme={theme}
        />

        {subjects.map((s) => (
          <Chip
            key={s}
            label={s}
            active={subjectFilter === s}
            onClick={() => setSubjectFilter(s)}
            theme={theme}
          />
        ))}
      </div>

      <div
        style={{
          marginTop: 14,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Chip active={filter === "all"} onClick={() => setFilter("all")} label="Alle" theme={theme} />
          <Chip active={filter === "open"} onClick={() => setFilter("open")} label="Offen" theme={theme} />
          <Chip active={filter === "done"} onClick={() => setFilter("done")} label="Erledigt" theme={theme} />
          <Chip active={filter === "today"} onClick={() => setFilter("today")} label="Heute" theme={theme} />
          <Chip active={filter === "week"} onClick={() => setFilter("week")} label="Diese Woche" theme={theme} />
          <Chip active={filter === "overdue"} onClick={() => setFilter("overdue")} label="Überfällig" theme={theme} />
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", color: isDark ? "white" : "black" }}>
          <span style={{ opacity: 0.7, fontSize: 14 }}>Sort:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            style={{ ...inputStyle, padding: "8px 10px" }}
          >
            <option value="newest">Neueste</option>
            <option value="oldest">Älteste</option>
            <option value="title">Titel A-Z</option>
          </select>
        </div>
      </div>

      {error && (
        <div
          style={{
            marginTop: 12,
            background: isDark ? "#1b0707" : "#ffe5e5",
            border: "1px solid #6b1a1a",
            padding: 10,
            borderRadius: 12,
            color: "#FF7A7A",
            fontWeight: 800,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
        {filteredSortedTasks.length === 0 ? (
          <div
            style={{
              border: isDark ? "1px solid #222" : "1px solid #ddd",
              background: isDark ? "#0b0b0b" : "white",
              borderRadius: 14,
              padding: 18,
              color: isDark ? "#bbb" : "#666",
              textAlign: "center",
            }}
          >
            Keine Tasks gefunden.
          </div>
        ) : (
          filteredSortedTasks.map((task) => {
            const due = formatDueDate(task.dueDate);
            const tone =
              String(task.priority) === "low"
                ? "low"
                : String(task.priority) === "high"
                ? "high"
                : "medium";

            return (
              <div
                key={task.id}
                style={{
                  padding: 12,
                  border: isDark ? "1px solid #333" : "1px solid #ddd",
                  borderRadius: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  background: isDark ? "#0b0b0b" : "white",
                  color: isDark ? "white" : "black",
                }}
              >
                <div style={{ display: "grid", gap: 6 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id, task.completed)}
                    />
                    <button
                      type="button"
                      onClick={() => openEdit(task)}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: isDark ? "white" : "black",
                        fontWeight: 900,
                        padding: 0,
                        cursor: "pointer",
                        textAlign: "left",
                        textDecoration: "underline",
                        opacity: task.completed ? 0.6 : 1,
                      }}
                      title="Bearbeiten"
                    >
                      {task.title}
                    </button>
                  </label>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {task.subject && <Badge label={`Fach: ${task.subject}`} theme={theme} />}
                    {task.priority && (
                      <Badge label={`Prio: ${String(task.priority)}`} tone={tone as any} theme={theme} />
                    )}
                    {due && <Badge label={`Fällig: ${due}`} theme={theme} />}
                  </div>

                  {task.notes && (
                    <div style={{ color: isDark ? "#ddd" : "#444", fontSize: 14 }}>
                      {task.notes}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => openEdit(task)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 10,
                      border: isDark ? "1px solid #333" : "1px solid #ddd",
                      background: isDark ? "#111" : "white",
                      color: isDark ? "white" : "black",
                      cursor: "pointer",
                      fontWeight: 900,
                      height: 38,
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 10,
                      border: isDark ? "1px solid #333" : "1px solid #ddd",
                      background: isDark ? "#1a1a1a" : "#fff5f5",
                      color: "#ff4d4d",
                      cursor: "pointer",
                      fontWeight: 900,
                      height: 38,
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {editing && (
        <div
          onClick={() => {
            if (!savingEdit) closeEdit();
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "grid",
            placeItems: "center",
            padding: 16,
            zIndex: 50,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(620px, 100%)",
              background: isDark ? "#0b0b0b" : "white",
              border: isDark ? "1px solid #333" : "1px solid #ddd",
              borderRadius: 16,
              padding: 16,
              color: isDark ? "white" : "black",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>Task bearbeiten</h3>
                <p style={{ marginTop: 6, opacity: 0.7 }}>Änderungen werden gespeichert</p>
              </div>

              <button
                onClick={closeEdit}
                disabled={savingEdit}
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: isDark ? "1px solid #333" : "1px solid #ddd",
                  background: isDark ? "#111" : "white",
                  color: isDark ? "white" : "black",
                  cursor: savingEdit ? "not-allowed" : "pointer",
                  fontWeight: 900,
                  height: 38,
                  opacity: savingEdit ? 0.7 : 1,
                }}
              >
                Close
              </button>
            </div>

            <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
              <input value={eTitle} onChange={(e) => setETitle(e.target.value)} placeholder="Titel" style={inputStyle} />
              <input value={eSubject} onChange={(e) => setESubject(e.target.value)} placeholder="Fach" style={inputStyle} />

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <input
                  type="date"
                  value={eDueDate}
                  onChange={(e) => setEDueDate(e.target.value)}
                  style={inputStyle}
                />
                <select
                  value={ePriority}
                  onChange={(e) => setEPriority(e.target.value as any)}
                  style={inputStyle}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <textarea
                value={eNotes}
                onChange={(e) => setENotes(e.target.value)}
                placeholder="Notizen"
                rows={4}
                style={inputStyle}
              />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  onClick={closeEdit}
                  disabled={savingEdit}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: isDark ? "1px solid #333" : "1px solid #ddd",
                    background: isDark ? "#111" : "white",
                    color: isDark ? "white" : "black",
                    cursor: savingEdit ? "not-allowed" : "pointer",
                    opacity: savingEdit ? 0.7 : 1,
                    fontWeight: 900,
                  }}
                >
                  Cancel
                </button>

                <button
                  onClick={saveEdit}
                  disabled={savingEdit}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: isDark ? "1px solid #333" : "1px solid #ddd",
                    background: isDark ? "white" : "black",
                    color: isDark ? "black" : "white",
                    cursor: savingEdit ? "not-allowed" : "pointer",
                    opacity: savingEdit ? 0.7 : 1,
                    fontWeight: 900,
                  }}
                >
                  {savingEdit ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function UpcomingSection({
  title,
  tasks,
  tone,
  onOpen,
  theme,
}: {
  title: string;
  tasks: Task[];
  tone: "neutral" | "low" | "medium" | "high";
  onOpen: (t: Task) => void;
  theme: "dark" | "light";
}) {
  const isDark = theme === "dark";

  if (tasks.length === 0) return null;

  return (
    <div
      style={{
        border: isDark ? "1px solid #222" : "1px solid #ddd",
        background: isDark ? "#0b0b0b" : "white",
        borderRadius: 14,
        padding: 12,
        marginBottom: 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <h3 style={{ margin: 0, fontWeight: 900, color: isDark ? "white" : "black" }}>{title}</h3>
        <Badge label={`${tasks.length}`} tone={tone} theme={theme} />
      </div>

      <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
        {tasks.slice(0, 5).map((t) => (
          <button
            key={t.id}
            onClick={() => onOpen(t)}
            style={{
              border: isDark ? "1px solid #333" : "1px solid #ddd",
              background: isDark ? "#111" : "#fafafa",
              color: isDark ? "white" : "black",
              borderRadius: 12,
              padding: "10px 12px",
              textAlign: "left",
              cursor: "pointer",
              fontWeight: 800,
            }}
            type="button"
            title="Bearbeiten"
          >
            {t.title}
          </button>
        ))}
        {tasks.length > 5 && (
          <div style={{ opacity: 0.7, color: isDark ? "white" : "black" }}>
            +{tasks.length - 5} mehr…
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
  theme,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  theme: "dark" | "light";
}) {
  const isDark = theme === "dark";

  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 12px",
        borderRadius: 999,
        border: active
          ? "1px solid white"
          : isDark
          ? "1px solid #333"
          : "1px solid #ddd",
        background: active ? (isDark ? "white" : "black") : isDark ? "#111" : "white",
        color: active ? (isDark ? "black" : "white") : isDark ? "white" : "black",
        cursor: "pointer",
        fontWeight: 900,
        fontSize: 14,
      }}
      type="button"
    >
      {label}
    </button>
  );
}

function Badge({
  label,
  tone = "neutral",
  theme,
}: {
  label: string;
  tone?: "neutral" | "low" | "medium" | "high";
  theme: "dark" | "light";
}) {
  const isDark = theme === "dark";

  const toneStyle =
    tone === "low"
      ? { border: "1px solid #1f6f43", background: "#0f1f16", color: "#7CFFA6" }
      : tone === "medium"
      ? { border: "1px solid #6b5b1a", background: "#1b1607", color: "#FFD36A" }
      : tone === "high"
      ? { border: "1px solid #6b1a1a", background: "#1b0707", color: "#FF7A7A" }
      : {
          border: isDark ? "1px solid #333" : "1px solid #ddd",
          background: isDark ? "#111" : "white",
          color: isDark ? "white" : "black",
        };

  return (
    <span
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 900,
        ...toneStyle,
      }}
    >
      {label}
    </span>
  );
}