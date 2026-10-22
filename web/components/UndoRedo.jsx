import { useEffect } from "react";

const isTyping = (el) => el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

/** Undo / redo buttons plus Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z (or Ctrl+Y) shortcuts. */
export default function UndoRedo({ canUndo, canRedo, onUndo, onRedo }) {
  useEffect(() => {
    function onKeyDown(e) {
      if (!(e.ctrlKey || e.metaKey) || isTyping(document.activeElement)) return;
      const key = e.key.toLowerCase();
      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        onUndo();
      } else if ((key === "z" && e.shiftKey) || key === "y") {
        e.preventDefault();
        onRedo();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onUndo, onRedo]);

  return (
    <div className="undo-redo">
      <button type="button" className="secondary" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
        Undo
      </button>
      <button type="button" className="secondary" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">
        Redo
      </button>
    </div>
  );
}
