import { useState } from "react";
import { sortByDue } from "../../src/sort.js";
import TaskCard from "./TaskCard.jsx";

export default function Column({ status, tasks, onMove, onUpdate, onRemove }) {
  const [dragOver, setDragOver] = useState(false);

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const id = Number(e.dataTransfer.getData("text/task-id"));
    // TODO: ignore drops of a card onto the column it already lives in
    // TODO: keyboard alternative for accessibility
    onMove(id, status);
  }

  return (
    <section
      className={`column${dragOver ? " drag-over" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <h2>
        {status} <span className="count">{tasks.length}</span>
      </h2>
      <ul>
        {sortByDue(tasks).map((t) => (
          <TaskCard key={t.id} task={t} onMove={onMove} onUpdate={onUpdate} onRemove={onRemove} />
        ))}
        {tasks.length === 0 && <li className="empty">Nothing here</li>}
      </ul>
    </section>
  );
}
