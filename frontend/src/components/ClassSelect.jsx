import { useEffect, useRef, useState } from "react";
import { CLASSES } from "../lib/validators.js";

// Single-choice class dropdown (value is controlled by the parent)
export default function ClassSelect({ value, onChange, describedBy }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const btn = useRef(null);
  const items = useRef([]);

  const openMenu = (focusOpt = true) => {
    setOpen(true);
    if (focusOpt)
      setTimeout(() => {
        const i = Math.max(0, CLASSES.indexOf(value));
        items.current[i]?.focus();
      });
  };
  const closeMenu = () => setOpen(false);
  const choose = (c) => {
    onChange(c);
    setOpen(false);
    btn.current.focus();
  };

  useEffect(() => {
    const onDoc = (e) => {
      if (open && !root.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [open]);

  const onMenuKey = (e) => {
    const i = items.current.indexOf(document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      items.current[Math.min(i + 1, CLASSES.length - 1)].focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items.current[Math.max(i - 1, 0)].focus();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (i > -1) choose(CLASSES[i]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeMenu();
      btn.current.focus();
    } else if (e.key === "Tab") closeMenu();
  };

  return (
    <div className={"select" + (open ? " open" : "")} ref={root}>
      <button
        type="button"
        className="select-btn"
        ref={btn}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-describedby={describedBy}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            openMenu();
          }
        }}
      >
        <span className={"select-val" + (value ? " picked" : "")}>{value || "Select your class"}</span>
        <i aria-hidden="true">▾</i>
      </button>
      <ul className="select-menu" role="listbox" aria-label="Class" hidden={!open} onKeyDown={onMenuKey}>
        {CLASSES.map((c, i) => (
          <li
            key={c}
            role="option"
            tabIndex={-1}
            ref={(el) => (items.current[i] = el)}
            aria-selected={value === c}
            onClick={() => choose(c)}
          >
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}
