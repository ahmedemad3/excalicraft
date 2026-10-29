# Security Audit — excalidraw-REA (ExcaliCraft)

**Run date:** 2026-10-26
**Profile:** `quick` (single hunter wave + coverage-critic pass; appropriate for source size)
**Scope:** `src/` (11 JS modules), `index.html`, `package.json` / `package-lock.json` (dependency versions).
**Out of scope:** `dist/` build artifacts (see Observation D1), `node_modules/` internals (dependency health reviewed at version level only), `doc/` files (used as prior-run claims evidence), `img/`.
**Source state reviewed:** no git metadata present in the working directory; file set as of 2026-10-26.

**Method:** source-first review of every trust boundary, then sandboxed local validation of candidate findings (Node harness with stubbed canvas 2D context, no network, temporary scratch directory, inputs constructed ad hoc — no live services probed). Browser-only wall-clock behavior is marked where owner observation is required.

---

## 1. Architecture & trust boundaries

ExcaliCraft is a fully client-side, backend-less single-page drawing app (Vite + Rough.js + canvas 2D). Trust boundaries:

1. **Imported diagram files** (`#fileInput` → `importFromJson` → `this.elements`) — the only boundary where *external, attacker-influenced data* enters the runtime. A `.excalidraw`/`.json` file shared by another party is attacker-controlled until proven otherwise.
2. **Export artifacts** (SVG/PNG/PDF/GIF/JSON) — data flowing *out*; relevant because exported SVG may be opened elsewhere.
3. **Local user input** (canvas, inspector fields, clipboard) — same-principal authority, not a boundary crossing.

No network calls, `postMessage`, `Worker`, `window.open`, storage APIs, or URL-parameter consumption exist in `src/`. The only external origin used is Google Fonts (`index.html:8-10`).

## 2. Findings

### F1 — Imported files bypass all claimed validation: schema/type errors crash the render pipeline (bricks the session)

**Severity: Low** · CWE-20 / CWE-754 · Confirmed (locally demonstrated)

- **Principal & resource:** any user who opens an attacker-supplied `.excalidraw` file.
- **Intended control:** `doc/security_issues.md` (SEC-S1-04, SEC-S2-03) claims the import handler enforces clamps ("points.slice(0,5000)", roughness/coordinate clamps, "±10,000,000") and that a "schema structural validator with default type fallbacks" runs on JSON load.
- **Actual code:** `src/export.js:495-512` (`importFromJson`) contains **no validation of any kind** — it accepts `JSON.parse` output when `data.elements` (or the root itself) is an array and passes it straight through (main.js `fileInput` change handler, `2870-2790`). `normalizeElement` (`src/math.js:38-61`) is applied only to freshly drawn shapes, never to imported data, and contains no clamps anyway.

Malformed property **types** (parseable JSON, wrong JS type) reach `SceneRenderer.renderElement`, which has no try/catch (only Rough.js shape generation does, `renderer.js:1048-1112`). Locally reproduced with the real modules, exact results:

| Imported element | Observed |
|---|---|
| `type: "text", text: 123` or `{"a":1}` | `TypeError: (element.text || "").split is not a function` (`renderer.js:1158`) |
| `type: "node", icon: 123` | `TypeError: (iconName || "").toLowerCase is not a function` (`icons.js:71`) |
| `type: "node", badge: 123` | `TypeError: element.badge.toUpperCase is not a function` (`renderer.js:340`) |
| `type: "state-node", actions: "abc"` | `TypeError: element.actions.forEach is not a function` (`renderer.js:725`) |

Each throw propagates out of `render()` with no catch, so every interactive render path (select, drag, inspector update) throws against the broken scene and the canvas is permanently blank until page reload. Undo history does not help: the imported file replaced `this.elements` entirely (`main.js:2783`).

- **Result for the owner:** a one-click availability failure triggered by opening a craftable file; user work created before import is lost from view.
- **Refuted sub-case (verified, not assumed):** `icon: "__proto__"` / `"constructor"` are **safe** — the installed lucide `icons` registry (`node_modules/lucide`, v1.61.0) exposes a null-prototype object, so prototype-key lookups return `undefined` and fall back to the `Box` default icon. Vendor claim SEC-S1-08 holds for lookup; vendor claim SEC-S2-03 (type fallbacks) does not hold.
- **Smallest effective fix (last trusted decision point):** in `importFromJson`/on load in `main.js`, validate before commit: allow-list `type` values; coerce `title/subtitle/badge/text/icon/label` with `String(value)`; require `Array.isArray(actions/columns/points)` (else `[]`); clamp `points = points.slice(0, 5000)` and coordinates with `Number.isFinite(...)` bounds. Add a per-element `try/catch` skip in the render loop so one bad element cannot take down the frame.
- **Regression test:** parse the four payloads above through `importFromJson` and assert `render()` completes without throwing.

### F2 — Unbounded imported data drives repeated O(n) work and 50-deep full-scene cloning: freeze and memory exhaustion

**Severity: Medium** · CWE-400 / CWE-770 · Confirmed work amplification locally; browser freeze/OOM endpoint owner-observable

The same missing boundary as F1 has an availability-only consequence the type-safety fix above does not cover. Source paths that do work proportional to attacker-controlled sizes, per *event*, all fed by unvalidated imports:

- **Per render frame:** freedraw stroke path — `renderer.js:788-824` iterates every point of every element; minimap redraws all points per update (`minimap.js:211-219`).
- **Per eligible frame:** the `requestAnimationFrame` loop (`main.js:250-259`) calls full `render()` whenever any animated arrow exists — repeated cost against unbounded arrays.
- **Per pointer-down and per pointer-move while dragging:** `hitTest` over freedraw runs `distanceToSegment` for every point pair (`math.js:219-228`), i.e. O(n) per mousemove over a 10M-point stroke.
- **Per edit action — dominant amplifier:** `HistoryManager.record` deep-clones the *entire* scene with `JSON.parse(JSON.stringify(...))` (`history.js:14-24`), retaining up to 50 snapshots. Inspector handlers call `record()` on **every `input` event** (e.g. every keystroke of an ERD column name, `main.js:751-756`).

Locally demonstrated (Node harness, same V8 engine class as the browser):

- 500,000-point freedraw → **500,141 stroke-path operations per single `renderElement` call**.
- One ~32 MB freedraw element → one `history.record()` clone **375 ms** and **~1.6 GB** retained at the 50-snapshot undo ceiling — while ordinary interaction (arrow-key nudges, `main.js:2486-2498`) triggers `record` continuously.

- **Result for the owner:** opening a sizeable craftable file makes every interaction cost hundreds of milliseconds and multi-gigabyte memory growth → UI freeze, tab OOM crash.
- **Smallest effective fix:** enforce the size budget at import (the missing clamp from F1: ≤5,000 points, numeric coordinates clamped to `±1e7`, arrays length-capped) — this enforces the documented invariant at the one point external data enters. Secondary: cap undo snapshots by serialized size in `HistoryManager.record`.
- **Validation note:** the harness measured clone/iteration cost in Node; the final user-visible tab freeze in a real browser should be observed by the owner (open a fixture with a 2M-point stroke) — the code path amplification itself is source-evident and locally reproduced.

### F3 — Documented security controls are absent from the code (trust-model divergence)

**Severity: Informational (process)** · Cross-cutting

`doc/security_issues.md` marks as "Verified Safe" a set of controls that do not exist in `src/`:

| Claimed (doc) | Reality in source |
|---|---|
| SEC-S1-04: import clamps points to 5,000, roughness 0–5, coords ±10M | No clamp exists (`export.js:495-512`); caused F1/F2 |
| SEC-S2-02: max 100 columns per table on import | Unbounded (`renderer.js:517` iterates `element.columns` as-is) |
| SEC-S2-03: schema validator with type default fallbacks on JSON load | Only `Array.isArray` exists (`export.js:500-503`); caused F1 |
| SEC-S1-06: clean rejection of invalid structure | Holds (structural rejection only) |
| SEC-S2-07: numerical bounding clamp on scrollX/scrollY | No clamp in `onWheel`/pan (`main.js:2376-2403`) — inert in practice (finite deltas), claim is inaccurate |
| SEC-S1-08: safe icon lookup, prototype traversal impossible | **Holds** — locally verified null-prototype registry |
| SEC-S2-05: clipboard deep clone strips internal handles | Holds (`main.js:2578-2583`) |

Prototype pollution via import (SEC-S1-03) is safe in the current code, but only incidentally: imported `__proto__` keys remain own data properties through `JSON.parse`/spread/`record()`; no evaluation path assigns attacker-chosen keys (`applyStyleToSelection` uses fixed key names, `main.js:512`). There is no defense-in-depth allow-list — the guarantee is fragile against future refactoring.

**Fix:** update the security registry to match reality, or implement the documented controls (they are exactly the F1/F2 fixes above).

### Observations (informational, no boundary violation)

- **O1 — No CSP.** No `Content-Security-Policy` meta in `index.html`; the vendor-hardening guideline from Sprint 1 is unreferenced. Hardening note only — today's XSS posture does not depend on it (see Section 3; importing `unsafe-inline`-style guidance would not fix anything currently exploitable).
- **O2 — External font origin.** `index.html:8-10` loads Google Fonts from `https://fonts.googleapis.com/gstatic`. Availability and privacy (third-party request on every load) dependency; if fonts fail, canvas text rendering falls back gracefully.
- **O3 — `dist/` provenance mismatch.** `dist/index.html` ships chunks naming `purify.es` and `html2canvas`, and `package-lock.json` carries `dompurify 3.4.17`/`html2canvas 1.4.1` (transitive via `jspdf 4.2.1`), while `src/` imports neither directly. Nothing explosive, but the shipped bundle should be re-generated from the audited source before release so the reviewed build corresponds to `dist/`.

## 3. XSS assurance (negative results — checked surfaces)

No cross-site scripting sink was found carrying attacker-controlled data. Verified:

- Canvas rendering uses `ctx.fillText()` exclusively for all user strings (`renderer.js` throughout); no HTML interpolation.
- SVG export builds XML via `createElementNS` + `textContent`/`setAttribute` (`export.js:195-464`) — escapes are automatic; no element/attribute creation from raw strings.
- All `innerHTML` uses in `main.js` (static registry data only — icon grid `main.js:466`, ERD key select `main.js:730`, telemetry placeholder `main.js:800`); the telemetry JSON view uses `textContent` (`main.js:805`).
- Clipboard is in-memory only with JSON round-trip cloning (`main.js:2578-2583`); no design-mode `paste` parsing of HTML.
- DOMPurify/html2canvas are present only as transitive jspdf dependencies, never fed untrusted data.

## 4. Dependency health (versions in `package-lock.json`)

`vite 8.3.5`, `jspdf 4.2.1`, `lucide 1.61.0`, `roughjs 4.6.6`, `gifenc 1.0.3`, `dompurify 3.4.17`, `html2canvas 1.4.1` — all current-generation versions, consistent with `package.json` ranges. No pinned-known-vulnerable versions identified at review time; no lockfile drift.

## 5. Coverage statement

`quick`-profile run: all `src/` modules read in full (main.js, renderer.js, export.js, math.js, history.js, icons.js, minimap.js, presenter.js; templates.js and style.css pattern-scanned — templates.js is static data, style.css is presentation-only), plus `index.html` and lockfile. One mitigation: templates/style were not read line-by-line; no dynamic constructs were found by targeted scan. `dist/` and `node_modules` internals out of scope per the primary scope. No prior coverage ledger existed for this target — this run must not be read as exhaustive; a `standard`/`deep` pass (e.g. dependency supply-chain integrity checks, browser-side fixture validation of F2's freeze endpoint) would add depth.

## 6. Evidence & reproduction summary

Local validation harness (Node 24, isolated scratch dir, stubbed canvas 2D context, no network):

- `T1/T2` — the four F1 crash payloads, real `icons.js` / `renderer.js` under load.
- `T3` — call-count amplification for unbounded freedraw rendering.
- `T4` — `history.record` clone cost and retained-memory amplification.
- Null-prototype verification of the lucide `icons` registry (refutes the inheritance-crash sub-path).

Harness retained outside the target at `C:\Users\ahmed\AppData\Local\Temp\opencode\excalidraw-rea-audit\` (harness.mjs, harness2.mjs); no target files modified; no artifacts promoted into the repository.
