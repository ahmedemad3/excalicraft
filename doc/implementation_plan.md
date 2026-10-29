# ExcaliCraft: Master Engineering Implementation Plan
## Cumulative Multi-Sprint Roadmap & Architecture Directory

This master document tracks the ongoing engineering roadmap, technical architecture, and sprint deliveries for **ExcaliCraft**. Future sprints will be appended to this registry.

---

## Master Sprint Registry

| Sprint | Focus Area | Status | Scope / Core Deliverables |
|---|---|---|---|
| **Sprint 1** | **Templates, Minimap & Presentation** | 🟢 **Completed** | • Smart Technical Templates (Cloud, Patterns, UML, ERD)<br>• Overview Radar / Canvas Minimap (`M`)<br>• Presentation Stage Mode (`F`) & Zoom-to-Fit |
| **Sprint 2** | **Component Library, ERD Editor, UML Suite & Canvas Navigation** | 🟢 **Completed** | • ERD Table Authoring & Column Schema Editor with SQL datalist<br>• First-Class Component Library (Data, Architecture, UML Suite)<br>• Decision Diamond (◇) & Activity Diagram Elements (Action, Fork, Join, Flow Final)<br>• Freedraw & Text Tool Interaction Repairs<br>• Full Keyboard Shortcut Suite (Ctrl+C/V/X/A/Z/Y, H, Arrow keys)<br>• 4-Way Infinite Canvas Movement (Hand tool, Space, Middle-click, Shift+Wheel) |
| **Sprint 3** | **System Design, Quantitative Modeling & C4 Architecture** | 🟢 **Completed** | • C4 Architecture Model Hierarchy (`Context`, `Container`, `Component`, `Deployment`)<br>• Network & Security Boundaries (VPC, Public/Private Subnets, K8s Cluster/Namespace)<br>• Quantitative Metrics Overlays (QPS, Latency p50/p99 ms, SLA 99.99%)<br>• Automated SPOF (Single Point of Failure) Detection & Bottleneck Analysis<br>• Metrics Overlay Hotkey & Export Toggle (`Alt+M`) |
| **Sprint 4** | **Developer Code Interoperability & DDL Generation** | 🟢 **Core Completed / Hardened** | • 1-Click ANSI/PostgreSQL SQL DDL Generation & Download (`.sql`) from ERD Tables<br>• Bi-directional Mermaid.js Sequence & Architecture Diagram Sync<br>• OpenAPI / Swagger 3.0 Import (Drag-and-drop `openapi.json` to service cards)<br>• v1.0 Production Gaps: Local Storage Auto-Save, Confirmations, Onboarding Empty State, Toast System, Shortcuts Sheet<br>• Insert Image Tool (Beside Eraser, File Picker, Drag & Drop, SVG/PDF Parity)<br>• Quick Save Hotkey `Ctrl + S` (Export to SVG with Toast) |
| **Sprint 5** | **AI Prompt-to-Diagram & Codebase Scanner** | ⚪ *Planned* | • One-line prompt generation ("API -> Cache -> DB")<br>• Archify Typed JSON IR Parser & Auto-Layout<br>• Git Repository commit-backed source cards (`SRC n`) |
| **Sprint 7** | **Bug-Fix & Repository Hardening** | 🔵 **In Progress** | • ISSUE-35: Fix Critical Path Latency (BFS→DFS Longest-Path)<br>• ISSUE-36/46/47/48/49: README Accuracy Corrections<br>• ISSUE-37: Mermaid Import — Chained Edges, Subgraphs, stateDiagram-v2<br>• ISSUE-38: Explicit `role` Property for SPOF Heuristics<br>• ISSUE-39: Capacity Badge Visibility + Template Saturation Data<br>• ISSUE-40: Path Traversal Fix in `/api/save-gif` Middleware<br>• ISSUE-41: `isReplicated` / `intentionalSinglePoint` Node Properties<br>• ISSUE-42: Add MIT `LICENSE` File<br>• ISSUE-43: `npm test` Script + `tests/run_all.js` + GitHub Actions CI<br>• ISSUE-44: Clean `package.json` (description, remove invalid `main`)<br>• ISSUE-45: Clean `img/` (remove stray screenshots & sprint duplicates) |

---

# Sprint 1: Smart Templates, Minimap & Presentation Mode

### 1.1 Objective & Executive Summary
Sprint 1 elevates ExcaliCraft from an open sketchpad into an engineering communication system by adding:
1. **Smart Technical Architecture Templates**: 1-click generation of hand-drawn system diagrams (Microservices Cloud, Database ERD, API Sequence Flow).
2. **Interactive Canvas Minimap / Overview Radar (<kbd>M</kbd>)**: Floating, high-DPI semi-transparent viewport radar that synchronizes bidirectionally with the main camera.
3. **Presentation Stage Mode (<kbd>F</kbd>)**: Clean, distraction-free presentation environment with automatic Zoom-to-Fit diagram framing.

---

### 1.2 Architectural Architecture & File Changes (Sprint 1)

```
excalidraw-REA/
├── index.html                  # [Modified] Add Templates dropdown, Minimap canvas, Present button
├── src/
│   ├── templates.js            # [New] Factory generating pre-configured ExcalidrawElement trees
│   ├── minimap.js              # [New] Floating radar canvas, coordinate mapping & drag sync
│   ├── presenter.js            # [New] Presentation stage state controller, zoom-to-fit framing
│   ├── main.js                 # [Modified] Wire hotkeys (F, M), template injections, lifecycle
│   ├── renderer.js             # [Modified] Expose bounding calculations & minimap render hook
│   ├── math.js                 # [Modified] Add calculateZoomToFit calculation & bounding helpers
│   └── style.css               # [Modified] Styling for templates menu, minimap radar, present mode
└── doc/
    ├── implementation_plan.md  # [Cumulative Multi-Sprint Implementation Roadmap]
    ├── test_scenario.md        # [Cumulative QA & Functional Test Scenarios]
    ├── security_issues.md      # [Cumulative Security Threat Model & Test Cases]
    └── handoff.md              # [Cumulative Session Handoff & Sprint Baseline]
```

---

### 1.3 Detailed Component Specifications (Sprint 1)

#### 1.3.1 Smart Templates Factory (`src/templates.js`)
* **Responsibility**: Returns an array of clean `ExcalidrawElement` objects positioned deterministically with hand-drawn Rough.js aesthetics.
* **Templates Included**:
  1. **Microservices Cloud Architecture (`template-microservices`)**:
     - Client Layer (Web App, Mobile Client).
     - Trust Boundary container with hand-drawn dashed border.
     - Ingress API Gateway, core microservices (Auth, Orders, Payments).
     - Persistent and cache storage (Redis, PostgreSQL Cluster, Kafka event bus).
     - Pre-connected, cleanly routed arrows.
  2. **Database Schema / ERD (`template-erd`)**:
     - Table cards: `users`, `orders`, `order_items`, `products`.
     - Distinct header sections, typed column rows (`UUID`, `VARCHAR`, `TIMESTAMP`).
     - Primary Key (`[PK]`) and Foreign Key (`[FK]`) badges.
     - Cardinality relationship connectors (1:N, 1:1).
  3. **API Sequence Flow (`template-sequence`)**:
     - Lifeline columns: User, Client App, API Server, Auth Provider, Database.
     - Activation blocks and numbered synchronous/asynchronous request and return arrows.
* **Behavior**:
  - Automatically clears or appends to current canvas.
  - Assigns unique IDs (`generateId()`) and PRNG seeds (`generateSeed()`).
  - Commits snapshot to `HistoryManager` so users can undo with <kbd>Ctrl+Z</kbd>.
  - Automatically executes Zoom-to-Fit onto the loaded template.

#### 1.3.2 Canvas Minimap / Overview Radar (`src/minimap.js`)
* **Responsibility**: Real-time spatial radar on an infinite canvas.
* **Technical Details**:
  - Floating container (`200px × 130px`) pinned at bottom-right (`bottom: 16px; right: 16px;`).
  - Hi-DPI offscreen rendering: iterates over `elements` and draws fast geometric vector paths.
  - Scale Factor: $S = \min(\frac{W_{map}}{W_{scene}}, \frac{H_{map}}{H_{scene}})$.
  - Semi-transparent illuminated rectangle represents visible camera viewport.
  - **Interaction**: Clicking or dragging on the minimap immediately pans the main viewport.
  - **Hotkey**: <kbd>M</kbd> toggles minimap visibility.

#### 1.3.3 Presentation Stage Mode (`src/presenter.js`)
* **Responsibility**: Fullscreen pitch and review stage.
* **Technical Details**:
  - Adds `.mode-presentation` class to `document.body`.
  - CSS smoothly collapses top toolbar, left property inspector, bottom hints, and minimap.
  - Executes `zoomToFit(elements, viewportWidth, viewportHeight)`:
    - Centers camera: `scrollX = (viewWidth - bounds.width * zoom) / 2 - bounds.x * zoom`.
    - Scales camera smoothly to frame diagram within 90% of screen bounds.
  - Floating presentation control pill with Exit, Zoom, and Slide Navigation.
  - Hotkey toggle: <kbd>F</kbd> enters, <kbd>Escape</kbd> exits.

#### 1.3.4 Eraser Architecture Engine & Dynamic Properties Palette (`src/icons.js`, `src/renderer.js`, `src/main.js`)
* **Responsibility**: Production-grade system architecture diagramming matching [Eraser.io](https://www.eraser.io/make/free-system-architecture-diagram-maker) and [@eraserlabs/eraser-diagrams](https://github.com/eraserlabs/eraser-diagrams).
* **Key Innovations**:
  1. **Unified Architecture Node (`type: 'node'`)**:
     - Single cohesive element holding Title, Subtitle / Tech Stack, Lucide Icon, Category Badge (`EDGE`, `SERVICE`, `DATABASE`, etc.), and Accent Theme.
     - Moving, scaling, or deleting the card operates on the entire component in lockstep without fragmented primitives.
     - Sleek Eraser styling: crisp rounded card with soft drop-shadow, top accent color stripe, pastel icon badge container, and high-contrast typography.
  2. **Dedicated Contextual Properties Palette**:
     - **Node Selected**: Service Title input, Subtitle input, Badge input + preset chips, 16-icon Lucide visual grid, 8-accent color swatches, card style toggle (`Modern Crisp` vs `Hand-Drawn`).
     - **Connector Selected**: Protocol / Label input, directional flow toggle (`One-way`, `Bidirectional`, `Line`), live animated packet flow toggle.
     - **Group Boundary Selected**: Boundary Label input, dashed/solid stroke toggle, accent tint swatches.
     - **Canvas / Default**: Quick-add action buttons (`+ Service Node`, `+ VPC Boundary`, `+ Flow Arrow`) and 1-click template switchers.
  3. **On-Canvas Direct Editing**:
     - Double-clicking any architecture node on canvas pops up an inline quick-edit modal adjacent to the card for immediate editing without opening sidebars.
     - Double-clicking arrows selects the connector and focuses its protocol label input.
  4. **Animated Signal Flow Pulses**:
     - Real-time 60 FPS animation loop (`requestAnimationFrame`) propagating packet pulses along all active connectors.

---

### 1.4 Sprint 1 Delivery Milestones & Checkpoints

- [x] **Milestone 1.1: Math & Viewport**: Implement `calculateZoomToFit()` in `src/math.js`.
- [x] **Milestone 1.2: Templates Engine**: Implement `src/templates.js` and top-bar template menu.
- [x] **Milestone 1.3: Canvas Minimap**: Build `src/minimap.js` with drag sync and <kbd>M</kbd> toggle.
- [x] **Milestone 1.4: Presentation Stage**: Build `src/presenter.js` with <kbd>F</kbd> and <kbd>Esc</kbd> handlers.
- [x] **Milestone 1.5: Eraser Diagrams Overhaul**: Integrated first-class `node` elements, Lucide canvas icons, labeled connectors, animated flow pulses, dynamic architecture inspector, and on-canvas quick editor.
- [x] **Milestone 1.6: Architecture Verification**: End-to-end browser subagent verification of template loading, live property editing, on-canvas popups, and unified card dragging.
- [x] **Milestone 1.7: Comprehensive Export & PDF Engine**: Integrated `jsPDF` for publication-quality PDF export, resolved offscreen canvas DPR scale mismatch that caused image cutting, expanded bounding box calculations for arrowheads, labels, pills, and shadows with 60px safe padding, and verified PNG, SVG, and PDF downloads in browser test.
- [x] **Milestone 1.8: Eraser Architecture Suite (Cloud, Patterns, UML, DB) & Animated GIF Export**:
  - Implemented 10 standard Eraser.io templates (Cloud Architectures, Patterns, UML, ERD).
  - Categorized templates dropdown menu with 4 visual groups and high-contrast icon badges.
  - Multi-provider Icon Selector in Property Palette with provider filter tabs.
  - Client-side Looping Animated GIF Export Engine using `gifenc`.

---

# Sprint 2: Component Library, Dynamic ERD Schema Editor, UML Suite & Canvas Navigation

### 2.1 Objective & Executive Summary
Sprint 2 delivers an extensible architectural design workspace with:
1. **Interactive Database Table (ERD) Authoring & Schema Editor with SQL Autocomplete**:
   - Add new `erd-table` elements directly onto canvas.
   - Live Column Schema Editor in the Properties Panel: add, rename, retype, toggle `PK` / `FK` key flags, delete columns, and automatic vertical height reflow.
   - Column types powered by `<datalist id="commonSqlTypes">` providing dropdown suggestions for standard SQL types (`UUID`, `VARCHAR(255)`, `TEXT`, `INTEGER`, `BIGINT`, `BOOLEAN`, `TIMESTAMP`, `DECIMAL(10,2)`, `JSONB`, `SERIAL`, etc.) while allowing freeform custom typing.
2. **First-Class Eraser Component Library**:
   - Dedicated component archetypes added directly from the Properties palette:
     - **Database Component** (`PostgreSQL DB`).
     - **Redis Cache Component** (`Redis Cluster`).
     - **Message Queue Component** (`Kafka Event Bus`).
     - **Sequence Lifeline Participant** (`Auth Service` with continuous vertical dashed lifeline).
     - **Lifeline Activation Execution Box** (`activation-box` with height & color control).
     - **Process Swimlane** (`swimlane` with header tab & title).
     - **UML State Machine Nodes** (Initial State `●`, State Card with action compartments, Final State `◉`).
3. **UML Activity Diagram Component Suite**:
   - **`+ Action Step`** (`activity-action`): Rounded action card with centered title and accent theme.
   - **`Decision ◇`** (`diamond`): Unified diamond geometry with centered condition text and inspector property editing.
   - **`Fork Bar ━`** (`fork-node`): Synchronization bar splitting a single incoming flow into concurrent parallel paths.
   - **`Join Bar ━`** (`join-node`): Synchronization bar joining multiple parallel paths back together.
   - **`Flow Final ⊗`** (`flow-final`): Circular terminal node with internal diagonal cross.
4. **Drawing & Text Tool Interaction Repairs**:
   - **Pencil (Freedraw)**: Implemented smooth quadratic canvas curves with round caps/joins, bypassing stale Rough.js cache keys, plus instant single-tap dot rendering (`ctx.arc`).
   - **Text Tool**: Isolated inline textarea events (`stopProp`), prevented premature blur on canvas click/pointerup, added <kbd>Enter</kbd> commit and <kbd>Escape</kbd> cancel.
5. **Full Keyboard Shortcut Suite**:
   - <kbd>Ctrl+C</kbd> (Copy), <kbd>Ctrl+V</kbd> (Paste with 24px cascade), <kbd>Ctrl+X</kbd> (Cut), <kbd>Ctrl+A</kbd> (Select All), <kbd>Ctrl+Z</kbd> (Undo), <kbd>Ctrl+Y</kbd> (Redo), <kbd>H</kbd> (Hand Tool), and Arrow keys (nudge 1px/10px).
6. **4-Way Canvas Movement & Navigation**:
   - **Hand Tool** (<kbd>H</kbd> or toolbar button): Pan freely by clicking and dragging.
   - **Spacebar + Drag**: Instant grab-panning from any tool.
   - **Middle Mouse Drag**: Hardware scroll-wheel drag panning.
   - **Shift + Wheel**: Horizontal canvas scrolling.
   - **Vertical Wheel**: Standard vertical canvas scrolling.
   - **Arrow Keys**: Keyboard panning across Left, Right, Up, and Down when no element is selected.

---

### 2.2 Detailed Specifications & Architectural Changes (Sprint 2)

#### 2.2.1 ERD Table Editor (`src/renderer.js`, `src/main.js`, `index.html`)
- **Element Data Contract (`type: 'erd-table'`)**:
  ```typescript
  interface ErdColumn {
    key: 'PK' | 'FK' | '';
    name: string;
    type: string;
    isPk?: boolean;
    isFk?: boolean;
  }
  interface ErdTableElement extends ExcalidrawElement {
    tableName: string;
    tableType: 'TABLE' | 'BASE TABLE' | 'VIEW' | 'COLLECTION';
    columns: ErdColumn[];
    themeColor: string;
  }
  ```
- **Autocomplete Datalist**:
  `<datalist id="commonSqlTypes">` attached to column type inputs via `list="commonSqlTypes"`.

#### 2.2.2 Decision Diamond & Activity Diagram Renderers (`src/renderer.js`)
- **Diamond Rendering**: [`renderDiamond(element, theme)`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/renderer.js#L735-L783) draws crisp diamond geometry and centered condition text (`element.text || element.label`).
- **Activity Action Rendering**: [`renderActivityAction(element, theme)`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/renderer.js#L820-L865) draws rounded action state cards.
- **Fork / Join Rendering**: [`renderForkJoin(element, theme)`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/renderer.js#L867-L885) draws thick synchronization bars.
- **Flow Final Rendering**: [`renderFlowFinal(element, theme)`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/renderer.js#L887-L915) draws terminal node with internal diagonal cross (⊗).

---

### 2.3 Sprint 2 Delivery Milestones & Checkpoints

- [x] **Milestone 2.1: ERD Table Authoring & Column Schema Editor**: Implement Table add action, column addition/deletion/key switching, and live canvas height reflow.
- [x] **Milestone 2.2: Column Data Types Datalist**: Added `<datalist id="commonSqlTypes">` with standard SQL types dropdown while preserving freeform custom text entry.
- [x] **Milestone 2.3: Decision Diamond (◇) Geometry & In-Place Text Editing**: Replaced dual-element hack with unified diamond element, centered condition text, and dedicated property inspector.
- [x] **Milestone 2.4: Pencil (Freedraw) & Text Tool Fixes**: Implemented smooth quadratic canvas curves with round caps/joins, single-tap dot support, and fixed inline text editor premature blur bug.
- [x] **Milestone 2.5: Activity Diagram Component Suite**: Added Action Step, Decision Diamond, Fork Bar, Join Bar, Flow Final, Initial State, Final State, and Swimlane to Component Library.
- [x] **Milestone 2.6: Full Keyboard Shortcut Suite**: Wired <kbd>Ctrl+C</kbd>, <kbd>Ctrl+V</kbd>, <kbd>Ctrl+X</kbd>, <kbd>Ctrl+A</kbd>, <kbd>Ctrl+Z</kbd>, <kbd>Ctrl+Y</kbd>, <kbd>H</kbd>, and Arrow keys.
- [x] **Milestone 2.7: 4-Way Infinite Canvas Movement**: Hand Tool (<kbd>H</kbd>), Space+drag, Middle-click drag, Shift+wheel horizontal scrolling, and Arrow key panning.
- [x] **Milestone 2.8: Verification & End-to-End Browser Testing**: Validated all additions in browser subagent and confirmed production bundle build (`npm run build`).

---

# Sprint 3: System Design, Quantitative Modeling & C4 Architecture

### 3.1 Objective & Executive Summary
Sprint 3 evolves ExcaliCraft into an intelligent modeling workbench for Solution Architects and System Designers:
1. **C4 Model Architecture Hierarchy**:
   - Native C4 level abstraction tags: `System Context`, `Container`, `Component`, and `Deployment Node`.
   - Distinctive C4 pastel badge styles and level-based visual hierarchy.
2. **Network & Security Boundary Enclosures**:
   - Specialized boundary archetypes: `Cloud VPC`, `Public Subnet`, `Private Subnet`, `Isolated DB Tier`, and `Kubernetes Cluster/Namespace`.
   - CIDR block annotations (e.g. `10.0.0.0/16`) and unified drag-containment.
3. **Quantitative System Design Overlays**:
   - Connector throughput volume (`QPS / RPS`) and network hop latency (`ms`).
   - Node processing budget (`latencyMs` p50/p99) and availability SLA (`99.9%` / `99.99%`).
   - One-click overlay toggle via toolbar button or hotkey (<kbd>Alt+M</kbd>).
4. **Automated Reliability & SPOF (Single Point of Failure) Detection**:
   - In-memory pure JavaScript directed graph engine ([`src/graph.js`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/graph.js)).
   - Linear-time articulation points detection (Tarjan's algorithm) to automatically identify and alert on un-replicated SPOF choke points.
   - Cumulative path latency aggregation and capacity overflow warnings.

---

### 3.2 Detailed Specifications & Architectural Changes (Sprint 3)

```
excalidraw-REA/
├── src/
│   ├── graph.js                # [New] Pure JS directed graph solver: SPOF, path latency, bottleneck detection
│   ├── renderer.js             # [Modified] Render C4 badges, network boundary archetypes, and telemetry pills
│   ├── main.js                 # [Modified] Wire Alt+M overlay toggle, C4 inspector controls, metrics editing
│   ├── export.js               # [Modified] Support exporting diagrams with or without metrics overlays
│   └── style.css               # [Modified] Telemetry pills, C4 theme chips, and subnet badge styles
```

#### 3.2.1 Graph Analysis Engine Data Contracts (`src/graph.js`)
```typescript
interface SystemMetrics {
  qps?: number;              // Queries/Requests per second
  latencyMs?: number;        // Processing time or hop transit latency
  sla?: string;              // e.g. '99.99%'
  c4Level?: 'context' | 'container' | 'component' | 'deployment';
  isSpof?: boolean;          // Auto-calculated or manual override
  maxCapacityQps?: number;   // Saturated threshold
}
```

#### 3.2.2 Delivery Milestones & Checkpoints (Sprint 3)
- [x] **Milestone 3.1: Graph Engine Core (`src/graph.js`)**: Build in-memory graph model from canvas elements and bindings with Tarjan's articulation point SPOF detector and cumulative path latency calculator.
- [x] **Milestone 3.2: C4 Model Primitives & Inspector**: Add dedicated C4 Model Primitives to Component Library (`C4 Person`, `C4 System`, `C4 Container`, `C4 Component`, `C4 Database`), C4 hierarchy level selector, and manual SPOF hazard override (`#propNodeIsSpof`).
- [x] **Milestone 3.3: Network Boundary Enclosures**: Implement Cloud VPC, Public Subnet, Private Subnet, and K8s Cluster boundary styles with CIDR headers.
- [x] **Milestone 3.4: Telemetry Overlays & SPOF Visibility**: Prominent floating SPOF hazard badges on top card borders (`⚠️ SPOF ALERT`), capacity saturation indicators (`🔥 20k/10k QPS (200%)`), and Alt+M instant toggle.
- [x] **Milestone 3.5: C4 & System Design Template Suite**: Added official **C4 Container Diagram** and **C4 Context Diagram** to the template menu, alongside *E-Commerce Flash Sale*, *Global Microservices with Multi-Region HA*, and *Fintech Payment Gateway*.
- [x] **Milestone 3.6: Verification & QA**: Automated test suite validation (`tests/sprint3_test.js` - 6 test suites, 100% pass), browser subagent E2E validation, and production build verification (`npm run build`).

---

# Sprint 4: Developer Code Interoperability & DDL Generation

### 4.1 Objective & Executive Summary
Sprint 4 bridges visual architecture and implementation code for developers:
1. **1-Click SQL DDL Generation & Export**:
   - Generate production-ready ANSI SQL / PostgreSQL DDL from on-canvas `erd-table` elements.
   - Includes `CREATE TABLE`, primary keys (`PRIMARY KEY`), foreign key constraints (`REFERENCES`), and data type mapping (`UUID`, `VARCHAR`, `TIMESTAMP`).
   - "Copy SQL DDL" and "Download .sql" directly from ERD inspector.
2. **Bi-directional Mermaid.js Synchronization**:
   - Export sequence flows, flowcharts, and architecture diagrams to Mermaid syntax.
   - Import Mermaid text strings directly into canvas elements.
3. **OpenAPI 3.0 Path Skeleton Generator**:
   - Generate initial OpenAPI/Swagger 3.0 endpoint specifications from connected service nodes and labeled arrows.

#### 4.2 Delivery Milestones & Checkpoints (Sprint 4)
- [x] **Milestone 4.1: SQL DDL Code Generator (`src/codegen.js`)**: Implement schema parser converting `erd-table` elements into clean PostgreSQL / MySQL / ANSI SQL statements with foreign keys, column typing, and topological dependency ordering.
- [x] **Milestone 4.2: ERD Inspector DDL Actions**: Add "Copy SQL DDL" button, "Download .sql" action, and live SQL preview modal with dialect selector.
- [x] **Milestone 4.3: Mermaid.js Exporter & Importer (`src/mermaid.js`)**: Implement bidirectional Mermaid translation for sequence diagrams, flowcharts, and ERDs with auto-layout.
- [x] **Milestone 4.4: Security Hardening (SEC-S4-01 & SEC-S4-02)**: Implemented SQL identifier quoting and injection sanitization, along with Mermaid AST markdown and HTML tag escaping.
- [x] **Milestone 4.5: Developer Interop Verification**: Automated test suite (`tests/sprint4_test.js` - 8 test suites, 100% pass) and production build verification.
- [ ] **Milestone 4.6: OpenAPI / Swagger 3.0 Import (Specification & Design)**:
  - **Feature Summary**: Dragging an `openapi.json` or `swagger.json` file onto the canvas instantly parses the specification and deterministically scaffolds connected service cards, endpoints, and schema tables.
  - **Deterministic Parsing Logic**:
    1. **System Ingress**: Extracts `info.title` and `servers[0].url` to construct an Ingress Gateway card (`node-card`) with description and base URL.
    2. **Tag / Domain Grouping**: Group endpoints by OpenAPI `tags`. Each tag forms a container boundary or microservice node (e.g. `Auth Service`, `Orders Service`).
    3. **Endpoints & HTTP Operations**: Each path item (`paths['/orders'].post`) generates a child endpoint node with method pill (`POST` in green, `GET` in blue, `DELETE` in red) and summary.
    4. **Component Schemas / ERD Interop**: Complex request/response bodies under `components.schemas` are translated directly into `erd-table` entities with field names and OpenAPI types (`string`, `integer`, `boolean`, `array`).
    5. **Directed Wiring**: Connects `Ingress Gateway` -> `Service Nodes` -> `Data Schemas` using orthogonal labeled connectors.
  - **Implementation Gate**: Designed and ready for implementation following completion and stabilization of all v1.0 Production Gaps.
- [x] **Milestone 4.7: v1.0 Production Gaps & System Reliability Enhancements**:
  - **Local State Persistence (Auto-Save)**: 600ms debounced persistence to `localStorage` (`excalidraw_craft_autosave_v1`) capturing elements, zoom, pan, and theme; automatic reload on F5 with restore toast notification.
  - **Destructive Action Confirmations**: Clean glassmorphism modal (`#confirmModal`) with danger badge for "Clear Canvas" and file/Mermaid imports, coupled with full <kbd>Ctrl+Z</kbd> undo history preservation.
  - **First-Time User Onboarding / Empty State**: Floating starter card (`#welcomeOnboarding`) presenting 4 instant template shortcuts (Microservices, C4 Container, PostgreSQL, AWS Serverless) and blank canvas option; auto-toggles on canvas clean/dirty.
  - **Unified Toast Notification System**: Centralized pill notification manager (`#toastContainer`, `showToast`) providing non-intrusive feedback across exports, DDL generation, clipboard copies, and state events.
  - **Keyboard Shortcuts Cheat Sheet**: Global <kbd>?</kbd> modal (`#shortcutsModal`) and header button displaying categorized shortcuts across Navigation, Architecture, Tools, and Editing.
- [x] **Milestone 4.8: First-Class Image Insertion Tool (`src/main.js`, `src/renderer.js`, `src/math.js`, `src/export.js`)**:
  - **Toolbar Integration**: Dedicated `#tool-image` button positioned directly beside the Eraser (`#tool-eraser`) with hotkey `I`.
  - **Dual Ingestion Paths**: Native OS file picker (`#imageFileInput`) and direct drag-and-drop onto the canvas viewport with automatic screen-to-scene coordinate mapping.
  - **Aspect-Preserving Scaling**: Automatically scales oversized images to a clean max dimension (520px) while preserving exact natural aspect ratios.
  - **Rendering & Cache Engine**: In-memory `imageCache` in `SceneRenderer` rendering via `ctx.drawImage` with optional rounded corner clipping (`edges: 'round'`).
  - **Export Parity**: Full export support in SVG (`<image href="..." />`), PNG, PDF, and GIF exports.
- [x] **Milestone 4.9: Quick Save Keyboard Shortcut (<kbd>Ctrl + S</kbd> / <kbd>Cmd + S</kbd>)**:
  - Prevents native browser "Save HTML page" dialog.
  - Invokes `exportToSvg()` for current canvas (or active selection).
- [x] **Milestone 4.10: Orthogonal Stepped (Elbow) Flow Arrow Connector**:
  - **Toolbar Tool & Hotkeys**: Added dedicated `#tool-elbow-arrow` directly beside Arrow with hotkeys <kbd>O</kbd> and <kbd>Shift+A</kbd>.
  - **Connector Routing Inspector**: Added `#arrowRoutingControl` (`Straight` vs `Elbow (Stepped)`) in `#connectorInspectorSection` for real-time switching of any arrow.
  - **Smooth Rounded Fillet Corners**: Built-in 2D Canvas rendering using `ctx.arcTo()` with dynamic corner radius clamping (max 14px) for smooth elbows.
  - **Circular Connection Anchor Ports**: High-fidelity concentric glow rings with solid inner port dots at start and end connection targets matching Eraser.io aesthetics (rendered upon selection for a clean workspace).
  - **Animated Packet Flow & Pulse Particle**: Opt-in dynamic electric cyan dashed packet flow (`setLineDash([8, 8])`) with continuous `lineDashOffset` cycling and glowing travelling particle along the 3 orthogonal segments (only executes 60 FPS loop when `isAnimated: true` is explicitly enabled).
  - **Cyan Waypoint Handles & Draggable Elbow Split**: 3 circular translucent cyan waypoint handles rendered when selected; middle handle is interactively draggable to dynamically adjust `elbowRatio`. Start and end ports are draggable for intuitive repositioning without displaying cumbersome 8-handle rectangular boxes or rotation stems.
  - **Vector SVG Export Parity**: Full export in `exportToSvg()` generating SVG `<path>`, flow dash overlay, concentric circular ports, and correctly oriented arrowhead tip.
  - **Bounds & Label Stability**: Safe bounds calculation in `src/math.js` checking `pts.length >= 4` to prevent `undefined` index crashes on straight labeled arrows across all diagram templates.
  - **Verification**: `tests/elbow_arrow_test.js` validating geometry, bounds, hit testing, and dragging (7 test suites, 100% pass).

### Phase 6: Contextual Properties Architecture & Canvas Layout Refinement (Sprint 6)

#### 6.1 Objectives
1. **Properties Inspector Reorganization & Left Docking (Excalidraw Design)**:
   - Floating left dock layout (`left: 16px; top: 76px;`) matching Excalidraw's core interface layout with smooth left slide transitions (`transform: translateX(calc(-100% - 30px))`).
   - Contextual section gating: When an Architecture Node or System Component is selected, hide irrelevant drawing controls (stroke palette, fill patterns, sloppiness/roughness, edges, text-align) and prominently display architecture fields (Service Title, Subtitle, Category Badge presets, Cloud/Lucide Icon Picker, Accent Theme palette, C4 Level, Latency, Capacity, SPOF Alert checkbox) plus universal Opacity and Layers.
   - Standard element parity: Standard geometric shapes, text, connectors, and images display only their applicable styling sections.
2. **Text Alignment Inversion Fix (ISSUE-27)**:
   - Accurately measure dynamic multiline text width in `renderTextElement()` (`src/renderer.js`) using `ctx.measureText` so text anchoring respects `totalW = Math.max(element.width || 0, maxLineWidth)`.
   - Ensure `textAlign === 'right'` anchors text at `element.x + totalW`, `center` at `element.x + totalW / 2`, and `left` at `element.x`.
   - Update SVG export (`exportToSvg` in `src/export.js`) and shape text (`renderShapeText`) for full parity across canvas, PNG, and SVG formats.
3. **Canvas Layers Ordering & Keyboard Shortcut Restoration (ISSUE-28)**:
   - Refactor `SceneRenderer.render()` in `src/renderer.js` to render elements in sequential array order (`this.elements`), allowing Bring to Front / Send to Back / Bring Forward / Send Backward to control canvas z-ordering deterministically.
   - Attach `e.stopPropagation()` and `e.preventDefault()` to layer button click listeners.
   - Add international keyboard shortcut support for <kbd>Ctrl + Shift + ]</kbd> / <kbd>Ctrl + Shift + [</kbd> and <kbd>Ctrl + ]</kbd> / <kbd>Ctrl + [</kbd> using both `e.key` and `e.code` (`BracketRight`, `BracketLeft`).
   - Provide instantaneous visual feedback via toast alerts (`showToast`).

#### 6.2 Delivery Milestones & Checkpoints (Sprint 6)
- [x] **Milestone 6.1: Floating Left Dock Layout (`src/style.css`)**: Maintained `.property-inspector` and `.properties-toggle-btn` at the top-left viewport edge (`left: 16px; top: 76px;`) matching Excalidraw layout, with smooth slide transitions (`transform: translateX(calc(-100% - 30px))`).
- [x] **Milestone 6.2: Contextual Properties Section Gating (`src/main.js`)**: Updated `updateInspectorUI()` to evaluate `isArchElement`, `isImage`, `isGroup`, and `isShape`, cleanly toggling relevant style panels while suppressing inapplicable tools.
- [x] **Milestone 6.3: Text Alignment Mathematical Fix (`src/renderer.js`, `src/export.js`)**: Resolved text alignment anchoring in canvas and SVG export engines.
- [x] **Milestone 6.4: Full Canvas Layer Z-Index Pipeline (`src/renderer.js`, `src/main.js`)**: Unified element rendering loop in painter's algorithm order, fixed layer keyboard listeners, and added toast feedback.
- [x] **Milestone 6.5: Quality Assurance & Build Verification**: Automated syntax validation (`node -c`), verified Vite production build (`npm run build`), and updated test cases.
- [x] **Milestone 6.6: Telemetry Overlays Gating in Exports (ISSUE-30)**: Corrected `metricsOverlay` default in `exportToGif` ([`src/export.js`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/export.js)) and passed `{ metricsOverlay: this.showMetricsOverlay }` from all export button handlers in [`src/main.js`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/main.js). If Telemetry Ops is unclicked, exports are 100% clean across all templates; if active, telemetry overlays are preserved.
- [x] **Milestone 6.7: Canvas Background Property Section (ISSUE-31)**: Added `#sec-canvas-bg` as the first section in the property inspector ([`index.html`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/index.html)) with 8 palette swatches and custom hex picker. Wired `setCanvasBackground(color)`, `saveAutoSave()`, and canvas clearing in [`src/renderer.js`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/renderer.js) and exports ([`src/export.js`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/src/export.js)).
- [x] **Milestone 6.8: Excalidraw Image & Compressed SVG Diagram Import (ISSUE-32)**: Whitelisted `image` in `sanitizeImportedElements`, mapped `data.files[fileId]` to `el.dataURL`, implemented `decodeExcalidrawSvg` via `DecompressionStream('deflate')`, and routed SVG diagrams through `importFromJson` with automatic viewport zoom-to-fit framing.



---

# Sprint 7: Bug-Fix & Repository Hardening

### 7.1 Objective & Executive Summary

Sprint 7 is a **pure bug-fix and repo-hardening sprint** driven by a comprehensive external code review (`doc/excalicraft-review.md`). No new product features are added. The goals are:
1. Correct the **critical-path latency algorithm** (BFS → DFS longest-path).
2. **Fix Mermaid import** for chained edges, subgraphs, and stateDiagram-v2.
3. Replace **title-substring SPOF heuristics** with an explicit `role` property.
4. Make **capacity saturation badges visible** on default templates.
5. **Harden the dev-server** `/api/save-gif` middleware against path traversal.
6. **Clean up the repository** (LICENSE, npm test, package.json, img/ stray files).
7. **Correct README** accuracy (Terraform/Compose false claim, autosave omission, overclaims).

---

### 7.2 File Changes (Sprint 7)

```
excalicraft/
├── LICENSE                         # [New] MIT License — Ahmed Emad 2026
├── .github/
│   └── workflows/
│       └── ci.yml                  # [New] GitHub Actions CI: install + build + test
├── package.json                    # [Modified] description filled, 'main' removed, 'test' script added
├── vite.config.js                  # [Modified] /api/save-gif hardened (basename, ext allowlist, size cap)
├── README.md                       # [Modified] Accuracy fixes (Terraform, autosave, overclaims, terminology)
├── src/
│   ├── graph.js                    # [Modified] calculatePathLatency (DFS longest-path), role property, isReplicated
│   └── mermaid.js                  # [Modified] Chained edge decomposition, subgraph parser, error recovery
├── tests/
│   ├── run_all.js                  # [New] Sequential test runner — exits 1 on failure
│   ├── sprint7_test.js             # [New] Regression tests: TC-S7-LAT-01/02, TC-S7-MRM-01/02/03, TC-S7-SPF-01/02, TC-S7-CAP-01
│   └── sprint7_security_test.js    # [New] Security tests: SEC-S7-01/02/03
├── img/                            # [Cleaned] Removed 5 stray PNGs + 5 sprint3_* duplicate GIFs
└── doc/
    ├── issues.md                   # [Updated] ISSUE-35 through ISSUE-49 added
    ├── test_scenario.md            # [Updated] Sprint 7 TC-S7 suite added
    ├── security_issues.md          # [Updated] Sprint 7 SEC-S7 suite added
    ├── implementation_plan.md      # [This document — Updated]
    └── handoff.md                  # [Updated] Sprint 7 session handoff appended
```

---

### 7.3 Detailed Component Specifications (Sprint 7)

#### 7.3.1 Critical Path Latency Fix (`src/graph.js`)
- **Function**: `calculatePathLatency(startId, endId)`
- **Old behavior**: BFS + shared `visited` Set → returns shortest path (first to reach `endId`).
- **New behavior**: DFS + per-path stack visited tracking → returns longest cumulative latency path.
- **Cycle safety**: New helper `hasCycle(startId)` runs a DFS topological check; if a cycle exists, the longest-path DFS is bounded to `MAX_DEPTH = 500` to prevent stack overflow.
- **Return**: `{ totalLatency: number, path: string[] }` — unchanged signature, corrected result.

#### 7.3.2 Mermaid Import Hardening (`src/mermaid.js`)
- **Chained edges**: Pre-processing step splits `A --> B --> C` into `[['A','B'],['B','C']]` before the token parser loop.
- **Subgraph blocks**: A `subgraph … end` block parser collects the label and all node IDs within; creates a `group-boundary` element wrapping those nodes.
- **Error recovery**: Replace `throw new Error(...)` on unknown tokens with `errors.push({ line, message })` → import continues. After the loop, if `errors.length > 0`, show a non-blocking toast: "Imported with N warnings — check console".
- **stateDiagram-v2**: Added `parseStateDiagram()` branch: `[*]` → `initial-state` element, `State: label` → `state-node` element, `-->` transitions → `arrow` elements.

#### 7.3.3 Explicit Node Role Property (`src/graph.js` + `index.html` + `src/main.js`)
- **New property on node elements**: `role: 'entry' | 'service' | 'datastore' | 'queue' | 'cache' | undefined`
- **New property**: `isReplicated: boolean` — if `true`, suppress stateful-SPOF flagging unconditionally.
- **New property**: `intentionalSinglePoint: boolean` — if `true`, show amber SPOF badge (warning level) instead of crimson.
- **Detection priority** in `detectSpofs()`:
  1. `node.role === 'entry'` → treat as entry node (replaces `title.includes('client')`)
  2. `node.role === 'datastore'` → treat as target node (replaces `title.includes('db')`)
  3. `node.isReplicated === true` → not SPOF (replaces `title.includes('replica')`)
  4. **Fallback** to title substring matching when `role` is undefined (backwards compat)
- **Inspector UI**: Added `#propNodeRole` `<select>` and `#propNodeReplicated` `<input type="checkbox">` to the Architecture Properties section.

#### 7.3.4 Capacity Visibility (`src/graph.js` + `src/templates.js`)
- `analyzeCapacity()`: when `maxCapacityQps` is falsy on a node, set `capacityNotConfigured: true` in the returned metrics map.
- Inspector: if `capacityNotConfigured`, show badge: `⚠ Capacity not set` in the Metrics section.
- Templates updated with `maxCapacityQps`:
  - Flash Sale: API Gateway = 50,000 QPS capacity, Order Service = 800 QPS (saturated at >100% with template's default arrow QPS values).
  - Global HA: Primary DB = 3,000 QPS capacity (will saturate with full stack QPS).
  - Fintech PCI: HSM Vault = 200 QPS capacity (intentionally low, will show saturation).

#### 7.3.5 Dev Server Path Traversal Fix (`vite.config.js`)
```js
// Before (vulnerable):
const targetFile = path.join(imgDir, filename);

// After (hardened):
const safeName = path.basename(filename);                    // strip ../ sequences
const allowedExts = ['.gif', '.png'];
if (!allowedExts.includes(path.extname(safeName).toLowerCase())) {
  res.statusCode = 400; res.end(JSON.stringify({ error: 'Invalid file extension' })); return;
}
const targetFile = path.join(imgDir, safeName);
if (!path.resolve(targetFile).startsWith(path.resolve(imgDir))) {
  res.statusCode = 403; res.end(JSON.stringify({ error: 'Forbidden' })); return;
}
// Body size cap: reject if accumulated body > 20MB
const MAX_SIZE = 20 * 1024 * 1024;
if (body.length > MAX_SIZE) {
  res.statusCode = 413; res.end(JSON.stringify({ error: 'Payload too large' })); return;
}
```

#### 7.3.6 Repository Hygiene
- `LICENSE`: MIT License, copyright 2026 Ahmed Emad.
- `package.json`: `description` set, `main` removed, `"test": "node tests/run_all.js"` added.
- `tests/run_all.js`: Imports and sequentially runs all `*.js` test files in `tests/`; collects results; prints pass/fail summary; exits 0 on all pass, exits 1 on any failure.
- `.github/workflows/ci.yml`: Triggers on `push` and `pull_request`; runs on `ubuntu-latest`; Node 20; steps: checkout, `npm ci`, `npm run build`, `npm test`.
- `img/` cleanup: 10 files removed (5 timestamped PNGs + 5 sprint3 GIFs).

---

### 7.4 Delivery Milestones & Checkpoints (Sprint 7)

- [x] **Milestone 7.1: graph.js — DFS Critical Path** (ISSUE-35)
- [x] **Milestone 7.2: mermaid.js — Import Hardening** (ISSUE-37)
- [x] **Milestone 7.3: graph.js + inspector — Role Property & isReplicated** (ISSUE-38, ISSUE-41)
- [x] **Milestone 7.4: graph.js + templates.js — Capacity Visibility** (ISSUE-39)
- [x] **Milestone 7.5: vite.config.js — Path Traversal Fix** (ISSUE-40)
- [x] **Milestone 7.6: Repo Hygiene** (LICENSE, package.json, npm test, CI, img/ clean) (ISSUE-42, ISSUE-43, ISSUE-44, ISSUE-45)
- [x] **Milestone 7.7: README Accuracy** (Terraform removed, autosave added, overclaims softened, terminology corrected) (ISSUE-36, ISSUE-46, ISSUE-47, ISSUE-48, ISSUE-49)
- [x] **Milestone 7.8: Test Suites** (sprint7_test.js, sprint7_security_test.js, run_all.js)

---

# Sprint 8 — Advanced Architecture Modeling, Reverse DDL, Markdown Notes & True Canvas Text Experience (November 2026)

## 8.1 Executive Scope & Strategic Vision
Sprint 8 delivers four major capabilities that bridge the gap between architectural diagramming and real-world system design workflows:
1. **SQL DDL → ERD Reverse Parser (FEAT-S8-01 / ISSUE-50)**: Ingest raw SQL schema definitions (`CREATE TABLE`, `ALTER TABLE ADD CONSTRAINT`, PK/FK, column types, nullability, unique) via drag-and-drop `.sql` files or modal paste, automatically laying out interactive ERD table cards on canvas with live relational foreign key connector arrows.
2. **First-Class Markdown Notes (FEAT-S8-02 / ISSUE-51)**: Provide dedicated, rich architectural documentation cards (ADRs, runbooks, code snippets, checklists) and element-anchored sticky callouts with live Markdown parsing, collapsible header pills, and high-fidelity vector export support (SVG, PDF, GIF).
3. **Directed Dominator Tree SPOF Analysis (FEAT-S8-03 / ISSUE-52)**: Upgrade from undirected articulation points to flow-directed dominance analysis (Lengauer-Tarjan / iterative dataflow), featuring interactive downstream blast-radius inspection and traffic-starvation path highlighting when selecting any node.
4. **Authentic Excalidraw Text Tool & Input UX (FEAT-S8-04 / ISSUE-53)**:
   - Replace toolbar 'T' text-box icon with authentic Excalidraw 'A' (letter A) icon.
   - Remove the artificial Word-like bounding box border around text during editing.
   - Eliminate the strict requirement to press Enter to commit text: typing directly on canvas, auto-resizing inline editor with zero frame, commit on blur / click outside, multiline support with Enter / Shift+Enter, and discard only on empty text.

---

## 8.2 Architectural Specifications & Technical Design

### 8.2.1 SQL DDL → ERD Reverse Parser (`src/codegen.js` + `src/main.js`)
- **Module**: `parseSqlDdl(sqlText)` in `src/codegen.js`.
- **Dialect Coverage**: PostgreSQL, MySQL/MariaDB, SQLite, ANSI SQL.
- **Parsing Pipeline**:
  1. **Tokenizer & Cleaner**: Strip block comments (`/* ... */`), line comments (`--`), and backticks/quotes.
  2. **Table Extractor**: Regex tokenizer identifying `CREATE TABLE [IF NOT EXISTS] <tableName> (...)`.
  3. **Column Extractor**: Extract `<colName> <colType> [PRIMARY KEY] [NOT NULL] [UNIQUE] [DEFAULT ...] [REFERENCES ...]`.
  4. **Table-level Constraints**: Parse `PRIMARY KEY (col1, col2)`, `FOREIGN KEY (fk_col) REFERENCES parent_table (pk_col)`, and `CONSTRAINT ...`.
  5. **Auto-Layout & Referential Linking**:
     - Compute grid-based layout offsets for generated `table` elements.
     - For each resolved foreign key relationship, instantiate an `arrow` element with `startBinding` to parent table and `endBinding` to child table, marked with `label: "1:N"`, `isErdRel: true`, and `fkConstraintName`.
- **UI Integration**:
  - Drag-and-drop listener on canvas accepting `.sql` files.
  - "Import SQL Schema" option in the top "Export/Import" modal.

### 8.2.2 First-Class Markdown Notes (`src/renderer.js` + `src/export.js` + `src/main.js`)
- **Element Definition**: `type: 'note-card'`, schema:
  ```typescript
  {
    id: string;
    type: 'note-card';
    x: number; y: number; width: number; height: number;
    title: string;              // e.g. "ADR-004: Payment Idempotency"
    markdownContent: string;    // Full Markdown body
    isCollapsed: boolean;       // If true, renders as single-line title pill
    attachedToElementId?: string; // Optional anchor to a service/DB node
    theme: 'yellow-sticky' | 'dark-slate' | 'clean-white' | 'glass';
  }
  ```
- **Lightweight Markdown Parser**: Renders headers (`#`, `##`, `###`), bold/italic (`**`, `*`), bullet lists (`- `), task checkboxes (`- [x]`), inline code (`` `code` ``), and fenced code blocks (` ``` `) with syntax styling.
- **Attached Sticky Callouts**: When `attachedToElementId` is present, the note tracks the host node's position on canvas movements.
- **Export Engine**:
  - `exportToSvg`: Emits `<foreignObject>` for modern vector viewers with structured `<text>`/`<rect>` vector fallbacks.
  - `exportToPdf`: Emits crisp vector text blocks maintaining pagination bounds.

### 8.2.3 Directed Dominator Tree SPOF Engine (`src/graph.js` + `src/renderer.js` + `src/main.js`)
- **Module**: `computeDominatorTree(rootId)` and `getBlastRadius(nodeId)` in `src/graph.js`.
- **Mathematical Foundation**:
  - A node $D$ dominates $N$ ($D \text{ dom } N$) with respect to ingress root $R$ if every directed path from $R$ to $N$ must pass through $D$.
  - Constructs the Immediate Dominator ($idom$) tree using iterative dataflow or Lengauer-Tarjan algorithm.
- **Interactive Blast Radius UI**:
  - In Flow Simulation Mode (`Ctrl+Shift+O`), hovering or clicking a node highlights its **Dominance Subtree**.
  - All nodes dominated by the selected node are outlined with a pulsing crimson **Blast Radius Aura**; non-affected components fade to 25% opacity.
  - Saturated flow arrows entering dominated nodes show `0 QPS (Starved)`.
  - Inspector displays exact metric: `Blast Radius: X% of downstream infrastructure affected`.

### 8.2.4 Authentic Excalidraw Text Tool & Input UX (`index.html` + `src/main.js` + `src/style.css` + `src/renderer.js`)
- **Toolbar Icon Modernization**:
  - Replace the framed Word-like `T` button in `index.html` with an authentic clean letter `A` vector icon matching Excalidraw standards.
- **Frameless Inline Text Editor**:
  - Redesign `#inlineTextEditor` in `src/style.css`: remove artificial input borders, background shadows, and box outlines.
  - Text editor inherits exact canvas zoom, canvas coordinates, font family (`Outfit`, `Caveat`, `JetBrains Mono`), font size, color, and line height.
  - Editor automatically grows in width and height dynamically as the user types (`textarea.style.height = textarea.scrollHeight + 'px'`).
- **Commit & Keyboard Ergonomics**:
  - **No strict Enter requirement**: Clicking anywhere outside the text editor or blurring the textarea immediately commits the text to canvas.
  - Pressing `Enter` adds a natural multiline newline (matching Excalidraw).
  - Pressing `Escape` commits if non-empty, or cancels if empty.
  - Single-line and multiline text render cleanly without any artificial bounding box frame on canvas.

---

## 8.3 Delivery Milestones & Checkpoints (Sprint 8)

- [x] **Milestone 8.1: SQL DDL Reverse Parser** (`src/codegen.js` + `src/main.js`)
  - [x] Lexer and tokenizer for `CREATE TABLE`, column types, PKs, FKs, constraints.
  - [x] Auto-scaffolding of ERD cards on canvas with relational arrows.
  - [x] File drop (`.sql`) and modal import support.
- [x] **Milestone 8.2: First-Class Markdown Notes** (`src/renderer.js` + `src/export.js` + `src/main.js`)
  - [x] Element schema `type: 'note'` (`sticky` and `adr`) with markdown token parser.
  - [x] Canvas rendering of cards, code blocks, task checkboxes, and collapsed pills.
  - [x] Element attachment anchor tracking host movements.
  - [x] High-fidelity SVG, PDF, PNG, and GIF export.
- [x] **Milestone 8.3: Directed Dominator Tree SPOF Engine** (`src/graph.js` + `src/renderer.js` + `src/main.js`)
  - [x] Immediate dominator ($idom$) tree calculation from entrypoint roots.
  - [x] Blast radius calculation (`getBlastRadius(nodeId)`).
  - [x] Interactive UI highlighting (dimming unaffected, glowing severed downstream components, 0 QPS starved flow).
- [x] **Milestone 8.4: Authentic Excalidraw Text Tool & Seamless Input** (`index.html` + `src/main.js` + `src/style.css` + `src/renderer.js`)
  - [x] Replace toolbar button `T` icon with clean letter `A` icon.
  - [x] Zero-border frameless textarea inheriting canvas typography and scaling.
  - [x] Blur/click-outside commit without mandatory Enter keypress.
  - [x] Multiline Enter / Shift+Enter support.
- [x] **Milestone 8.5: Sprint 8 Verification & Security Test Suites**
  - [x] `tests/sprint8_test.js` covering SQL reverse parsing, Markdown notes, Dominator Tree, and Text tool.
  - [x] Security protections covering SQL parser ReDoS (SEC-S8-01), Markdown XSS sanitization (SEC-S8-02), cycle safety (SEC-S8-03), and DOM input integrity (SEC-S8-04).
  - [x] Integration with `tests/run_all.js` (`npm test`) — 12/12 suites passing cleanly.
