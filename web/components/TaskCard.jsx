import { isOverdue } from "../../src/tasks.js";
import StatusSelect from "./StatusSelect.jsx";

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
        <StatusSelect value={task.status} onChange={(status) => onMove(task.id, status)} />
        <button className="link" onClick={() => onRemove(task.id)} aria-label={`Delete ${task.title}`}>
          Delete
        </button>
      </div>
    </li>
  );
}
