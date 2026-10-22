import { useCallback, useRef, useState } from "react";
import { TaskStore } from "../src/store.js";
import { History } from "../src/history.js";

const STORAGE_KEY = "task-board";

function load() {
  try {
    return new TaskStore(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"));
  } catch {
    return new TaskStore();
  }
}

const copy = (tasks) => tasks.map((t) => ({ ...t, tags: t.tags ? [...t.tags] : t.tags }));

/**
 * React wrapper around the plain TaskStore from src/store.js.
 * Returns a snapshot of the tasks plus actions that mutate the store,
 * persist to localStorage, and re-render. Actions throw on invalid input.
 * Every successful change can be undone / redone.
 */
export function useTaskStore() {
  const storeRef = useRef(null);
  const historyRef = useRef(null);
  if (storeRef.current === null) storeRef.current = load();
  if (historyRef.current === null) historyRef.current = new History();

  const [tasks, setTasks] = useState(() => copy(storeRef.current.all()));

  const publish = useCallback(() => {
    const next = copy(storeRef.current.all());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setTasks(next);
  }, []);

  const commit = useCallback(
    (fn) => {
      const before = copy(storeRef.current.all());
      const result = fn(storeRef.current);
      // Only reached when `fn` did not throw, so failed actions never create an undo step.
      historyRef.current.push(before);
      publish();
      return result;
    },
    [publish],
  );

  const travel = useCallback(
    (direction) => {
      const current = copy(storeRef.current.all());
      const target = historyRef.current[direction](current);
      if (!target) return;
      storeRef.current = new TaskStore(target);
      publish();
    },
    [publish],
  );

  return {
    tasks,
    addTask: (input) => commit((s) => s.add(input)),
    moveTask: (id, status) => commit((s) => s.move(id, status)),
    updateTask: (id, changes) => commit((s) => s.update(id, changes)),
    removeTask: (id) => commit((s) => s.remove(id)),
    undo: () => travel("undo"),
    redo: () => travel("redo"),
    canUndo: historyRef.current.canUndo,
    canRedo: historyRef.current.canRedo,
  };
}
