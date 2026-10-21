import { STATUSES } from "../../src/store.js";

/** Dropdown for choosing a task status. Shared by the card and (later) any bulk actions. */
export default function StatusSelect({ value, onChange, label = "Status" }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
      {STATUSES.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );
}
