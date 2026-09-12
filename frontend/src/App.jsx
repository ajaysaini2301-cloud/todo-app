import { useEffect, useState } from "react";
import AddTodo from "./components/AddTodo.jsx";
import TodoList from "./components/TodoList.jsx";

const API_BASE = "http://localhost:5000/api";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTodos = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/todos`);
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error("Kaam add nahi ho paya");
    const newTodo = await res.json();
    setTodos((prev) => [newTodo, ...prev]);
  };

  const toggleTodo = async (id, is_done) => {
    const res = await fetch(`${API_BASE}/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_done }),
    });
    if (!res.ok) return;
    const updated = await res.json();
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const deleteTodo = async (id) => {
    const res = await fetch(`${API_BASE}/todos/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const doneCount = todos.filter((t) => t.is_done).length;

  return (
    <div className="page">
      <header className="header">
        <h1>Karne Ka Kaam</h1>
        <p className="tally">
          {todos.length === 0 ? "Abhi koi kaam nahi" : `${doneCount} / ${todos.length} pura hua`}
        </p>
      </header>

      <AddTodo onAdd={addTodo} />

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="hint">Load ho raha hai...</p>
      ) : (
        <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
      )}
    </div>
  );
}
