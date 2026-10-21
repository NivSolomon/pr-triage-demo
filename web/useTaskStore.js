import { useCallback, useRef, useState } from "react";
import { TaskStore } from "../src/store.js";

const STORAGE_KEY = "task-board";

function load() {
  try {
    return new TaskStore(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"));
  } catch {
    return new TaskStore();
  }
}

/**
 * React wrapper around the plain TaskStore from src/store.js.
 * Returns a snapshot of the tasks plus actions that mutate the store,
 * persist to localStorage, and re-render. Actions throw on invalid input.
 */
export function useTaskStore() {
  const storeRef = useRef(null);
  if (storeRef.current === null) storeRef.current = load();

  const snapshot = () => storeRef.current.all().map((t) => ({ ...t }));
  const [tasks, setTasks] = useState(snapshot);

  const commit = useCallback((fn) => {
    const store = storeRef.current;
    const result = fn(store);
    const next = store.all().map((t) => ({ ...t }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setTasks(next);
    return result;
  }, []);

  return {
    tasks,
    addTask: (input) => commit((s) => s.add(input)),
    moveTask: (id, status) => commit((s) => s.move(id, status)),
    removeTask: (id) => commit((s) => s.remove(id)),
  };
}
