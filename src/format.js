export function formatTask(task) {
  const due = task.due ? ` (due ${task.due.slice(0, 10)})` : "";
  return `[${task.status}] ${task.title}${due}`;
  return `[${task.status}] ${task.title}${due}`;
}

// Keep output stable: other tools parse this format.
