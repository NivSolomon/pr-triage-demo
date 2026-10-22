import { test } from "node:test";
import assert from "node:assert/strict";
import { nextDue, spawnNext } from "../src/recurrence.js";
import { TaskStore } from "../src/store.js";

test("daily and weekly add a fixed number of days", () => {
  assert.equal(nextDue("2030-01-31T09:00:00.000Z", "daily"), "2030-02-01T09:00:00.000Z");
  assert.equal(nextDue("2030-01-31T09:00:00.000Z", "weekly"), "2030-02-07T09:00:00.000Z");
});

test("monthly keeps the day of month and the time of day", () => {
  assert.equal(nextDue("2030-03-15T18:30:00.000Z", "monthly"), "2030-04-15T18:30:00.000Z");
});

test("monthly clamps to the end of shorter months", () => {
  assert.equal(nextDue("2030-01-31T00:00:00.000Z", "monthly"), "2030-02-28T00:00:00.000Z");
  assert.equal(nextDue("2032-01-31T00:00:00.000Z", "monthly"), "2032-02-29T00:00:00.000Z"); // leap year
  assert.equal(nextDue("2030-08-31T00:00:00.000Z", "monthly"), "2030-09-30T00:00:00.000Z");
});

test("monthly rolls over the year boundary", () => {
  assert.equal(nextDue("2030-12-20T00:00:00.000Z", "monthly"), "2031-01-20T00:00:00.000Z");
});

test("nextDue rejects unknown repeats and bad dates; 'none' has no next date", () => {
  assert.equal(nextDue("2030-01-01T00:00:00.000Z", "none"), null);
  assert.throws(() => nextDue("2030-01-01T00:00:00.000Z", "yearly"), /unknown repeat/);
  assert.throws(() => nextDue("not a date", "daily"), /invalid due date/);
});

test("spawnNext returns null for one-off tasks", () => {
  assert.equal(spawnNext({ title: "a", due: null, repeat: "none" }), null);
  assert.equal(spawnNext({ title: "a", due: null }), null);
});

test("spawnNext builds a backlog task with the same title and rule", () => {
  const next = spawnNext({ title: "water plants", due: "2030-01-01T00:00:00.000Z", repeat: "weekly", status: "done" });
  assert.deepEqual(next, {
    title: "water plants",
    due: "2030-01-08T00:00:00.000Z",
    repeat: "weekly",
    status: "backlog",
  });
});

test("completing a recurring task schedules the next occurrence", () => {
  const store = new TaskStore();
  const task = store.add({ title: "standup notes", due: "2030-01-01T00:00:00.000Z", repeat: "daily" });
  store.move(task.id, "done");
  const all = store.all();
  assert.equal(all.length, 2);
  assert.equal(all[1].due, "2030-01-02T00:00:00.000Z");
  assert.equal(all[1].status, "backlog");
});

test("moving a done task to done again does not spawn a duplicate", () => {
  const store = new TaskStore();
  const task = store.add({ title: "a", due: "2030-01-01T00:00:00.000Z", repeat: "daily" });
  store.move(task.id, "done");
  store.move(task.id, "done");
  assert.equal(store.all().length, 2);
});

test("completing a one-off task spawns nothing", () => {
  const store = new TaskStore();
  const task = store.add({ title: "a", due: "2030-01-01T00:00:00.000Z" });
  store.move(task.id, "done");
  assert.equal(store.all().length, 1);
});

test("a recurring task needs a due date and a known repeat", () => {
  const store = new TaskStore();
  assert.throws(() => store.add({ title: "a", repeat: "daily" }), /need a due date/);
  assert.throws(() => store.add({ title: "a", due: "2030-01-01T00:00:00.000Z", repeat: "hourly" }), /unknown repeat/);
  assert.equal(store.all().length, 0);
});

test("the spawned task gets a fresh id and the original keeps its own", () => {
  const store = new TaskStore();
  const task = store.add({ title: "a", due: "2030-01-01T00:00:00.000Z", repeat: "weekly" });
  store.move(task.id, "done");
  assert.deepEqual(store.all().map((t) => t.id), [1, 2]);
});
