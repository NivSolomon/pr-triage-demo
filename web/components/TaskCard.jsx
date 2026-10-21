import { isOverdue } from "../../src/tasks.js";
import { STATUSES } from "../../src/store.js";

export default function TaskCard({ task, onMove, onRemove }) {
  const overdue = isOverdue(task);
  return (
    <li className={`card${overdue ? " overdue" : ""}`}>
      <div className="card-title">{task.title}</div>
      {task.due && (
        <div className="card-due">
          {overdue ? "Overdue: " : "Due "}
          {task.due.slice(0, 10)}
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
        <button className="link" onClick={() => onRemove(task.id)} aria-label={`Delete ${task.title}`}>
          Delete
        </button>
      </div>
    </li>
  );
}
