import { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { TLink, TransitionOverlay } from "./components/Transition.jsx";
import Home from "./pages/Home.jsx";
import StudentsPage from "./pages/StudentsPage.jsx";
import StudentDetail from "./pages/StudentDetail.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import { createStudent, fetchStudents } from "./lib/api.js";
import { useGlobalEffects } from "./lib/effects.js";

export default function App() {
  useGlobalEffects();
  const location = useLocation();
  const { pathname } = location;

  // The ONE source of state for the student list. Pages only read it; adding goes through addStudent.
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    fetchStudents()
      .then((rows) => alive && setStudents(rows))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  // Save on the server, then put the saved student into state -> the list updates right away
  const addStudent = useCallback(async (values) => {
    const saved = await createStudent(values);
    setStudents((prev) => [...prev, saved]);
    return saved;
  }, []);

  // a new page starts at the top (like a fresh page load used to)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.key]);

  return (
    <>
      <TransitionOverlay />
      <nav className="nav">
        <TLink to="/" className="logo">Twinkle</TLink>
        <TLink to="/students" className={pathname.startsWith("/students") ? "on" : ""}>Students</TLink>
        <TLink to="/register" className={pathname === "/register" ? "on" : ""}>Register</TLink>
      </nav>
      <main className="wrap">
        <Routes>
          <Route path="/" element={<Home total={students.length} />} />
          <Route path="/students" element={<StudentsPage students={students} loading={loading} error={error} />} />
          <Route path="/students/:id" element={<StudentDetail students={students} loading={loading} />} />
          <Route path="/register" element={<RegisterPage onAdd={addStudent} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
