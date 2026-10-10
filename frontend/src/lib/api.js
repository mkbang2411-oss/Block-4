// Talks to the Express server. These are fetch (XHR) calls, so the page itself never reloads.
// Dev: VITE_API_URL is empty -> "/api/..." goes through the Vite proxy.
// Production: set VITE_API_URL=https://your-backend-domain (no trailing slash) BEFORE `npm run build`.
const API = import.meta.env.VITE_API_URL || "";
const DOWN =
  "Can't reach the server. Start the backend first (cd backend, then npm start).";

async function call(url, options) {
  let res;
  try {
    res = await fetch(API + url, options);
  } catch {
    throw new Error(DOWN);
  }
  const data = await res.json().catch(() => null); // not JSON = not our Express API
  return { res, data };
}

export async function fetchStudents() {
  const { res, data } = await call("/api/students");
  if (!res.ok || !Array.isArray(data)) throw new Error(DOWN);
  return data;
}

export async function createStudent(student) {
  const { res, data } = await call("/api/students", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(student),
  });
  if (!res.ok) throw new Error((data && data.error) || DOWN);
  return data; // the student that was just saved (with its id)
}
