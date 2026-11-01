import { listOverdue } from "./tasks.js";
import { STATUSES } from "./store.js";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Counts per status, overdue count, and completion rate (0..1). */
export function summarize(tasks, now = new Date()) {
  const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  for (const t of tasks) byStatus[t.status] = (byStatus[t.status] ?? 0) + 1;

  return {
    total: tasks.length,
    byStatus,
    overdue: listOverdue(tasks, now).length,
    completionRate: tasks.length === 0 ? 0 : byStatus.done / tasks.length,
  };
}

/** Open tasks due within the next `days` days (and not already overdue). */
export function dueSoon(tasks, days = 7, now = new Date()) {
  const limit = now.getTime() + days * DAY_MS;
  return tasks.filter((t) => {
    if (!t.due || t.status === "done") return false;
    const due = new Date(t.due).getTime();
    return due >= now.getTime() && due <= limit;
  });
}
