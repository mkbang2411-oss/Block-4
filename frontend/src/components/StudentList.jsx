import StudentRow from "./StudentRow.jsx";
import { PER_PAGE } from "../lib/students.js";

// Shows the students it is given (already filtered, sorted and cut to one page by the parent)
export default function StudentList({ students }) {
  const fillers = students.length ? Math.max(0, PER_PAGE - students.length) : 0;
  return (
    <section className="grid">
      {students.map((s) => (
        <StudentRow key={s.id} student={s} />
      ))}
      {/* invisible cards keep the pager bar in the same spot on the last page */}
      {Array.from({ length: fillers }, (_, i) => (
        <div key={"fill" + i} className="card student fill" aria-hidden="true" />
      ))}
    </section>
  );
}
