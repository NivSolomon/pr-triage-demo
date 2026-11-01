import { test } from "node:test";
import assert from "node:assert/strict";
import { createTask, isOverdue, listByStatus, listOverdue, DEFAULT_STATUS } from "../src/tasks.js";
import { formatTask } from "../src/format.js";

test("createTask trims the title and applies the default status", () => {
  const t = createTask({ id: 1, title: "  write docs  " });
  assert.equal(t.title, "write docs");
  assert.equal(t.status, DEFAULT_STATUS);
});

test("createTask rejects an empty title", () => {
  assert.throws(() => createTask({ id: 1, title: "   " }), /title is required/);
});

test("a task due in the past is overdue", () => {
  const t = createTask({ id: 1, title: "a", due: "2020-01-01T00:00:00Z" });
  assert.equal(isOverdue(t, new Date("2020-01-02T00:00:00Z")), true);
});

test("a task due exactly now is not overdue", () => {
  const now = new Date("2020-01-02T00:00:00Z");
  const t = createTask({ id: 1, title: "a", due: now.toISOString() });
  assert.equal(isOverdue(t, now), false);
});

test("a done task is never overdue", () => {
  const t = createTask({ id: 1, title: "a", due: "2020-01-01T00:00:00Z", status: "done" });
  assert.equal(isOverdue(t, new Date("2021-01-01T00:00:00Z")), false);
});

test("listByStatus filters", () => {
  const tasks = [
    createTask({ id: 1, title: "a" }),
    createTask({ id: 2, title: "b", status: "done" }),
  ];
  assert.deepEqual(listByStatus(tasks, "done").map((t) => t.id), [2]);
});

test("listOverdue returns only open tasks that are already late", () => {
  const now = new Date("2020-01-02T00:00:00Z");
  const tasks = [
    createTask({ id: 1, title: "late", due: "2020-01-01T00:00:00Z" }),
    createTask({ id: 2, title: "today", due: now.toISOString() }),
    createTask({ id: 3, title: "done late", due: "2020-01-01T00:00:00Z", status: "done" }),
    createTask({ id: 4, title: "no due" }),
  ];
  assert.deepEqual(listOverdue(tasks, now).map((t) => t.id), [1]);
});

test("formatTask shows status, title and due date", () => {
  const t = createTask({ id: 1, title: "ship", due: "2030-05-06T10:00:00Z" });
  assert.equal(formatTask(t), `[${DEFAULT_STATUS}] ship (due 2030-05-06)`);
});
