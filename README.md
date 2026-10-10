# Block-3 — Student List (CSR: React + Vite, Express + SQLite)

```
Block-3/
├── backend/    Express + SQLite, only returns JSON (/api/students)   -> http://localhost:4000
└── frontend/   React + Vite (client-side rendering)                   -> http://localhost:5173
```

## Run (one command)

```bash
npm run install:all     # installs root + backend + frontend (once)
npm run dev             # starts BOTH servers
```

Then open **http://localhost:5173** (not :4000 — that one is only the API).

### Or run them separately (two terminals)

```bash
cd backend  && npm install && npm start       # API on :4000
cd frontend && npm install && npm run dev     # app on :5173
```

Vite forwards `/api/*` to the backend, so no extra setup is needed.

## How it works

- `App.jsx` owns the `students` state (single source). Pages only read it.
- `StudentForm.jsx` uses controlled inputs. On submit it calls `onAdd` -> `POST /api/students`
  -> the saved student is added to the `students` state -> the list shows it immediately,
  and the form is reset. Nothing reloads the page (only `fetch` calls, no new document request).
- `StudentList.jsx` / `StudentRow.jsx` render the list. Search, filter, sort and paging are
  computed on the client from the same state.
