import { summarize } from "../../src/stats.js";

export default function StatsBar({ tasks }) {
  const s = summarize(tasks);
  return (
    <div className="stats">
      <span>Total <strong>{s.total}</strong></span>
      <span>Overdue <strong className={s.overdue ? "danger" : ""}>{s.overdue}</strong></span>
      <span>Done <strong>{Math.round(s.completionRate * 100)}%</strong></span>
    </div>
  );
}
