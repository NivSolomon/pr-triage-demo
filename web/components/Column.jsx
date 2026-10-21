import { sortByDue } from "../../src/sort.js";
import TaskCard from "./TaskCard.jsx";

export default function Column({ status, tasks, onMove, onRemove }) {
  return (
    <section className="column">
      <h2>
        {status} <span className="count">{tasks.length}</span>
      </h2>
      <ul>
        {sortByDue(tasks).map((t) => (
          <TaskCard key={t.id} task={t} onMove={onMove} onRemove={onRemove} />
        ))}
        {tasks.length === 0 && <li className="empty">Nothing here</li>}
      </ul>
    </section>
  );
}
