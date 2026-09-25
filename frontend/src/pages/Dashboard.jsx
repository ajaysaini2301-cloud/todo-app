import { useEffect, useState } from "react";
import AddTodo from "../components/AddTodo.jsx";
import { useAuth } from "../context/AuthContext.jsx";

// const API_BASE = "https://todo-app-soyi.onrender.com/api";
const API_BASE = "http://localhost:5000/api";

export default function Dashboard() {
  const [todos, setTodos] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const { token, user, logout } = useAuth();

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const loadTodos = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/todos`, { headers: authHeaders });
      if (!res.ok) throw new Error("Kaam list load nahi ho payi");
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const addTodo = async (title) => {
    const res = await fetch(`${API_BASE}/todos`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error("Kaam add nahi ho paya");
    const newTodo = await res.json();
    setTodos((prev) => [newTodo, ...prev]);
  };

  const toggleTodo = async (id, is_done) => {
    const res = await fetch(`${API_BASE}/todos/${id}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ is_done }),
    });
    if (!res.ok) return;
    const updated = await res.json();
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const deleteTodo = async (id) => {
    const res = await fetch(`${API_BASE}/todos/${id}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    if (!res.ok) return;
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const doneCount = todos.filter((t) => t.is_done).length;
  const totalCount = todos.length;
  const pendingCount = totalCount - doneCount;
  const progressPct = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  const initials = (user?.name || "?")
    .trim()
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning!" : hour < 17 ? "Good Afternoon!" : "Good Evening!";

  const filteredTodos = todos.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  // --- decorative calendar (current month) ---
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const monthName = today.toLocaleString("default", { month: "long" });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarCells = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarCells.push({ day: daysInPrevMonth - i, faded: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({ day: d, faded: false, isToday: d === today.getDate() });
  }
  while (calendarCells.length % 7 !== 0) {
    calendarCells.push({ day: calendarCells.length - (firstDay + daysInMonth) + 1, faded: true });
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f5fb", fontFamily: "sans-serif", flexDirection: isMobile ? "column" : "row", position: "relative" }}>

      {/* Sidebar */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 40,
          }}
        />
      )}
      <aside
        style={{
          width: 260,
          background: "#f9f9fd",
          borderRight: "1px solid #ececf5",
          padding: "24px 16px",
          display: "flex",
          flexDirection: "column",
          ...(isMobile
            ? {
              position: "fixed",
              top: 0,
              left: sidebarOpen ? 0 : -280,
              height: "100vh",
              zIndex: 50,
              transition: "left 0.25s ease",
              boxShadow: sidebarOpen ? "2px 0 12px rgba(0,0,0,0.15)" : "none",
            }
            : {}),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32, padding: "0 8px" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "#4f46e5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
            }}
          >
            ✓
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 17 }}>TaskMate</p>
            <p style={{ margin: 0, fontSize: 11, color: "#9a9ab0" }}>Plan Today, Do More Tomorrow</p>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 24 }}>
          {[
            { label: "My Tasks", icon: "🏠", active: true },
            { label: "Today", icon: "📅" },
            { label: "Upcoming", icon: "🗓️" },
            { label: "Important", icon: "⭐" },
            { label: "Completed", icon: "✅" },
            { label: "Trash", icon: "🗑️" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: item.active ? 600 : 500,
                color: item.active ? "#4f46e5" : "#4b4b5a",
                background: item.active ? "#e8e7fc" : "transparent",
                cursor: "pointer",
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>

        <div style={{ marginBottom: "auto" }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#9a9ab0",
              textTransform: "uppercase",
              margin: "0 12px 8px",
            }}
          >
            Lists
          </p>
          {[
            { label: "Personal", color: "#3b82f6" },
            { label: "Work", color: "#22c55e" },
            { label: "Study", color: "#f59e0b" },
            { label: "Health", color: "#ec4899" },
            { label: "Shopping", color: "#8b5cf6" },
          ].map((list) => (
            <div
              key={list.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                fontSize: 14,
                color: "#4b4b5a",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: list.color,
                  display: "inline-block",
                }}
              />
              {list.label}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            fontSize: 14,
            color: "#4b4b5a",
            cursor: "pointer",
          }}
          onClick={logout}
        >
          <span>⚙️</span> Settings / Logout
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: isMobile ? "16px" : "24px 28px", display: "flex", flexDirection: "column", gap: 20, width: "100%", boxSizing: "border-box" }}>

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: isMobile ? "wrap" : "nowrap" }}>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                border: "1px solid #ececf5",
                background: "#fff",
                borderRadius: 10,
                width: 40,
                height: 40,
                fontSize: 18,
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              ☰
            </button>
          )}
          <div
            style={{
              flex: 1,
              minWidth: isMobile ? "60%" : "auto",
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#fff",
              border: "1px solid #ececf5",
              borderRadius: 12,
              padding: "10px 16px",
            }}
          >
            <span>🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              style={{ border: "none", outline: "none", flex: 1, fontSize: 14, background: "transparent" }}
            />
          </div>
          <span style={{ fontSize: 20 }}>☀️</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={logout}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#4f46e5",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              {initials}
            </div>
            {!isMobile && <span style={{ fontSize: 14, fontWeight: 600 }}>{user?.name || "User"}</span>}
            <span style={{ color: "#9a9ab0" }}>▾</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexDirection: isMobile ? "column" : "row", width: "100%" }}>

          {/* Left/center column */}
          <div style={{ flex: 1, minWidth: 0 }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>{greeting} 👋</h1>
                <p style={{ margin: "4px 0 0", color: "#9a9ab0", fontSize: 14 }}>Stay focused. Great things take time.</p>
              </div>
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <div style={{ marginBottom: 16 }}>
              <AddTodo onAdd={addTodo} />
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {["All", "Today", "Upcoming", "Important"].map((tab, i) => (
                <div
                  key={tab}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    background: i === 0 ? "#e8e7fc" : "transparent",
                    color: i === 0 ? "#4f46e5" : "#4b4b5a",
                  }}
                >
                  {tab}
                </div>
              ))}
            </div>

            {loading ? (
              <p style={{ color: "#9a9ab0" }}>Load ho raha hai...</p>
            ) : filteredTodos.length === 0 ? (
              <p style={{ color: "#9a9ab0" }}>Koi kaam nahi mila.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {filteredTodos.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      background: "#fff",
                      border: "1px solid #ececf5",
                      borderRadius: 14,
                      padding: "14px 18px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!t.is_done}
                      onChange={() => toggleTodo(t.id, !t.is_done)}
                      style={{ width: 18, height: 18, cursor: "pointer", flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          margin: 0,
                          fontWeight: 600,
                          fontSize: 15,
                          textDecoration: t.is_done ? "line-through" : "none",
                          color: t.is_done ? "#9a9ab0" : "#1a1a2e",
                        }}
                      >
                        {t.title}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteTodo(t.id)}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "#c4c4d4",
                        cursor: "pointer",
                        fontSize: 16,
                      }}
                      aria-label="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ width: isMobile ? "100%" : 300, display: "flex", flexDirection: "column", gap: 16, flexShrink: 0 }}>

            {/* Progress card */}
            <div style={{ background: "#fff", border: "1px solid #ececf5", borderRadius: 16, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: `conic-gradient(#4f46e5 ${progressPct * 3.6}deg, #e8e7fc 0deg)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: "50%",
                      background: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 15,
                    }}
                  >
                    {doneCount}/{totalCount}
                  </div>
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Today's Progress</p>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#9a9ab0" }}>Keep going! 💪</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <div style={{ flex: 1, background: "#eafbf0", borderRadius: 10, padding: "10px 12px" }}>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#16a34a" }}>{doneCount}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#4b4b5a" }}>Completed</p>
                </div>
                <div style={{ flex: 1, background: "#f1f1fb", borderRadius: 10, padding: "10px 12px" }}>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#4b4b5a" }}>{pendingCount}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#4b4b5a" }}>Remaining</p>
                </div>
              </div>
            </div>

            {/* Calendar card */}
            <div style={{ background: "#fff", border: "1px solid #ececf5", borderRadius: 16, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>
                  {monthName} {year}
                </p>
                <div style={{ display: "flex", gap: 8, color: "#9a9ab0" }}>
                  <span style={{ cursor: "pointer" }}>‹</span>
                  <span style={{ cursor: "pointer" }}>›</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, fontSize: 11, color: "#9a9ab0", textAlign: "center", marginBottom: 6 }}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, fontSize: 12, textAlign: "center" }}>
                {calendarCells.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "6px 0",
                      borderRadius: 8,
                      color: c.faded ? "#d0d0dd" : c.isToday ? "#fff" : "#4b4b5a",
                      background: c.isToday ? "#4f46e5" : "transparent",
                      fontWeight: c.isToday ? 700 : 400,
                    }}
                  >
                    {c.day}
                  </div>
                ))}
              </div>
            </div>

            {/* Motivation card */}
            <div
              style={{
                background: "linear-gradient(135deg, #ddd6fe, #e0e7ff)",
                borderRadius: 16,
                padding: 20,
                color: "#2e2a5e",
              }}
            >
              <p style={{ margin: 0, fontWeight: 700, fontSize: 16, lineHeight: 1.4 }}>
                Small steps every day lead to big results.
              </p>
              <p style={{ margin: "10px 0 0", fontSize: 13, opacity: 0.8 }}>You got this! 🚀</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}