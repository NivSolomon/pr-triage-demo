import { useState } from "react";

export default function TaskForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    try {
      onAdd({ title, due: due ? new Date(due).toISOString() : null });
      setTitle("");
      setDue("");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="What needs doing?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-label="Task title"
      />
      <input type="date" value={due} onChange={(e) => setDue(e.target.value)} aria-label="Due date" />
      <button type="submit">Add task</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
