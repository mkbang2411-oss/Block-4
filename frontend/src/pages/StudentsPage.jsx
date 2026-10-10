import { useEffect, useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import Bubble from "../components/Bubble.jsx";
import StudentList from "../components/StudentList.jsx";
import { TLink } from "../components/Transition.jsx";
import { CLASSES } from "../lib/validators.js";
import { PER_PAGE, searchFilterSort } from "../lib/students.js";

// The list page: search / filter / sort / pagination. Everything is computed from the
// `students` state that App owns; the chosen options live in the URL (?q=&class=&sort=&order=&page=).
export default function StudentsPage({ students, loading, error }) {
  const [params, setParams] = useSearchParams();
  const ok = useLocation().state?.ok;

  // ----- options currently applied (from the URL)
  const s = (params.get("q") || "").trim();
  const cls = CLASSES.includes(params.get("class")) ? params.get("class") : "";
  const sorts = params.getAll("sort").filter((x) => x === "id" || x === "name");
  const sortId = sorts.includes("id");
  const sortName = sorts.includes("name");
  const sortCount = sorts.length;
  const order = params.get("order") === "desc" ? "desc" : "asc";

  // ----- what the user is choosing right now (applied when pressing Search / Apply)
  const [draft, setDraft] = useState({ q: s, cls, sorts, order });
  const [openDd, setOpenDd] = useState(null); // "filter" | "sort" | null
  const key = params.toString();
  useEffect(() => {
    setDraft({ q: s, cls, sorts, order });
  }, [key]);

  useEffect(() => {
    const onClick = (e) => {
      if (!e.target.closest("[data-dd]")) setOpenDd(null);
    };
    const onKey = (e) => {
      if (e.key !== "Escape" || !openDd) return;
      document.querySelector(`[data-dd="${openDd}"] .dd-btn`)?.focus();
      setOpenDd(null);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [openDd]);

  function apply(e) {
    e.preventDefault();
    const next = new URLSearchParams();
    const q = draft.q.trim();
    if (q) next.set("q", q);
    if (draft.cls) next.set("class", draft.cls);
    draft.sorts.forEach((x) => next.append("sort", x));
    if (draft.sorts.length && draft.order === "desc") next.set("order", "desc");
    setParams(next);
    setOpenDd(null);
  }
  const toggleSort = (k) =>
    setDraft((d) => {
      const has = d.sorts.includes(k);
      return { ...d, sorts: ["id", "name"].filter((x) => (x === k ? !has : d.sorts.includes(x))) };
    });

  // ----- the rows: search + filter + sort, then cut out the current page
  const all = useMemo(
    () => searchFilterSort(students, { s, cls, sortId, sortName, order }),
    [students, s, cls, sortId, sortName, order],
  );
  const count = all.length;
  const pages = Math.max(1, Math.ceil(count / PER_PAGE));
  const pageNo = Math.min(Math.max(parseInt(params.get("page")) || 1, 1), pages);
  const rows = all.slice((pageNo - 1) * PER_PAGE, pageNo * PER_PAGE);
  const hasFilter = !!(s || cls);

  // query string carried by the pagination links (ends with "&" when not empty)
  const base = new URLSearchParams();
  if (s) base.set("q", s);
  if (cls) base.set("class", cls);
  sorts.forEach((x) => base.append("sort", x));
  if (sortCount && order === "desc") base.set("order", "desc");
  const baseQs = base.toString() ? base.toString() + "&" : "";

  const nums = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - pageNo) <= 1) nums.push(i);
    else if (nums[nums.length - 1] !== "…") nums.push("…");
  }

  return (
    <>
      <Bubble text="Students" />
      {ok && <p className="toast">You're registered! Your name is now on the list.</p>}

      <form className="controls" id="filterForm" onSubmit={apply}>
        <div className="search">
          <input
            name="q"
            value={draft.q}
            onChange={(e) => setDraft({ ...draft, q: e.target.value })}
            placeholder="Search by name / student id / class"
          />
          <button className="btn sun pop">Search</button>

          <div className={"dd" + (openDd === "filter" ? " open" : "")} data-dd="filter">
            <button
              type="button"
              className="btn mint dd-btn"
              aria-haspopup="true"
              aria-expanded={openDd === "filter"}
              onClick={() => setOpenDd(openDd === "filter" ? null : "filter")}
            >
              Filter<span className="dd-badge" hidden={!draft.cls}>1</span><i aria-hidden="true">▾</i>
            </button>
            <div className="dd-menu" role="group" aria-label="Filter by class" hidden={openDd !== "filter"}>
              <p className="dd-title">Class</p>
              <label className="dd-item">
                <input type="radio" name="class" value="" checked={!draft.cls} onChange={() => setDraft({ ...draft, cls: "" })} />
                <span>All classes</span>
              </label>
              {CLASSES.map((c) => (
                <label className="dd-item" key={c}>
                  <input type="radio" name="class" value={c} checked={draft.cls === c} onChange={() => setDraft({ ...draft, cls: c })} />
                  <span>{c}</span>
                </label>
              ))}
              <button className="btn mint dd-apply">Apply</button>
            </div>
          </div>

          <div className={"dd" + (openDd === "sort" ? " open" : "")} data-dd="sort">
            <button
              type="button"
              className="btn pink dd-btn"
              aria-haspopup="true"
              aria-expanded={openDd === "sort"}
              onClick={() => setOpenDd(openDd === "sort" ? null : "sort")}
            >
              Sort<span className="dd-badge" hidden={!draft.sorts.length}>{draft.sorts.length}</span><i aria-hidden="true">▾</i>
            </button>
            <div className="dd-menu right" role="group" aria-label="Sort" hidden={openDd !== "sort"}>
              <p className="dd-title">Sort by</p>
              <label className="dd-item">
                <input type="checkbox" name="sort" value="id" checked={draft.sorts.includes("id")} onChange={() => toggleSort("id")} />
                <span>Student ID</span>
              </label>
              <label className="dd-item">
                <input type="checkbox" name="sort" value="name" checked={draft.sorts.includes("name")} onChange={() => toggleSort("name")} />
                <span>Name</span>
              </label>
              <p className="dd-title">Order</p>
              <label className="dd-item">
                <input type="radio" name="order" value="asc" checked={draft.order === "asc"} onChange={() => setDraft({ ...draft, order: "asc" })} />
                <span>A → Z</span>
              </label>
              <label className="dd-item">
                <input type="radio" name="order" value="desc" checked={draft.order === "desc"} onChange={() => setDraft({ ...draft, order: "desc" })} />
                <span>Z → A</span>
              </label>
              <button className="btn pink dd-apply">Apply</button>
            </div>
          </div>
        </div>
      </form>

      <div className="result-bar" role="status" aria-live="polite">
        <span className="count-pill"><b>{count}</b> {count === 1 ? "result" : "results"} found</span>
        {cls && <span className="tag">Class: {cls}</span>}
        {s && <span className="tag">Search: “{s}”</span>}
        {sortCount > 0 && (
          <span className="tag">
            Sorted by {[sortId && "Student ID", sortName && "Name"].filter(Boolean).join(" + ")} ({order === "desc" ? "Z → A" : "A → Z"})
          </span>
        )}
        {(hasFilter || sortCount > 0) && <TLink className="clear" to="/students">Clear all</TLink>}
      </div>

      <StudentList students={rows} />

      {!rows.length && (
        <p className="empty">
          {loading ? (
            "Loading…"
          ) : error ? (
            <span className="toast bad">{error}</span>
          ) : hasFilter ? (
            "No students match your filters."
          ) : (
            <>No students yet. <TLink to="/register">Be the first to register</TLink></>
          )}
        </p>
      )}

      {pages > 1 && (
        <nav className="pager-nav" aria-label="Pages">
          {pageNo > 1 ? (
            <TLink className="pg" to={`/students?${baseQs}page=${pageNo - 1}`} aria-label="Previous page">‹</TLink>
          ) : (
            <span className="pg off">‹</span>
          )}
          {nums.map((n, i) =>
            n === "…" ? (
              <span className="pg gap" key={"gap" + i}>…</span>
            ) : (
              <TLink className={"pg " + (n === pageNo ? "on" : "")} to={`/students?${baseQs}page=${n}`} key={n}>{n}</TLink>
            ),
          )}
          {pageNo < pages ? (
            <TLink className="pg" to={`/students?${baseQs}page=${pageNo + 1}`} aria-label="Next page">›</TLink>
          ) : (
            <span className="pg off">›</span>
          )}
        </nav>
      )}
    </>
  );
}
