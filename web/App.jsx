import { STATUSES } from "../src/store.js";
import { groupByStatus } from "../src/sort.js";
import { useTaskStore } from "./useTaskStore.js";
import TaskForm from "./components/TaskForm.jsx";
import StatsBar from "./components/StatsBar.jsx";
import Column from "./components/Column.jsx";
import UndoRedo from "./components/UndoRedo.jsx";

export default function App() {
  const { tasks, addTask, moveTask, updateTask, removeTask, undo, redo, canUndo, canRedo } = useTaskStore();
  const groups = groupByStatus(tasks);

  return (
    <main className="app">
      <header>
        <h1>Task Board</h1>
        <StatsBar tasks={tasks} />
        <UndoRedo canUndo={canUndo} canRedo={canRedo} onUndo={undo} onRedo={redo} />
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
