import { useNavigate } from "react-router-dom";
import Bubble from "../components/Bubble.jsx";
import StudentForm from "../components/StudentForm.jsx";

export default function RegisterPage({ onAdd }) {
  const navigate = useNavigate();
  return (
    <>
      <Bubble text="Register" />
      {/* after the student is saved and the form is reset, go to the list (inside React, no reload) */}
      <StudentForm onAdd={onAdd} onAdded={() => navigate("/students", { state: { ok: true } })} />
    </>
  );
}
