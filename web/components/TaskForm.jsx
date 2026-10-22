import { useState } from "react";
import { REPEATS } from "../../src/recurrence.js";

export default function TaskForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [repeat, setRepeat] = useState("none");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    try {
      onAdd({ title, due: due ? new Date(due).toISOString() : null, repeat });
      setTitle("");
      setDue("");
      setRepeat("none");
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
      <select value={repeat} onChange={(e) => setRepeat(e.target.value)} aria-label="Repeat">
        {REPEATS.map((r) => (
          <option key={r} value={r}>
            {r === "none" ? "no repeat" : `repeats ${r}`}
          </option>
        ))}
      </select>
      <button type="submit">Add task</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
