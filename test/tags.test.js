import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeTags, filterByTag, tagCounts, MAX_TAGS } from "../src/tags.js";
import { TaskStore } from "../src/store.js";

test("normalizeTags lower-cases, strips # and de-duplicates", () => {
  assert.deepEqual(normalizeTags("#Work, home  WORK urgent"), ["work", "home", "urgent"]);
});

test("normalizeTags accepts arrays and empty input", () => {
  assert.deepEqual(normalizeTags(["A", " b "]), ["a", "b"]);
  assert.deepEqual(normalizeTags(""), []);
  assert.deepEqual(normalizeTags(undefined), []);
});

test("normalizeTags rejects more than MAX_TAGS distinct tags", () => {
  const many = Array.from({ length: MAX_TAGS + 1 }, (_, i) => `t${i}`);
  assert.throws(() => normalizeTags(many), /at most/);
});

test("filterByTag tolerates tasks saved before tags existed", () => {
  const tasks = [
    { id: 1, title: "old", tags: undefined },
    { id: 2, title: "new", tags: ["work"] },
  ];
  assert.deepEqual(filterByTag(tasks, "work").map((t) => t.id), [2]);
  assert.equal(filterByTag(tasks, "").length, 2);
});

test("tagCounts sorts by usage then name", () => {
  const tasks = [
    { id: 1, tags: ["b", "a"] },
    { id: 2, tags: ["b"] },
    { id: 3 },
  ];
  assert.deepEqual(tagCounts(tasks), [
    { tag: "b", count: 2 },
    { tag: "a", count: 1 },
  ]);
});

test("store normalizes tags on add and update", () => {
  const store = new TaskStore();
  const task = store.add({ title: "x", tags: "#Home, home" });
  assert.deepEqual(task.tags, ["home"]);
  store.update(task.id, { tags: "Work Urgent" });
  assert.deepEqual(store.get(task.id).tags, ["work", "urgent"]);
});

test("store rejects invalid tags without creating the task", () => {
  const store = new TaskStore();
  assert.throws(() => store.add({ title: "x", tags: "a b c d e f" }), /at most/);
  assert.equal(store.all().length, 0);
});
