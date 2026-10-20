export const DEFAULT_STATUS = "todo";

/** Create a task. `due` is an ISO date string or null. */
export function createTask({ id, title, due = null, status = DEFAULT_STATUS }) {
  if (!title || !title.trim()) throw new Error("title is required");
  return { id, title: title.trim(), due, status };
}

/** A task is overdue when its due date is strictly in the past and it is not done. */
export function isOverdue(task, now = new Date()) {
  if (!task.due || task.status === "done") return false;
  return new Date(task.due).getTime() < now.getTime();
}

export function listByStatus(tasks, status) {
  return tasks.filter((t) => t.status === status);
}
