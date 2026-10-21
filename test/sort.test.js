import { test } from "node:test";
import assert from "node:assert/strict";
import { sortByDue, sortByTitle, groupByStatus } from "../src/sort.js";

const tasks = [
  { id: 1, title: "banana", due: null, status: "backlog" },
  { id: 2, title: "Apple", due: "2030-02-01T00:00:00Z", status: "done" },
  { id: 3, title: "cherry", due: "2030-01-01T00:00:00Z", status: "backlog" },
];

test("sortByDue puts earliest first and undated last, without mutating", () => {
  assert.deepEqual(sortByDue(tasks).map((t) => t.id), [3, 2, 1]);
  assert.equal(tasks[0].id, 1);
});

test("sortByTitle is case-insensitive", () => {
  assert.deepEqual(sortByTitle(tasks).map((t) => t.title), ["Apple", "banana", "cherry"]);
});

test("groupByStatus buckets tasks", () => {
  const groups = groupByStatus(tasks);
  assert.deepEqual(groups.backlog.map((t) => t.id), [1, 3]);
  assert.deepEqual(groups.done.map((t) => t.id), [2]);
});
