# ExcaliCraft — Review: Bugs, Gaps & Proposed Features

- **Repo:** https://github.com/ahmedemad3/excalicraft (commit `3de091a`, the only commit)
- **Reviewed:** 2026-10-28
- **Method:** cloned, `npm install`, `npm run build`, ran all 9 test scripts, then probed `graph.js`, `mermaid.js` and `codegen.js` directly in Node with my own inputs.
- **Not tested:** the browser UI (no browser available), GIF/PDF/PNG export output, presentation mode, minimap, PlantUML conversion, undo/redo, the Excalidraw import path beyond the existing tests.

Labels: **[Verified]** = reproduced by running code. **[Code-read]** = seen in source, not executed. **[Unverified]** = suspicion only.

---

## 1. Bugs

| ID | Severity | Title | Evidence |
|---|---|---|---|
| BUG-01 | High | Path latency returns the shortest path, not the critical path | [Verified] |
| BUG-02 | Medium | README promises Terraform / Docker Compose export; it does not exist | [Verified] |
| BUG-03 | Medium | Mermaid import rejects valid, common syntax | [Verified] |
| BUG-04 | Low–Med | SPOF/entry/target detection relies on substring matches in node titles | [Code-read] |
| BUG-05 | Low | Capacity silently defaults, so built-in templates never show saturation | [Verified] |
| BUG-06 | Low (dev-only) | `/api/save-gif` dev middleware allows path traversal | [Code-read] |
| BUG-07 | Low | Sink databases are always flagged SPOF; behavior undocumented | [Verified] |

### BUG-01 — Latency is not the critical path
`calculatePathLatency()` in `src/graph.js` does a BFS with one `visited` set shared across all paths. The first path to reach the target wins, so longer paths are never explored.

Repro: `a→b→d` (10 ms + 10 ms) and `a→c→d` (50 ms + 50 ms).
Expected: 100 ms via `c`. Actual: `{ totalLatency: 20, path: [a, b, d] }`.

The README sells "Critical Path Latency Calculator", so this underreports exactly the number the feature exists to show.

Suggested fix: longest path via DFS + memoization on the DAG; detect cycles first (SCC) and fall back to a bounded search; optionally return the top-N paths.

### BUG-02 — Terraform / Docker Compose export is claimed but missing
README's codebase tree says `codegen.js` is "Infrastructure as Code (Terraform / Docker Compose) export". `src/codegen.js` only exports SQL DDL functions (`generateSqlDdl`, `generateTableDdl`, `sanitizeSqlIdentifier`, …). `grep -i terraform|compose` over `src/` and `index.html` returns nothing.
Fix: implement it, or remove the claim.

### BUG-03 — Mermaid import is incomplete
Works: simple flowchart (`graph LR/TD` with `[ ] { } (( )) ([ ]) [( )]`), `sequenceDiagram`, `erDiagram`, C4 diagrams.
Fails with a hard error for the whole file:
- Chained edges: `A --> B --> C` → `Syntax error at line 2: unexpected token`
- `subgraph … end` → `unexpected token "subgraph X"`
- `stateDiagram-v2` and `classDiagram` → "Unsupported diagram type" (state machines can be **exported** to Mermaid but not imported back, so round-trip is one-way)

Not tested: `A --> B & C`, `click`, `classDef`/`style` lines, `%%{init}%%` directives.
Fix: see F-02.

### BUG-04 — Heuristics keyed on title text
`detectSpofs()` / `isCriticalBridge()` treat a node as:
- an entry if its title contains `client` or `gateway`
- a target if its title contains `db` or `postgres`
- non-SPOF if title/subtitle contains `replica` or `standby`

Example of a false positive: a node titled **"Feedback Service"** contains the substring `db`.
Fix: explicit per-node properties (role: entry / service / datastore / queue; `replicas: N`), with titles used only to pre-fill defaults.

### BUG-05 — Silent capacity defaults
When `maxCapacityQps` is not set, capacity defaults to 20,000 QPS (5,000 for `DATABASE`). All three templates I ran (microservices, monolith, AWS) report **zero** saturated nodes, so the headline "saturation alerts" feature is invisible until the user sets numbers.
Fix: show "capacity not set" in the inspector and on the badge; ship at least one template with an overloaded node.

### BUG-06 — Dev-server path traversal (low severity, dev-only)
`vite.config.js` registers `/api/save-gif`. It reads `filename` from the POST body and does `path.join(imgDir, filename)` with no sanitization, no extension allow-list and no body-size limit. With `vite --host`, anyone on the LAN can write files outside `img/`. It does not exist in the production build.
Fix: `path.basename()`, allow only `.gif`/`.png`, cap body size — or remove it from the repo and keep it as a local tool.

### BUG-07 — Sink DB is always a SPOF
In every probe the leaf `Postgres` node was flagged as a SPOF, including the case where it is the only datastore by design. This is arguably correct (no replica), but nothing in the README or UI explains it, and there is no way to mark "this is replicated" except the word `replica` in a title (see BUG-04).

---

## 2. Repository & documentation gaps

| ID | Issue |
|---|---|
| REPO-01 | **No `LICENSE` file**, though the README badge says MIT and links to `/blob/main/LICENSE`. Without it the code is legally "all rights reserved". |
| REPO-02 | **No `doc/` folder.** README's tree lists it, and the test files' headers reference `doc/test_scenario.md` and `doc/security_issues.md`. |
| REPO-03 | **Tests:** no `npm test` script, no CI. 9 standalone scripts, all passing. Some assert on strings inside `style.css` rather than behavior. |
| REPO-04 | `package.json`: empty `description`, `"main": "index.js"` (file doesn't exist), default version. |
| REPO-05 | `img/` contains timestamped working screenshots (`*_canvas_1792901….png`) and duplicate `sprint3_*.gif` files. Ship only assets the README references. |
| REPO-06 | One commit, 0 stars, no description / topics / website / live demo. |
| REPO-07 | Very large files: `main.js` 4,686 lines, `templates.js` 4,722, `renderer.js` 2,407, `mermaid.js` 1,695. Hard to review or contribute to. |
| REPO-08 | Build output has a single 1.14 MB chunk (307 KB gzip). `jspdf`, `gifenc`, and `html2canvas` could be lazy-loaded on first export. |

---

## 3. README claims vs. what I found

| README / your description | Status |
|---|---|
| ERD ↔ SQL | **ERD → SQL works** (Postgres / MySQL / ANSI DDL with FK constraints). **SQL → ERD is not implemented.** Mermaid `erDiagram` → ERD works. |
| Mermaid ↔ drawing | **Partial** (see BUG-03). |
| PlantUML conversion | Mentioned in `mermaid.js` description; **not tested**. |
| Terraform / Docker Compose export | **Not found** (BUG-02). |
| Notes tool | Not mentioned in the README; **no dedicated notes feature found** (no note/markdown/sticky element, only the regular text tool). |
| "100% Excalidraw compatible, zero data loss" | SVG-payload extraction has a passing test; full round-trip fidelity **unverified**. Too absolute to claim. |
| "Telemetry" | It visualizes numbers the user types in. "Flow overlay" or "Simulation" describes it better and avoids implying live monitoring. |
| Comparison table vs Lucidchart / Eraser | Not verifiable; replace with "what this replaces". |
| Autosave | **Exists** (localStorage key `excalidraw_craft_autosave_v1`) but is not mentioned in the README. |
| SPOF detection | **Works better than I expected**: on diamond and redundant-LB topologies it correctly flags the true SPOF and not the redundant nodes. |
| Capacity saturation | Works when capacity is set (1000 QPS into 500 capacity → 200%). |

---

## 4. Proposed features (prioritized)

### P0 — before sharing it publicly (days)
1. Fix BUG-01 and add a regression test (the diamond case above).
2. Add `LICENSE` (MIT) and remove or restore the `doc/` references.
3. Deploy a live demo (GitHub Pages or Vercel; set Vite `base`) and put the link at the top of the README.
4. Rewrite the README around *"One tool instead of five"*: a table of replaced tool → ExcaliCraft feature, a short GIF per conversion. Remove claims that aren't true (BUG-02, "zero data loss").
5. Add `npm test` and a GitHub Action that runs build + tests.
6. Harden or remove the `/api/save-gif` middleware.
7. Set repo description and topics.

### P1 — closes the gap between pitch and product (weeks)
- **F-01 SQL → ERD import.** Parse `CREATE TABLE` (PK, FK / `REFERENCES`, composite keys, `UNIQUE`, `NOT NULL`, defaults), detect dialect, report unsupported statements without failing. Add an export → import → export idempotency test.
- **F-02 Complete Mermaid import.** Chained edges, `&`, `subgraph` → boundary elements, `classDef`/`style`, `stateDiagram-v2`, optionally `classDiagram`. Collect errors per line and import what is valid instead of rejecting the file. Add round-trip tests for every diagram type that has an exporter.
- **F-03 Notes as a first-class feature.** A markdown note element and a per-element notes panel; include notes in PDF export and as comments in Mermaid / SQL output. This is the missing 5th tool in the "five in one" story.
- **F-04 Explicit node properties** (role, replicas, capacity, latency) in the inspector, replacing title matching (BUG-04, BUG-05, BUG-07).

### P2 — depth and polish
- **F-05 Directed SPOF analysis** via dominators from entry nodes to sinks, plus "affected paths" highlighting on click. Keep articulation points as the quick mode.
- **F-06 Critical-path highlighting** on the canvas; per-node p50/p99 annotations instead of summing; a utilization color scale. If you add a queueing hint above ~70–80% utilization, label it clearly as an estimate.
- **F-07 Versioned file format** (`.excalicraft` JSON with a schema version) and share-by-URL-hash for small diagrams.
- **F-08 Arabic / RTL support.** The fonts named in the README (Outfit, Caveat, JetBrains Mono) are Latin-oriented [Unverified in-app]. Add an Arabic-capable font (e.g. Cairo / Noto Naskh) and RTL text direction in labels and notes. Worth it given the Arab-community audience.
- **F-09 More interchange formats:** DBML (dbdiagram.io) and Prisma schema import/export.
- **F-10 Lazy-load export libraries** to cut initial bundle size.

### P3 — nice to have
IaC export (Terraform / Docker Compose) if you decide to keep that promise; PWA/offline install; optional real-time collaboration; template gallery contributed by the community; keyboard-only and screen-reader accessibility pass.

---

## 5. Honest evaluation

**Short version:** a genuinely good idea with a solid core, wrapped in a README that promises more than the code delivers, and a repo that isn't yet set up for strangers to trust or contribute to. It's an impressive v0.9, not yet a finished open-source project.

Subjective scores (based only on what I could verify):

| Area | Score | Why |
|---|---|---|
| Idea / differentiation | **8/10** | Animated flows + SPOF/capacity overlay + C4 + ERD + Mermaid in one free, local-first tool is a real gap. |
| Core engineering (graph, DDL) | **7/10** | SPOF handles redundancy correctly; DDL output is clean and sanitized; 9/9 test scripts pass. Latency bug and title-matching drag it down. |
| Completeness vs. its own pitch | **5/10** | SQL → ERD, Terraform/Compose and notes are missing; Mermaid import is partial. |
| Docs honesty | **4/10** | Several claims aren't true or can't be verified; the strongest features are barely explained. |
| Repo hygiene | **3/10** | No license, no demo, missing `doc/`, one commit, stray assets, no CI. |
| Visual presentation | **8/10** | The GIF showcase is strong and sells the idea in seconds. |

**What I would do first:** BUG-01 → LICENSE + demo → README rewrite → SQL import and Mermaid completeness → notes. After that, the "five tools in one" claim is true and provable, which is the thing that will make people star it.

**Limits of this review:** I read and ran the logic, not the UI. Rendering quality, interaction feel, export fidelity (GIF/PDF/PNG), and performance with hundreds of elements are untested and could change the picture in either direction.
