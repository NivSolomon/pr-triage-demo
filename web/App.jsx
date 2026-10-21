import { STATUSES } from "../src/store.js";
import { groupByStatus } from "../src/sort.js";
import { useTaskStore } from "./useTaskStore.js";
import TaskForm from "./components/TaskForm.jsx";
import StatsBar from "./components/StatsBar.jsx";
import Column from "./components/Column.jsx";

export default function App() {
  const { tasks, addTask, moveTask, updateTask, removeTask } = useTaskStore();
  const groups = groupByStatus(tasks);

  return (
    <main className="app">
      <header>
        <h1>Task Board</h1>
        <StatsBar tasks={tasks} />
      </header>
      <TaskForm onAdd={addTask} />
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
