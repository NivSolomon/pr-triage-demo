import { useState } from "react";
import { isOverdue } from "../../src/tasks.js";
import { STATUSES } from "../../src/store.js";

export default function TaskCard({ task, onMove, onUpdate, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [due, setDue] = useState(task.due ? task.due.slice(0, 10) : "");
  const [tags, setTags] = useState((task.tags ?? []).join(", "));
  const [error, setError] = useState("");
  const overdue = isOverdue(task);

  function startEdit() {
    setTitle(task.title);
    setDue(task.due ? task.due.slice(0, 10) : "");
    setTags((task.tags ?? []).join(", "));
    setError("");
    setEditing(true);
  }

  function save(e) {
    e.preventDefault();
    try {
      onUpdate(task.id, { title, due: due ? new Date(due).toISOString() : null, tags });
      setEditing(false);
    } catch (err) {
      setError(err.message);
    }
  }

  if (editing) {
    return (
      <li className="card">
        <form className="edit-form" onSubmit={save}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Edit title" autoFocus />
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)} aria-label="Edit due date" />
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tags" aria-label="Edit tags" />
          {error && <p className="error">{error}</p>}
          <div className="card-actions">
            <button type="submit">Save</button>
            <button type="button" className="secondary" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className={`card${overdue ? " overdue" : ""}`}>
      <div className="card-title">{task.title}</div>
      {task.due && (
        <div className="card-due">
          {overdue ? "Overdue: " : "Due "}
          {task.due.slice(0, 10)}
        </div>
      )}
      {(task.tags ?? []).length > 0 && (
        <div className="card-tags">
          {task.tags.map((tag) => (
            <span key={tag} className="tag">
              #{tag}
            </span>
          ))}
        </div>
      )}
      <div className="card-actions">
        <select value={task.status} onChange={(e) => onMove(task.id, e.target.value)} aria-label="Status">
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span>
          <button className="link neutral" onClick={startEdit} aria-label={`Edit ${task.title}`}>
            Edit
          </button>
          <button className="link" onClick={() => onRemove(task.id)} aria-label={`Delete ${task.title}`}>
            Delete
          </button>
        </span>
      </div>
    </li>
  );
}
