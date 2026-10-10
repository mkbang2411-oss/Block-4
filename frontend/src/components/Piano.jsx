import { useEffect, useRef } from "react";
import { burst } from "../lib/effects.js";

const WHITE = [
  ["#5aa9ff", 261.63, "C"],
  ["#ff8fc7", 293.66, "D"],
  ["#ffb454", 329.63, "E"],
  ["#5be0a0", 349.23, "F"],
  ["#8d8bff", 392.0, "G"],
  ["#ff6f91", 440.0, "A"],
  ["#5be0a0", 493.88, "B"],
  ["#5aa9ff", 523.25, "C"],
];
const BLACK = [
  [1, 277.18, "C#"],
  [2, 311.13, "D#"],
  [4, 369.99, "F#"],
  [5, 415.3, "G#"],
  [6, 466.16, "A#"],
];
const STARS = [
  ["#ffd23f", "34px", "-2%", "-4px", "0s"],
  ["#ff8fc7", "22px", "10%", "-34px", "0.6s"],
  ["#5be0a0", "26px", "86%", "-30px", "1.1s"],
  ["#ffb454", "36px", "98%", "20px", "0.3s"],
  ["#fff", "20px", "-6%", "90px", "0.9s"],
  ["#8d8bff", "24px", "104%", "110px", "1.4s"],
];

// Playable little piano (click / tap the keys, or use A S D F G H J K + W E T Y U)
export default function Piano() {
  const ctx = useRef(null);
  const keys = useRef({}); // letter -> button element
  const rootRef = useRef(null);

  function play(freq) {
    ctx.current = ctx.current || new (window.AudioContext || window.webkitAudioContext)();
    const c = ctx.current;
    if (c.state === "suspended") c.resume();
    const t = c.currentTime,
      o = c.createOscillator(),
      g = c.createGain();
    o.type = "triangle";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.35, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + 1.15);
  }
  function hit(el) {
    play(+el.dataset.note);
    el.classList.add("down");
    setTimeout(() => el.classList.remove("down"), 160);
  }

  useEffect(() => {
    const whites = [...rootRef.current.querySelectorAll(".key.w")];
    const blacks = [...rootRef.current.querySelectorAll(".key.b")];
    const map = {};
    "asdfghjk".split("").forEach((ch, i) => (map[ch] = whites[i]));
    "wetyu".split("").forEach((ch, i) => (map[ch] = blacks[i]));
    const onKey = (e) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = map[e.key.toLowerCase()];
      if (k && e.target === document.body) {
        hit(k);
        const r = k.getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + 20);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const keyProps = {
    type: "button",
    onPointerDown: (e) => hit(e.currentTarget),
    onKeyDown: (e) => {
      if ((e.key === "Enter" || e.key === " ") && !e.repeat) hit(e.currentTarget);
    },
  };

  return (
    <div className="piano-wrap" ref={rootRef}>
      {STARS.map(([c, z, left, top, delay], i) => (
        <i key={i} className="pstar" style={{ "--c": c, "--z": z, left, top, animationDelay: delay }} />
      ))}
      <span className="note n1" aria-hidden="true">♪</span>
      <span className="note n2" aria-hidden="true">♫</span>
      <div className="piano" role="group" aria-label="Little piano — tap the keys to play">
        <span className="piano-label">♪ Twinkle Piano ♪</span>
        <div className="keys-bed">
          <div className="keys">
            {WHITE.map(([c, note, name], i) => (
              <button key={"w" + i} {...keyProps} className="key w pop" style={{ "--c": c }} data-note={note} aria-label={"Piano key " + name} />
            ))}
            {BLACK.map(([k, note, name]) => (
              <button key={"b" + k} {...keyProps} className="key b pop" style={{ "--k": k }} data-note={note} aria-label={"Piano key " + name} />
            ))}
          </div>
        </div>
      </div>
      <p className="piano-hint">Tap the keys and play a song!</p>
    </div>
  );
}
