import { readFile, writeFile } from "node:fs/promises";
import { TaskStore } from "./store.js";

/** Load a store from a JSON file. A missing file yields an empty store. */
export async function loadStore(path) {
  try {
    const raw = await readFile(path, "utf8");
    return new TaskStore(JSON.parse(raw));
  } catch (err) {
    if (err.code === "ENOENT") return new TaskStore();
    throw err;
  }
}

export async function saveStore(path, store) {
  await writeFile(path, JSON.stringify(store.all(), null, 2) + "\n", "utf8");
}
