import { useRef, useState } from "react";
import ClassSelect from "./ClassSelect.jsx";
import { validate } from "../lib/validators.js";

const EMPTY = { full_name: "", student_code: "", email: "", class_name: "" };
const NO_FLAGS = { full_name: {}, student_code: {}, email: {}, class_name: {} };

// Add-student form. Every input is controlled: its value lives in React state.
// onAdd(values) saves the student (the owner, App, puts it in the students state).
export default function StudentForm({ onAdd, onAdded }) {
  const [values, setValues] = useState(EMPTY);
  const [flags, setFlags] = useState(NO_FLAGS); // per field: { focused, blurred }
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const sending = useRef(false);
  const inputs = useRef({});

  const setFlag = (name, patch) => setFlags((f) => ({ ...f, [name]: { ...f[name], ...patch } }));
  const setValue = (name, v) => setValues((s) => ({ ...s, [name]: v }));

  // One field with its live hints (a plain function, not a component, so inputs keep focus while typing)
  const field = (name, children) => {
    const v = values[name];
    const { focused, blurred } = flags[name];
    const res = validate(name, v);
    const dirty = v.length > 0 || blurred || submitted;
    return (
      <div
        key={name}
        className={"field" + (res.ok ? " ok" : "") + (!res.ok && (blurred || submitted) ? " bad" : "")}
        data-field={name}
        onFocus={() => setFlag(name, { focused: true })}
        onBlur={(e) => {
          if (e.currentTarget.contains(e.relatedTarget)) return;
          setFlag(name, { focused: false, blurred: true });
        }}
      >
        {children}
        <ul className="rules" id={"r-" + name} hidden={!(dirty || focused)}>
          {res.results.map((r) => {
            const state = r.ok ? "ok" : dirty ? "bad" : "idle";
            return (
              <li key={r.text} className={"rule " + state}>
                <span className="mark" aria-hidden="true">
                  {r.ok ? "✓" : dirty ? "✗" : "○"}
                </span>
                {r.text + (r.detail ? " " + r.detail : "")}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  const input = (name, props) => (
    <input
      name={name}
      value={values[name]}
      onChange={(e) => setValue(name, e.target.value)}
      ref={(el) => (inputs.current[name] = el)}
      aria-describedby={"r-" + name}
      {...props}
    />
  );

  async function handleSubmit(e) {
    e.preventDefault(); // no page reload
    if (sending.current) return;
    setSubmitted(true);
    const firstBad = Object.keys(values).find((n) => !validate(n, values[n]).ok);
    if (firstBad) {
      if (firstBad === "class_name") document.querySelector(".select-btn").focus();
      else inputs.current[firstBad].focus();
      return;
    }
    sending.current = true;
    try {
      const student = await onAdd(values);
      // saved -> reset the form
      setValues(EMPTY);
      setFlags(NO_FLAGS);
      setSubmitted(false);
      setError(null);
      onAdded?.(student);
    } catch (err) {
      setError(err.message); // keep what the user typed
    } finally {
      sending.current = false;
    }
  }

  return (
    <form className="card form" id="regForm" onSubmit={handleSubmit} noValidate>
      {error && <p className="toast bad">{error}</p>}

      {field("full_name", input("full_name", { placeholder: "Full name", autoComplete: "name" }))}
      {field("student_code", input("student_code", { placeholder: "Student ID", inputMode: "numeric", autoComplete: "off" }))}
      {field("email", input("email", { type: "text", inputMode: "email", placeholder: "Email", autoComplete: "email" }))}
      {field(
        "class_name",
        <ClassSelect value={values.class_name} onChange={(c) => setValue("class_name", c)} describedBy="r-class_name" />,
      )}

      <button className="btn pink pop">Submit</button>
    </form>
  );
}
