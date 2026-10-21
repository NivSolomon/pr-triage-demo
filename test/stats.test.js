import { test } from "node:test";
import assert from "node:assert/strict";
import { TaskStore } from "../src/store.js";
import { summarize, dueSoon } from "../src/stats.js";

const now = new Date("2030-01-10T00:00:00Z");

function sample() {
  const store = new TaskStore();
  store.add({ title: "late", due: "2030-01-01T00:00:00Z" });
  store.add({ title: "soon", due: "2030-01-12T00:00:00Z" });
  store.add({ title: "far", due: "2030-03-01T00:00:00Z" });
  store.add({ title: "finished", due: "2030-01-11T00:00:00Z", status: "done" });
  return store.all();
}

test("summarize counts statuses, overdue and completion", () => {
  const s = summarize(sample(), now);
  assert.equal(s.total, 4);
  assert.equal(s.byStatus.done, 1);
  assert.equal(s.overdue, 1);
  assert.equal(s.completionRate, 0.25);
});

test("summarize handles an empty list", () => {
  assert.equal(summarize([], now).completionRate, 0);
});

test("dueSoon returns open tasks inside the window only", () => {
  assert.deepEqual(dueSoon(sample(), 7, now).map((t) => t.title), ["soon"]);
});
