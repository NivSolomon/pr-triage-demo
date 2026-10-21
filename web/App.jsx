import { useState } from "react";
import { STATUSES } from "../src/store.js";
import { groupByStatus } from "../src/sort.js";
import { filterByTag } from "../src/tags.js";
import { useTaskStore } from "./useTaskStore.js";
import TaskForm from "./components/TaskForm.jsx";
import StatsBar from "./components/StatsBar.jsx";
import TagFilter from "./components/TagFilter.jsx";
import Column from "./components/Column.jsx";

export default function App() {
  const { tasks, addTask, moveTask, updateTask, removeTask } = useTaskStore();
  const [activeTag, setActiveTag] = useState("");
  // If the last task carrying the active tag is deleted, fall back to showing everything.
  const tag = tasks.some((t) => (t.tags ?? []).includes(activeTag)) ? activeTag : "";
  const groups = groupByStatus(filterByTag(tasks, tag));

  return (
    <main className="app">
      <header>
        <h1>Task Board</h1>
        <StatsBar tasks={tasks} />
      </header>
      <TaskForm onAdd={addTask} />
      <TagFilter tasks={tasks} active={tag} onChange={setActiveTag} />
      <div className="board">
        {STATUSES.map((status) => (
          <Column
            key={status}
            status={status}
            tasks={groups[status] ?? []}
            onMove={moveTask}
            onUpdate={updateTask}
            onRemove={removeTask}
          />
        ))}
      </div>
    </main>
  );
}
