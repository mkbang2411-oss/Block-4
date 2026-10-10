const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const Validators = require("./validators.js");
const app = express();
const db = new Database(process.env.DB_PATH || "students.db");

db.exec(`CREATE TABLE IF NOT EXISTS students(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL, student_code TEXT NOT NULL,
  email TEXT NOT NULL, class_name TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_code, class_name))`);

// Older databases were created with `student_code TEXT UNIQUE`, which blocks the same
// student ID across ALL classes. `CREATE TABLE IF NOT EXISTS` never changes an existing
// table, so rebuild it once with UNIQUE(student_code, class_name) (data is kept).
(function migrateStudentsTable() {
  const idCodeOnly = db
    .prepare("PRAGMA index_list(students)")
    .all()
    .filter((i) => i.unique)
    .some((i) => {
      const cols = db.prepare(`PRAGMA index_info("${i.name}")`).all();
      return cols.length === 1 && cols[0].name === "student_code";
    });
  if (!idCodeOnly) return;
  db.transaction(() => {
    db.exec(`
      ALTER TABLE students RENAME TO students_old;
      CREATE TABLE students(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL, student_code TEXT NOT NULL,
        email TEXT NOT NULL, class_name TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_code, class_name));
      INSERT INTO students(id, full_name, student_code, email, class_name, created_at)
        SELECT id, full_name, student_code, email, class_name, created_at FROM students_old;
      DROP TABLE students_old;`);
  })();
})();

const tidyName = Validators.tidy;

// CORS: the browser blocks the frontend (another domain) from calling this API unless we allow it.
// CORS_ORIGIN = your frontend URL(s), comma separated. Not set -> allow all (fine for local dev only).
const origins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : true;
app.use(cors({ origin: origins }));
app.use(express.json());

// Health check: hosts ping this to know the server is alive
app.get("/health", (req, res) => res.json({ ok: true }));

// GET /api/students -> every student (the frontend keeps them in React state and
// does the searching / filtering / sorting / paging itself)
app.get("/api/students", (req, res) => {
  res.json(db.prepare("SELECT * FROM students ORDER BY id ASC").all());
});

// POST /api/students -> validate, insert, answer with the new student
app.post("/api/students", (req, res) => {
  const body = req.body || {};
  const v = {
    full_name: Validators.tidy((body.full_name || "").toString()),
    // ID, email and class are checked exactly as typed (e.g. spaces in the ID are an error)
    student_code: (body.student_code || "").toString(),
    email: (body.email || "").toString(),
    class_name: (body.class_name || "").toString(),
  };
  let err = null;
  if (Object.values(v).some((x) => !x)) err = "Please fill in all 4 fields.";
  else {
    for (const field of Object.keys(v)) {
      const failed = Validators.validate(field, v[field]).results.find(
        (r) => !r.ok,
      );
      if (failed) {
        err = failed.text + ".";
        break;
      }
    }
  }
  // One class can only hold a student ID once. Same ID in the same class = already there,
  // even if the name is different. The same ID may join other classes freely.
  if (!err) {
    const dup = db
      .prepare(
        "SELECT full_name FROM students WHERE student_code = ? AND class_name = ?",
      )
      .get(v.student_code, v.class_name);
    if (dup) {
      const norm = (x) => tidyName(x).normalize("NFC").toLocaleLowerCase("vi");
      err =
        norm(dup.full_name) === norm(v.full_name)
          ? `${v.full_name} (${v.student_code}) is already registered in ${v.class_name}.`
          : `Student ID ${v.student_code} already exists in ${v.class_name}.`;
    }
  }
  let id;
  if (!err)
    try {
      id = db
        .prepare(
          `INSERT INTO students(full_name,student_code,email,class_name)
      VALUES(@full_name,@student_code,@email,@class_name)`,
        )
        .run(v).lastInsertRowid;
    } catch (e) {
      // Only a real duplicate (same ID + same class) gets this message; show other errors as-is
      if (!String(e.code).startsWith("SQLITE_CONSTRAINT")) throw e;
      err = `Student ID ${v.student_code} already exists in ${v.class_name}.`;
    }
  if (err) return res.status(400).json({ error: err });
  res
    .status(201)
    .json(db.prepare("SELECT * FROM students WHERE id = ?").get(id));
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
