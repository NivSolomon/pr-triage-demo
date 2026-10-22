import { createTask } from "./tasks.js";
import { REPEATS, spawnNext } from "./recurrence.js";

export const STATUSES = ["backlog", "in-progress", "done"];

/** In-memory task collection with auto-incrementing ids. */
export class TaskStore {
  constructor(tasks = []) {
    this.tasks = [...tasks];
    this.nextId = tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1;
  }

  add({ title, due = null, status, repeat = "none" }) {
    const task = { ...createTask({ id: this.nextId, title, due, status }), repeat };
    if (!STATUSES.includes(task.status)) throw new Error(`unknown status: ${task.status}`);
    if (!REPEATS.includes(repeat)) throw new Error(`unknown repeat: ${repeat}`);
    if (repeat !== "none" && !due) throw new Error("recurring tasks need a due date");
    this.nextId += 1;
    this.tasks.push(task);
    return task;
  }

  get(id) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) throw new Error(`task ${id} not found`);
    return task;
  }

  update(id, changes) {
    const task = this.get(id);
    if (changes.title !== undefined) {
      if (!changes.title.trim()) throw new Error("title is required");
      task.title = changes.title.trim();
    }
    if (changes.due !== undefined) task.due = changes.due;
    if (changes.status !== undefined) this.move(id, changes.status);
    return task;
  }

  move(id, status) {
    if (!STATUSES.includes(status)) throw new Error(`unknown status: ${status}`);
    const task = this.get(id);
    const completing = status === "done" && task.status !== "done";
    task.status = status;
    // Completing a recurring task schedules its next occurrence.
    if (completing) {
      const next = spawnNext(task);
      if (next) this.add(next);
    }
    return task;
  }

  remove(id) {
    const task = this.get(id);
    this.tasks = this.tasks.filter((t) => t.id !== id);
    return task;
  }

  all() {
    return [...this.tasks];
  }
}
