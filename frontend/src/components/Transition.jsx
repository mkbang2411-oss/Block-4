import { Link, useLocation, useNavigate } from "react-router-dom";
import Bubble from "./Bubble.jsx";
import { burst, reduceMotion } from "../lib/effects.js";

/* Tab transitions (cloud / bubble / fresh), same effects as before.
   Flow: click a tab link -> play the "cover" effect -> change the route -> play the "reveal" effect.
   The route changes inside React, so the page never reloads. */

// Destination -> effect type
const EFFECT = { "/": "fresh", "/students": "cloud", "/register": "bubble" };
// Cover time (ms) before changing route / reveal time before cleaning up
const COVER = { cloud: 950, bubble: 1050, fresh: 1050 };
const REVEAL = { cloud: 1500, bubble: 1500, fresh: 1500 };

let busy = false;

function reveal(type) {
  const root = document.documentElement;
  if (type === "fresh") {
    // star bursts mid-screen while the ripples collapse
    [450, 600, 750].forEach((t, i) =>
      setTimeout(() => burst(innerWidth * (0.38 + i * 0.12), innerHeight * 0.42), t),
    );
  }
  if (type === "bubble") {
    // a few bubbles pop with sparkles
    document.querySelectorAll(".vt-bubble .bb").forEach((b, i) => {
      if (i % 6 !== 0) return;
      const r = b.getBoundingClientRect();
      const delay = 100 + (parseFloat(b.style.getPropertyValue("--po")) || 0) * 1000 + 120;
      setTimeout(() => burst(r.left + r.width / 2, r.top + r.height / 2), delay);
    });
  }
  if (type === "cloud") setTimeout(() => burst(innerWidth / 2, innerHeight * 0.4), 700);

  setTimeout(() => {
    root.classList.remove("vt-in");
    delete root.dataset.vt;
    busy = false;
  }, REVEAL[type] || 1500);
}

function play(type, to, el, navigate) {
  const root = document.documentElement;
  busy = true;
  // the "fresh" ripples spread from the exact button that was clicked
  const r = el.getBoundingClientRect();
  root.style.setProperty("--ox", r.left + r.width / 2 + "px");
  root.style.setProperty("--oy", r.top + r.height / 2 + "px");
  root.dataset.vt = type;
  root.classList.add("vt-out");

  setTimeout(() => {
    try {
      navigate(to);
      root.classList.remove("vt-out");
      root.classList.add("vt-in");
      reveal(type);
    } catch (err) {
      // never leave the cover stuck on the screen
      root.classList.remove("vt-out", "vt-in");
      delete root.dataset.vt;
      busy = false;
      console.error(err);
    }
  }, COVER[type]);
}

// Drop-in replacement for <Link>: adds the transition when going to another tab
export function TLink({ to, onClick, ...rest }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handle = (e) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const dest = new URL(to, window.location.origin).pathname;
    const type = EFFECT[dest];
    if (!type || dest === pathname || busy || reduceMotion()) return; // plain navigation
    e.preventDefault();
    play(type, to, e.currentTarget, navigate);
  };

  return <Link {...rest} to={to} onClick={handle} />;
}

// The overlay itself (always in the page, hidden until a transition starts)
export function TransitionOverlay() {
  const pal = [
    ["#9fd0ff", "#2a6fd6"],
    ["#ffc2e1", "#d9569a"],
    ["#fff0a0", "#ffb62e"],
    ["#a8f2cf", "#2aa56e"],
    ["#b9ccff", "#3a64d6"],
    ["#ffb0c4", "#c93a5c"],
  ];
  const COLS = 8,
    ROWS = 6;

  const clouds = [];
  for (const side of ["l", "r"]) {
    for (let i = 0; i < 9; i++) {
      const y = -8 + i * 12;
      const w = 78 + ((i * 7 + (side === "r" ? 3 : 0)) % 5) * 4;
      const h = 26 + ((i * 3) % 4) * 2;
      const dl = ((i * 5 + (side === "r" ? 2 : 0)) % 7) * 0.035;
      clouds.push(
        <i key={side + i} className={`c ${side}`} style={{ "--y": `${y}vh`, "--w": `${w}vw`, "--h": `${h}vh`, "--dl": `${dl.toFixed(3)}s` }} />,
      );
    }
  }

  const bubbles = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const n = r * COLS + c;
      const k = (1.1 + ((n * 37) % 9) / 22).toFixed(2);
      const cx = (((c + 0.5) * 100) / COLS + (((n * 53) % 7) - 3) * 0.5).toFixed(1);
      const cy = (((r + 0.5) * 100) / ROWS + (((n * 29) % 7) - 3) * 0.6).toFixed(1);
      const up = ((ROWS - 1 - r) * 0.06 + ((n * 29) % 5) * 0.025).toFixed(3);
      const po = (((n * 41) % 17) * 0.03).toFixed(3);
      const p = pal[(n * 5 + r) % pal.length];
      bubbles.push(
        <i key={n} className="bb" style={{ "--cx": `${cx}%`, "--cy": `${cy}%`, "--k": k, "--up": `${up}s`, "--po": `${po}s`, "--c1": p[0], "--c2": p[1] }} />,
      );
    }
  }

  const foam = [];
  for (let i = 0; i < 18; i++) {
    foam.push(
      <i
        key={i}
        className="sb"
        style={{
          "--x": `${(i * 37) % 100}%`,
          "--s": `${14 + ((i * 13) % 34)}px`,
          "--t": `${(0.55 + ((i * 7) % 6) * 0.07).toFixed(2)}s`,
          "--dl": `${(((i * 11) % 8) * 0.04).toFixed(2)}s`,
          "--sw": `${(i % 2 ? 1 : -1) * (14 + ((i * 5) % 22))}px`,
        }}
      />,
    );
  }

  const rings = ["#ff8fc7", "#ff9f43", "#ffd23f", "#5be0a0", "linear-gradient(#1f8cff,#7cc4ff 60%,#d8f0ff)"];

  return (
    <div id="vt" aria-hidden="true">
      {/* 1. CLOUDS: rush in from both sides, then drift apart */}
      <div className="vt-cloud">{clouds}</div>

      {/* 2. BUBBLES: flood up from the bottom, then pop */}
      <div className="vt-bubble">
        {bubbles}
        {foam}
      </div>

      {/* 3. FRESH: candy ripples + the Twinkle star */}
      <div className="vt-fresh">
        {rings.map((bg, i) => (
          <i key={i} className="ring" style={{ "--i": i, "--bg": bg }} />
        ))}
        <div className="center">
          <div className="star-wrap">
            <i className="star" />
          </div>
          <Bubble as="div" className="vt-word bubble s" text="Twinkle" />
        </div>
      </div>
    </div>
  );
}
