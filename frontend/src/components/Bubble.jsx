import { colors } from "../lib/effects.js";

// Big bubbly multi-colour title
export default function Bubble({ text, as: Tag = "h2", className = "bubble s" }) {
  return (
    <Tag className={className} aria-label={text}>
      {[...text].map((ch, i) => {
        if (ch === " ") return " ";
        const [c, d] = colors[i % colors.length];
        return (
          <span key={i} aria-hidden="true" style={{ "--c": c, "--d": d, "--i": i }}>
            {ch}
          </span>
        );
      })}
    </Tag>
  );
}
