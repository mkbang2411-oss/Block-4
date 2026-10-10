import { TLink } from "./Transition.jsx";

// One student card in the list
export default function StudentRow({ student }) {
  return (
    <TLink className="card tilt student" to={`/students/${student.id}`}>
      <h3>{student.full_name}</h3>
      <p>{student.student_code}</p>
      <span className="chip">{student.class_name}</span>
      <small>View profile →</small>
    </TLink>
  );
}
