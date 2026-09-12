export default function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li className={`todo-item ${todo.is_done ? "done" : ""}`}>
      <button
        className="check"
        onClick={() => onToggle(todo.id, !todo.is_done)}
        aria-label={todo.is_done ? "Kaam ko wapis khol dein" : "Kaam pura mark karein"}
      >
        {todo.is_done ? "✓" : ""}
      </button>
      <span className="title">{todo.title}</span>
      <button className="delete" onClick={() => onDelete(todo.id)} aria-label="Kaam hatayein">
        ✕
      </button>
    </li>
  );
}
