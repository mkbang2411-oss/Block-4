import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { TLink } from "../components/Transition.jsx";

const PALETTE = [
  ["#5aa9ff", "#2a6fd6"],
  ["#ff8fc7", "#d9569a"],
  ["#ffb454", "#d9822a"],
  ["#5be0a0", "#2aa56e"],
  ["#8d8bff", "#5b58d6"],
  ["#ff6f91", "#c93a5c"],
];

export default function StudentDetail({ students, loading }) {
  const { id } = useParams();
  const sid = Number(id);
  const r = students.find((s) => s.id === sid);

  // Show the card when it scrolls into view, hide it again when it leaves (direction-aware)
  useEffect(() => {
    if (!r) return;
    const show = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const el = e.target;
          if (e.isIntersecting) {
            el.classList.add("in");
            el.classList.remove("above");
          } else {
            el.classList.remove("in");
            el.classList.toggle("above", e.boundingClientRect.top < 0);
          }
        });
      },
      { threshold: 0.35 },
    );
    document.querySelectorAll(".page").forEach((p) => show.observe(p));
    return () => show.disconnect();
  }, [r?.id]);

  if (!r) return loading ? null : <Navigate to="/students" replace />;

  const words = r.full_name.trim().split(/\s+/);
  const initials = (words.length > 1 ? words[0][0] + words[words.length - 1][0] : words[0].slice(0, 2)).toUpperCase();
  const pal = PALETTE[r.id % 6];
  const prev = students.filter((s) => s.id < r.id).reduce((a, s) => (!a || s.id > a.id ? s : a), null);
  const next = students.filter((s) => s.id > r.id).reduce((a, s) => (!a || s.id < a.id ? s : a), null);
  const no = students.filter((s) => s.id <= r.id).length;

  return (
    <>
      <section className="page" key={r.id} style={{ "--bg": pal[0], "--sh": pal[1] }}>
        <span className="ghost" aria-hidden="true">{String(no).padStart(2, "0")}</span>
        <article className="card profile">
          <div className="avatar">{initials}</div>
          <span className="chip">{r.class_name}</span>
          <h2>{r.full_name}</h2>
          <ul className="info">
            <li><b>Student ID</b><span>{r.student_code}</span></li>
            <li><b>Email</b><span>{r.email}</span></li>
            <li><b>Joined</b><span>{r.created_at.slice(0, 10)}</span></li>
          </ul>
          <small className="no">Friend {no} of {students.length}</small>
        </article>
      </section>
      <div className="pager">
        {prev && <TLink className="btn mint pop" to={`/students/${prev.id}`}>← Previous</TLink>}
        <TLink className="btn sun pop" to="/students">Students</TLink>
        {next && <TLink className="btn pink pop" to={`/students/${next.id}`}>Next →</TLink>}
      </div>
    </>
  );
}
