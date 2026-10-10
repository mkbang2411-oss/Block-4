import Bubble from "../components/Bubble.jsx";
import Piano from "../components/Piano.jsx";
import { TLink } from "../components/Transition.jsx";

export default function Home({ total }) {
  return (
    <section className="hero">
      <p className="chip">Our little classroom</p>
      <Bubble as="h1" className="bubble" text="Twinkle" />
      <p className="sub">
        <b>{total}</b> {total === 1 ? "friend has" : "friends have"} joined. Let's soar high together!
      </p>
      <div className="actions">
        <TLink to="/register" className="btn pink pop">Sign up now</TLink>
        <TLink to="/students" className="btn mint pop">View the list</TLink>
      </div>
      <Piano />
    </section>
  );
}
