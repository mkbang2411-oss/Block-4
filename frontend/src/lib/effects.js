import { useEffect } from "react";

export const colors = [
  ["#5aa9ff", "#2a6fd6"],
  ["#ff8fc7", "#d9569a"],
  ["#ffb454", "#d9822a"],
  ["#5be0a0", "#2aa56e"],
  ["#7aa8ff", "#3a64d6"],
  ["#ff6f91", "#c93a5c"],
  ["#6fe8b0", "#2aa56e"],
];

export const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// little star burst
export function burst(x, y) {
  if (reduceMotion()) return;
  for (let i = 0; i < 14; i++) {
    const s = document.createElement("i"),
      a = Math.random() * 6.28,
      r = 50 + Math.random() * 70;
    s.className = "fx";
    s.style.cssText = `left:${x}px;top:${y}px;--c:${colors[i % 7][0]};--x:${Math.cos(a) * r}px;--y:${Math.sin(a) * r}px`;
    document.body.append(s);
    setTimeout(() => s.remove(), 800);
  }
}

// Page-wide effects (bursts on .pop, 3D tilt on .tilt). They listen on `document`,
// so they also work for cards that React adds later.
export function useGlobalEffects() {
  useEffect(() => {
    const onClick = (e) => {
      if (e.target.closest(".pop")) burst(e.clientX, e.clientY);
    };
    const onMove = (e) => {
      const c = e.target.closest(".tilt");
      if (!c) return;
      const b = c.getBoundingClientRect();
      const x = (e.clientX - b.left) / b.width - 0.5,
        y = (e.clientY - b.top) / b.height - 0.5;
      c.style.transform = `rotateX(${-y * 14}deg) rotateY(${x * 14}deg) translateZ(10px)`;
    };
    const onOut = (e) => {
      const c = e.target.closest(".tilt");
      if (c && !c.contains(e.relatedTarget)) c.style.transform = "";
    };
    document.addEventListener("click", onClick);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseout", onOut);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseout", onOut);
    };
  }, []);
}
