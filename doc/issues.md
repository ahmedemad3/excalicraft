# ExcaliCraft System Issues & Enhancements Log

**Project**: ExcaliDraw Pro (ExcaliCraft)  
**Location**: `doc/issues.md`  
**Last Updated**: October 29, 2026  
**Status Overview**: 49 Tracked Issues | 49 Resolved (100%) | 0 Open — Sprints 1–7 Completed 🟢

---

## README Recommendations & Issue Correlation

### 2. Does Resolving the Issues in doc/issues.md Cover the Above?
Yes, resolving the issues in `doc/issues.md` (specifically Sprint 7 issues ISSUE-35 through ISSUE-49) covers almost all of these recommendations directly.

Here is the exact correlation:

| Recommendation in README | Corresponding Issue in doc/issues.md | How Resolving It Covers It |
| :--- | :--- | :--- |
| **#1: One Tool Instead of Five** | Structural Alignment | Highlights the multi-diagram capabilities established across Sprints 1–6 (C4, ERD, Mermaid, Whiteboard). |
| **#2: Honest Flow Overlay Disclaimer** | ISSUE-49 | Removes misleading "Telemetry Ops" branding in favor of "Flow Simulation Mode". |
| **#3: Import & Export Matrix** | ISSUE-46, ISSUE-47, ISSUE-48 | ISSUE-46 clarifies SQL DDL is export only; ISSUE-47 adds auto-save to docs; ISSUE-48 replaces "zero data loss" overclaims with accurate fidelity metrics. |
| **#4: Known Limitations Section** | ISSUE-35, ISSUE-37, ISSUE-38, ISSUE-39, ISSUE-41 | The limitations list mirrors the exact bugs being addressed: latency shortest vs critical path (ISSUE-35), capacity 20k default (ISSUE-39), SPOF title heuristics (ISSUE-38 & ISSUE-41), and Mermaid syntax errors (ISSUE-37). |
| **#5: Roadmap Section** | ISSUE-35, ISSUE-37, ISSUE-38, ISSUE-43, Sprint 5 | Defines what is resolved in Sprint 7 (critical path, Mermaid fixes, explicit roles, CI test script) and sets clear milestones for future sprints (SQL import, notes, RTL). |
| **#6: Testing & GIF Generation Guide** | ISSUE-43, ISSUE-40 | ISSUE-43 provides the unified npm test script and CI workflow; ISSUE-40 hardens the /api/save-gif dev endpoint against directory traversal. |
| **#7: Correct Codebase Tree** | ISSUE-36 | Formally corrects the false Terraform/Docker Compose claim for src/codegen.js. |

---

## Issues Summary Table

| Issue ID | Category | Title | Severity | Status | Verification |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **ISSUE-01** | Interoperability | Mermaid Diagram Type Misclassification & Live Editor Syntax Errors | High | 🟢 Resolved | Verified (Flowchart TD + Subgraphs, Live Editor Valid) |
| **ISSUE-02** | UI / Navigation | Remove "How It Works" Button & Modal from Top Header | Low | 🟢 Resolved | Verified (Clean Header, No Dead Buttons) |
| **ISSUE-03** | Visual Design | Modal UI Enhancement (Modern Glassmorphism & Fancy Theme) | Medium | 🟢 Resolved | Verified (macOS dots, Glassmorphism, Glow Buttons) |
| **ISSUE-04** | Export Engine | Improve GIF Resolution & Dimensions to Match Full PNG Size | Medium | 🟢 Resolved | Verified (1:1 Canvas Bounds, 60px Padding) |
| **ISSUE-05** | Properties UI | Fix Properties Widget Left Clipping & Horizontal Overflow | High | 🟢 Resolved | Verified (280px Width, No Scrollbar, No Clipping) |
| **ISSUE-06** | Icon Engine | Fix Missing Icons (PubSub, Kafka, BlobStorage) & Incomplete Database Icon | High | 🟢 Resolved | Verified (Direct SVG in Picker + Ellipse Cap on Canvas) |
| **ISSUE-07** | Interoperability | Sequence Diagram Duplicate Participants & Vertical Lifelines in Mermaid | High | 🟢 Resolved | Verified (4 clean participants, 7 ordered messages, 0 ghost loops) |
| **ISSUE-08** | Interoperability | State Machine Diagram Mermaid Export Invalid Syntax (stateDiagram-v2) | High | 🟢 Resolved | Verified (Valid stateDiagram-v2, <<choice>>, action compartments) |
| **ISSUE-09** | Architecture / Reliability | C4 SPOF Toggle Not Working (Sticky Detection & Missing Display) | High | 🟢 Resolved | Verified (Direct canvas badge & pulse border toggle, manual override preserved) |
| **ISSUE-10** | UI / Aesthetics | SQL Dialect Control Enhancement (Fix Text Wrapping & Enhance Segment UI) | Medium | 🟢 Resolved | Verified (No text wrap on ANSI SQL, single-line segment with tactile active pill) |
| **ISSUE-11** | Canvas / Styling | Background / Fill Color Not Working Across Multiple Component Types | High | 🟢 Resolved | Verified (Full element.backgroundColor & effectiveFillStyle in Inspector & Canvas) |
| **ISSUE-12** | Core / State Persistence | Local State Persistence (localStorage Debounced Auto-Save & Session Restore) | High (v1.0 Gap) | 🟢 Resolved | Verified (Debounced auto-save on history changes, instant reload on F5 with toast) |
| **ISSUE-13** | Safety / Core UX | Destructive Action Confirmations (Clear Canvas & File Import Modals + Undo) | High (v1.0 Gap) | 🟢 Resolved | Verified (Clean glassmorphism confirm dialog, red danger action, 100% Ctrl+Z restorable) |
| **ISSUE-14** | Onboarding / First-Time UX | First-Time User Onboarding & Empty State Floating Card | High (v1.0 Gap) | 🟢 Resolved | Verified (Subtle floating starter card, 4 quick templates, auto-hides on canvas dirty) |
| **ISSUE-15** | Feedback / Notifications | Unified Toast Feedback System (Clipboard, Exports, Auto-Save, Warnings) | High (v1.0 Gap) | 🟢 Resolved | Verified (Bottom-center floating toast pill with slide-up, auto-dismiss, icon accents) |
| **ISSUE-16** | Productivity / Help | Keyboard Shortcuts Cheat Sheet Modal (? Hotkey & Top Bar Button) | Medium (Nice-to-Have) | 🟢 Resolved | Verified (Categorized 4-column modal, kbd tags, triggered by ? key or header icon) |
| **ISSUE-17** | Presentation Mode | Presentation Mode Controls Simplification & Fit Viewport Camera Fix | High | 🟢 Resolved | Verified (Removed architecture/service/data slide pills, auto-fit on enter, reliable Fit button) |
| **ISSUE-18** | Theme / Readability | Dark Theme Diagram Contrast & Boundary Translucency Rectification | High | 🟢 Resolved | Verified (Dynamic luminance contrast, dark surface cards, non-foggy group boundaries) |
| **ISSUE-19** | UI / Branding | Header Brand Subtitle Cleanup (Remove "Excalidraw Engine") | Low | 🟢 Resolved | Verified (Clean ExcaliCraft logo, brand tag eliminated) |
| **ISSUE-20** | UI / Toolbar | Tool Palette Hand Tool Priority Reordering (Move Hand Before Selection) | Low | 🟢 Resolved | Verified (Hand tool is 1st element before Select tool) |
| **ISSUE-21** | Interoperability & C4 | C4 Diagram Standardization & Mermaid C4Context/C4Container Bi-directional Interop | High | 🟢 Resolved | Verified (Authentic Person head/torso, 3D DB cylinder, C4Context syntax, nested boundaries) |
| **ISSUE-22** | Inspector / Typography | Text Element Attributes Missing Controls on Selection & `.excalidraw` Import | High | 🟢 Resolved | Verified (Image 1 layout: Font family, S/M/L/XL size, 2-row align grid, opacity ticks, layers) |
| **ISSUE-23** | Inspector / Shapes | Drawing Shape Attributes Missing Controls (Fill, Stroke, Edges, Shape Text) | High | 🟢 Resolved | Verified (Image 2 layout: 5 swatches + divider, Edges sharp/round, shape typography, inline text editor) |
| **ISSUE-24** | UI / Navigation | Rename Top Navigation Export Button to "Export/Import" | Low | 🟢 Resolved | Verified (Top nav button updated to "Export/Import" with download icon) |
| **ISSUE-25** | Export Engine / PDF | PDF Export Uncentered, Small Size, and Excessive Padding Rectification | High | 🟢 Resolved | Verified (Standard A4 pagination, centered viewport, 2x retina supersampling) |
| **ISSUE-26** | Export Engine / SVG | SVG Export Missing Text, Unformatted Multi-line Code, & Hardcoded Typography Fix | High | 🟢 Resolved | Verified (Google Fonts pre-import, tspan multiline preserve, shape labels, text-anchor) |
| **ISSUE-27** | Typography / Canvas | Text Alignment Inverted (Align Right aligns left and vice versa) | High | 🟢 Resolved | Verified (Accurate text width bounding anchor, ctx.textAlign parity) |
| **ISSUE-28** | Core / Canvas Layers | Layers Z-Order Controls Inoperative (Send to Back, Backward, Forward, Front) | High | 🟢 Resolved | Verified (Stable multi-element array swapping, renderer z-order preservation, toast feedback) |
| **ISSUE-29** | Properties UI | Reorganize Properties Widget (Contextual Architecture vs Drawing Shapes & Right Docking) | High | 🟢 Resolved | Verified (Right-floating 16px dock, clean contextual separation, irrelevant styles suppressed) |
| **ISSUE-30** | Export Engine | Telemetry Overlays Gating in Exports | Medium | 🟢 Resolved | Verified (Pure clean export when overlay off, metrics when active) |
| **ISSUE-31** | Canvas | Canvas Background Color Selection | Medium | 🟢 Resolved | Verified (8 palette swatches + hex input, smooth canvas repaint & autosave) |
| **ISSUE-32** | Interoperability | Excalidraw & Compressed SVG Import | High | 🟢 Resolved | Verified (Deflate decompression & direct file reading supported) |
| **ISSUE-33** | C4 / Inspector | C4 Boundary Border Style Dash Override & Network Archetype Selection | High | 🟢 Resolved | Verified (Boundary styles respect user selection, C4 archetypes present) |
| **ISSUE-34** | C4 / Primitives | C4 Architecture Primitives Library & Property Inspector Integration | High | 🟢 Resolved | Verified (All 11 C4 primitives added to palette & dedicated inspector) |
| **ISSUE-35** | Graph / Algorithm | BUG-01: Critical Path Latency Uses BFS+Shared Visited — Returns Shortest, Not Critical Path | High | 🟢 Resolved | Verified (TC-S7-LAT-01 diamond DFS critical path, TC-S7-LAT-02 linear chain) |
| **ISSUE-36** | README / Docs | BUG-02: README Claims Terraform/Docker Compose Export — Feature Does Not Exist | Medium | 🟢 Resolved | Verified (README updated, 0 false IaC claims, codegen.js accurate) |
| **ISSUE-37** | Interoperability | BUG-03: Mermaid Import Rejects Valid Syntax (Chained Edges, Subgraphs, stateDiagram-v2) | Medium | 🟢 Resolved | Verified (TC-S7-MRM-01..04, chained edges, subgraphs, warning tolerance) |
| **ISSUE-38** | Graph / Heuristics | BUG-04: SPOF/Entry/Target Detection Uses Title Substring Matching — False Positives | Medium | 🟢 Resolved | Verified (TC-S7-SPF-01, explicit role property prevents FP) |
| **ISSUE-39** | Graph / UX | BUG-05: Capacity Silently Defaults to 20k QPS — Saturation Badges Never Fire on Templates | Medium | 🟢 Resolved | Verified (TC-S7-CAP-01, saturation badge fires at 175% in Flash Sale template) |
| **ISSUE-40** | Security / DevServer | BUG-06: /api/save-gif Dev Middleware Has Path Traversal Vulnerability (No Sanitization) | High | 🟢 Resolved | Verified (SEC-S7-01..04, path traversal stripped, extension allowlist, 20MB cap) |
| **ISSUE-41** | Graph / UX | BUG-07: Sink Database Always Flagged SPOF With No Way to Mark as Intentional | Low | 🟢 Resolved | Verified (TC-S7-SPF-02, isReplicated suppresses stateful SPOF) |
| **ISSUE-42** | Repo Hygiene | REPO-01: No LICENSE File (MIT Badge Links to 404) | High | 🟢 Resolved | Verified (LICENSE file created at root, standard MIT Ahmed Emad 2026) |
| **ISSUE-43** | Repo Hygiene | REPO-03: No `npm test` Script — Tests Are Standalone Node Scripts With No CI | Medium | 🟢 Resolved | Verified (npm test runs 11/11 test suites via tests/run_all.js, CI workflow) |
| **ISSUE-44** | Repo Hygiene | REPO-04: package.json Has Empty Description and Non-Existent `main` Entry | Low | 🟢 Resolved | Verified (package.json description populated, non-existent main removed) |
| **ISSUE-45** | Repo Hygiene | REPO-05: img/ Contains Timestamped Working Screenshots and Duplicate Sprint GIFs | Low | 🟢 Resolved | Verified (Cleaned img/, exactly 16 production GIFs referenced in README) |
| **ISSUE-46** | README / Docs | README: SQL → ERD Import Claimed But Not Implemented | Medium | 🟢 Resolved | Verified (README matrix updated, clarified SQL DDL is export only) |
| **ISSUE-47** | README / Docs | README: Autosave Feature Exists But Is Not Mentioned | Low | 🟢 Resolved | Verified (README updated with dedicated Auto-Save & Session Restore section) |
| **ISSUE-48** | README / Docs | README: "100% Excalidraw Compatible, Zero Data Loss" Is Too Absolute | Low | 🟢 Resolved | Verified (README overclaims replaced with accurate high-fidelity metrics) |
| **ISSUE-49** | README / Docs | README: "Telemetry" Terminology Misleads Users — Should Be "Flow Overlay" | Low | 🟢 Resolved | Verified (README updated with Flow Simulation disclaimer and mode naming) |

---

## Detailed Resolution Log

### ISSUE-01: Mermaid Diagram Type Misclassification & Live Editor Syntax Errors
- **Reported**: When exporting architecture diagrams (AWS, GCP, Microservices, etc.), the generator falsely output `sequenceDiagram` instead of architecture flowcharts. Furthermore, opening the generated Mermaid in the official Mermaid Live Editor resulted in parse/syntax errors.
- **Root Cause**:
  1. `exportToMermaid` in `src/mermaid.js` used a flawed heuristic: `horizontalArrows.length >= 2` caused any cloud diagram with two horizontal connections (e.g., Client -> CloudFront -> S3) to be misclassified as a Sequence Diagram.
  2. Semicolons inside label replacements (`#40;` for parentheses) were subsequently replaced by `#59;`, generating corrupted invalid tokens like `#40#59;` which broke the Mermaid parser.
  3. Cloud boundaries (VPCs, Subnets, K8s clusters) were not mapped into Mermaid `subgraph` syntax.
- **Resolution**:
  - Restructured `isSequenceDiagram` detection in `src/mermaid.js`: only genuine sequence diagrams (activation boxes, lifelines, or single top-row participants with stepped horizontal messages) trigger `sequenceDiagram`.
  - Fixed `escapeMermaidLabel`: properly orders replacements (semicolons replaced first, followed by quotes and angle brackets; brackets safely encoded as `#91;` and `#93;`) to prevent corrupted `#40#59;` tokens.
  - Added support for `subgraph` clusters for cloud and network boundaries (`group-boundary`, `c4-boundary`, `network-boundary`) and database cylinder shapes `[("...")]`.
- **Verification**: Verified with automated test suites (`tests/sprint4_test.js`) and verified live in browser with AWS Serverless and Microservices architecture diagrams. Output imports and renders cleanly in Mermaid Live Editor.

---

### ISSUE-02: Remove "How It Works" Button & Modal from Top Header
- **Reported**: User requested removing the "How It Works" button from the main interface.
- **Root Cause**: `#btn-architecture` ("How It Works") was present in the top navigation bar (`index.html`) linking to the architecture evidence modal `#archModal`.
- **Resolution**:
  - Removed `<button id="btn-architecture">How It Works</button>` from `index.html`.
  - Safely guarded event listeners in `src/main.js` so no runtime errors occur.
  - Cleaned up top navigation layout to preserve spacing and alignment.
- **Verification**: Verified via `browser_subagent` navigation to `http://localhost:5173`. Header shows a clean, uncluttered toolbar without the "How It Works" button.

---

### ISSUE-03: Modal UI Enhancement (Modern Glassmorphism & Fancy Theme)
- **Reported**: User requested enhancing the modal UI to look fancy and visually stunning.
- **Root Cause**: Modals (`exportModal`, `sqlPreviewModal`, `mermaidModal`) had basic gray borders and generic layouts.
- **Resolution**:
  - Created `.fancy-modal` and `.fancy-code-window` components in `src/style.css` and `index.html`.
  - Added backdrop blur (`backdrop-filter: blur(18px) saturate(190%)`), subtle gradient accent lines, deep layered drop shadows (`rgba(0, 0, 0, 0.45)`), and rounded corners.
  - Added sleek macOS window header controls (traffic light red, yellow, and green micro-dots) on code preview containers with dark slate editors (`#0f172a`).
  - Added glow effects on action buttons (`.primary-glow`, `.emerald-glow`).
- **Verification**: Visually verified both the Mermaid Interop Modal and the SQL DDL Export Modal in the browser. Both display modern glassmorphism and macOS chrome.

---

### ISSUE-04: Improve GIF Resolution & Dimensions to Match Full PNG Size
- **Reported**: Exported GIFs were lower in resolution and smaller in dimensions compared to PNG exports.
- **Root Cause**: `exportToGif` in `src/export.js` clamped exported canvas dimensions with `maxDim = 850; scale = Math.min(1, maxDim / Math.max(rawWidth, rawHeight))`, while `exportToPng` rendered at full 1:1 canvas size with 60px padding.
- **Resolution**:
  - Removed the `maxDim = 850` downscale clamp in `exportToGif`.
  - Updated bounding box calculation to use `padding = 60` and `scale = options.scale || 1`, exactly matching `exportToPng`.
  - Configured high-fidelity color palette extraction and crisp frame quantization.
- **Verification**: GIF exports now generate at 1:1 pixel dimensions corresponding to the diagram's full bounding box.

---

### ISSUE-05: Fix Properties Widget Left Clipping & Horizontal Overflow
- **Reported**: In the architecture properties panel (as shown in user-attached screenshot), the left column of icons and field labels ("Sqs", "dstorage", "Gke", "rchitecture Level", "e Processing Latency") were clipped on the left, and an unwanted horizontal scrollbar appeared at the bottom.
- **Root Cause**:
  - `.property-inspector` had fixed `width: 250px;` and `overflow-x: auto;`.
  - The 5 buttons in the C4 Architecture Level segmented control and the 4 columns in the icon picker grid exceeded the available width, causing the container to scroll horizontally and clip content on the left.
- **Resolution**:
  - Increased `.property-inspector` width to `280px` with `box-sizing: border-box; overflow-x: hidden; overflow-y: auto;`.
  - Styled `.c4-level-control` with compact layout (`flex-wrap: nowrap; padding: 5px 2px; font-size: 10px; min-width: 0;`).
  - Styled `.arch-icon-picker-grid` with `grid-template-columns: repeat(4, minmax(0, 1fr)); box-sizing: border-box;` and text truncation with ellipsis.
- **Verification**: Verified via `browser_subagent` screenshot and inspection. "Architecture Level", "Baseline Processing Latency", "Sqs", "Gke", and "CloudStorage" labels render fully without any left clipping or horizontal scrollbars.

---

### ISSUE-06: Fix Missing Icons (PubSub, Kafka, BlobStorage) & Incomplete Database Icon
- **Reported**: Some architecture icons in the picker displayed text only without icons (PubSub, BlobStorage, Kafka). Additionally, the database icon was incomplete on the canvas.
- **Root Cause**:
  1. `ARCHITECTURE_ICONS` used PascalCase keys like `MessageSquare` and `HardDrive`. When generating picker HTML, `item.iconKey.toLowerCase()` produced `messagesquare` and `harddrive`. Lucide's `createIcons` expects kebab-case (`message-square`, `hard-drive`), causing icon rendering to fail silently.
  2. Canvas `drawLucideIcon` in `src/icons.js` lacked support for `tag === 'ellipse'`. Lucide's `Database` icon consists of an ellipse cap `[ 'ellipse', { cx: '12', cy: '5', rx: '9', ry: '3' } ]` plus two paths. The ellipse was skipped, leaving the database icon incomplete on canvas.
- **Resolution**:
  - Implemented `getLucideSvg(iconName, strokeColor, size)` in `src/icons.js` and updated `renderIconPicker` in `src/main.js` to render inline SVGs directly. This completely bypassed DOM race conditions and ensured all icons (including `PubSub`, `Kafka`, `BlobStorage`, `Sqs`, `Database`) render instantly.
  - Added support for `tag === 'ellipse'` with `ctx.ellipse()` and standard arc fallback in `drawLucideIcon` in `src/icons.js`.
- **Verification**: Verified in browser that the icon grid displays all icons clearly, and the database icon renders with its top ellipse cap intact on the canvas.

---

### ISSUE-07: Sequence Diagram Duplicate Participants & Vertical Lifelines in Mermaid
- **Reported**: In sequence diagrams exported to Mermaid, participants were duplicated (top and bottom cards), and vertical dashed lifelines were converted into erroneous self-referential message arrows (e.g. `P_0 -> P_0`).
- **Root Cause**:
  1. Sequence diagram canvas templates provide participant cards at the top and bottom of each lifeline for clarity. Naive graph extraction treated both top and bottom cards as unique participants, duplicating `Browser Client`, `API Gateway`, `Auth Microservice`, and `PostgreSQL DB`.
  2. The 4 vertical dashed arrows connecting top and bottom participant cards were captured as regular message arrows, producing ghost self-referential message loops.
- **Resolution**:
  - Added `exportSequenceToMermaid(elements)` in `src/mermaid.js` with participant grouping: cards sharing identical labels and within `±30px` vertical alignment are merged into single distinct participants.
  - The highest `y`-coordinate card is retained as the participant header (actors like `Browser Client` rendered with `actor` keyword, microservices/databases with `participant`).
  - Vertical connection arrows (delta-X < 25px and delta-Y > 80px) that span between matching top/bottom lifelines are explicitly filtered out from message sequences.
  - Retained genuine horizontal messages, sorted by ascending Y coordinate (execution time order), supporting both synchronous request arrows (`->>`) and asynchronous/return arrows (`-->>`).
- **Verification**: Verified via `tests/issues_verification_test.js` and live in browser: exactly 4 participants (`actor P_0_Browser_Client`, `participant P_1_API_Gateway`, `participant P_2_Auth_Microservice`, `participant P_3_PostgreSQL_DB`) and exactly 7 numbered clean messages. 100% valid in Mermaid Live Editor with 0 duplicates and 0 ghost lines.

---

### ISSUE-08: State Machine Diagram Mermaid Export Invalid Syntax (stateDiagram-v2)
- **Reported**: When exporting state machine diagrams to Mermaid, the generated output was invalid syntax or degraded into broken generic flowcharts.
- **Root Cause**:
  - State machine elements (`state-node`, `state-initial`, `state-final`, `state-choice`, `state-transition`) were unhandled by the Mermaid exporter.
  - Exporter attempted to dump them as standard flowchart nodes (`id[label]`), which failed to represent entry/do/exit compartments, initial `[*]` markers, and decision diamonds.
- **Resolution**:
  - Implemented `exportStateMachineToMermaid(elements)` in `src/mermaid.js` utilizing the official `stateDiagram-v2` Mermaid syntax specification:
    1. Detects `state-initial` elements and renders initial transition: `[*] --> FirstState`.
    2. Detects `state-final` elements and renders terminal transition: `LastState --> [*]`.
    3. Formats decision diamonds using `state choice_id <<choice>>`.
    4. Formats state actions (entry, do, exit) using Mermaid state compartments:
       - `StateName: entry / action`
       - `StateName: do / action`
       - `StateName: exit / action`
    5. Converts state transitions with triggers/guards into clean syntax: `StateA --> StateB: [guard] / action`.
- **Verification**: Verified via `tests/issues_verification_test.js` and live modal export in browser. Generates valid `stateDiagram-v2` rendering `[*] --> Draft`, `choice_1 <<choice>>`, guards `[risk < 0.20] / approve()`, and terminal state `--> [*]`.

---

### ISSUE-09: C4 SPOF Toggle Not Working (Sticky Detection & Missing Display)
- **Reported**: In C4 architecture models, clicking the SPOF (Single Point of Failure) checkbox in the property inspector did not display the SPOF alert badge/border, or got immediately overridden.
- **Root Cause**:
  1. `renderNodeCard` in `src/renderer.js` wrapped the SPOF badge and pulse border inside `if (options && options.metricsOverlay)`. Toggling `isSpof` on a component produced no visual feedback unless the user also enabled the metrics telemetry overlay (`Alt+M`).
  2. The graph analysis engine `detectSpofs()` in `src/graph.js` strictly computed articulation points via Tarjan's algorithm on every frame. When a user manually unchecked the SPOF toggle (`node.isSpof === false`), the next graph pass recalculated topological articulation and forcefully re-flagged the node as a SPOF.
- **Resolution**:
  - Separated SPOF badge and alert border rendering from `options.metricsOverlay` in `src/renderer.js`: any element with `element.isSpof === true` immediately displays the red single-point-of-failure warning badge and pulsing alert border on the canvas.
  - Added support for SPOF badges to `renderErdTable` in `src/renderer.js`.
  - Updated `ArchitectureGraph.detectSpofs()` in `src/graph.js` to respect explicit user overrides:
    - If `node.isSpof === false`, it is permanently deleted from the detected SPOFs set.
    - If `node.isSpof === true`, it is added directly to the SPOF set.
- **Verification**: Verified with automated graph tests in `tests/issues_verification_test.js` and live in browser: unchecking a topological SPOF keeps it disabled; checking an arbitrary component immediately displays the red SPOF alert badge on canvas without requiring metrics overlay mode.

---

### ISSUE-10: SQL Dialect Control Enhancement (Fix Text Wrapping & Enhance Segment UI)
- **Reported**: As shown in the user screenshot, in the SQL DDL preview modal, the "ANSI SQL" button was cramped, wrapping into two lines ("ANSI" on top, "SQL" below), and the dialect segmented control had insufficient spacing.
- **Root Cause**:
  - `.segment-btn` in `src/style.css` lacked `white-space: nowrap;` and used `flex: 1`, forcing buttons to compress and break text onto multiple lines on narrower viewports.
  - The segmented control lacked adequate inner padding, modern micro-interactions, and visual contrast between active and inactive dialect pills.
- **Resolution**:
  - Enhanced `.dialect-group` and `.segmented-control.fancy-segment` in `src/style.css`:
    - Enforced `white-space: nowrap;` and `min-width: fit-content;` on `.segment-btn`.
    - Added `flex-wrap: nowrap; gap: 8px;` to prevent button squishing.
    - Added generous horizontal padding (`7px 16px;`) and rounded pill radius (`8px`).
    - Styled active state (`.segment-btn.active`) with tactile drop shadow (`0 2px 8px rgba(0, 0, 0, 0.12)`), vibrant blue accent typography, and smooth transitions.
    - Styled dark mode `.fancy-segment` with sleek semi-transparent pill container (`rgba(255, 255, 255, 0.05)`) and dark slate active button (`#1e293b`).
- **Verification**: Visually verified in browser with DDL preview modal open: "PostgreSQL", "MySQL", and "ANSI SQL" sit cleanly side-by-side on a single line with zero text wrapping and smooth toggle animations.

---

### ISSUE-11: Background / Fill Color Not Working Across Multiple Component Types
- **Reported**: Selecting custom background / fill colors in the property inspector had no effect on several architecture and diagram component types.
- **Root Cause**:
  1. Component renderers in `src/renderer.js` (`renderNodeCard`, `renderErdTable`, `renderStateNode`, `renderSwimlane`, `renderActivityAction`, `renderFlowFinal`) hardcoded background colors or completely ignored `element.backgroundColor`.
  2. Rough.js drawables ignored `element.backgroundColor` when `element.fillStyle` defaulted to `'none'`.
  3. `updateInspectorUI()` in `src/main.js` hid `#standardShapeSection` (which contains the background and fill color pickers) whenever specialized architecture or UML components were selected.
- **Resolution**:
  - Updated `updateInspectorUI()` in `src/main.js` to ensure `#standardShapeSection` remains displayed (`style.display = 'block'`) for all single-element selections, exposing color pickers, stroke widths, and fill controls.
  - Updated `setBackgroundColor(color)` in `src/main.js`: automatically updates `el.fillStyle = 'solid'` if `fillStyle` was `'none'`, ensuring immediate canvas rendering.
  - Updated `getOrCreateDrawable` in `src/renderer.js` to dynamically fall back `effectiveFillStyle` to `'solid'` whenever `hasBg` is true and `fillStyle` is `'none'` or undefined.
  - Updated `renderErdTable`, `renderStateNode`, `renderSwimlane`, `renderActivityAction`, and `renderFlowFinal` in `src/renderer.js` to honor `element.backgroundColor` across both light and dark themes.
- **Verification**: Verified via `tests/issues_verification_test.js` and live canvas testing. Changing background and fill colors immediately updates ERD tables, state nodes, activity nodes, swimlanes, and C4 cards on canvas and in exports.

---

### ISSUE-12: Local State Persistence (localStorage Debounced Auto-Save & Session Restore)
- **Reported**: In v1.0, refreshing the browser tab (F5, Ctrl+R) or accidentally navigating away causes total loss of in-memory diagramming state.
- **Root Cause**: The application held the active `elements` array solely in heap memory without any automatic offline persistence layer or storage sync hook.
- **Resolution**:
  - Implemented debounced auto-save mechanism (`scheduleAutoSave` with 600ms debounce) wired directly into the core history subscription system (`this.history.subscribe(...)`), ensuring any canvas mutation, undo, or redo triggers serialized persistence.
  - Stored diagram payload under `excalidraw_craft_autosave_v1` in `localStorage`, persisting:
    1. Active `elements` array.
    2. Viewport offsets (`scrollX`, `scrollY`).
    3. Viewport scale (`zoom`).
    4. Active application `theme` (`light` / `dark`).
    5. Save timestamp.
  - On app launch, `this.loadAutoSave()` loads the persisted session into the canvas, resets history to the restored state, synchronizes viewport and theme, and displays an informative restore toast notification ("Session restored from auto-save (N elements)").
- **Verification**: Verified via automated Vite production build and simulated reload cycles. Reloading with active diagrams restores identical canvas elements, zoom position, and theme settings without data loss.

---

### ISSUE-13: Destructive Action Confirmations (Clear Canvas & File Import Modals + Undo)
- **Reported**: Clicking "Clear Canvas" or choosing a JSON/Mermaid import could silently wipe or overwrite hours of diagramming work in a single click with no confirmation or safety net.
- **Root Cause**: The "Clear Canvas" action previously invoked a simple browser `confirm()` dialogue (which is easily misclicked and blocks the main thread), and file/Mermaid imports immediately replaced `this.elements` without warning the user.
- **Resolution**:
  - Engineered an in-app glassmorphism confirmation modal (`#confirmModal`) with customized title, detailed descriptive warning (including element count), and a highlighted danger action button (`.danger-badge`).
  - Integrated `showConfirmDialog({ title, message, confirmText, confirmDanger, onConfirm })`:
    - **Clear Canvas**: Prompts with "Clear Canvas? This will remove all N elements from your canvas." and records a clean history state so <kbd>Ctrl+Z</kbd> immediately restores all cleared elements.
    - **File / Mermaid Import**: If `this.elements.length > 0`, warns the user that importing will overwrite their current canvas, with explicit reassurance that <kbd>Ctrl+Z</kbd> can undo the replacement.
  - Wired keyboard dismissal: <kbd>Escape</kbd> or backdrop clicks cancel destructive operations safely.
- **Verification**: Verified in UI with populated diagrams. Hitting Clear Canvas prompts with the modal; clicking "Clear Canvas" clears the elements; pressing <kbd>Ctrl+Z</kbd> restores the entire diagram seamlessly.

---

### ISSUE-14: First-Time User Onboarding / Empty State Floating Card
- **Reported**: First-time visitors are presented with a vast blank grid canvas, which is intimidating and fails to convey the advanced architectural capabilities of the tool.
- **Root Cause**: No empty state handler or welcome onboarding overlay existed; canvas initialized as a blank void when `elements` was empty.
- **Resolution**:
  - Designed and implemented a sleek, floating glassmorphism onboarding card (`#welcomeOnboarding`) anchored cleanly in the viewport.
  - Features:
    - Welcome badge and punchy introduction highlighting ExcaliCraft's architecture, C4, Cloud, and database capabilities.
    - 4 instant template starter pills with icons:
      1. **Microservices**: Loads Distributed Microservices Architecture with API Gateway, Services, and Redis/Postgres.
      2. **C4 Containers**: Loads C4 Banking System Container diagram with SPOF indicators and boundary zones.
      3. **PostgreSQL Schema**: Loads multi-table relational schema with primary keys, foreign keys, and DDL readiness.
      4. **AWS Serverless**: Loads CloudFront, Lambda, and DynamoDB cloud infrastructure diagram.
    - "Start with Blank Canvas" button that dismisses the card.
    - Auto-hides immediately upon loading any template or drawing any element, and automatically reappears if all canvas elements are cleared.
- **Verification**: Verified on clean sessions and after clearing canvas. Clicking each template pill instantaneously populates the canvas, updates history, fits the viewport, and hides the card.

---

### ISSUE-15: Unified Toast Feedback System
- **Reported**: Actions such as copying SQL DDL, exporting files, importing diagrams, and auto-saving either lacked user feedback or relied on varied, inconsistent UI state changes.
- **Root Cause**: Absence of a centralized, non-intrusive notification manager in the frontend layer.
- **Resolution**:
  - Built a lightweight, high-performance toast container (`#toastContainer`) and notification controller (`this.showToast(message, type, duration)`).
  - Features:
    - Sleek bottom-center pill notification with CSS glassmorphism, subtle backdrop blur, and smooth slide-up / fade-out animations.
    - Semantic color-coded left borders and Lucide icons: `success` (green checkmark), `info` (blue info pill), `error` (red alert triangle).
    - Auto-dismisses after 2.8 seconds with automatic DOM cleanup.
    - Integrated across all primary user workflows:
      - Export actions: PNG, SVG, PDF, GIF, and JSON exports.
      - SQL actions: Dialect DDL copy, SQL file downloads, and table-level SQL generation.
      - Mermaid actions: Markup clipboard copy and diagram generation.
      - State actions: Auto-save session restores and canvas clear confirmations.
- **Verification**: Verified during user interactions across exports, clipboard actions, and template loading. Toasts appear cleanly at bottom-center without layout disruption or UI locking.

---

### ISSUE-16: Keyboard Shortcuts Cheat Sheet Modal (? Hotkey & Top Bar Button)
- **Reported**: Users were unaware of the extensive keyboard shortcuts available in ExcaliCraft (e.g., <kbd>M</kbd>, <kbd>F</kbd>, <kbd>Alt+M</kbd>, <kbd>H</kbd>, <kbd>Ctrl+Z</kbd>, <kbd>Ctrl+C</kbd>, <kbd>Ctrl+V</kbd>).
- **Root Cause**: No discoverable help UI or shortcut modal existed in the application.
- **Resolution**:
  - Added a dedicated Keyboard Shortcuts Help button (`#btn-shortcuts-help`) to the top header actions bar with a keyboard icon.
  - Implemented the global <kbd>?</kbd> (Shift + /) hotkey to toggle the shortcuts modal instantly from anywhere in the application.
  - Built a 4-column structured cheat sheet modal (`#shortcutsModal`) categorized by:
    1. **Navigation & Viewport**: Hand tool (<kbd>H</kbd> / Space), Zoom In/Out (<kbd>+</kbd> / <kbd>-</kbd>), Reset View (<kbd>0</kbd> / <kbd>Shift+1</kbd>).
    2. **Architecture & Modeling**: Architecture Catalog (<kbd>M</kbd>), Fullscreen Mode (<kbd>F</kbd>), Mermaid.js Interop (<kbd>Alt+M</kbd>), Help (<kbd>?</kbd>).
    3. **Tools & Shapes**: Selection (<kbd>V</kbd>), Rectangle (<kbd>R</kbd>), Ellipse (<kbd>O</kbd>), Arrow (<kbd>A</kbd>), Text (<kbd>T</kbd>), Eraser (<kbd>E</kbd>).
    4. **Editing & History**: Undo (<kbd>Ctrl+Z</kbd>), Redo (<kbd>Ctrl+Y</kbd>), Copy (<kbd>Ctrl+C</kbd>), Paste (<kbd>Ctrl+V</kbd>), Delete (<kbd>Del</kbd>).
  - Styled with semantic `<kbd>` tags and dark/light responsive styling.
- **Verification**: Tested pressing <kbd>?</kbd> on canvas and clicking the top header icon. Modal displays cleanly, can be dismissed with <kbd>Escape</kbd>, close button, or background click.

---

### ISSUE-17: Presentation Mode Controls Simplification & Fit Viewport Camera Fix
- **Reported**: In presentation mode, remove "full architecture", "service layer", and "data" slide buttons and keep "exit"; additionally, the "fit" (zoom to fit) function was not working.
- **Root Cause**:
  1. The presentation control panel in [index.html](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/index.html) previously housed legacy multi-slide buttons (`#btn-pres-prev`, `#btn-pres-next`, `#pres-slide-indicator`, and layer filter buttons) that assumed pre-authored slide sequences rather than presenting the user's active canvas.
  2. In [src/presenter.js](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/presenter.js), `zoomToFit()` failed when canvas container dimensions returned zero prior to rendering, had inaccurate bounding box offsets, or did not properly synchronize the camera `{ zoom, scrollX, scrollY }` and `#zoomDisplay` UI indicator with the main canvas rendering loop.
- **Resolution**:
  - Simplified `#presentationControls` in [index.html](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/index.html): eliminated slide navigation and layer filtering pills, leaving only the essential `#btn-pres-fit` (Fit Viewport) and `#btn-pres-exit` (Exit Presentation) controls.
  - Overhauled `zoomToFit()` in [src/presenter.js](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/presenter.js):
    1. Computes the complete bounding box across all active elements (`minX`, `maxX`, `minY`, `maxY`) with an 80px breathing margin.
    2. Falls back to `window.innerWidth` and `window.innerHeight` if `canvas.clientWidth`/`clientHeight` are unmeasured.
    3. Clamps the zoom scale within safe thresholds (`0.15` to `2.5`) and centers the viewport camera offsets (`scrollX`, `scrollY`).
    4. Automatically updates `#zoomDisplay` text and dispatches a high-priority canvas re-render.
  - Added an automatic 60ms delayed `zoomToFit()` invocation directly upon `presenter.enter()`, guaranteeing diagrams auto-fit to screen immediately upon entering presentation mode.
- **Verification**: Verified via test suite and browser validation. Entering presentation mode automatically zooms to fit all diagram elements neatly within screen bounds; clicking "Fit" re-centers the canvas anytime; clicking "Exit" seamlessly restores standard editing controls.

---

### ISSUE-18: Dark Theme Diagram Contrast & Boundary Translucency Rectification
- **Reported**: Diagrams displayed poorly in dark mode (as demonstrated in user-provided screenshot): white cards had white/invisible text ("white on white" effect), and translucent VPC/group boundaries rendered as washed-out milky gray fog.
- **Root Cause**:
  1. In [src/renderer.js](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/renderer.js), `renderNodeCard` and `renderErdTable` defaulted component backgrounds to `#ffffff`. When the theme was switched to `dark`, text was automatically flipped to `#f8f9fa`, but the card background remained bright white, producing unreadable white text against white cards.
  2. Cloud group boundaries (`renderGroupBoundary`) had high fill opacities (`rgba(231, 245, 255, 0.45)`) designed solely for white backgrounds, causing them to wash out dark mode canvases as foggy milky blocks.
- **Resolution**:
  - Implemented standard WCAG relative luminance detector `isColorLight(color)` in [src/renderer.js](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/renderer.js) supporting hex (#RGB, #RRGGBB) and rgb/rgba formats.
  - Updated `renderNodeCard` in [src/renderer.js](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/renderer.js):
    - When `theme === 'dark'`, default white/unset/transparent backgrounds dynamically resolve to dark surface tone `#1e1f24`.
    - Component title, subtitle, and badge text colors dynamically adapt based on `isColorLight(effectiveBg)`: dark backgrounds use light text (`#f8f9fa`, `#adb5bd`), while custom light backgrounds retain crisp dark text (`#212529`, `#495057`).
  - Updated `renderErdTable` in [src/renderer.js](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/renderer.js) to resolve dark theme backgrounds to `#1e1f24` with high-contrast column names and types.
  - Updated `renderGroupBoundary` in [src/renderer.js](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/renderer.js): in dark mode, boundary fills use subtle translucent dark tints (`rgba(25, 113, 194, 0.12)` or `rgba(255, 255, 255, 0.02)`) instead of milky light-blue fills, eliminating foggy overlays while keeping boundary borders sharp.
- **Verification**: Verified via luminance test assertions in `tests/issues_17_21_test.js` and canvas theme rendering. Cards display crisp legible text and boundaries remain transparent and elegant across both light and dark themes.

---

### ISSUE-19: Header Brand Subtitle Cleanup (Remove "Excalidraw Engine")
- **Reported**: Remove the subtitle text "Excalidraw Engine" from the top-left application logo.
- **Root Cause**: The brand header `#brandLogo` in [index.html](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/index.html) contained `<span class="brand-tag">Excalidraw Engine</span>`.
- **Resolution**: Removed the `<span class="brand-tag">Excalidraw Engine</span>` element from [index.html](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/index.html), preserving the clean "ExcaliCraft" brand identity mark and typography.
- **Verification**: Inspected `#brandLogo` in [index.html](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/index.html) and confirmed only "ExcaliCraft" appears in the top navigation bar.

---

### ISSUE-20: Tool Palette Hand Tool Priority Reordering (Move Hand Before Selection)
- **Reported**: Move the Hand tool (Pan) to be the first element in the toolbar before the Selection tool.
- **Root Cause**: In [index.html](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/index.html), `#tool-select` was placed at index 0 and `#tool-hand` was placed at index 8 of the floating `#toolPalette`.
- **Resolution**: Reordered the tool buttons inside `#toolPalette` in [index.html](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/index.html) so that `#tool-hand` is the very first button in the toolbar, immediately followed by `#tool-select`. Preserved the `<kbd>H</kbd>` and `<kbd>1</kbd>` key indicator badges and click bindings.
- **Verification**: Inspected `#toolPalette` DOM structure in [index.html](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/index.html) and verified Hand tool is positioned first in the toolbar layout.

---

### ISSUE-21: C4 Diagram Standardization & Mermaid C4Context/C4Container Bi-directional Interop
- **Reported**: C4 diagram templates did not follow authentic C4 diagrams (rendered as generic cloud VPCs instead of genuine C4 persons, software systems, databases, and queues), and Mermaid generation produced generic flowcharts instead of official `C4Context` / `C4Container` format matching the user specification:
  ```mermaid
  C4Context
      title System Context diagram for Internet Banking System
      Enterprise_Boundary(b0, "BankBoundary0") {
          Person(customerA, "Banking Customer A", "A customer of the bank, with personal bank accounts.")
          Person(customerB, "Banking Customer B")
          Person_Ext(customerC, "Banking Customer C", "desc")
          Person(customerD, "Banking Customer D", "A customer of the bank, <br/> with personal bank accounts.")
          System(SystemAA, "Internet Banking System", "Allows customers to view information about their bank accounts, and make payments.")
          Enterprise_Boundary(b1, "BankBoundary") {
              SystemDb_Ext(SystemE, "Mainframe Banking System", "Stores all of the core banking information about customers, accounts, transactions, etc.")
              System_Boundary(b2, "BankBoundary2") {
                  System(SystemA, "Banking System A")
                  System(SystemB, "Banking System B", "A system of the bank, with personal bank accounts. next line.")
              }
              System_Ext(SystemC, "E-mail system", "The internal Microsoft Exchange e-mail system.")
              SystemDb(SystemD, "Banking System D Database", "A system of the bank, with personal bank accounts.")
              Boundary(b3, "BankBoundary3", "boundary") {
                  SystemQueue(SystemF, "Banking System F Queue", "A system of the bank.")
                  SystemQueue_Ext(SystemG, "Banking System G Queue", "A system of the bank, with personal bank accounts.")
              }
          }
      }
      BiRel(customerA, SystemAA, "Uses")
      BiRel(SystemAA, SystemE, "Uses")
      Rel(SystemAA, SystemC, "Sends e-mails", "SMTP")
      Rel(SystemC, customerA, "Sends e-mails to")
  ```
- **Root Cause**:
  1. C4 templates in [src/templates.js](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/templates.js) used generic `node-card` cloud infrastructure components with VPC boundaries rather than authentic C4 model entities.
  2. In [src/renderer.js](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/renderer.js), there was no renderer for authentic C4 person shapes (circular head with curved shoulder torso), 3D isometric database cylinders, or capsule queues.
  3. In [src/mermaid.js](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/mermaid.js), C4 diagrams were exported as standard `flowchart TD` or `graph TD` syntax, lacking support for official Mermaid C4 functions (`C4Context`, `C4Container`, `Person(...)`, `System(...)`, `SystemDb(...)`, `SystemQueue(...)`, `Enterprise_Boundary(...)`, `System_Boundary(...)`, `BiRel(...)`, and `Rel(...)`).
  4. There was no parser in [src/mermaid.js](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/mermaid.js) for importing official Mermaid C4 syntax.
- **Resolution**:
  - Implemented `renderC4Element(element, theme, options)` in [src/renderer.js](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/renderer.js):
    - **Person & Person_Ext**: Renders authentic circular head on curved torso in official C4 navy (`#08427b`) or external grey (`#6c757d`), with centered title, subtitle (with `<br/>` and word-wrap support), and `[Person]` type tag.
    - **SystemDb & SystemDb_Ext**: Renders 3D isometric cylinder database shape with elliptical caps and shaded body in blue (`#1168bd`) or grey (`#6c757d`) with `[Software System]` tag.
    - **SystemQueue & SystemQueue_Ext**: Renders rounded capsule queue shape with vertical divider arc.
    - **System & System_Ext**: Renders official C4 software system rectangle with rounded corners and centered multi-line text.
  - Updated `renderGroupBoundary` in [src/renderer.js](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/renderer.js) to render authentic C4 boundary headers centered at the top (`BankBoundary0 [ENTERPRISE]`, `BankBoundary [ENTERPRISE]`, `BankBoundary2 [SYSTEM]`, `BankBoundary3 [boundary]`).
  - Overhauled `getC4ContextDiagramTemplate` in [src/templates.js](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/templates.js) to generate the exact official C4 System Context diagram for Internet Banking System matching Image 2 and the user specification.
  - Implemented `exportC4ToMermaid(elements)` in [src/mermaid.js](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/mermaid.js):
    - Detects C4 diagrams via `isC4Diagram(elements)`.
    - Outputs valid `C4Context` or `C4Container` header and title.
    - Hierarchically exports nested boundaries (`Enterprise_Boundary`, `System_Boundary`, `Boundary`).
    - Outputs authentic C4 entities: `Person`, `Person_Ext`, `System`, `System_Ext`, `SystemDb`, `SystemDb_Ext`, `SystemQueue`, `SystemQueue_Ext`.
    - Exports relationships with technology annotations: `Rel(from, to, "label", "techn")` and `BiRel(from, to, "label")`.
  - Implemented `parseC4Diagram(rawLines)` in [src/mermaid.js](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/mermaid.js):
    - Parses `C4Context`, `C4Container`, `C4Component`, and `C4Dynamic` diagrams.
    - Extracts nested boundary scopes, entity parameters (id, title, subtitle/description), and relationships.
    - Generates canvas elements and layout matching Image 2.
- **Verification**: Verified via [tests/issues_17_21_test.js](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/tests/issues_17_21_test.js):
  - `exportToMermaid` on C4 diagrams produces 100% valid `C4Context` Mermaid syntax matching user specification.
  - `importFromMermaid` accurately parses the exact user-provided C4 snippet into interactive canvas elements, boundaries, and relationship arrows.
  - `npm run build` succeeds cleanly with 0 errors.

---

### ISSUE-22: Text Attributes Missing Inspector Controls on Selection & `.excalidraw` Import
- **Reported**: When importing external `.excalidraw` files (e.g., `Mentor - 3rd Session.excalidraw`) or selecting text elements on canvas, text attributes did not match authentic Excalidraw attributes as illustrated in the user's reference image 1.
- **Root Cause**:
  1. The inspector panel lumped standard shape and text controls together, without dedicated controls for typography, font family options, font sizing, or horizontal + vertical text alignment.
  2. `sanitizeImportedElements()` in [src/export.js](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/export.js) stripped critical Excalidraw typography fields: `fontFamily`, `fontSize`, `textAlign`, `verticalAlign`, `lineHeight`, and `baseline`. Imported text elements were forced to fall back to hardcoded defaults.
  3. `renderTextElement()` in [src/renderer.js](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/renderer.js) did not dynamically compute multiline offset based on `textAlign` (`left`, `center`, `right`) and `verticalAlign` (`top`, `middle`, `bottom`).
- **Resolution**:
  - Restructured `#standardShapeSection` in [index.html](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/index.html) into modular, independently toggleable sections:
    - **Stroke Palette**: 5 preset color swatches + subtle vertical divider + custom HTML5 color picker with rainbow border.
    - **Font Family**: 4 authentic icon buttons (Virgil/Caveat hand-drawn, Outfit sans-serif, JetBrains Mono monospace, and Times Roman/Comic).
    - **Font Size**: 4-segment tactile control (`S`, `M`, `L`, `XL` corresponding to 16px, 20px, 28px, 36px).
    - **Text Align**: 2-row grid: row 1 horizontal alignment (`align-left`, `align-center`, `align-right`), row 2 vertical alignment (`align-vertical-top`, `align-vertical-middle`, `align-vertical-bottom`).
    - **Opacity**: Slider with min/max indicator ticks `0` and `100`.
    - **Layers**: 4 micro-button actions: `To Back` (`⤓`), `Backward` (`↓`), `Forward` (`↑`), `To Front` (`⤒`).
  - Added CSS in [src/style.css](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/style.css) for `.segmented-control.excali-control` with authentic lavender selection highlights (`#e5dbff` background / `#5f3dc4` accent) and dark theme equivalents (`#3b2d54` / `#d0bfff`).
  - Updated `sanitizeImportedElements()` in [src/export.js](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/export.js) to preserve `fontFamily`, `fontSize`, `textAlign`, `verticalAlign`, `lineHeight`, `baseline`, `containerId`, `boundElements`, `locked`, and `link`.
  - Added `getFontString(element)` in [src/renderer.js](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/renderer.js) resolving font family codes (1: Virgil, 2: Sans, 3: Monospace, 4: Times) and updated `renderTextElement` with dynamic alignment and font rendering.
  - Updated `updateInspectorUI()` in [src/main.js](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/main.js) to isolate text elements so only Image 1 controls are shown (Stroke, Font family, Font size, Text align, Opacity, Layers), hiding shape fills, edges, and roughness.
- **Verification**: Verified via test suite and in browser; selecting text or importing Excalidraw text preserves typography and displays the exact Image 1 inspector controls.

---

### ISSUE-23: Drawing Shapes Missing Attributes (Fill, Stroke, Edges, Shape Text)
- **Reported**: Clicking any drawing rectangle, ellipse, or diamond did not show the comprehensive Excalidraw attributes illustrated in the user's reference image 2 (Stroke, Background, Fill, Stroke width, Stroke style, Sloppiness, Edges, Font family, Font size, Text align, Opacity, Layers).
- **Root Cause**:
  1. Shape inspector was missing an Edges control (Sharp vs Round) and embedded text typography controls.
  2. Importer sanitizer dropped `roundness` and `edges` properties from `.excalidraw` JSON.
  3. Canvas renderer did not render rounded rough paths for rectangles when `edges === 'round'` or `roundness` was set.
  4. Drawing shapes lacked double-click inline text editing (shape text labels bound to rectangles/circles).
  5. Layer reordering only supported sending to extreme front/back, without stepped `bringForward()` or `sendBackward()`.
- **Resolution**:
  - Added `#sec-edges` segmented control in [index.html](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/index.html) with Sharp and Round edge buttons.
  - Styled all shape attribute controls in [src/style.css](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/style.css) matching Image 2 (Fill [hachure, cross-hatch, solid], Stroke width [thin, medium, bold], Stroke style [solid, dashed, dotted], Sloppiness [architect, artist, cartoonist], Edges [sharp, round]).
  - Updated `getOrCreateDrawable()` in [src/renderer.js](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/renderer.js) to generate rough rounded rectangles via SVG path commands (`rc.path(...)`) when `edges === 'round'` or `roundness` is present.
  - Implemented `renderShapeText()` in [src/renderer.js](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/renderer.js) to render embedded centered text labels inside shapes, with dynamic theme luminance adaptation.
  - Added `startInlineShapeTextEditor()` in [src/main.js](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/main.js) allowing double-clicking any rectangle, ellipse, or diamond to directly type or edit text within the shape.
  - Implemented `bringForward()` and `sendBackward()` methods on `App` class in [src/main.js](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/main.js) with standard keyboard shortcuts:
    - `Ctrl + ]`: Bring forward by 1 layer
    - `Ctrl + [`: Send backward by 1 layer
    - `Ctrl + Shift + ]`: Bring to front
    - `Ctrl + Shift + [`: Send to back
- **Verification**: Verified via test suite; selecting any rectangle, circle, or diamond reveals all Image 2 attributes, Edges toggle switches between sharp and rounded corners, and double-clicking permits shape text editing.

---

### ISSUE-24: Rename Top Navigation Export Button to "Export/Import"
- **Reported**: User requested renaming the top navigation "Export" button to "Export/Import".
- **Root Cause**: The button label in [index.html](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/index.html) was hardcoded to `<span>Export</span>`, which underrepresented the dropdown's import capabilities (Excalidraw, Mermaid, JSON).
- **Resolution**: Updated `<button id="btn-export-menu">` in [index.html](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/index.html) to render `<i data-lucide="download"></i><span>Export/Import</span>`.
- **Verification**: Verified in DOM and built output; header button displays "Export/Import".


---

### ISSUE-25: PDF Export Uncentered, Small Size, and Excessive Padding Rectification
- **Reported**: When exporting multi-page diagrams (such as `Mentor - 3rd Session.excalidraw`) to PDF, the output was not centered, rendered at a very small size, and had excessive white padding across the page compared to the user's reference document (`media_1793077460328.pdf`).
- **Root Cause**:
  1. **Incorrect Page Orientation**: Global bounding box evaluated `bounds.height (2966) > bounds.width (2700)`, incorrectly selecting **Portrait** mode instead of **Landscape**. Whiteboard canvases and multi-section notes are composed of wide landscape slides (aspect ratio ~1.4–1.6). In Portrait A4, printable width is only 523pt, shrinking wide diagrams by a factor of 5 and leaving over 60% blank white padding.
  2. **Centroid-Based Slicing Element Truncation**: Slicing previously filtered elements by centroid into mathematical bands (`bounds.height / 3`). This cut through tables, queries, and entity cards (e.g., splitting the vacation steps table between page 1 and page 2, and splitting sample entities between page 2 and page 3).
  3. **Ignoring Canvas Selection**: Export triggers in [src/main.js](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/main.js) always passed `this.elements` (all elements), ignoring user selections. If a whiteboard contained side drafts or scratch items (e.g., `x > 1800`), those were forced into the export bounding box, inflating canvas width from 1536px to 2700px.
- **Resolution**:
  - Overhauled `exportToPdf()` in [src/export.js](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/export.js):
    - **Standard ISO A4 Landscape**: Standardized on Landscape (`841.89 x 595.28 pt`) with 28pt margins (`availW = 785.89 pt`, `availH = 539.28 pt`), matching the orientation of standard architecture and Excalidraw documents.
    - **Width-Scaled Page Filling**: Scaled the diagram width to fill the printable landscape width (`widthScale = availW / canvasW`). This ensures content spans from margin to margin with large, legible text and no excessive empty padding.
    - **Continuous High-Resolution Canvas Slicing**: Rendered the entire export once onto an offscreen canvas at 2x retina supersampling (`dpr = 2`). For multi-page outputs, sliced the pre-rendered canvas vertically (`sliceHeightPx = availH / widthScale`) using `sliceCtx.drawImage(fullCanvas, ...)`. This completely eliminates element truncation, splitting, or dropped shapes.
    - **Single Page Centering**: When content fits on a single page, auto-centers both horizontally (`(pageW - destW) / 2`) and vertically (`(pageH - destH) / 2`).
  - Updated export triggers in [src/main.js](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/main.js):
    - Export functions now intelligently use `this.selectedElements` when elements are selected, or fall back to `this.elements` when no selection is active.
- **Verification**: Verified with [tests/issues_25_26_test.js](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/tests/issues_25_26_test.js); 3-session note produces exactly 3 landscape pages filling printable width (`widthScale = 0.492 pt/px`, `destW = 785.89 pt`), and `npm run build` completed with 0 errors.

---

### ISSUE-26: SVG Export Missing Text, Unformatted Multi-line Code, & Hardcoded Typography Fix
- **Reported**: When exporting diagrams with extensive text, SQL queries, or tables to SVG (e.g., `excalidraw-diagram-1793077122754.svg`), text was unformatted, missing line breaks, collapsed into single lines, or missing entirely from shapes.
- **Root Cause**:
  1. **Raw String SVG Text Nodes in [src/export.js](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/export.js)**: `exportToSvg()` serialized text elements by inserting `el.text` into a single `<text>` node. In XML/SVG, raw newline characters (`\n`) collapse into single spaces, flattening multi-line SQL queries, schema tables, and bullet points into an unreadable horizontal line.
  2. **Hardcoded Font Family**: SVG exporter hardcoded `font-family="Caveat, cursive, sans-serif"` for all elements, ignoring `el.fontFamily = 3` (Monospace / JetBrains Mono) and `el.fontFamily = 2` (Sans-Serif / Outfit).
  3. **Missing Font Imports**: The exported SVG lacked embedded font definitions, causing external viewers and browsers to fall back to generic serif fonts.
  4. **Missing Embedded Shape Text**: Rectangles, ellipses, and diamonds carrying user text labels (`el.text`) omitted text rendering in SVG export.
  5. **Ignored Text Alignment**: `textAlign` (`left`, `center`, `right`) and `verticalAlign` (`top`, `middle`, `bottom`) attributes were not mapped to `text-anchor` or calculated vertical start offsets.
- **Resolution**:
  - Implemented `getSvgFontFamily(familyCode)` in [src/export.js](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/export.js) mapping font codes to appropriate font stacks (Caveat, Outfit, JetBrains Mono, Times New Roman).
  - Injected `@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=JetBrains+Mono:wght@400;500;700&family=Outfit:wght@400;500;600;700&display=swap');` into the SVG `<defs><style>` header, with `white-space: pre`.
  - Added multiline `<tspan x="${anchorX}" dy="...">` rendering with `xml:space="preserve"` for each newline in text elements.
  - Implemented `createSvgShapeText(el, theme)` to render centered embedded text labels inside shapes, with dynamic contrast for dark and light themes.
  - Added multi-point path rendering for lines and arrows using `rc.linearPath(absolutePoints)`.
- **Verification**: Verified with [tests/issues_25_26_test.js](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/tests/issues_25_26_test.js); SVG correctly exports multi-line `<tspan>` tags, preserves code indentations and tables, applies JetBrains Mono to code blocks, and renders shape text.

---

### ISSUE-27: Text Alignment Inverted (Align Right Aligns Left and Opposite)
- **Reported**: When clicking "Align Right" in the properties panel, the text visually aligns to the far left (or jumps off the bounding box), and vice versa.
- **Root Cause**:
  1. In `renderTextElement()` in [`src/renderer.js`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/renderer.js), `alignX` was computed as:
     `if (element.width) { if (textAlign === 'right') alignX = element.x + element.width; }`
     However, newly drawn or edited text elements did not have an explicit `element.width` recorded (or had `element.width === 0`). As a result, `alignX` defaulted to `element.x`.
  2. When HTML5 Canvas executes `ctx.textAlign = 'right'` at anchor point `alignX = element.x`, the canvas places the *rightmost edge* of the text characters at `element.x`. This causes the entire text body to render to the *left* of the element origin, making it appear as if "Align Right" shifted text far left (outside the selection box).
  3. Conversely, when `element.width < 0` (drawn right-to-left) in container shapes (`renderShapeText`), `element.x + element.width` subtracted from `element.x`, causing inverted bounds.
- **Resolution**:
  - In `renderTextElement()`: compute `maxLineWidth` dynamically using `ctx.measureText(line).width`. Ensure `const totalWidth = Math.max(element.width || 0, maxLineWidth)`.
  - When `textAlign === 'right'`, anchor at `element.x + totalWidth`. When `textAlign === 'center'`, anchor at `element.x + totalWidth / 2`. When `textAlign === 'left'`, anchor at `element.x`.
  - In `renderShapeText()`: normalize bounds with `minX = element.width < 0 ? element.x + element.width : element.x` and `w = Math.abs(element.width)`, aligning correctly with 12px padding.
- **Verification**: Verified across both single-line and multi-line text elements and shape labels in light and dark themes.

---

### ISSUE-28: Layers Z-Order Controls Inoperative (Send to Back, Backward, Forward, Front)
- **Reported**: Clicking layer controls ("Send to back", "Send backward", "Bring forward", "Bring to front") failed to reorder layers or did not visually change layering on canvas.
- **Root Cause**:
  1. In [`src/renderer.js`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/renderer.js), the render loop segregated elements into two hardcoded passes: all `group-boundary` and `swimlane` elements were rendered first, and all other elements rendered second. This prevented relative z-index changes between containers and other shapes.
  2. In `sendBackward()` in [`src/main.js`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/main.js), the forward loop (`for (let i = 1; i < this.elements.length; i++)`) caused index corruption when multiple items were selected or when consecutive swaps occurred.
  3. No visual confirmation was presented to the user when clicking layer buttons, making changes difficult to perceive when elements didn't overlap.
- **Resolution**:
  - Overhauled layer manipulation in [`src/main.js`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/main.js) with robust index swapping algorithms:
    - `bringToFront()`: shifts all selected elements to the end of the array, preserving relative order.
    - `sendToBack()`: shifts all selected elements to index 0, preserving relative order.
    - `bringForward()`: traverses from `length - 2` down to 0, swapping selected elements with the adjacent unselected element.
    - `sendBackward()`: traverses from 1 to `length - 1`, swapping selected elements with the preceding unselected element.
  - Added feedback toast notifications (`showToast('Brought to front', 'info')`, `showToast('Sent to back', 'info')`, etc.).
  - Added keyboard shortcut normalization for `[` and `]` across international keyboard layouts.
- **Verification**: Verified by placing 3 overlapping rectangles and nodes; verified layer swapping, undo/redo history recording, and canvas redraw order.

---

### ISSUE-29: Reorganize Properties Inspector Widget (Contextual Architecture vs Drawing Shapes & Left Docking)
- **Reported**: When selecting an Architecture Node, the properties widget displayed numerous non-working and irrelevant drawing controls (e.g. Hachure fill, Sloppiness/Roughness, Edges). User requested reorganizing the widget so Architecture/Telemetry properties are separated from standard drawing properties, while keeping the property inspector docked to the left viewport edge matching Excalidraw.
- **Root Cause**:
  - The inspector in [`src/main.js`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/main.js) and [`index.html`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/index.html) unconditionally forced `#standardPropertiesSection` (`display: block`) for all selected single elements, even when selecting Architecture Nodes (`el.type === 'node'`).
- **Resolution**:
  - **Left-Side Docking (Matching Excalidraw)**: Maintained `.property-inspector` and `.properties-toggle-btn` at `left: 16px; top: 76px;` in [`src/style.css`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/style.css), with smooth slide-out transition to the left (`translateX(calc(-100% - 30px))`).
  - **Contextual Inspector Filtering**:
    - When selecting an **Architecture Node** or **C4 Component**: Completely hide drawing style controls (Stroke color palette, background color, fill style, stroke width, stroke style, sloppiness, edges, font family, font size, text align). Display *strictly* the architecture metadata (Service title, subtitle, category badge presets, cloud/tech icon picker, card style, accent theme palette, C4 level hierarchy, latency ms, capacity QPS, SPOF toggle) plus essential object actions (Opacity, Layers, Copy/Delete).
    - When selecting a **Drawing Shape** (Rectangle, Ellipse, Diamond): Show standard drawing styles (Stroke, Fill, Roughness, Edges, Typography, Layers).
    - When selecting a **Connector** (Arrow, Line, Elbow Arrow): Show flow routing, connection protocol label, QPS throughput, latency, stroke width, stroke style, and layers.
    - When selecting a **Text Element**: Show font family, font size, text align, vertical align, opacity, layers.
- **Verification**: Verified in DOM with Node cards, Rectangles, Text, and Connectors; inspected left-dock layout and contextual section toggling.

---

### ISSUE-30: Telemetry Overlays Gating in Animated GIF & All Export Formats
- **Reported**: When exporting diagrams (e.g. Sequence Diagram template) as an animated GIF, telemetry ops badges/overlays were automatically included in the exported GIF even when the user had not chosen or clicked Telemetry Ops. User required: if Telemetry Ops is not active/clicked (`this.showMetricsOverlay === false`), telemetry must NOT be in the GIF or other exports. If Telemetry Ops is active/clicked, it must be included. Check across all diagram templates and export formats (GIF, PNG, SVG, PDF).
- **Root Cause**:
  1. In [`src/export.js`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/export.js), `exportToGif` had `metricsOverlay: options.metricsOverlay !== undefined ? options.metricsOverlay : true`, defaulting to `true` even when omitted.
  2. In [`src/main.js`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/main.js), export trigger listeners (`export-gif`, `export-png`, `export-pdf`, `export-svg`) called export functions without passing `{ metricsOverlay: this.showMetricsOverlay }`.
- **Resolution**:
  - In [`src/export.js`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/export.js):
    - Updated `exportToGif`: changed default to `metricsOverlay: Boolean(options.metricsOverlay)`.
    - Added `metricsOverlay` option pass-through to `exportToPng` and `exportToPdf`.
  - In [`src/main.js`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/main.js):
    - Updated export listeners to pass `{ metricsOverlay: this.showMetricsOverlay, canvasBackground: this.canvasBackground }` for PNG, PDF, GIF, and SVG exports.
- **Verification**: Verified with Telemetry Ops toggled OFF: exports contain pure clean diagrams with zero telemetry badges. Verified with Telemetry Ops toggled ON: exports include real-time telemetry metrics and SPOF indicators as expected.

---

### ISSUE-31: Canvas Background Color Selector in Properties Panel
- **Reported**: Add Canvas Background as the first element in the properties inspector panel, allowing users to pick canvas background colors matching Excalidraw standards. Canvas background was not updating when clicking swatches.
- **Root Cause**:
  1. Canvas background was previously hardcoded in [`src/renderer.js`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/renderer.js) (`#f8f9fa` for light mode, `#121212` for dark mode), with no UI controls or persistence.
  2. When adding `setCanvasBackground(color)`, it erroneously called non-existent `this.saveAutoSave()` instead of `this.scheduleAutoSave()`. This threw an uncaught `TypeError: this.saveAutoSave is not a function`, terminating execution before `this.render()` or `this.updateInspectorUI()` could run, causing canvas background clicks to do nothing.
- **Resolution**:
  - In [`index.html`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/index.html): Added `#sec-canvas-bg` ("Canvas background") containing 8 quick palette swatches (`#ffffff` White, `#f8f9fa` Warm Gray, `#f1f3f5` Cool Gray, `#fff9db` Sand, `#e6fcf5` Mint Aqua, `#e7f5ff` Sky Blue, `#fff0f6` Rose Pink, `#121212` Dark Charcoal) and a custom color input `#customCanvasBgColor` directly under the inspector header.
  - In [`src/style.css`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/style.css): Styled `#canvasBgColorPalette` as an 8-column grid (`repeat(8, 1fr)`) with subtle swatch borders (`border: 1px solid var(--border-subtle)`) so light and white swatches are clearly distinguishable.
  - In [`src/renderer.js`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/renderer.js): Supported `options.canvasBackground` in `render()`, dynamically clearing the canvas with the custom background color or theme default.
  - In [`src/main.js`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/main.js):
    - Corrected `setCanvasBackground(color)` to call `this.scheduleAutoSave()`, and defined `saveAutoSave()` as an alias so neither can ever throw.
    - Synchronized `toggleTheme()`: when toggling between light and dark themes, defaults flip between `#ffffff` and `#121212` while preserving user custom tints.
    - Added `canvasBackground` pass-through to PNG, SVG, PDF, and GIF exports and auto-save state.
- **Verification**: Verified via `tests/issues_30_32_test.js` and live canvas testing. Clicking any background swatch immediately repaints the canvas, updates the inspector's active indicator, and schedules auto-save.

---

### ISSUE-32: Missing Embedded Images & saveAutoSave Error in Excalidraw JSON & Compressed SVG Imports
- **Reported**:
  1. When importing `Mentor - 18th Session.excalidraw`, the alert `Error parsing JSON file: this.saveAutoSave is not a function` popped up and aborted import.
  2. The diagram's embedded image (a 1017x793 Modular Booking System architecture PNG) did not appear, leaving an empty outline on the canvas.
- **Root Cause**:
  1. In `importFromJson` ([`src/export.js`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/export.js)), after JSON parsing, `onLoad` was called inside `reader.onload`. In `src/main.js`, `onLoad` invoked `this.setCanvasBackground(appState.viewBackgroundColor)`. Because `setCanvasBackground` called `this.saveAutoSave()` (which did not exist), a `TypeError: this.saveAutoSave is not a function` was thrown. `importFromJson` caught this runtime exception in its generic `catch (err)` block and displayed `Error parsing JSON file: this.saveAutoSave is not a function`.
  2. In [`src/export.js`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/export.js), `sanitizeImportedElements(rawElements, files)` omitted `'image'` from its `allowedTypes` whitelist (`['rectangle', 'diamond', ...]`), causing any imported image element to be converted into a blank `'rectangle'`.
  3. In Excalidraw files, image data is stored in a top-level `files` dictionary (`data.files[fileId].dataURL`). `sanitizeImportedElements` did not accept `files` or map `fileId` to `dataURL`.
  4. In [`src/main.js`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/main.js), SVG files were treated indiscriminately as standard graphics (`isImg = true`) and routed to `insertImageFromFile`, rather than unpacking embedded Excalidraw SVG diagram payloads.
- **Resolution**:
  - In [`src/main.js`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/main.js):
    - Resolved `this.scheduleAutoSave()` in `setCanvasBackground` and added `saveAutoSave()` alias.
    - Updated `fileInput` change handler and drag-and-drop listener to route `.svg` files through `importFromJson` and auto-fit imported diagrams with `calculateZoomToFit`.
  - In [`src/export.js`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/export.js):
    - Added `'image'` to `allowedTypes` in `sanitizeImportedElements`.
    - Passed `files` map into `sanitizeImportedElements`, automatically resolving `el.dataURL = el.dataURL || (files[el.fileId] ? files[el.fileId].dataURL : '')`, preserving `fileId`, `scale`, and `crop`.
    - Implemented `decodeExcalidrawSvg(svgText)`: uses browser-native `DecompressionStream('deflate')` to unpack compressed Excalidraw SVG scene payloads (`<!-- payload-start -->...<!-- payload-end -->`).
    - Isolated `onLoad` callback execution within a dedicated `try / catch` so internal UI handler errors are logged separately from JSON parser syntax errors.
    - Updated `exportToJson` to export the top-level `files` map for all image elements on canvas.
- **Verification**: Verified via `tests/issues_30_32_test.js` (100% pass) and live import. Both `.excalidraw` and `.svg` files import without error, viewBackgroundColor is applied, and the Booking System Design architecture diagram image renders cleanly with annotations.

---

### ISSUE-33: C4 Boundary Border Style Dash Override & Network Archetype Selection
- **Reported**: When choosing a C4 Model Architecture template (e.g. C4 Container or C4 System Context) and clicking on a group boundary (e.g. `BankBoundary0` or `Internet Banking System`), the Network Archetype segmented control in the Property Inspector had no button active or chosen. Furthermore, trying to change the border style from dashed to solid had no effect on the canvas.
- **Root Cause**:
  1. **Hardcoded Stroke Dash Override in Renderer**: In [`src/renderer.js`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/renderer.js), `renderGroupBoundary` set line dashes using `lineDash = isC4Boundary ? [6, 6] : (boundaryType === 'vpc' ? [] : [6, 4]);`. Because C4 boundaries had `c4BoundaryType: 'System_Boundary'` or `c4BoundaryType: 'Enterprise_Boundary'`, `isC4Boundary` was `true`. This hardcoded `[6, 6]` dashed line dash unconditionally, ignoring the user's `element.strokeStyle === 'solid'`.
  2. **Missing C4 Archetype Buttons**: In [`index.html`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/index.html), `#groupArchetypeControl` only contained buttons for `standard`, `vpc`, `public-subnet`, `private-subnet`, and `k8s-cluster`. Because C4 templates set `boundaryType: 'enterprise'` or `boundaryType: 'system'`, no button in `#groupArchetypeControl` matched, leaving all archetype buttons unselected.
- **Resolution**:
  - In [`src/renderer.js`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/renderer.js): Updated `renderGroupBoundary` to prioritize explicit `element.strokeStyle`:
    - `element.strokeStyle === 'solid' => []` (solid line).
    - `element.strokeStyle === 'dotted' => [2, 4]` (dotted line).
    - `element.strokeStyle === 'dashed' => [6, 6]` (dashed line).
    - Only falls back to default `isC4Boundary ? [6, 6] : ...` when `element.strokeStyle` is undefined.
  - In [`src/export.js`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/export.js): Enhanced `case 'group-boundary':` in `exportToSvg` to respect `el.strokeStyle === 'solid'` (omits `stroke-dasharray`) and correctly render C4 boundary headers (`[ENTERPRISE]`, `[SYSTEM]`).
  - In [`index.html`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/index.html): Added `Enterprise` (`data-boundary-type="enterprise"`) and `System` (`data-boundary-type="system"`) buttons to `#groupArchetypeControl`.
  - In [`src/main.js`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/main.js):
    - In `updateInspectorUI`: Resolved active state for `enterprise` and `system` boundaries, matching `el.boundaryType` and `el.c4BoundaryType`.
    - In `bindArchInspectorEvents`: Handled clicks on `enterprise` and `system` buttons, setting C4 boundary properties (`c4BoundaryType`, `c4BoundaryTag`, muted styling) and updating the canvas and inspector in real time.
- **Verification**: Verified via Playwright subagent. Selecting C4 boundaries immediately highlights the `Enterprise` or `System` archetype button. Clicking "Solid" in Border Style switches the canvas boundary stroke from dashed to solid immediately.

---

### ISSUE-34: C4 Architecture Primitives Library & Property Inspector Integration
- **Reported**: When choosing the C4 System Context Diagram from templates, the elements rendered on the canvas (such as External Person, External System, External DB, Message Queue, Enterprise Boundary, and System Boundary) did not exist in the Properties panel under `🏛️ C4 Architecture Primitives` beside the current elements. Furthermore, clicking on these C4 elements did not open a dedicated C4 properties inspector.
- **Root Cause**:
  1. **Incomplete Component Library**: In [`index.html`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/index.html) and [`src/main.js`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/main.js), `🏛️ C4 Architecture Primitives` only contained 5 buttons (`Person`, `System`, `Container`, `Component`, `Database`), which generated generic `node` cards. Missing were:
     - `Person_Ext` (External Person persona in muted grey)
     - `System_Ext` (External Software System in muted grey)
     - `SystemDb_Ext` (External Database Cylinder in muted grey)
     - `SystemQueue` (Message Queue / Bus capsule shape)
     - `Enterprise_Boundary` (Outer enterprise boundary)
     - `System_Boundary` (System context boundary)
  2. **Missing C4 Inspector Section**: The property inspector had no section for `c4-element` or C4 architecture metadata. Selecting a C4 element showed only generic drawing controls or nothing.
  3. **Export & Bounds Gaps**: `c4-element` was not whitelisted in `sanitizeImportedElements` in [`src/export.js`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/export.js), causing C4 elements to be downgraded to generic rectangles upon import/export, and lacked SVG path rendering in `exportToSvg`.
- **Resolution**:
  - In [`index.html`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/index.html):
    - Expanded `🏛️ C4 Architecture Primitives` to provide all 11 primitives: Person, Ext Person, System, Ext System, Container, Component, Database, Ext DB, Queue / Bus, Enterprise Bnd, System Bnd.
    - Added `#c4InspectorSection` featuring:
      - Element Title (`#propC4Title`)
      - Description / Subtitle (`#propC4Subtitle`)
      - C4 Shape segmented control (`#c4ShapeControl`: Person, System, Database, Queue)
      - External Element toggle checkbox (`#propC4IsExt`)
      - Type Annotation Tag (`#propC4Tag`: e.g. `[Person]`, `[Software System]`, `[Container: Database]`)
      - C4 Theme Accent Palette (`#c4AccentPalette`: authentic C4 Navy, Blue, Sky, Slate, Muted Grey, Forest, Crimson)
  - In [`src/main.js`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/main.js):
    - Initialized `#c4AccentPalette` in `initPalettes()`.
    - Added `c4-element` handling in `updateInspectorUI()`: sets badge to `C4: ${SHAPE}`, synchronizes title, subtitle, shape, external status, tag, and accent color swatch.
    - Wired all input and click listeners for `#c4InspectorSection` in `bindArchInspectorEvents()`.
    - Wired all 11 quick-add buttons to create authentic `c4-element` and C4 `group-boundary` objects with proper default tags, dimensions, and color schemes.
  - In [`src/math.js`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/math.js): Added `c4-element` to `getElementBounds(element)` for accurate bounding boxes and resize handles.
  - In [`src/export.js`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/export.js): Whitelisted `c4-element` in `sanitizeImportedElements` and implemented full SVG vector rendering in `exportToSvg` (circle head + torso for Person, 3D cylinder for Database, rounded capsule for Queue, and authentic card for System).
- **Verification**: Verified via Vite production build (`npm run build` passed with 0 errors) and automated Playwright browser test. C4 primitives can be placed from the library, rendered on canvas, inspected and modified via the C4 Inspector, and exported accurately.

---

## Sprint 7 — Bug Fix & Repository Hardening (October 29, 2026)

### ISSUE-35: BUG-01 — Critical Path Latency Uses BFS+Shared Visited — Returns Shortest, Not Critical Path
- **Reported**: External review (`excalicraft-review.md`, BUG-01). The `calculatePathLatency()` function in `src/graph.js` uses BFS with a single shared `visited` set initialized before the loop. Once any node is enqueued, it is marked visited and cannot be reached again via a longer alternative path. In a diamond topology (`a→b→d`, `a→c→d`) where path via `c` is longer, the function returns the first-found path through `b` rather than the true critical (longest) path through `c`.
- **Root Cause**: Line 273 in `src/graph.js`: `const visited = new Set([startId])`. Line 290: `if (!visited.has(nextId)) { visited.add(nextId); ... }`. Because `visited` is shared across all BFS branches, the second path to any shared node is permanently excluded once the first path enqueues it.
- **Resolution**:
  - Rewrote `calculatePathLatency()` to use **longest-path DFS with memoization** on a DAG.
  - Pre-detect cycles using `detectCycle()` before traversal; if a cycle exists, fall back to bounded DFS with depth limit (500).
  - Removed the shared `visited` set from the accumulation loop; track per-path visited state on the DFS call stack instead.
  - Added a regression test (`TC-S7-LAT-01`) with a diamond topology verifying the correct critical path is returned.
- **Status**: 🟢 Resolved
- **Verification**: Run `node tests/sprint7_test.js` → `TC-S7-LAT-01` passes. Diamond `a→b→d` (20ms) vs `a→c→d` (100ms) returns `{ totalLatency: 100, path: ['a','c','d'] }`.

---

### ISSUE-36: BUG-02 — README Claims Terraform/Docker Compose Export — Feature Does Not Exist
- **Reported**: External review (BUG-02). `README.md` line 376 describes `codegen.js` as "Infrastructure as Code (Terraform / Docker Compose) export". `src/codegen.js` contains only SQL DDL functions. Zero Terraform or Docker Compose code exists anywhere in the codebase.
- **Root Cause**: The `codegen.js` description in the README codebase tree was written as a future aspiration and never updated after Sprint 4 delivered only SQL DDL generation.
- **Resolution**:
  - Updated `README.md` codebase tree: `codegen.js` now reads `# SQL DDL Code Generator (ANSI / PostgreSQL / MySQL)`.
  - Removed all Terraform/Docker Compose claims from README.
  - Moved IaC export to the `P3 — Nice to Have` backlog section as a clearly future feature.
- **Status**: 🟢 Resolved
- **Verification**: `grep -i terraform README.md` → no results. `grep -i "docker compose" README.md` → no results.

---

### ISSUE-37: BUG-03 — Mermaid Import Rejects Valid Syntax (Chained Edges, Subgraphs, stateDiagram-v2)
- **Reported**: External review (BUG-03). Mermaid import fails with hard errors for: chained edges (`A --> B --> C`), `subgraph … end` blocks, `stateDiagram-v2`, and `classDiagram`. The entire import is rejected rather than importing valid parts.
- **Root Cause**: The `importFromMermaid()` parser in `src/mermaid.js` uses a line-by-line token loop. Chained edge syntax (`A --> B --> C`) is not decomposed into individual edges. The `subgraph` keyword triggers an "unexpected token" error with no recovery. `stateDiagram-v2` and `classDiagram` hit an "Unsupported diagram type" guard with no fallback.
- **Resolution**:
  - Added chained edge decomposition: split `A --> B --> C` into `[A→B, B→C]` before token processing.
  - Added `subgraph … end` block parser: creates a `group-boundary` element with the subgraph label.
  - Changed error handling from fail-fast to **per-line error collection**: invalid lines are logged and skipped; valid elements are still imported.
  - Added `stateDiagram-v2` import path that maps states and transitions to state-machine elements.
  - Updated round-trip test to cover `subgraph` and chained edge export → import → export idempotency.
- **Status**: 🟢 Resolved
- **Verification**: `node tests/sprint7_test.js` → `TC-S7-MRM-01`, `TC-S7-MRM-02`, `TC-S7-MRM-03` all pass.

---

### ISSUE-38: BUG-04 — SPOF/Entry/Target Detection Uses Title Substring Matching — False Positives
- **Reported**: External review (BUG-04). `detectSpofs()` and `isCriticalBridge()` in `src/graph.js` classify nodes as entry/target/replicated based on substring matches in `node.title`. Example false positive: a node titled "Feedback Service" contains `db` and is mis-classified as a database target.
- **Root Cause**: Lines 169–174 and 221–226 in `src/graph.js` use `title.includes('client')`, `title.includes('db')`, `title.includes('replica')` etc. as the primary classification mechanism. No explicit `role` property exists on nodes.
- **Resolution**:
  - Added explicit `role` property support: `node.role` can be `'entry' | 'service' | 'datastore' | 'queue' | 'cache'`.
  - Modified `detectSpofs()`: check `node.role` first; fall back to title substring matching only when `node.role` is unset.
  - Added `node.isReplicated` boolean property that, when `true`, suppresses SPOF flagging regardless of title.
  - Updated Property Inspector in `index.html` and `src/main.js` to expose a **Role** dropdown and **Is Replicated** checkbox for service/architecture nodes.
  - Title-based fallback is preserved for backwards compatibility but is now secondary.
- **Status**: 🟢 Resolved
- **Verification**: `node tests/sprint7_test.js` → `TC-S7-SPF-01`: Node titled "Feedback Service" with no `role` set is no longer flagged as a database target.

---

### ISSUE-39: BUG-05 — Capacity Silently Defaults to 20k QPS — Saturation Badges Never Fire on Templates
- **Reported**: External review (BUG-05). `analyzeCapacity()` in `src/graph.js` defaults `maxCapacityQps` to 20,000 QPS (5,000 for DATABASE) when not set. Built-in templates do not set `maxCapacityQps`, so the saturation alert badges are never triggered, making the flagship "Capacity Saturation" feature invisible.
- **Root Cause**: Line 319 in `src/graph.js`: `|| (node.badge === 'DATABASE' ? 5000 : 20000)`. Templates in `src/templates.js` omit `maxCapacityQps` from all nodes.
- **Resolution**:
  - When `maxCapacityQps` is not set on a node, the capacity badge now shows **"Capacity not set"** in the inspector instead of silently using the default.
  - Added `maxCapacityQps` values to the Flash Sale, Global HA, and Fintech PCI-DSS templates so at least three templates demonstrate saturation in their default state.
  - The silent default (20,000) is preserved for the calculation engine itself so existing canvas elements are not broken, but the UI now clearly flags unconfigured nodes.
- **Status**: 🟢 Resolved
- **Verification**: `node tests/sprint7_test.js` → `TC-S7-CAP-01`: Flash Sale template loads and at least one node shows a saturation badge ≥150%.

---

### ISSUE-40: BUG-06 — /api/save-gif Dev Middleware Has Path Traversal Vulnerability
- **Reported**: External review (BUG-06 / SEC). `vite.config.js` registers `/api/save-gif`. It writes files using `path.join(imgDir, filename)` with no sanitization, no extension allowlist, and no body-size limit. A filename like `../../src/main.js` can overwrite source files on the developer's machine.
- **Root Cause**: `vite.config.js` L26: `const targetFile = path.join(imgDir, filename)` — `filename` comes directly from the POST request body with zero validation.
- **Resolution**:
  - Applied `path.basename(filename)` to strip directory traversal sequences.
  - Added extension allowlist: only `.gif` and `.png` extensions are accepted; all other extensions return HTTP 400.
  - Added body-size cap: requests with `Content-Length > 20MB` or accumulated body > 20MB are rejected with HTTP 413.
  - Added `imgDir` confinement check: `path.resolve(targetFile).startsWith(imgDir)` — if not, reject with HTTP 403.
- **Status**: 🟢 Resolved
- **Verification**: `node tests/sprint7_security_test.js` → `SEC-S7-01` (path traversal), `SEC-S7-02` (extension bypass), `SEC-S7-03` (body-size bomb) all pass.

---

### ISSUE-41: BUG-07 — Sink Database Always Flagged SPOF With No Way to Mark as Intentional
- **Reported**: External review (BUG-07). Any database node with no sibling node containing `replica` or `standby` in its title is unconditionally flagged as a SPOF, even when it is the only intentional datastore in the architecture. There is no user-facing way to suppress this flag.
- **Root Cause**: `src/graph.js` L224–L231: the stateful-SPOF detection block has no escape hatch other than title substring matching.
- **Resolution**:
  - Added `node.isReplicated` boolean property (from ISSUE-38). When `true`, the stateful-SPOF block skips the node.
  - Added `node.intentionalSinglePoint` boolean: when `true`, the SPOF badge still appears but is styled in amber (warning) rather than crimson (critical), with a tooltip "Intentional Single Point — No Replica Configured".
  - Both properties are exposed in the Architecture Properties Inspector.
- **Status**: 🟢 Resolved
- **Verification**: `node tests/sprint7_test.js` → `TC-S7-SPF-02`: A lone Postgres node with `isReplicated: true` is not flagged SPOF.

---

### ISSUE-42: REPO-01 — No LICENSE File (MIT Badge Links to 404)
- **Reported**: External review (REPO-01). `README.md` badge links to `/blob/main/LICENSE` which returns 404 because no `LICENSE` file exists in the repo, despite the badge claiming MIT.
- **Root Cause**: MIT license was intended but the file was never created.
- **Resolution**:
  - Created `LICENSE` file at the repository root with the standard MIT License text, copyright year 2026, copyright holder "Ahmed Emad".
- **Status**: 🟢 Resolved
- **Verification**: `Test-Path LICENSE` → `True`. File contains MIT License header.

---

### ISSUE-43: REPO-03 — No `npm test` Script — Tests Are Standalone Node Scripts
- **Reported**: External review (REPO-03). `package.json` has no `"test"` script. The 9 test files in `tests/` must be run individually with `node tests/<file>.js`. There is no CI configuration.
- **Root Cause**: Tests were written as standalone scripts; `package.json` was never updated to wire them.
- **Resolution**:
  - Added `"test": "node tests/run_all.js"` to `package.json` scripts.
  - Created `tests/run_all.js` that imports and runs all test suites sequentially, reporting pass/fail counts and exiting with code 1 on any failure.
  - Added `.github/workflows/ci.yml` running `npm install && npm run build && npm test` on every push and pull request.
- **Status**: 🟢 Resolved
- **Verification**: `npm test` runs all suites and exits with code 0 when all pass.

---

### ISSUE-44: REPO-04 — package.json Has Empty Description and Non-Existent `main` Entry
- **Reported**: External review (REPO-04). `package.json` has `"description": ""` and `"main": "index.js"` — `index.js` does not exist at the root; the project is a Vite SPA.
- **Root Cause**: `npm init` defaults were never cleaned up.
- **Resolution**:
  - Set `"description"` to `"Animated architecture whiteboard with SPOF analysis, C4 diagrams, ERD-to-SQL, and Mermaid.js bi-directional sync."`.
  - Removed `"main"` field (not applicable to browser SPA projects).
- **Status**: 🟢 Resolved
- **Verification**: `node -e "const p = require('./package.json'); console.log(p.description, p.main)"` → description populated, `main` is `undefined`.

---

### ISSUE-45: REPO-05 — img/ Contains Timestamped Screenshots and Duplicate Sprint GIFs
- **Reported**: External review (REPO-05). `img/` folder contains 5 timestamped working screenshots (`*_canvas_*.png`, `export_gif_modal_*.png`) and 5 `sprint3_*.gif` duplicates that are not referenced by the README.
- **Root Cause**: Working screenshots captured during development were committed to `img/` alongside production GIF artifacts. Sprint3 GIFs were renamed for production but originals were not removed.
- **Resolution**:
  - Deleted all timestamped PNG screenshots: `azure_architecture_canvas_*.png`, `database_erd_canvas_*.png`, `export_gif_modal_*.png`, `flowchart_canvas_*.png`, `sequence_diagram_canvas_*.png`.
  - Deleted duplicate sprint-prefixed GIFs: `sprint3_c4_container.gif`, `sprint3_c4_context.gif`, `sprint3_fintech_pci.gif`, `sprint3_flash_sale.gif`, `sprint3_global_ha.gif`.
  - `img/` now contains exactly the 16 production GIFs referenced by the README.
- **Status**: 🟢 Resolved
- **Verification**: `(Get-ChildItem img/ -Filter "sprint3_*").Count` → 0. `(Get-ChildItem img/ -Filter "*_canvas_*").Count` → 0.

---

### ISSUE-46: README — SQL → ERD Import Claimed But Not Implemented
- **Reported**: External review (Section 3 table). README implies bi-directional ERD↔SQL ("ERD ↔ SQL"). `ERD → SQL DDL` works. `SQL → ERD` (parsing `CREATE TABLE` statements) does not exist.
- **Root Cause**: The `↔` symbol was used in the README to imply bi-directionality that was planned but not delivered in Sprint 4.
- **Resolution**:
  - Updated README to clearly state: `ERD → SQL DDL: ✅ Implemented (PostgreSQL, MySQL, ANSI)` and `SQL → ERD: 🗓 Planned (Sprint 8)`.
  - Removed `↔` symbol from the ERD feature description.
- **Status**: 🟢 Resolved
- **Verification**: README no longer implies SQL→ERD is currently functional.

---

### ISSUE-47: README — Autosave Feature Exists But Is Not Mentioned
- **Reported**: External review (Section 3). The autosave feature (localStorage key `excalidraw_craft_autosave_v1`, 600ms debounce) is fully implemented and verified since Sprint 4, but is never mentioned in the README.
- **Root Cause**: Documentation omission.
- **Resolution**:
  - Added "🔄 Auto-Save & Session Restore" bullet point to the Core Capabilities section of README: describes the 600ms debounced localStorage autosave and automatic session restore on browser refresh (F5/Ctrl+R).
- **Status**: 🟢 Resolved
- **Verification**: Autosave section present in README.

---

### ISSUE-48: README — "100% Excalidraw Compatible, Zero Data Loss" Is Overclaim
- **Reported**: External review (Section 3). The claim is too absolute. SVG payload extraction has a passing test; full round-trip fidelity across all element types and edge cases is unverified.
- **Root Cause**: Marketing language written before full round-trip testing was completed.
- **Resolution**:
  - Softened to: "Excalidraw Native & Compressed SVG Ingestion: Full support for `.excalidraw` JSON and deflate SVG scenes, with image decoding and canvas background tinting. Round-trip fidelity is continuously tested."
  - Removed "zero data loss" from the Feature Comparison Matrix cell; replaced with "High fidelity (actively tested)".
- **Status**: 🟢 Resolved
- **Verification**: README no longer contains the phrase "zero data loss".

---

### ISSUE-49: README — "Telemetry" Terminology Misleads Users
- **Reported**: External review (Section 3). The feature visualizes numbers the user manually types in. The word "Telemetry" implies live monitoring from real infrastructure, which does not exist.
- **Root Cause**: Marketing terminology chosen for impact without accuracy.
- **Resolution**:
  - Renamed all README occurrences of "Telemetry Ops" used as a standalone capability name to "Flow Simulation Overlay".
  - Kept "Telemetry" in UI button labels (`Ctrl+Shift+O` toggle) to match the existing keyboard shortcut documented in the Cheatsheet, but added parenthetical: "(Flow Simulation Mode — visualize manually entered QPS, latency, and capacity values)".
  - The feature comparison table row is renamed to "Live Flow Simulation Overlay (QPS, Latency, SPOF)".
- **Status**: 🟢 Resolved
- **Verification**: README no longer implies real-time data collection or live monitoring.
