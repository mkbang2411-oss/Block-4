import { tidy } from "./validators.js";

export const PER_PAGE = 6;

const nameCollator = new Intl.Collator("vi", { sensitivity: "base" });

// Vietnamese name order for sorting: given name first, then middle name(s), then family name.
// "Nguyễn Thị Thu Hà" is compared as Hà -> Thu -> Thị -> Nguyễn (last word back to first word).
const compareNames = (a, b) => {
  const wa = tidy(a).split(" ").reverse();
  const wb = tidy(b).split(" ").reverse();
  for (let i = 0; i < Math.min(wa.length, wb.length); i++) {
    const r = nameCollator.compare(wa[i], wb[i]);
    if (r) return r;
  }
  return wa.length - wb.length; // all shared words equal: the shorter name comes first
};

// Search + class filter + sort, all computed from the students state
export function searchFilterSort(students, { s, cls, sortId, sortName, order }) {
  const q = s.toLowerCase();
  const all = students.filter(
    (r) =>
      (r.full_name.toLowerCase().includes(q) ||
        r.student_code.toLowerCase().includes(q) ||
        r.class_name.toLowerCase().includes(q)) &&
      (!cls || r.class_name === cls),
  );
  const dir = order === "desc" ? -1 : 1;
  if (sortId || sortName) {
    all.sort((a, b) => {
      let r = 0;
      if (sortId) r = a.student_code.localeCompare(b.student_code);
      if (!r && sortName) r = compareNames(a.full_name, b.full_name);
      return r * dir || a.id - b.id;
    });
  } else all.sort((a, b) => b.id - a.id); // default: newest first
  return all;
}
