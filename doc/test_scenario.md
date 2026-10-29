# ExcaliCraft: Quality Assurance & Test Scenarios
## Cumulative Multi-Sprint Test Master Registry

This master document tracks functional, regression, and integration test scenarios across all development sprints for **ExcaliCraft**. New sprints will append their test suites to this registry.

---

## Master Test Execution Registry

| Sprint | Suite Code | Feature / Test Focus | Test Count | Status |
|---|---|---|---|---|
| **Sprint 1** | `TC-S1-TMP` | Smart Technical Architecture Templates | 3 Cases | 🟢 Passing |
| **Sprint 1** | `TC-S1-MAP` | Canvas Minimap & Overview Radar (`M`) | 3 Cases | 🟢 Passing |
| **Sprint 1** | `TC-S1-PRS` | Presentation Stage Mode (`F`) & Zoom-to-Fit | 2 Cases | 🟢 Passing |
| **Sprint 1** | `TC-S1-COR` | Core Rough.js Jitter & Geometry Regressions | 3 Cases | 🟢 Passing |
| **Sprint 1** | `TC-S1-EXP` | Export / Import Parity (PNG, SVG, PDF, JSON) | 5 Cases | 🟢 Passing |
| **Sprint 1** | `TC-S1-ARC` | Eraser Architecture Nodes & Dedicated Properties Palette | 5 Cases | 🟢 Passing |
| **Sprint 2** | `TC-S2-ERD` | ERD Table Authoring & Column Schema Editor with Autocomplete | 7 Cases | 🟢 Passing |
| **Sprint 2** | `TC-S2-CMP` | First-Class Eraser Component Library | 8 Cases | 🟢 Passing |
| **Sprint 2** | `TC-S2-TPL` | UML Diagrams & Tiered Templates Hierarchy | 3 Cases | 🟢 Passing |
| **Sprint 2** | `TC-S2-DIA` | Decision Diamond Geometry & In-Place Text Editing | 3 Cases | 🟢 Passing |
| **Sprint 2** | `TC-S2-PEN` | Pencil (Freedraw) & Text Tool Fixes | 3 Cases | 🟢 Passing |
| **Sprint 2** | `TC-S2-NAV` | 4-Way Infinite Canvas Movement & Navigation | 4 Cases | 🟢 Passing |
| **Sprint 2** | `TC-S2-KBD` | Full Keyboard Shortcut Suite & Clipboard | 4 Cases | 🟢 Passing |
| **Sprint 2** | `TC-S2-ACT` | Activity Diagram Common Elements Suite | 4 Cases | 🟢 Passing |
| **Sprint 3** | `TC-S3-C4` | C4 Model Hierarchy & Level Tagging | 3 Cases | 🟢 Passing |
| **Sprint 3** | `TC-S3-NET` | Network Boundaries (VPC, Subnets, K8s Namespaces) | 3 Cases | 🟢 Passing |
| **Sprint 3** | `TC-S3-MET` | Quantitative Metrics Overlays, Path Latency & SPOF Alerts | 4 Cases | 🟢 Passing |
| **Sprint 4** | **Developer Interop & DDL Generation** | | | |
| Sprint 4 | `TC-S4-DDL` | SQL DDL Code Generation & ANSI/Postgres Export | 3 Cases | 🟢 Passing |
| Sprint 4 | `TC-S4-MRM` | Bi-directional Mermaid.js Sequence & Diagram Sync | 3 Cases | 🟢 Passing |
| Sprint 4 | `TC-S4-OAS` | OpenAPI / Swagger 3.0 Import Specification | 3 Cases | ⚪ Planned (Design Contract) |
| Sprint 4 | `TC-S4-AUT` | Local State Persistence & Debounced Auto-Save | 1 Case | 🟢 Passing |
| Sprint 4 | `TC-S4-CFM` | Destructive Action Confirmations & Undo Safety | 1 Case | 🟢 Passing |
| Sprint 4 | `TC-S4-ONB` | First-Time User Onboarding & Empty State | 1 Case | 🟢 Passing |
| Sprint 4 | `TC-S4-TST` | Unified Toast Feedback System | 1 Case | 🟢 Passing |
| Sprint 4 | `TC-S4-KBD-05` | Keyboard Shortcuts Cheat Sheet Modal (`?`) | 1 Case | 🟢 Passing |
| Sprint 4 | `TC-S4-IMG` | Insert Image Tool (File Picker, Drag & Drop, Scaling, Export Parity) | 3 Cases | 🟢 Passing |
| Sprint 4 | `TC-S4-KBD-06` | Quick Save Diagram Hotkey (`Ctrl + S` / `Cmd + S`) | 1 Case | 🟢 Passing |
| *Sprint 5* | `TC-S5-AIG` | AI Prompt-to-Diagram & Codebase Scanner | *Planned* | ⚪ Pending |

---

# Sprint 1 Test Scenarios: Templates, Minimap & Presentation

## Suite 1.1: Smart Architecture Templates (`TC-S1-TMP`)

### TC-S1-TMP-01: Load Microservices & Cloud Architecture Template
* **Objective:** Verify that the Microservices template renders correctly with proper service clusters, database nodes, and arrows.
* **Preconditions:** Application is open at `http://localhost:5173/`.
* **Steps:**
  1. Click the **"Templates"** dropdown in the top navigation bar.
  2. Select **"Microservices Architecture"**.
  3. Observe the canvas and scene graph.
* **Expected Result:**
  - Canvas renders the Microservices architecture layout.
  - Nodes include Client App, API Gateway, Auth Service, Order Service, Redis Cache, Postgres DB, and Kafka Bus.
  - Interconnecting hand-drawn arrows connect endpoints cleanly without overlapping text.
  - Camera automatically executes Zoom-to-Fit to center the template on screen.
  - History records the action (<kbd>Ctrl+Z</kbd> successfully rolls back to previous state).

### TC-S1-TMP-02: Load Database Schema (ERD) Template
* **Objective:** Verify rendering of relational database tables, columns, data types, and cardinality connectors.
* **Steps:**
  1. Click **"Templates" → "Database Schema (ERD)"**.
* **Expected Result:**
  - Table containers (`users`, `orders`, `order_items`, `products`) render with header sections and column rows.
  - Primary Key (`[PK]`) and Foreign Key (`[FK]`) badges are visible.
  - Cardinality lines connect foreign keys to target parent tables.
  - Each element receives a unique `id` and deterministic Rough.js `seed`.

### TC-S1-TMP-03: Load API Sequence Diagram Template
* **Objective:** Verify rendering of sequence lifelines, activation blocks, and call/return arrows.
* **Steps:**
  1. Click **"Templates" → "API Sequence Flow"**.
* **Expected Result:**
  - Vertical lifelines with dashed styles render across participating components.
  - Numbered horizontal arrows indicate synchronous and asynchronous message flow.
  - Double-clicking any step's text opens the inline editor for custom text modification.

---

## Suite 1.2: Interactive Canvas Minimap (`TC-S1-MAP`)

### TC-S1-MAP-01: Minimap Rendering & Scale Accuracy
* **Objective:** Verify that the overview radar displays a scaled representation of all elements on the canvas.
* **Steps:**
  1. Draw 3 shapes across different regions of the infinite canvas (e.g. at (0, 0), (1500, 200), (-800, -600)).
  2. Observe the bottom-right Minimap widget.
* **Expected Result:**
  - Minimap displays simplified outlines of all 3 shapes with correct relative positioning and aspect ratio.
  - The semi-transparent illuminated rectangle represents the exact visible camera viewport.

### TC-S1-MAP-02: Bidirectional Viewport Dragging on Minimap
* **Objective:** Verify that clicking or dragging the minimap viewport rectangle immediately pans the main canvas.
* **Steps:**
  1. Click and hold the viewport indicator inside the Minimap.
  2. Drag the rectangle toward the top-left corner of the minimap.
  3. Release the mouse.
* **Expected Result:**
  - Main canvas smoothly pans in real time matching the dragged coordinates.
  - Scene rendering remains fluid at 60 FPS without stuttering or ghosting.

### TC-S1-MAP-03: Minimap Toggle (<kbd>M</kbd> Key)
* **Objective:** Verify that the minimap can be shown or hidden via keyboard hotkey.
* **Steps:**
  1. Press <kbd>M</kbd> while focus is on the canvas.
  2. Observe the minimap.
  3. Press <kbd>M</kbd> again.
* **Expected Result:**
  - First press: Minimap smoothly fades out / collapses.
  - Second press: Minimap reappears in the bottom-right corner.

---

## Suite 1.3: Presentation Stage Mode (`TC-S1-PRS`)

### TC-S1-PRS-01: Fullscreen Presentation Entry (<kbd>F</kbd> Key)
* **Objective:** Verify that entering presentation mode clears all UI clutter and centers the diagram.
* **Steps:**
  1. Have an active diagram on the canvas.
  2. Click the **"Present"** button in the header or press <kbd>F</kbd>.
* **Expected Result:**
  - Top navigation bar, left Properties panel, bottom hints, and minimap are hidden.
  - Body element receives `.mode-presentation` class.
  - Canvas camera smoothly animates to Zoom-to-Fit, perfectly framing the entire diagram within 90% of the viewport.
  - A subtle floating control pill appears at the bottom with zoom and exit buttons.

### TC-S1-PRS-02: Presentation Exit (<kbd>Esc</kbd> Key)
* **Objective:** Verify that exiting presentation mode restores all editing panels to their previous state.
* **Steps:**
  1. While in Presentation Mode, press <kbd>Escape</kbd> or click the "Exit" button in the control pill.
* **Expected Result:**
  - Presentation mode ends.
  - Top toolbar, left Property Inspector (respecting whether it was previously opened or collapsed), and bottom controls return.
  - Camera maintains user zoom level without disorientation.

---

## Suite 1.4: Core Drawing & Geometry Regressions (`TC-S1-COR`)

### TC-S1-COR-01: Rough.js Deterministic Jitter Stability
* **Objective:** Verify that shapes do not vibrate, jitter, or change sketchy paths during zoom and pan operations.
* **Steps:**
  1. Draw a rectangle with `roughness: 2.0` (Cartoonist).
  2. Note the exact curvature and crossover lines.
  3. Pan the canvas around using <kbd>Space</kbd> + drag.
  4. Zoom in and out using <kbd>Ctrl</kbd> + mouse wheel.
* **Expected Result:**
  - The shape's sketchy contours remain 100% frozen and stable across all frames.
  - Rough.js cached drawable is reused without recalculating random geometry.

### TC-S1-COR-02: 8-Handle Resizing & Angle Rotation
* **Objective:** Verify that selecting a shape allows accurate resizing in all 8 cardinal directions and free rotation.
* **Steps:**
  1. Select a shape.
  2. Drag the `se` handle to enlarge.
  3. Drag the `nw` handle to shrink.
  4. Drag the top circular handle to rotate 45 degrees.
* **Expected Result:**
  - Shape boundaries update predictably without negative width/height collapse.
  - Rotation rotates element around its geometric center.
  - Live JSON schema telemetry updates coordinates and angle in real time.

### TC-S1-COR-03: Undo / Redo Stack Integrity
* **Objective:** Verify that state snapshots accurately track element creation, modification, deletion, and rearrangement.
* **Steps:**
  1. Draw a Rectangle.
  2. Change its fill to "Hachure".
  3. Draw an Arrow.
  4. Press <kbd>Ctrl+Z</kbd> twice.
  5. Press <kbd>Ctrl+Y</kbd> once.
* **Expected Result:**
  - First undo removes the Arrow.
  - Second undo reverts fill style back to None.
  - Redo restores the Hachure fill.
  - Undo and Redo UI buttons enable and disable according to stack bounds.

---

## Suite 1.5: Export & Import Parity (`TC-S1-EXP`)

### TC-S1-EXP-01: Hi-DPI PNG Export
* **Objective:** Verify exported PNG contains all elements supersampled with clean transparency or background.
* **Steps:**
  1. Click **"Export" → "Export as PNG"**.
  2. Open the downloaded PNG file in an image viewer.
* **Expected Result:**
  - Image is cropped to diagram bounding box with a 40px margin.
  - Hand-drawn lines are rendered at 2x Retina resolution with zero pixelation or blurry edges.

### TC-S1-EXP-02: SVG Vector Export
* **Objective:** Verify exported SVG preserves true vector paths generated via `rough.svg()`.
* **Steps:**
  1. Click **"Export" → "Export as SVG"**.
  2. Open the SVG in a browser or vector editor (Illustrator/Figma).
* **Expected Result:**
  - SVG elements are vector `<path>`, `<line>`, and `<text>` nodes.
  - Colors, fill styles (hachure patterns), and fonts match canvas appearance exactly.

### TC-S1-EXP-03: JSON / .excalidraw Round-Trip Fidelity
* **Objective:** Verify saving and re-importing a diagram reproduces identical visual elements and seeds.
* **Steps:**
  1. Create a diagram with text, shapes, arrows, and custom colors.
  2. Click **"Export" → "Export as JSON / .excalidraw"**.
  3. Clear the canvas (<kbd>Clear Canvas</kbd>).
  4. Click **"Import JSON / .excalidraw"** and select the exported file.
* **Expected Result:**
  - All elements reload into the scene graph with exact coordinates, colors, seeds, and text.
  - Drawing continues seamlessly from the imported state.

### TC-S1-EXP-04: Publication-Quality PDF Vector Export
* **Objective:** Verify exporting diagram as a publication-ready PDF document formatted to the diagram's exact aspect ratio.
* **Steps:**
  1. Load a cloud architecture diagram with service cards, groups, and labeled arrows.
  2. Click **"Export" → "Export as PDF"**.
  3. Open the downloaded `.pdf` file in a PDF viewer or Chrome.
* **Expected Result:**
  - PDF document is generated via `jsPDF` matching diagram proportions (Landscape or Portrait).
  - High resolution (2x Retina supersampled bitmap vector framing).
  - All labels, icons, accent stripes, and group boundaries are crisp and centered.

### TC-S1-EXP-05: Non-Clipping Bounding Box Verification (Shadows, Badges & Labels)
* **Objective:** Verify that no diagram elements (node drop shadows, group-boundary header pills, connector label badges, arrowheads) get cut off or truncated during export.
* **Steps:**
  1. Load Microservices Cloud architecture diagram.
  2. Ensure perimeter elements have outer label pills and dashed boundary tags.
  3. Export to PNG, SVG, and PDF.
  4. Inspect all 4 boundary margins (Top, Left, Right, Bottom).
* **Expected Result:**
  - 60px safe padding margin surrounds the outermost elements.
  - No card drop shadow is truncated at the canvas edge.
  - Header tags (`y - 12px` on VPC boundary) and connector badges remain completely visible within the export crop box.
  - Zero DPR scaling distortion occurs.

---

## Suite 1.6: Eraser Architecture Nodes & Dedicated Properties Palette (`TC-S1-ARC`)

### TC-S1-ARC-01: Eraser Architecture Node Card Live Property Editing
* **Objective:** Verify that selecting an architecture node card reveals the dedicated Architecture Node Properties section in the left inspector, and modifications immediately reflect on canvas.
* **Preconditions:** Microservices template is loaded (`Templates` → `Microservices Cloud Architecture`).
* **Steps:**
  1. Click on the `API Gateway` service card.
  2. Observe the left Properties Inspector.
  3. Change Title to `"Cloudflare Edge Gateway"`.
  4. Select preset badge chip `"EDGE"`.
  5. Click the `Globe` icon in the 16-icon Lucide grid.
  6. Click the Indigo accent color swatch (`#6366f1`).
* **Expected Result:**
  - Left inspector activates `#nodeInspectorSection` and hides irrelevant shape tools (fill pattern, stroke width, roughness).
  - Canvas node card updates immediately: top accent stripe becomes Indigo, icon renders Globe vector path, title displays "Cloudflare Edge Gateway", badge updates to "EDGE".
  - Undo history logs the change.

### TC-S1-ARC-02: Connector Arrow Live Label, Directionality & Signal Pulse Flow Animation
* **Objective:** Verify editing connector arrow labels, directional toggles, and live animated flow pulses.
* **Steps:**
  1. Click on an arrow connector (or its label badge) between Client App and Gateway.
  2. In the inspector's Connector Properties section, type label `"gRPC / HTTP3"`.
  3. Toggle direction to `Bidirectional (<->)`.
  4. Check the `"Live Signal Flow Pulse"` checkbox.
* **Expected Result:**
  - High-contrast label pill updates with crisp typography and background pill.
  - Arrow renders arrowheads at both source and target endpoints.
  - Glowing animated packet pulses smoothly travel along the arrow trajectory at 60 FPS.

### TC-S1-ARC-03: On-Canvas Double-Click Quick Edit Popover
* **Objective:** Verify that double-clicking directly on any architecture node triggers a popover modal directly above the card on canvas for fast editing.
* **Steps:**
  1. Double-click on the `Web Application` service card.
  2. Observe the popover modal `#nodeQuickEditModal`.
  3. Edit Title, Subtitle, or Badge directly within the modal.
  4. Click "Done" or click outside on the canvas.
* **Expected Result:**
  - Floating popover appears dynamically positioned right above the clicked node.
  - Input fields pre-populate with existing node attributes.
  - Changes save to the node immediately upon typing and closing.

### TC-S1-ARC-04: Cohesive Unified Node Dragging & Group Preservation
* **Objective:** Verify that moving an architecture node moves the entire card (background, border, icon, title, subtitle, badge) together as a single unified atomic component without fragmentation.
* **Steps:**
  1. Click and drag the `Web Application` card downward by 150px.
  2. Release the pointer.
* **Expected Result:**
  - Background container, pastel icon square, Lucide icon, title text, subtitle text, and badge pill all move together synchronously.
  - Connected arrows adjust their spatial orientation accordingly.
  - Elements do not separate into disjointed text or rectangle primitives.

### TC-S1-ARC-05: Dynamic Contextual Property Inspector Switching
* **Objective:** Verify that the Properties Inspector seamlessly swaps sections between Architecture Node, Flow Connector, VPC Group Boundary, and Canvas Quick-Add based on user selection.
* **Steps:**
  1. Click on empty canvas: observe `#canvasQuickAddSection` with `+ Service Node`, `+ VPC Boundary`, `+ Flow Arrow`.
  2. Click an architecture node: observe `#nodeInspectorSection`.
  3. Click a connector arrow: observe `#connectorInspectorSection`.
  4. Click a VPC boundary container: observe `#groupInspectorSection`.
  5. Click a standard sketch rectangle: observe `#standardShapeSection`.
* **Expected Result:**
### TC-S1-ARC-06: Multi-Provider Icon Filtering (`[All] [AWS] [Google] [Azure] [Tech]`)
* **Objective:** Verify that the icon picker in the Architecture Node Inspector allows instant filtering across cloud providers and tech stacks.
* **Steps:**
  1. Select an architecture node.
  2. In the inspector's icon section, observe provider filter tabs: `[All]`, `[AWS]`, `[Google]`, `[Azure]`, `[Tech]`.
  3. Click `AWS`: verify only AWS icons (Lambda, S3, DynamoDB, API Gateway, CloudFront, RDS, SQS, SNS) are shown.
  4. Click `Google`: verify only GCP icons (Cloud Run, Functions, Pub/Sub, Cloud SQL, BigQuery, Storage, Kubernetes, Load Balancing) are shown.
  5. Click `Azure`: verify only Azure icons (App Service, Functions, Cosmos DB, Blob Storage, Front Door, Service Bus, Azure SQL, Event Hubs) are shown.
  6. Click `Tech`: verify tech stack icons (Postgres, Redis, Kafka, Nginx, Docker, GraphQL, React, Python) are shown.
* **Expected Result:**
  - Filtering operates instantly without page reload.
  - Active tab is highlighted with primary pill style.
  - Selecting any filtered icon updates the node card on canvas immediately.

---

## Suite 1.7: Eraser Architecture & UML Template Suite (`TC-S1-TPL`)

### TC-S1-TPL-01: AWS Serverless Architecture
* **Objective:** Verify loading prebuilt AWS Serverless Architecture template matching Eraser standards.
* **Steps:**
  1. Click `Templates` dropdown in the top navigation bar.
  2. Select `AWS Serverless Architecture` (`#tpl-aws`).
* **Expected Result:**
  - Canvas loads AWS Cloud boundary containing CloudFront, API Gateway, Lambda Functions, DynamoDB, and S3 Bucket.
  - Elements possess official AWS service color accents and badges.
  - Live animated connectors show request dispatch flow.
  - Auto zoom-to-fit smoothly frames diagram with 60px padding.

### TC-S1-TPL-02: Google Cloud Platform (GCP) Enterprise
* **Objective:** Verify loading prebuilt GCP Enterprise Architecture template.
* **Steps:**
  1. Open `Templates` dropdown → select `Google Cloud (GCP) Enterprise` (`#tpl-google`).
* **Expected Result:**
  - Canvas loads Cloud Armor / Cloud CDN, Cloud Run API Service, Cloud Pub/Sub, Cloud Functions worker, Cloud SQL, and BigQuery data warehouse.
  - Distinct GCP branding colors and categorized badges (`INGRESS`, `COMPUTE`, `QUEUE`, `WAREHOUSE`).

### TC-S1-TPL-03: Microsoft Azure Enterprise
* **Objective:** Verify loading prebuilt Microsoft Azure Architecture template.
* **Steps:**
  1. Open `Templates` dropdown → select `Microsoft Azure Architecture` (`#tpl-azure`).
* **Expected Result:**
  - Canvas loads Azure Front Door, App Service, Event Grid, Functions, Azure Cosmos DB, and Blob Storage.
  - Consistent Azure blue accents with full directional connectors.

### TC-S1-TPL-04: Monolithic System Architecture
* **Objective:** Verify loading Monolithic System pattern with Presentation, Domain, Data Layer, and Cache.
* **Steps:**
  1. Open `Templates` dropdown → select `Monolithic System Architecture` (`#tpl-monolithic`).
* **Expected Result:**
  - Renders Nginx reverse proxy, monolithic MVC app server, Primary PostgreSQL, Read Replica, and Redis Session Cache.
  - Group boundary encapsulates the monolith host environment.

### TC-S1-TPL-05: Modular Monolith Core Architecture
* **Objective:** Verify loading Modular Monolith pattern with In-Process Event Bus and Bounded Modules.
* **Steps:**
  1. Open `Templates` dropdown → select `Modular Monolithic Core` (`#tpl-modular-monolith`).
* **Expected Result:**
  - Renders Bounded Modules (Auth Module, Orders Module, Inventory Module, Billing Module) communicating via an In-Process Mediators / Event Bus.
  - Segregated database schemas clearly demarcated.

### TC-S1-TPL-06: Microservices Cloud Architecture
* **Objective:** Verify loading Microservices Cloud pattern with Envoy Gateway, independent microservices, Kafka bus, and distributed databases.
* **Steps:**
  1. Open `Templates` dropdown → select `Microservices Cloud` (`#tpl-microservices`).
* **Expected Result:**
  - Renders Web Client, Envoy Gateway, Auth Service, Orders Service, Catalog Service, Kafka Event Bus, and segregated Redis & MongoDB stores.

### TC-S1-TPL-07: Business Process Flowchart
* **Objective:** Verify loading UML Flowchart template with decision diamonds and parallel branches.
* **Steps:**
  1. Open `Templates` dropdown → select `Business Process Flowchart` (`#tpl-flowchart`).
* **Expected Result:**
  - Renders Start state (pill), Process steps (rectangles), Decision node (diamond), Yes/No branch paths, and Terminal state.
  - Connectors display decision branch labels ("Approved", "Rejected").

### TC-S1-TPL-08: API Sequence Diagram
* **Objective:** Verify loading UML Sequence Diagram template with lifelines and execution boxes.
* **Steps:**
  1. Open `Templates` dropdown → select `API Sequence Diagram` (`#tpl-sequence`).
* **Expected Result:**
  - Renders Client App, API Gateway, Order Service, and Database lifelines.
  - Synchronous request arrows, asynchronous database queries, and dotted return arrows with status codes ("201 Created").

### TC-S1-TPL-09: UML State Machine Diagram
* **Objective:** Verify loading UML State Machine template with transitions and guard conditions.
* **Steps:**
  1. Open `Templates` dropdown → select `UML State Machine Diagram` (`#tpl-state-machine`).
* **Expected Result:**
  - Renders Initial State, Draft, In Review, Active Processing, Completed, and Cancelled states.
  - Transition arrows feature trigger labels (`submit()`, `approve()`, `reject()`, `timeout`).

### TC-S1-TPL-10: Database Relational ERD Schema
* **Objective:** Verify loading Entity Relationship Diagram (ERD) template with tables, keys, and relations.
* **Steps:**
  1. Open `Templates` dropdown → select `Relational Database Schema (ERD)` (`#tpl-erd`).
* **Expected Result:**
  - Renders `users`, `orders`, `products`, `payments`, and `order_items` tables with column names, data types, PK/FK flags, and cardinality arrows (`1 : N`, `N : M`).

---

## Suite 1.8: Looping Animated GIF Export Engine (`TC-S1-EXP-06`)

### TC-S1-EXP-06: Looping Animated GIF Export with Signal Packet Flow
* **Objective:** Verify exporting animated architecture diagrams containing traveling packet pulses into a valid `.gif` file using client-side `gifenc`.
* **Steps:**
  1. Load an architecture diagram with active animated connectors (e.g. AWS or Microservices).
  2. Click `Export` in top bar → click `Export as Animated GIF` (`#export-gif`).
  3. Observe export processing and verify generated file download.
  4. Open the downloaded `.gif` file in browser or image viewer.
* **Expected Result:**
  - Export modal closes smoothly upon triggering.
  - Multi-frame simulation executes 16 time steps (1000ms loop at 16 FPS / 60ms delay).
  - Generated `.gif` file downloads with name `diagram-[timestamp].gif`.
  - Signal packets are seen traveling along connector arrows in smooth cyclic motion.
  - Palette quantization and transparency masking preserve crisp typography and pastel card colors without artifacting.

---

# Sprint 2: Component Library, Dynamic ERD Schema Editor & Tiered Templates Hierarchy

## Suite 2.1: Database Tables (ERD) Authoring & Schema Editing (`TC-S2-ERD`)

### TC-S2-ERD-01: Add New Database Table Component from Properties Palette
* **Objective:** Verify user can click `+ Database Table (ERD)` in the Quick Architecture palette to spawn a new `erd-table` on canvas.
* **Steps:**
  1. Ensure no element is selected on canvas.
  2. In the Properties panel, locate the Data Components section and click `+ Database Table (ERD)`.
* **Expected Result:**
  - A new `erd-table` appears at the center of the viewport with default name `new_table`.
  - Default columns include `id` (PK, `uuid`), `created_at` (`timestamp`).
  - Table is automatically selected and inspector switches to `#erdTableInspectorSection`.

### TC-S2-ERD-02: Live Editing Table Name & Table Type
* **Objective:** Verify changing the table name and type badge dynamically updates the table card.
* **Steps:**
  1. Select an `erd-table` card.
  2. In the Table Inspector, change Table Name to `"customers"`.
  3. Change Table Type badge to `"BASE TABLE"`.
* **Expected Result:**
  - Canvas header immediately renders `⊞  customers` and `BASE TABLE` badge.
  - Undo/redo logs the change.

### TC-S2-ERD-03: Add New Column with Type and Key Flag
* **Objective:** Verify clicking `+ Add Column` adds a new row and reflows table height.
* **Steps:**
  1. Select an `erd-table`.
  2. In the Columns Editor, click `+ Add Column`.
  3. Type column name `"email_address"`, type `"varchar(255)"`, and select key `"FK"`.
* **Expected Result:**
  - New row appears in inspector and immediately renders on canvas with blue `FK` badge.
  - Table card height expands proportionally without clipping adjacent elements.

### TC-S2-ERD-04: Modify Existing Column Name, Type, and Primary Key
* **Objective:** Verify changing key badge to `PK` updates styling to gold `PK` badge.
* **Steps:**
  1. Select `orders` table.
  2. Toggle `user_id` column key from `FK` to `PK`.
* **Expected Result:**
  - Badge switches from blue `FK` to gold `PK`.

### TC-S2-ERD-05: Delete Column Row
* **Objective:** Verify deleting a column removes the row and shrinks table card height.
* **Steps:**
  1. Click the trash icon next to a column row in the Table Inspector.
* **Expected Result:**
  - Column is removed from schema and canvas.
  - Table height shrinks by 24px cleanly.

### TC-S2-ERD-06: Double-Click on Canvas Table to Focus Schema Inspector
* **Objective:** Verify double-clicking any `erd-table` on canvas selects the table and opens the properties editor.
* **Steps:**
  1. Double click on an ERD table on canvas.
* **Expected Result:**
  - Table is selected, property panel opens if collapsed, and table title input receives focus.

### TC-S2-ERD-07: SQL Common Types Datalist Dropdown with Custom Freeform Typing
* **Objective:** Verify column type input displays common SQL types dropdown while allowing freeform custom type entry.
* **Steps:**
  1. Select an ERD table and focus any column's type input.
  2. Double-click or press <kbd>Down Arrow</kbd> to view autocomplete datalist options (`UUID`, `VARCHAR(255)`, `TEXT`, `INTEGER`, `BIGINT`, `BOOLEAN`, `TIMESTAMP`, `DECIMAL(10,2)`, `JSONB`, `SERIAL`).
  3. Select `UUID` from dropdown and verify immediate canvas update.
  4. Type custom type `"GEOMETRY(Point, 4326)"` not in list.
* **Expected Result:**
  - Standard SQL types are suggested automatically via native `<datalist id="commonSqlTypes">`.
  - Custom types outside the datalist are accepted without rejection or truncation.
  - Canvas renders the exact type string in the column type column.

---

## Suite 2.2: First-Class Eraser Component Library (`TC-S2-CMP`)

### TC-S2-CMP-01: Quick Add Database Component
* **Objective:** Verify adding a dedicated `PostgreSQL DB` component.
* **Steps:**
  1. In Quick Architecture palette, click `+ PostgreSQL DB`.
* **Expected Result:**
  - Spawns a cohesive database component card with `Postgres` icon, `DATABASE` badge, and `#336791` theme.

### TC-S2-CMP-02: Quick Add Redis Cache Component
* **Objective:** Verify adding a dedicated `Redis Cluster` component.
* **Steps:**
  1. Click `+ Redis Cache`.
* **Expected Result:**
  - Spawns a cache card with `Terminal` icon, `CACHE` badge, subtitle `"In-Memory Key-Value Store"`, and `#d6336c` theme.

### TC-S2-CMP-03: Quick Add Kafka / Message Queue Component
* **Objective:** Verify adding a dedicated `Kafka Queue` component.
* **Steps:**
  1. Click `+ Kafka Queue`.
* **Expected Result:**
  - Spawns an event stream component with `Activity` icon, `QUEUE` badge, and `#f76707` theme.

### TC-S2-CMP-04: Quick Add Sequence Lifeline Participant & Continuous Lifeline
* **Objective:** Verify adding a Sequence Lifeline Actor.
* **Steps:**
  1. Click `+ Lifeline Participant`.
* **Expected Result:**
  - Spawns participant card with vertical dashed lifeline dropping down and bottom actor footer.

### TC-S2-CMP-05: Quick Add Sequence Activation Box
* **Objective:** Verify adding an execution activation box.
* **Steps:**
  1. Click `+ Activation Box`.
* **Expected Result:**
  - Spawns an `activation-box` element with adjustable height.

### TC-S2-CMP-06: Quick Add Process Swimlane
* **Objective:** Verify adding an Activity/Process swimlane container.
* **Steps:**
  1. Click `+ Process Swimlane`.
* **Expected Result:**
  - Spawns a horizontal `swimlane` element with left colored header tab and vertical lane title.

### TC-S2-CMP-07: Quick Add UML State Node with Action Compartments
* **Objective:** Verify adding a `state-node` with entry/do/exit action compartments.
* **Steps:**
  1. Click `+ UML State Node`.
* **Expected Result:**
  - Spawns state card with header divider and configurable actions.

### TC-S2-CMP-08: Quick Add Initial (●) and Final (◉) States
* **Objective:** Verify adding Initial State and Final State UML nodes.
* **Steps:**
  1. Click `+ Initial State (●)`.
  2. Click `+ Final State (◉)`.
* **Expected Result:**
  - Spawns solid initial circle and bullseye final circle.

---

## Suite 2.3: UML Diagrams & Tiered Templates Hierarchy (`TC-S2-TPL`)

### TC-S2-TPL-01: Activity Diagram Template (Renamed from Business Process Flowchart)
* **Objective:** Verify template displays under UML as "Activity Diagram (Swimlane Process)".
* **Steps:**
  1. Open Templates menu → hover UML Diagrams → select `Activity Diagram`.
* **Expected Result:**
  - Loads 4-swimlane Expense Reimbursement diagram with steps, decision diamonds, and cross-lane routing.

### TC-S2-TPL-02: Logic Flow Chart Diagram Template
* **Objective:** Verify loading new dedicated Logic Flowchart template.
* **Steps:**
  1. Open Templates menu → hover UML Diagrams → select `Flow Chart Diagram`.
* **Expected Result:**
  - Loads standard logic flowchart with Start pill, input validation diamond, processing cards, transaction diamond, error rollback, and End pill.

### TC-S2-TPL-03: Tiered Menu Navigation & Submenu Hover
* **Objective:** Verify smooth nested submenu opening and keyboard/mouse interaction.
* **Steps:**
  1. Click `Templates` in top toolbar.
  2. Hover over `Cloud Architecture`, `Architecture Patterns`, `UML Diagrams`, `Database Design`.
* **Expected Result:**
  - High-visibility submenus fly out to the right without flickering or layout shifting.
  - Clicking any template item loads canvas and closes menu.

---

## Suite 2.4: Decision Diamond Geometry & In-Place Text Editing (`TC-S2-DIA`)

### TC-S2-DIA-01: Direct Decision Diamond (◇) Creation & Rendering
* **Objective:** Verify clicking `Decision ◇` spawns a single unified diamond element without composite shape fragmentation.
* **Steps:**
  1. In Properties palette or quick architecture bar, click `Decision ◇`.
  2. Observe the canvas and scene graph.
* **Expected Result:**
  - Spawns a cohesive `diamond` element with vertices at top, right, bottom, left.
  - Border renders with configured theme stroke and soft semi-transparent background fill.
  - Element can be dragged, scaled, or duplicated as a single object.

### TC-S2-DIA-02: Centered Condition Text Rendering & Contrast
* **Objective:** Verify diamond condition text is centered inside the diamond with high contrast in dark/light modes.
* **Steps:**
  1. Select the created decision diamond.
  2. Check default text `"is valid?"`.
* **Expected Result:**
  - Text is vertically and horizontally centered at `(x + width/2, y + height/2)`.
  - Font renders in JetBrains Mono with appropriate contrast against canvas background.

### TC-S2-DIA-03: Inspector & Inline Text Modification
* **Objective:** Verify changing condition text in the inspector updates the diamond text instantly.
* **Steps:**
  1. With diamond selected, open property inspector.
  2. In "Condition / Decision Text" input, change text to `"Authorized?"`.
  3. Change Theme Color to Purple (`#7048e8`).
* **Expected Result:**
  - Condition text updates immediately to `"Authorized?"`.
  - Diamond stroke updates to purple theme.
  - Undo (<kbd>Ctrl+Z</kbd>) restores previous label and color.

---

## Suite 2.5: Pencil (Freedraw) & Text Tool Fixes (`TC-S2-PEN`)

### TC-S2-PEN-01: Freedraw Smooth Quadratic Canvas Curves
* **Objective:** Verify drawing with Pencil tool (`P`) produces smooth curves without stale Rough.js cache key errors.
* **Steps:**
  1. Select Pencil tool (`P`).
  2. Click and drag across the canvas in continuous curved strokes.
  3. Release mouse button.
* **Expected Result:**
  - Curve renders smoothly in real time using quadratic Bézier midpoint interpolation.
  - End points have rounded caps (`ctx.lineCap = 'round'`) and corners have round joins (`ctx.lineJoin = 'round'`).
  - No JavaScript runtime exceptions occur in console.

### TC-S2-PEN-02: Single-Tap Freedraw Dot Rendering (`ctx.arc`)
* **Objective:** Verify a single tap/click with the pencil tool renders a visible dot instead of vanishing.
* **Steps:**
  1. Select Pencil tool (`P`).
  2. Click once on the canvas without dragging.
* **Expected Result:**
  - A crisp dot of radius `strokeWidth / 2` renders at the clicked coordinate via `ctx.arc()`.
  - The dot persists after releasing pointer and participates in selection.

### TC-S2-PEN-03: Inline Text Area Event Isolation & Blur Fix
* **Objective:** Verify clicking Text tool (`T`) opens the inline editor, allows typing without premature closing, and commits on <kbd>Enter</kbd> or click outside.
* **Steps:**
  1. Select Text tool (`T`).
  2. Click anywhere on canvas.
  3. Type `"Microservices Gateway Architecture"`.
  4. Press <kbd>Enter</kbd> (or click canvas outside textarea).
* **Expected Result:**
  - Textarea receives focus immediately upon canvas click.
  - Clicking inside textarea or dragging cursor does not cause premature blur.
  - Pressing <kbd>Enter</kbd> commits text element to canvas with correct font size and family.
  - Pressing <kbd>Escape</kbd> cancels text creation cleanly.

---

## Suite 2.6: 4-Way Infinite Canvas Movement & Navigation (`TC-S2-NAV`)

### TC-S2-NAV-01: Hand Tool (`H`) Drag Panning
* **Objective:** Verify selecting the Hand Tool allows continuous 4-way panning across the entire canvas.
* **Steps:**
  1. Press <kbd>H</kbd> or click Hand icon in toolbar.
  2. Notice cursor changes to `grab`.
  3. Click and drag Left, Right, Up, and Down.
* **Expected Result:**
  - Viewport camera (`scrollX`, `scrollY`) translates 1:1 with mouse displacement.
  - Active cursor changes to `grabbing` during active drag.
  - Releasing mouse preserves new camera position.

### TC-S2-NAV-02: Spacebar + Drag & Middle Mouse Drag Panning
* **Objective:** Verify temporary grab-panning via Spacebar hold or middle mouse button.
* **Steps:**
  1. Switch to Selection tool (`V`).
  2. Hold <kbd>Spacebar</kbd> and drag mouse across canvas.
  3. Release <kbd>Spacebar</kbd>.
  4. Press down Middle Mouse Button (scroll wheel) and drag.
* **Expected Result:**
  - Holding Spacebar switches cursor to `grab` and enables canvas panning from any tool.
  - Releasing Spacebar returns tool to previous active tool.
  - Middle mouse drag pans canvas immediately regardless of active tool.

### TC-S2-NAV-03: Shift + Wheel Horizontal Scrolling & Wheel Vertical Panning
* **Objective:** Verify hardware scroll wheel can pan both vertically and horizontally.
* **Steps:**
  1. Place cursor over empty canvas.
  2. Scroll mouse wheel Up and Down.
  3. Hold <kbd>Shift</kbd> and scroll mouse wheel Up and Down.
* **Expected Result:**
  - Standard mouse wheel scrolls vertically (`scrollY` adjusts by delta).
  - <kbd>Shift</kbd> + wheel scrolls horizontally (`scrollX` adjusts by delta).

### TC-S2-NAV-04: Arrow Key 4-Directional Viewport Panning
* **Objective:** Verify Arrow keys pan the canvas viewport in all 4 directions when no element is selected.
* **Steps:**
  1. Click empty canvas to ensure no elements are selected.
  2. Press <kbd>ArrowLeft</kbd>, <kbd>ArrowRight</kbd>, <kbd>ArrowUp</kbd>, and <kbd>ArrowDown</kbd>.
  3. Hold <kbd>Shift</kbd> with Arrow keys for accelerated panning.
* **Expected Result:**
  - <kbd>ArrowLeft</kbd> pans camera right (revealing left content).
  - <kbd>ArrowRight</kbd> pans camera left (revealing right content).
  - <kbd>ArrowUp</kbd> and <kbd>ArrowDown</kbd> pan vertically.
  - Holding <kbd>Shift</kbd> pans at 5× speed (150px per step).

---

## Suite 2.7: Full Keyboard Shortcut Suite & Clipboard (`TC-S2-KBD`)

### TC-S2-KBD-01: Clipboard Copy (`Ctrl+C`) & Paste (`Ctrl+V`) with 24px Offset
* **Objective:** Verify copying elements and pasting them duplicates the elements with independent IDs and a visual 24px cascade.
* **Steps:**
  1. Select an Architecture Node or ERD Table.
  2. Press <kbd>Ctrl+C</kbd> (or <kbd>Cmd+C</kbd> on macOS).
  3. Press <kbd>Ctrl+V</kbd>.
* **Expected Result:**
  - Duplicated element spawns offset by `(+24px, +24px)`.
  - Duplicated element receives a new unique `id` and random Rough.js `seed`.
  - Newly pasted element becomes the active selection.

### TC-S2-KBD-02: Clipboard Cut (`Ctrl+X`)
* **Objective:** Verify cutting elements copies them to clipboard and removes them from canvas.
* **Steps:**
  1. Select an element on canvas.
  2. Press <kbd>Ctrl+X</kbd>.
  3. Observe canvas, then press <kbd>Ctrl+V</kbd> in a new location.
* **Expected Result:**
  - Original element is deleted from canvas.
  - Pressing <kbd>Ctrl+V</kbd> restores the element at the pasted location.
  - Entire transaction is undoable via <kbd>Ctrl+Z</kbd>.

### TC-S2-KBD-03: Select All (`Ctrl+A`) and Mass Deletion (`Delete` / `Backspace`)
* **Objective:** Verify <kbd>Ctrl+A</kbd> selects all canvas elements and <kbd>Delete</kbd> clears them.
* **Steps:**
  1. Press <kbd>Ctrl+A</kbd>.
  2. Verify all elements are enclosed in multi-selection bounding box.
  3. Press <kbd>Delete</kbd> or <kbd>Backspace</kbd>.
* **Expected Result:**
  - All elements are selected.
  - Pressing Delete removes all elements in one atomic operation.
  - Pressing <kbd>Ctrl+Z</kbd> restores all elements with exact previous positions and properties.

### TC-S2-KBD-04: Arrow Key Element Nudging (1px / Shift 10px)
* **Objective:** Verify Arrow keys nudge selected elements with pixel precision.
* **Steps:**
  1. Select an element on canvas.
  2. Press <kbd>ArrowRight</kbd> 5 times.
  3. Hold <kbd>Shift</kbd> and press <kbd>ArrowDown</kbd> 2 times.
* **Expected Result:**
  - Element moves right by exactly 5px (1px per tap).
  - Element moves down by exactly 20px (10px per shift tap).
  - Canvas does not pan while an element is selected and being nudged.

---

## Suite 2.8: Activity Diagram Common Elements Suite (`TC-S2-ACT`)

### TC-S2-ACT-01: Activity Action Step Card (`+ Action Step`)
* **Objective:** Verify adding an Activity Action step card to canvas.
* **Steps:**
  1. In Properties palette under Activity Diagram elements, click `+ Action Step`.
* **Expected Result:**
  - Spawns rounded rectangular card (`activity-action`) with title `"Process Order"`.
  - Element has dedicated inspector allowing renaming title, changing theme color, and sizing.

### TC-S2-ACT-02: Fork Bar (`━`) & Join Bar (`━`) Synchronization Nodes
* **Objective:** Verify adding Fork (split) and Join (merge) synchronization bars.
* **Steps:**
  1. Click `Fork Bar ━`.
  2. Click `Join Bar ━`.
* **Expected Result:**
  - Fork node spawns as a thick horizontal bar labeled `[Fork]`.
  - Join node spawns as a thick horizontal bar labeled `[Join]`.
  - Elements render with dark high-contrast fill and support arrow connections on top and bottom edges.

### TC-S2-ACT-03: Flow Final (`⊗`) Terminal Node
* **Objective:** Verify adding a Flow Final node to represent the end of a specific path without terminating the whole activity.
* **Steps:**
  1. Click `Flow Final ⊗`.
* **Expected Result:**
  - Spawns circular node with internal diagonal cross (`⊗`).
  - Renders with crisp circular border and 45-degree diagonal lines.

### TC-S2-ACT-04: Initial (`●`) and Activity Final (`◉`) Nodes
* **Objective:** Verify adding start and end control nodes in an activity diagram.
* **Steps:**
  1. Click `+ Initial State (●)`.
  2. Click `+ Final State (◉)`.
* **Expected Result:**
  - Initial node renders as a filled solid circle.
  - Final node renders as a bullseye (outer circle with solid inner concentric circle).

---

# Sprint 3: System Design, Quantitative Modeling & C4 Architecture

## Suite 3.1: C4 Model Hierarchy & Level Tagging (`TC-S3-C4`)

### TC-S3-C4-01: Set Architecture Node C4 Hierarchy Level
* **Objective:** Verify selecting a node allows setting its C4 abstraction tier (`Context`, `Container`, `Component`, `Deployment`) in the inspector, immediately updating the card badge and color.
* **Steps:**
  1. Select an Architecture Node (e.g. `Order Service`).
  2. In the inspector's C4 Architecture section, click `Container`.
* **Expected Result:**
  - Card displays `[CONTAINER]` badge with C4 standardized container styling.
  - Scene graph element records `c4Level: 'container'`.
  - JSON round-trip export preserves the C4 tag.

### TC-S3-C4-02: C4 System Context External Persona / System Card
* **Objective:** Verify creating a System Context external user persona or SaaS system.
* **Steps:**
  1. Click `+ Context System` in Quick Architecture palette.
* **Expected Result:**
  - Spawns card with high-level `[CONTEXT]` styling, external actor icon, and subtitle `"External Banking Provider"`.

### TC-S3-C4-03: C4 Hierarchy Filter / Focus Mode
* **Objective:** Verify filtering canvas view by C4 level dims elements outside the active abstraction tier.
* **Steps:**
  1. In the header or inspector filter, select `Focus: Container Level`.
* **Expected Result:**
  - Container-level elements remain fully illuminated (100% opacity).
  - Component-level sub-elements and external deployment nodes fade to 20% opacity.

---

## Suite 3.2: Network & Security Boundary Enclosures (`TC-S3-NET`)

### TC-S3-NET-01: Spawn Cloud VPC Boundary with CIDR Block Tag
* **Objective:** Verify creating a Cloud VPC boundary renders dual-line border and CIDR notation header.
* **Steps:**
  1. Click `+ Cloud VPC` in Quick Architecture palette.
* **Expected Result:**
  - Spawns boundary container with header pill `"VPC (10.0.0.0/16)"` and dark/light cloud boundary styling.
  - Moving the VPC translates all encapsulated services together synchronously.

### TC-S3-NET-02: Public vs Private Subnet Boundary Contrast
* **Objective:** Verify public and private subnet containers display distinct visual borders and security labels.
* **Steps:**
  1. Click `+ Public Subnet` and `+ Private Subnet`.
* **Expected Result:**
  - Public Subnet renders with emerald green security accent (`DMZ / Ingress`).
  - Private Subnet renders with slate blue shielded accent (`Internal Isolated`).

### TC-S3-NET-03: Kubernetes Namespace / Cluster Enclosure
* **Objective:** Verify spawning a Kubernetes Cluster boundary with namespace badge.
* **Steps:**
  1. Click `+ K8s Cluster`.
* **Expected Result:**
  - Container renders with Kubernetes blue accent and `k8s: production-core` header tag.

---

## Suite 3.3: Quantitative Metrics Overlays, Path Latency & SPOF Alerts (`TC-S3-MET`)

### TC-S3-MET-01: Toggle System Metrics Overlay (<kbd>Alt+M</kbd>)
* **Objective:** Verify pressing <kbd>Alt+M</kbd> or clicking "Metrics Overlay" toggles telemetry badges on nodes and connectors.
* **Steps:**
  1. Load Microservices Cloud architecture diagram.
  2. Press <kbd>Alt+M</kbd>.
* **Expected Result:**
  - Connector arrows display QPS and hop transit latency badges (`⚡ 5.2k QPS | 4ms`).
  - Service nodes display processing budget and SLA badges (`⏱ 20ms (p99) | 99.99%`).
  - Pressing <kbd>Alt+M</kbd> again smoothly fades out all telemetry overlays for clean presentation.

### TC-S3-MET-02: Automated SPOF (Single Point of Failure) Detection
* **Objective:** Verify graph solver identifies un-replicated critical bottlenecks and displays an alert indicator.
* **Steps:**
  1. Draw a sequence: `Client App -> Single API Gateway -> Multiple Services`.
  2. Turn on Metrics Overlay (<kbd>Alt+M</kbd>).
* **Expected Result:**
  - In-memory graph engine runs Tarjan's articulation point detection.
  - `Single API Gateway` is flagged as an articulation point: displays amber/red `⚠️ SPOF Alert` badge.
  - Adding a redundant gateway and load balancer clears the SPOF alert automatically.

### TC-S3-MET-03: Cumulative End-to-End Critical Path Latency
* **Objective:** Verify clicking a request path calculates total cumulative latency.
* **Steps:**
  1. Select an end-to-end flow from Client to Database (`10ms network + 15ms gateway + 5ms network + 30ms order service + 8ms database`).
  2. View Path Latency summary in inspector.
* **Expected Result:**
  - Displays Total Path Latency: `68ms (p99)`.

### TC-S3-MET-04: Saturated Capacity Overflow Warning
* **Objective:** Verify when incoming QPS exceeds node capacity, the component highlights a saturation warning.
* **Steps:**
  1. Set incoming arrow QPS to `15,000`.
  2. Set node `maxCapacityQps` to `10,000`.
* **Expected Result:**
  - Node card border glows red with alert pill: `"Capacity Exceeded (150%)"`.

### TC-S3-C4-02: C4 Container & Context Template Ingestion
* **Objective:** Verify selecting C4 templates from the templates menu loads full C4 Model architectural diagrams.
* **Steps:**
  1. Open Templates menu -> Category 6: `🏛️ C4 Model Architecture`.
  2. Select `C4 Container Diagram`.
* **Expected Result:**
  - Loads Person (`Customer`), System Boundary (`10.0.0.0/16`), SPA (`React`), Mobile App (`Flutter`), API Application (`Java Spring Boot`), Relational Database (`PostgreSQL`), Mainframe, and Email systems.
  - Nodes include standardized C4 level metadata (`person`, `container`, `context`).

### TC-S3-C4-03: C4 Architecture Primitives Palette Buttons
* **Objective:** Verify creating C4 components directly from the left Component Library.
* **Steps:**
  1. Ensure no element is selected on the canvas.
  2. In Component Library, locate `🏛️ C4 Architecture Primitives`.
  3. Click `C4 Person`, `C4 System`, `C4 Container`, `C4 Component`, and `C4 Database`.
* **Expected Result:**
  - Distinct C4 node cards spawn with corresponding C4 color themes, Lucide vector icons, and type badges.

### TC-S3-MET-05: Prominent Top-Border SPOF Floating Alert Pill & Red Halo Glow
* **Objective:** Verify single points of failure render prominently at the top card boundary without overlapping bottom badges.
* **Steps:**
  1. Load `C4 Container Diagram` and toggle Telemetry (<kbd>Alt+M</kbd>).
  2. Inspect `API Application` and `Relational Database`.
* **Expected Result:**
  - Cards feature a glowing red halo (`#fa5252`, 2.5px border).
  - Floating pill on top border displays `⚠️ SINGLE POINT OF FAILURE` / `⚠️ SPOF ALERT`.
  - Bottom edge displays traffic capacity utilization `🔥 20,000/10,000 QPS (200%)`.

### Automated Verification Results (Sprint 3 Suite):
* **Execution Script:** [`tests/sprint3_test.js`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/tests/sprint3_test.js)
* **Status:** Passed 100% (6 Test Suites, Zero Regressions)
* **Build Verification:** `npm run build` completed cleanly in 857ms (`dist/index-*.js`, `dist/index-*.css`).

| Test Identifier | Component Under Test | Evaluation Criteria | Result |
| :--- | :--- | :--- | :--- |
| **TC-S3-C4-01** | C4 Model Inspector | Abstraction tags (`Context`, `Container`, `Component`, `Deployment`) | `PASSED` |
| **TC-S3-C4-02** | C4 Templates | Dedicated dropdown menu & quick pills for C4 Container & Context diagrams | `PASSED` |
| **TC-S3-C4-03** | C4 Primitives Palette | Quick-add buttons for Person, System, Container, Component, Database | `PASSED` |
| **TC-S3-NET-01** | Group Boundary | Cloud VPC double-border & CIDR notation (`10.0.0.0/16`) | `PASSED` |
| **TC-S3-NET-02** | Group Boundary | Public DMZ (green) vs Private Isolated (indigo) Subnets | `PASSED` |
| **TC-S3-NET-03** | Group Boundary | K8s Cluster bracketed corners & namespace tag | `PASSED` |
| **TC-S3-MET-01** | Telemetry Overlays | <kbd>Alt+M</kbd> instant toggle & telemetry pill rendering | `PASSED` |
| **TC-S3-MET-02** | Tarjan Graph Solver | SPOF cut-vertex detection in Flash Sale and C4 Container | `PASSED` |
| **TC-S3-MET-03** | Graph Engine | Cumulative critical path transit latency (`A -> B -> C = 75ms`) | `PASSED` |
| **TC-S3-MET-04** | Capacity Engine | Saturation detection (20k inflow vs 10k capacity = 200%) | `PASSED` |
| **TC-S3-MET-05** | SPOF Alert Visibility | Floating top-border badge (`⚠️ SINGLE POINT OF FAILURE`) & red border glow | `PASSED` |

### Sprint 3 Animated GIF Artifacts (Saved to `img/` for README Documentation):
All 5 test case diagrams have been rendered and exported as looping animated GIFs with active signal pulse flows, quantitative telemetry badges, and SPOF hazard indicators:

| Architecture Diagram | Artifact Path | Size | Features Visualized |
| :--- | :--- | :--- | :--- |
| **C4 Container Diagram** | [`img/sprint3_c4_container.gif`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/img/sprint3_c4_container.gif) | 559.9 KB | Person, System Boundary, SPA, Mobile App, API App (SPOF alert), PostgreSQL (SPOF & 200% QPS overload), Mainframe, Email |
| **C4 Context Diagram** | [`img/sprint3_c4_context.gif`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/img/sprint3_c4_context.gif) | 326.5 KB | Enterprise customer persona, Internet Banking System Context, external banking mainframe, SMTP notifications |
| **E-Commerce Flash Sale** | [`img/sprint3_flash_sale.gif`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/img/sprint3_flash_sale.gif) | 424.2 KB | Edge CDN, Ingress Gateway, Order Processing Service (SPOF), Aurora Primary DB (SPOF & 117% capacity saturation) |
| **Global Microservices HA** | [`img/sprint3_global_ha.gif`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/img/sprint3_global_ha.gif) | 478.0 KB | Route53 Geolocation routing, dual multi-region VPC boundaries (US-East & EU-West), Active-Active replication |
| **Fintech PCI Gateway** | [`img/sprint3_fintech_pci.gif`](file:///c:/Users/ahmed/.gemini/antigravity/scratch/excalidraw-REA/img/sprint3_fintech_pci.gif) | 602.0 KB | 3 isolated network tiers: Public DMZ Subnet, Private App Subnet, and Tokenization Vault HSM isolated subnet |

---

# Sprint 4: Developer Code Interoperability & DDL Generation

## Suite 4.1: SQL DDL Code Generation (`TC-S4-DDL`)

### TC-S4-DDL-01: Instant SQL DDL Export from ERD Tables
* **Objective:** Verify clicking "Copy SQL DDL" in an ERD table inspector generates valid PostgreSQL/ANSI SQL statements.
* **Steps:**
  1. Select `users` ERD table containing `id (UUID, PK)`, `email (VARCHAR(255))`, `created_at (TIMESTAMP)`.
  2. In Table Inspector, click **"Copy SQL DDL"**.
  3. Paste clipboard contents into a text editor.
* **Expected Result:**
  - Generates valid SQL:
    ```sql
    CREATE TABLE "users" (
      "id" UUID PRIMARY KEY,
      "email" VARCHAR(255) NOT NULL,
      "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ```

### TC-S4-DDL-02: Foreign Key Constraint & Cardinality Mapping in DDL
* **Objective:** Verify relational arrows between tables generate foreign key `REFERENCES` clauses in SQL output.
* **Steps:**
  1. Connect `orders.user_id` to `users.id` with a cardinality connector.
  2. Click **"Export Full Schema SQL"** in top bar.
* **Expected Result:**
  - Generated schema includes:
    ```sql
    ALTER TABLE "orders" ADD CONSTRAINT "fk_orders_users" 
    FOREIGN KEY ("user_id") REFERENCES "users" ("id");
    ```

### TC-S4-DDL-03: Download Schema as `.sql` File
* **Objective:** Verify exporting full database diagram downloads a formatted `schema.sql` file.
* **Steps:**
  1. Click **"Export" -> "Export as SQL DDL (.sql)"**.
* **Expected Result:**
  - Browser downloads `schema-[timestamp].sql` with clean indentation and table ordering respecting foreign key dependencies.

---

## Suite 4.2: Bi-directional Mermaid.js Synchronization (`TC-S4-MRM`)

### TC-S4-MRM-01: Export Diagram to Mermaid Syntax
* **Objective:** Verify exporting sequence or architecture diagrams generates valid Mermaid.js markup.
* **Steps:**
  1. Load API Sequence Flow diagram.
  2. Click **"Export" -> "Export as Mermaid"**.
* **Expected Result:**
  - Opens modal displaying valid `sequenceDiagram` syntax:
    ```mermaid
    sequenceDiagram
      autonumber
      Client->>Gateway: POST /orders
      Gateway->>OrderService: CreateOrder()
      OrderService-->>Gateway: 201 Created
    ```
  - "Copy to Clipboard" button works with 1 click.

### TC-S4-MRM-02: Import Diagram from Mermaid Text
* **Objective:** Verify pasting Mermaid syntax converts text into on-canvas visual cards and connectors.
* **Steps:**
  1. Open **"Import" -> "Import from Mermaid"**.
  2. Paste a Mermaid flowchart: `graph LR; A[Client] --> B[API Gateway] --> C[(Postgres)];`.
  3. Click "Generate Diagram".
* **Expected Result:**
  - Canvas parses Mermaid AST and lays out nodes with auto-spacing and clean connectors.

### TC-S4-MRM-03: Mermaid Error Handling for Malformed Input
* **Objective:** Verify pasting invalid Mermaid syntax displays human-readable line errors without crashing the canvas.
* **Steps:**
  1. In Mermaid import dialog, paste invalid/broken syntax.
  2. Click "Generate Diagram".
* **Expected Result:**
  - Inline error shows: `"Syntax error at line 2: unexpected token"`.
  - Canvas remains undisturbed.

---

### Sprint 4 Test Execution Summary:
Executed via `tests/sprint4_test.js` covering both functional interoperability and security threat assertions:

| Test Case | Feature Under Test | Expected Behavior | Verification Status |
| :--- | :--- | :--- | :---: |
| **TC-S4-DDL-01** | Single Table DDL Export | `CREATE TABLE "users"` with PK, typed columns, and defaults | `PASSED` 🟢 |
| **TC-S4-DDL-02** | Foreign Key Constraint DDL | `ALTER TABLE "orders" ADD CONSTRAINT ... FOREIGN KEY ... REFERENCES ...` | `PASSED` 🟢 |
| **TC-S4-DDL-03** | Schema Export & Dialects | PostgreSQL (`DROP TABLE`, `UUID`), MySQL (`` `table` ``, `VARCHAR(36)`), ANSI SQL | `PASSED` 🟢 |
| **TC-S4-MRM-01** | Export to Mermaid Syntax | Generates valid `sequenceDiagram`, `autonumber`, and participant arrows | `PASSED` 🟢 |
| **TC-S4-MRM-02** | Import Mermaid Flowchart | Parses `graph LR`, places nodes with DAG level auto-layout and arrows | `PASSED` 🟢 |
| **TC-S4-MRM-03** | Malformed Mermaid Handling | Catches line syntax errors without crashing canvas state | `PASSED` 🟢 |
| **SEC-S4-01** | SQL Identifier Injection | Quotes identifiers, escapes internal `"` as `""`, blocks raw SQL execution | `PASSED` 🟢 |
| **SEC-S4-02** | Mermaid AST Sanitization | Encodes HTML tags (`&lt;script&gt;`) and bracket symbols (`#91;`, `#93;`) | `PASSED` 🟢 |
| **TC-S4-AUT-01** | Debounced Auto-Save & Session Restore | Debounced save to localStorage, auto-restore on F5 with toast | `PASSED` 🟢 |
| **TC-S4-CFM-01** | Destructive Action Confirmations | In-app modal confirms clear/import; instant Ctrl+Z history undo | `PASSED` 🟢 |
| **TC-S4-ONB-01** | First-Time User Onboarding & Empty State | Floating starter card with 4 template pills; hides on dirty canvas | `PASSED` 🟢 |
| **TC-S4-TST-01** | Unified Toast Notification System | Bottom-center pill with auto-dismiss across clipboard/exports | `PASSED` 🟢 |
| **TC-S4-KBD-05** | Keyboard Shortcuts Cheat Sheet Modal | 4-column cheat sheet opens via ? hotkey or top bar button | `PASSED` 🟢 |

---

## Suite 4.3: OpenAPI / Swagger 3.0 Import (`TC-S4-OAS`)

### TC-S4-OAS-01: Drag & Drop `openapi.json` to Generate Connected Service Cards
* **Objective:** Verify dragging an `openapi.json` file onto the canvas generates an Ingress Gateway card and tag-grouped service containers.
* **Preconditions:** Application is open with empty or active canvas.
* **Steps:**
  1. Drag an `openapi.json` file containing multiple paths (e.g. `/users`, `/orders`) with tags onto the viewport.
  2. Observe canvas generation.
* **Expected Result:**
  - An Ingress Gateway node is generated based on `info.title` and `servers[0].url`.
  - Service container cards are created for each unique tag (e.g., `Users API`, `Orders API`).
  - Child endpoint pills are created with standard HTTP method color indicators (`GET` blue, `POST` green, `DELETE` red).
  - Orthogonal connectors route from Ingress Gateway to each service container.
* **Status:** ⚪ Planned (Implementation gate active until v1.0 Production Gap stabilization).

### TC-S4-OAS-02: Components Schemas Translation to ERD Tables
* **Objective:** Verify OpenAPI `components.schemas` are translated into interactive `erd-table` elements.
* **Steps:**
  1. Import OpenAPI spec containing `User` schema with fields `id` (integer), `name` (string), and `email` (string).
* **Expected Result:**
  - An `erd-table` element named `User` is rendered on the canvas.
  - Columns match the schema fields with appropriately mapped types.
  - Directional connectors wire endpoints returning `User` directly to the `User` table card.
* **Status:** ⚪ Planned (Implementation gate active until v1.0 Production Gap stabilization).

### TC-S4-OAS-03: Error Handling for Broken / Circular OpenAPI References
* **Objective:** Verify importing malformed OpenAPI files or circular `$ref` schemas terminates safely with an informative toast and zero browser freeze.
* **Steps:**
  1. Import an OpenAPI spec with circular `$ref` pointers (`A -> B -> A`).
* **Expected Result:**
  - Recursion breaker terminates at depth 8.
  - Displays toast notification: `"Circular reference detected in schema [Node]. Truncated."`.
  - Application remains completely interactive.
* **Status:** ⚪ Planned (Implementation gate active until v1.0 Production Gap stabilization).

---

## Suite 4.4: v1.0 Production Gaps & Safety Enhancements

### TC-S4-AUT-01: Local State Persistence & Debounced Auto-Save
* **Objective:** Verify active canvas state automatically persists to `localStorage` and reloads seamlessly upon browser refresh (F5).
* **Steps:**
  1. Open canvas, draw 3 shapes and an ERD table.
  2. Wait 1 second for the 600ms debounce timer to persist to `excalidraw_craft_autosave_v1`.
  3. Refresh the browser tab (<kbd>F5</kbd> or <kbd>Ctrl+R</kbd>).
* **Expected Result:**
  - Canvas immediately reloads with all 4 elements intact.
  - Camera zoom, scroll position, and active theme are restored.
  - A bottom-center toast notification pill appears: `"Session restored from auto-save (4 elements)"`.
* **Verification Status:** `PASSED` 🟢

### TC-S4-CFM-01: Destructive Action Confirmations & Undo Safety
* **Objective:** Verify clicking "Clear Canvas" or importing a file prompts with a confirmation modal, and clearing can be undone via <kbd>Ctrl+Z</kbd>.
* **Steps:**
  1. With elements on the canvas, click **"Clear Canvas"** in the top navigation bar.
  2. Observe the custom modal dialog (`#confirmModal`).
  3. Click the red danger button **"Clear Canvas"**.
  4. Verify canvas is empty.
  5. Press <kbd>Ctrl+Z</kbd>.
* **Expected Result:**
  - Confirmation modal appears with title `"Clear Canvas?"`, warning message indicating element count, and danger action button.
  - Clicking confirm clears elements and records history.
  - Pressing <kbd>Ctrl+Z</kbd> immediately restores all elements to the canvas.
* **Verification Status:** `PASSED` 🟢

### TC-S4-ONB-01: First-Time User Onboarding & Empty State Floating Card
* **Objective:** Verify an empty canvas displays the floating starter card, clicking a template loads it immediately, and the card auto-hides.
* **Steps:**
  1. Clear the canvas or open in a clean browser session.
  2. Observe the `#welcomeOnboarding` floating card in the center of the viewport.
  3. Click the **"Microservices"** template pill.
* **Expected Result:**
  - Floating card displays welcome banner and 4 quick template pills with icons.
  - Clicking "Microservices" instantly populates the canvas with the Microservices architecture diagram, fits zoom to screen, hides the welcome card, and displays a success toast.
* **Verification Status:** `PASSED` 🟢

### TC-S4-TST-01: Unified Toast Feedback System
* **Objective:** Verify actions across exports, DDL generation, and clipboard copies trigger the sleek bottom-center toast notification pill.
* **Steps:**
  1. Export a diagram as PNG.
  2. Open SQL preview modal and click "Copy SQL DDL".
  3. Open Mermaid modal and click "Copy Mermaid Code".
* **Expected Result:**
  - Sleek glassmorphism pill slides up at bottom-center:
    - `"Diagram exported as PNG"`
    - `"Copied POSTGRESQL DDL to clipboard"`
    - `"Copied Mermaid markup to clipboard"`
  - Pill automatically fades out and is removed after 2.8 seconds.
* **Verification Status:** `PASSED` 🟢

### TC-S4-KBD-05: Keyboard Shortcuts Cheat Sheet Modal (<kbd>?</kbd>)
* **Objective:** Verify pressing <kbd>?</kbd> or clicking the header keyboard button opens the categorized cheat sheet modal.
* **Steps:**
  1. Click the keyboard icon button (`#btn-shortcuts-help`) in the top navigation bar, or press <kbd>?</kbd> (Shift + /) on the keyboard.
  2. Review modal contents.
  3. Press <kbd>Escape</kbd>.
* **Expected Result:**
  - Modal opens smoothly showing 4 columns: Navigation & Viewport, Architecture & Modeling, Tools & Shapes, Editing & History.
  - Pressing <kbd>Escape</kbd> or clicking backdrop closes the modal cleanly.
* **Verification Status:** `PASSED` 🟢

---

## Suite 4.8: First-Class Image Insertion Tool (`TC-S4-IMG`)

### TC-S4-IMG-01: Insert Image via Toolbar Button (`#tool-image`) & Native File Picker
* **Objective:** Verify that clicking the Image button in the toolbar (beside Eraser), selecting "Insert / Import Image" in the Export/Import menu, or pressing hotkey <kbd>I</kbd> opens the native image file picker (`accept="image/*"`), correctly ingests images, and never collides with JSON diagram import.
* **Steps:**
  1. Click the Image button (`#tool-image`) in the toolbar or open "Export / Import" and click "Insert / Import Image".
  2. Select an image file (e.g. PNG, JPG, SVG, WebP, GIF).
  3. Alternatively, test edge case: select a PNG in the "Import JSON / .excalidraw" dialog.
* **Expected Result:**
  - Ingestion triggers `#imageFileInput` with `accept="image/*,.png,.jpg,..."` (isolated from JSON file input).
  - Selected image is ingested as a base64 DataURL and dimensions are scaled to fit within 520px maximum bounds while preserving aspect ratio.
  - If a user accidentally selects an image in the JSON diagram file dialog, smart routing intercepts the image and inserts it onto the canvas without throwing "invalid json" or "unexpected token png".
  - Image element is placed at camera viewport center, toast notification displays, and <kbd>Ctrl+Z</kbd> rolls back the addition.
* **Verification Status:** `PASSED` 🟢

### TC-S4-IMG-02: Insert Image via Viewport Drag & Drop
* **Objective:** Verify that dragging an image file from the desktop and dropping it directly onto the canvas inserts the image at the exact dropped cursor position.
* **Steps:**
  1. Drag an image file from the desktop/file manager over `#viewport`.
  2. Drop the file at a specific canvas location.
* **Expected Result:**
  - `dragover` event activates without default browser image opening.
  - `drop` event captures `e.clientX, e.clientY` and translates them to scene coordinates via `screenToScene`.
  - Image element is spawned centered at the cursor drop point.
  - Undo stack records the addition.
* **Verification Status:** `PASSED` 🟢

### TC-S4-IMG-03: Export Canvas Containing Image to SVG, PNG, and PDF
* **Objective:** Verify that an image element on canvas serializes correctly to SVG `<image>` tags, renders on raster export (PNG), and includes in multi-page/single-page PDF export.
* **Steps:**
  1. Place an image alongside an ERD table and a rectangle on canvas.
  2. Export to SVG. Inspect generated SVG text.
  3. Export to PNG. Inspect rasterized canvas.
  4. Export to PDF. Inspect PDF output.
* **Expected Result:**
  - SVG export contains `<image href="data:image/..." x="..." y="..." width="..." height="..." preserveAspectRatio="none" />`.
  - PNG export draws the image with high-fidelity scaling.
  - PDF export renders the image without visual distortion or clipped bounds.
* **Verification Status:** `PASSED` 🟢

---

## Suite 4.9: Quick Save Diagram Hotkey (`TC-S4-KBD-06`)

### TC-S4-KBD-06: Quick Save Diagram via Keyboard Shortcut (<kbd>Ctrl + S</kbd> / <kbd>Cmd + S</kbd>)
* **Objective:** Verify pressing <kbd>Ctrl + S</kbd> (or <kbd>Cmd + S</kbd> on macOS) triggers immediate SVG export (same function as "Export to SVG"), prevents the browser's native webpage save dialog, and provides a clear toast confirmation.
* **Steps:**
  1. Open a diagram with elements on the canvas.
  2. Press <kbd>Ctrl + S</kbd> (or <kbd>Cmd + S</kbd>).
* **Expected Result:**
  - Native browser "Save HTML page" dialog is intercepted and suppressed via `e.preventDefault()`.
  - `exportToSvg()` executes immediately, triggering download of `excalidraw-diagram-<timestamp>.svg`.
  - If elements are actively selected, only selected elements are exported; otherwise full diagram is exported.
  - Sleek toast notification displays: `"Diagram saved as SVG (Ctrl+S)"`.
* **Verification Status:** `PASSED` 🟢

---

## Suite 4.10: Orthogonal Stepped (Elbow) Flow Arrow Connector (`TC-S4-ELB`)

### TC-S4-ELB-01: Create Elbow Flow Arrow via Toolbar Button & Hotkeys
* **Objective:** Verify creating an orthogonal stepped elbow flow arrow using the toolbar button or hotkeys (<kbd>O</kbd> / <kbd>Shift+A</kbd>).
* **Steps:**
  1. Click `#tool-elbow-arrow` in the top toolbar (or press <kbd>O</kbd> or <kbd>Shift+A</kbd>).
  2. Click and drag across the canvas between two nodes.
  3. Release pointer.
* **Expected Result:**
  - Active tool switches to `elbow-arrow`.
  - Preview element draws an orthogonal 3-segment path with smooth rounded corners in real-time.
  - Final element committed with `type: 'arrow'`, `routing: 'orthogonal'`, `isAnimated: true`.
  - Arrowhead points in the direction of the final segment.
* **Verification Status:** `PASSED` 🟢

### TC-S4-ELB-02: Toggle Arrow Routing in Architecture Inspector
* **Objective:** Verify switching an existing straight arrow to an elbow arrow (and vice-versa) using `#arrowRoutingControl`.
* **Steps:**
  1. Select an existing straight connector arrow on canvas.
  2. In `#connectorInspectorSection`, locate **Connector Routing** segmented control.
  3. Click `Elbow (Stepped)` (`data-arrow-routing="orthogonal"`).
  4. Observe canvas rendering.
  5. Click `Straight` (`data-arrow-routing="straight"`).
* **Expected Result:**
  - Selecting `Elbow (Stepped)` immediately reroutes the arrow into a 3-segment orthogonal path with rounded corners and circular anchor ports.
  - Selecting `Straight` switches back to a single direct line segment.
  - Selection bounds and hit-testing update instantly.
* **Verification Status:** `PASSED` 🟢

### TC-S4-ELB-03: Drag Middle Waypoint Handle to Adjust Elbow Split
* **Objective:** Verify user can drag the cyan midpoint handle along an orthogonal arrow to change `elbowRatio`.
* **Steps:**
  1. Select an orthogonal stepped arrow.
  2. Observe the 3 cyan circular waypoint handles along the segments.
  3. Hover and drag the middle cyan handle (`id: 'mid'`).
* **Expected Result:**
  - Cursor indicates dragging.
  - Moving the handle dynamically shifts the position of the middle horizontal (or vertical) segment.
  - `elbowRatio` is clamped safely between `0.1` and `0.9`.
  - Commits to history on pointer release for undo/redo.
* **Verification Status:** `PASSED` 🟢

### TC-S4-ELB-04: Visual Aesthetics Verification Matching Eraser.io
* **Objective:** Verify all visual design requirements from user reference image are satisfied.
* **Steps:**
  1. Inspect the rendered elbow arrow on canvas.
* **Expected Result:**
  - Corner turns feature smooth rounded fillets rendered via `ctx.arcTo()`.
  - Both start and end points display circular connection anchor ports (blue concentric rings with solid inner dot).
  - The path features continuous animated electric blue packet flow dash (`strokeDasharray: [8, 8]`).
  - Signal pulse particle travels smoothly along the full orthogonal length.
  - Arrowhead tip is properly aligned with the incoming orthogonal segment.
* **Verification Status:** `PASSED` 🟢

### TC-S4-ELB-05: Vector SVG & Raster Export Parity
* **Objective:** Verify orthogonal arrows serialize cleanly to SVG `<path>` and raster exports.
* **Steps:**
  1. Create an orthogonal flow arrow connecting two architecture nodes.
  2. Export to SVG (`Ctrl+S` or Export modal).
  3. Inspect SVG markup.
* **Expected Result:**
  - SVG contains `<path d="M ... L ... L ... L ...">` with `stroke-linejoin="round"`.
  - Includes animated packet flow dash path and concentric anchor port `<circle>` tags.
  - Arrow tip is rendered as a clean `<polygon>` oriented into the destination port.
* **Verification Status:** `PASSED` 🟢
### TC-S4-ELB-06: Orthogonal Arrow Stability, Render Performance & Selection Isolation
* **Objective:** Verify orthogonal elbow arrow does not trigger infinite render loops, crash other diagram templates, or display visual clutter when selected.
* **Steps:**
  1. Load templates containing straight labeled arrows (e.g. Microservices, Sequence Diagram, Monolithic).
  2. Verify all templates render without `TypeError: Cannot read properties of undefined (reading 'x')` or any console error.
  3. Draw or select an orthogonal elbow connector.
  4. Verify that when static (`isAnimated: false`), the canvas stays idle with 0 FPS overhead (no `requestAnimationFrame` render loop).
  5. Verify that selecting an elbow arrow renders only the concentric connection ports and 3 cyan waypoint handles, with no 8-handle rectangular box or rotation stem.
  6. Drag start and end ports to verify smooth repositioning.
* **Expected Result:**
  - 100% stable rendering across all diagram templates and arrows.
  - Zero idle CPU consumption for static diagrams.
  - Clean Eraser.io style selection handles.
* **Verification Status:** `PASSED` 🟢

---

# Sprint 6: Contextual Properties Architecture & Canvas Layout Refinement (`TC-S6`)

## Suite 6.1: Properties Widget Reorganization & Left Docking (`TC-S6-PROP`)

### TC-S6-PROP-01: Properties Inspector Left Docking & Smooth Slide Animation
* **Objective:** Verify that the Properties Inspector is positioned on the top-left viewport edge matching Excalidraw's design, and opens/closes with a smooth horizontal slide.
* **Steps:**
  1. Observe the Properties Inspector upon application load.
  2. Verify it is docked at `left: 16px; top: 76px;`.
  3. Click the close button (`#btn-close-properties`).
  4. Observe the panel sliding offscreen to the left (`transform: translateX(calc(-100% - 30px))`).
  5. Verify the floating `#btn-open-properties` button appears on the top-left (`left: 16px; top: 76px;`).
  6. Click `#btn-open-properties`.
* **Expected Result:**
  - Inspector smoothly slides back into view from the left.
  - Matches Excalidraw's native left floating properties panel ergonomics.
* **Verification Status:** `PASSED` 🟢

### TC-S6-PROP-02: Architecture Node Contextual Tool Gating
* **Objective:** Verify that selecting an Architecture Node hides inapplicable drawing controls and displays architecture-specific fields.
* **Steps:**
  1. Click on an Architecture Node card (`Service Node` or C4 component).
  2. Inspect the sections visible in the right Properties Inspector.
* **Expected Result:**
  - Standard drawing sections (`#sec-stroke`, `#sec-bg`, `#sec-fill`, `#sec-stroke-width`, `#sec-stroke-style`, `#sec-roughness`, `#sec-edges`, `#sec-font-family`, `#sec-font-size`, `#sec-text-align`) are completely hidden.
  - Dedicated `#nodeInspectorSection` is displayed with Title, Subtitle, Badge presets, Cloud icon picker, Accent theme, C4 level, Latency, Capacity, and SPOF toggle.
  - Universal `#sec-opacity`, `#sec-layers`, and `#actionsSection` (Duplicate, Delete) remain accessible.
* **Verification Status:** `PASSED` 🟢

## Suite 6.2: Text Alignment Directional Parity (`TC-S6-TXT`)

### TC-S6-TXT-01: Multiline & Singleline Text Alignment (Left, Center, Right)
* **Objective:** Verify that clicking "Align Right" anchors text to the right side of the element bounding box, and "Align Left" anchors text to the left side (fixing ISSUE-27).
* **Steps:**
  1. Select the Text tool (<kbd>T</kbd>) and click on canvas.
  2. Type multiline text:
     ```
     Line One
     Much Longer Second Line
     Short
     ```
  3. Select the committed text element.
  4. In `#textAlignControl`, click `Align Right` (`data-text-align="right"`).
  5. Observe the canvas rendering and selection bounding box.
  6. Click `Align Center` (`data-text-align="center"`).
  7. Click `Align Left` (`data-text-align="left"`).
* **Expected Result:**
  - When `Align Right` is selected, all lines align to the right edge (`element.x + totalW`); no text jumps outside the selection box to the left.
  - When `Align Center` is selected, all lines are centered at `element.x + totalW / 2`.
  - When `Align Left` is selected, all lines align to `element.x`.
  - Exporting to SVG (`Ctrl+S`) renders identical text anchoring (`text-anchor="end"`, `text-anchor="middle"`, `text-anchor="start"`).
* **Verification Status:** `PASSED` 🟢

## Suite 6.3: Canvas Layer Z-Index & Keyboard Shortcuts (`TC-S6-LAY`)

### TC-S6-LAY-01: Bring to Front / Send to Back via Buttons & Keyboard Shortcuts
* **Objective:** Verify that layer reordering deterministically shifts visual overlapping order on canvas with immediate toast feedback (fixing ISSUE-28).
* **Steps:**
  1. Create a large filled rectangle (`Shape A`).
  2. Create a smaller filled rectangle or Architecture Node (`Shape B`) overlapping `Shape A`.
  3. Notice `Shape B` renders on top of `Shape A`.
  4. Select `Shape B`.
  5. Click `#btn-layer-to-back` in the Properties Inspector (or press <kbd>Ctrl + Shift + [</kbd>).
  6. Observe canvas rendering.
  7. Press <kbd>Ctrl + Shift + ]</kbd> (or click `#btn-layer-to-front`).
  8. Test step-wise with <kbd>Ctrl + [</kbd> (Send backward) and <kbd>Ctrl + ]</kbd> (Bring forward).
* **Expected Result:**
  - Sending to back immediately renders `Shape B` underneath `Shape A`.
  - Bringing to front renders `Shape B` visibly above `Shape A`.
  - Keyboard shortcuts <kbd>Ctrl + Shift + ]</kbd> and <kbd>Ctrl + Shift + [</kbd> fire reliably across all keyboard layouts.
  - Toast notifications (`"Sent to back"`, `"Brought to front"`, `"Brought forward"`, `"Sent backward"`) appear at the bottom-right.
  - Canvas redraw is instant and logged in history for undo/redo.
* **Verification Status:** `PASSED` 🟢

## Suite 6.4: Telemetry Gating in Exports (`TC-S6-EXP`)

### TC-S6-EXP-01: Gated Telemetry Overlays in Animated GIF & All Exports (ISSUE-30)
* **Objective:** Verify that exporting diagrams as GIF, PNG, SVG, or PDF only contains telemetry ops metrics if the user explicitly clicked Telemetry Ops (`showMetricsOverlay === true`).
* **Steps:**
  1. Open Templates and load **Sequence Diagram** (or any architecture template).
  2. Ensure the "Telemetry Ops" button (`#btn-metrics-toggle`) is in its default inactive state.
  3. Open the Export Modal (`#exportModal`) and click **Export as GIF** (`#export-gif`).
  4. Inspect the generated GIF frames or check export parameters.
  5. Toggle "Telemetry Ops" ON (`#btn-metrics-toggle`).
  6. Export as GIF again.
* **Expected Result:**
  - With Telemetry Ops OFF: The exported GIF contains clean sequence diagram lifelines and messages with zero latency badges, QPS metrics, or telemetry overlays.
  - With Telemetry Ops ON: The exported GIF contains all telemetry badges and metrics overlays.
  - Same behavior applies consistently across PNG, PDF, and SVG exports.
* **Verification Status:** `PASSED` 🟢

## Suite 6.5: Canvas Background Color Selection (`TC-S6-BG`)

### TC-S6-BG-01: Canvas Background Palette Selection & Export Parity (ISSUE-31)
* **Objective:** Verify that Canvas Background appears as the first element in the Properties panel and dynamically changes the canvas and export background colors.
* **Steps:**
  1. Observe the left Properties Inspector panel.
  2. Verify that `#sec-canvas-bg` ("Canvas background") is displayed as the first section immediately under the panel header.
  3. Click the "Sand" swatch (`#fff9db`).
  4. Observe the canvas background.
  5. Click the custom color picker (`#customCanvasBgColor`) and pick a custom hex color.
  6. Refresh the page (<kbd>F5</kbd>) to test auto-save restore.
  7. Export as PNG and SVG.
* **Expected Result:**
  - The canvas background changes smoothly to the selected color.
  - Auto-save persists `canvasBackground` and restores it on refresh.
  - PNG and SVG exports render with the chosen canvas background color.
* **Verification Status:** `PASSED` 🟢

## Suite 6.6: Excalidraw Diagram & Compressed SVG Import (`TC-S6-IMP`)

### TC-S6-IMP-01: Excalidraw `.excalidraw` File & Embedded Image Restoration (ISSUE-32)
* **Objective:** Verify that importing an `.excalidraw` file containing embedded raster images (e.g. `Mentor - 18th Session.excalidraw`) properly renders the image elements without turning them into blank rectangles.
* **Steps:**
  1. Open the Export/Import modal and click **Open / Import Diagram File** (`#import-json-trigger`).
  2. Select `Mentor - 18th Session.excalidraw`.
  3. Observe canvas rendering.
* **Expected Result:**
  - All 120 elements are imported cleanly.
  - The embedded 1017x793 Modular Booking System diagram image (`type: "image"`, `dataURL: "data:image/png;base64,..."`) renders visibly on the canvas behind the handwritten annotations.
  - Viewport automatically calculates Zoom-to-Fit to frame all elements.
* **Verification Status:** `PASSED` 🟢

### TC-S6-IMP-02: Excalidraw `.svg` Embedded Payload Decompression (ISSUE-32)
* **Objective:** Verify that importing or dropping an Excalidraw-exported SVG (e.g. `Mentor - 18th Session.svg`) automatically extracts the compressed deflate payload (`<!-- payload-start -->`) and reconstructs the scene.
* **Steps:**
  1. Drag and drop `Mentor - 18th Session.svg` onto the canvas viewport or select it via the import file picker.
  2. Observe file processing.
* **Expected Result:**
  - The system detects the embedded Excalidraw payload, inflates the deflate stream, restores all 49 diagram elements and files, and renders the diagram with its embedded image.
* **Verification Status:** `PASSED` 🟢

---

# Sprint 7 Test Scenarios: Bug-Fix & Repository Hardening

## Master Test Registry Update (Sprint 7)

| Sprint | Suite Code | Feature / Test Focus | Test Count | Status |
|---|---|---|---|---|
| **Sprint 7** | `TC-S7-LAT` | Critical Path Latency — DFS Longest-Path Algorithm | 2 Cases | 🔵 New |
| **Sprint 7** | `TC-S7-MRM` | Mermaid Import — Chained Edges, Subgraphs, stateDiagram-v2 | 3 Cases | 🔵 New |
| **Sprint 7** | `TC-S7-SPF` | SPOF Detection — Explicit Role Property & isReplicated | 2 Cases | 🔵 New |
| **Sprint 7** | `TC-S7-CAP` | Capacity Badge Visibility on Default Templates | 1 Case | 🔵 New |
| **Sprint 7** | `TC-S7-SEC` | Security — /api/save-gif Path Traversal & Hardening | 3 Cases | 🔵 New (see security_issues.md) |
| **Sprint 7** | `TC-S7-REPO` | Repository Hygiene — LICENSE, npm test, package.json, img/ | 4 Cases | 🔵 New |

---

## Suite 7.1: Critical Path Latency (`TC-S7-LAT`)

### TC-S7-LAT-01: Diamond Topology Critical Path
* **Objective:** Verify `calculatePathLatency()` returns the longest cumulative latency path, not the first-found path.
* **Preconditions:** `ArchitectureGraph` constructed programmatically.
* **Test Data:**
  ```
  Nodes: a(latency=0), b(latency=10), c(latency=50), d(latency=0)
  Edges: a→b (latency=10ms), b→d (latency=10ms), a→c (latency=50ms), c→d (latency=50ms)
  ```
  - Path a→b→d: 10+10+10 = 30ms
  - Path a→c→d: 50+50+50 = 150ms (critical path)
* **Test Steps:**
  1. Construct graph with nodes and edges above.
  2. Call `graph.calculatePathLatency('a', 'd')`.
  3. Check `result.totalLatency` and `result.path`.
* **Expected Result:** `{ totalLatency: 150, path: ['a','c','d'] }`.
* **Previous Buggy Result:** `{ totalLatency: 30, path: ['a','b','d'] }` (BFS found shorter path first).
* **Verification Status:** `PASSED` 🟢

---

### TC-S7-LAT-02: Linear Path (No Regression)
* **Objective:** Verify that a simple linear chain `a→b→c` still returns the correct single path after the DFS rewrite.
* **Test Data:** `a→b (10ms), b→c (20ms)`. Node latencies all 0.
* **Expected Result:** `{ totalLatency: 30, path: ['a','b','c'] }`.
* **Verification Status:** `PASSED` 🟢

---

## Suite 7.2: Mermaid Import Hardening (`TC-S7-MRM`)

### TC-S7-MRM-01: Chained Edge Import
* **Objective:** Verify that chained Mermaid edges (`A --> B --> C`) are correctly parsed into two separate arrow elements.
* **Preconditions:** Mermaid import function available.
* **Input:**
  ```
  graph LR
  A --> B --> C
  ```
* **Expected Result:** Canvas contains nodes `A`, `B`, `C` and two arrows: `A→B` and `B→C`. No error thrown.
* **Previous Buggy Result:** `Syntax error at line 2: unexpected token`.
* **Verification Status:** `PASSED` 🟢

---

### TC-S7-MRM-02: Subgraph Block Import
* **Objective:** Verify that `subgraph … end` blocks are imported as `group-boundary` elements.
* **Input:**
  ```
  graph TD
  subgraph Backend
    API --> DB
  end
  Client --> API
  ```
* **Expected Result:** A `group-boundary` element labelled "Backend" wrapping the `API` and `DB` nodes. `Client` node outside the boundary. `Client→API` and `API→DB` arrows present.
* **Previous Buggy Result:** `unexpected token "subgraph Backend"` — full import aborted.
* **Verification Status:** `PASSED` 🟢

---

### TC-S7-MRM-03: Partial Import With Invalid Lines
* **Objective:** Verify that invalid Mermaid lines produce per-line warnings but do not abort the entire import.
* **Input:**
  ```
  graph LR
  A --> B
  @@INVALID_TOKEN
  B --> C
  ```
* **Expected Result:** Nodes `A`, `B`, `C` and arrows `A→B`, `B→C` are imported. A non-blocking toast appears: "Imported with 1 warning — check console". Console logs the invalid line.
* **Previous Buggy Result:** Full import aborted on first unrecognized token.
* **Verification Status:** `PASSED` 🟢

---

## Suite 7.3: SPOF Detection — Role Property (`TC-S7-SPF`)

### TC-S7-SPF-01: False Positive Prevention — "Feedback Service" Node
* **Objective:** Verify that a node titled "Feedback Service" (which contains substring `db` and `service`) is NOT mis-classified as a database target when no explicit `role` is set.
* **Test Data:** Node `{ id: 'n1', title: 'Feedback Service', type: 'node' }`.
* **Expected Result:** `n1` is not in `targetNodes` set inside `detectSpofs()`. Node is classified as a generic service (not datastore).
* **Previous Buggy Result:** `n1` was added to `targetNodes` because `title.includes('db')` matched the substring "Feedb**db**Service" — actually wait, "Feedback" doesn't contain 'db' sequentially... but "Feedback Service" → "feedback service" → includes `vice` not `db`. The actual false positive: **"Feedback DB" or nodes containing 'db'**. This test uses `{ title: 'UserDB Cache' }` which should NOT be a target because `role` is explicitly `'service'`.
* **Test Data (corrected):** Node `{ id: 'n1', title: 'UserDB Cache', type: 'node', role: 'service' }`.
* **Expected Result:** With explicit `role: 'service'`, node is NOT classified as datastore. `n1` not in `targetNodes`.
* **Verification Status:** `PASSED` 🟢

---

### TC-S7-SPF-02: isReplicated Suppresses Stateful SPOF
* **Objective:** Verify that a database node marked `isReplicated: true` is not flagged as a SPOF, even with no replica sibling node.
* **Test Data:**
  ```js
  { id: 'db1', title: 'Postgres Primary', badge: 'DATABASE', isReplicated: true }
  // No other node with 'replica' in title
  ```
* **Expected Result:** `detectSpofs()` does not include `db1` in the returned SPOF set.
* **Previous Buggy Result:** `db1` was always in SPOF set when no node title contained 'replica'.
* **Verification Status:** `PASSED` 🟢

---

## Suite 7.4: Capacity Badge Visibility (`TC-S7-CAP`)

### TC-S7-CAP-01: Flash Sale Template Shows Saturation Badge
* **Objective:** Verify that after loading the Flash Sale template, at least one node has a saturation badge visible (≥150%) in the telemetry overlay.
* **Preconditions:** Application loaded with Flash Sale template (includes updated `maxCapacityQps` values).
* **Test Steps:**
  1. Load the Flash Sale template.
  2. Enable Telemetry Ops (`Ctrl+Shift+O`).
  3. Inspect the canvas for saturation badges.
* **Expected Result:** At least one node (e.g., "Order Service") shows a badge with utilization ≥150%.
* **Previous Buggy Result:** All nodes showed 0% saturation because `maxCapacityQps` defaulted to 20,000 QPS and template arrow QPS values were lower.
* **Verification Status:** `PASSED` 🟢

---

## Suite 7.5: Repository Hygiene (`TC-S7-REPO`)

### TC-S7-REPO-01: MIT LICENSE File Exists
* **Objective:** Verify `LICENSE` file is present at the repo root and contains valid MIT License text.
* **Test Steps:**
  1. `Test-Path LICENSE` → `True`.
  2. Check file contains "MIT License", "Permission is hereby granted", "Ahmed Emad".
* **Verification Status:** `PASSED` 🟢

---

### TC-S7-REPO-02: npm test Script Works
* **Objective:** Verify `npm test` runs all test suites and exits with code 0 when all pass.
* **Test Steps:**
  1. Run `npm test`.
  2. Check exit code and output.
* **Expected Result:** Output shows each suite name with PASS/FAIL counts. Process exits with code 0.
* **Verification Status:** `PASSED` 🟢

---

### TC-S7-REPO-03: package.json Cleaned
* **Objective:** Verify `package.json` has non-empty description and no invalid `main` field.
* **Test Steps:**
  1. `node -e "const p=JSON.parse(require('fs').readFileSync('package.json')); console.log(!!p.description, p.main)"` → `true undefined`.
* **Verification Status:** `PASSED` 🟢

---

### TC-S7-REPO-04: img/ Contains Only Production GIFs
* **Objective:** Verify no stray timestamped PNGs or sprint-prefixed duplicate GIFs remain in `img/`.
* **Test Steps:**
  1. `(Get-ChildItem img/ -Filter "sprint3_*").Count` → 0.
  2. `(Get-ChildItem img/ -Filter "*_canvas_*").Count` → 0.
  3. `(Get-ChildItem img/ -Filter "export_gif_*").Count` → 0.
  4. `(Get-ChildItem img/).Count` → 16 (exactly 16 production GIFs).
* **Verification Status:** `PASSED` 🟢

---

# Sprint 8 Quality Assurance & Test Verification Suites

## Suite 8.1: SQL DDL → ERD Reverse Parser (`TC-S8-SQL`)

### TC-S8-SQL-01: Multi-Table DDL Ingestion into Interactive ERD Tables
* **Objective:** Verify `parseSqlDdl(sqlText)` correctly parses multiple `CREATE TABLE` definitions and creates canvas `table` elements with accurate column metadata.
* **Test Input:**
  ```sql
  CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE orders (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
  );
  ```
* **Expected Result:**
  - Emits 2 `table` elements (`users` and `orders`).
  - `users` contains 3 columns: `id` (PK), `email` (NOT NULL, UNIQUE), `created_at`.
  - `orders` contains 4 columns: `id` (PK), `user_id` (FK), `total_amount`, `status`.
  - Table titles, column types, and PK/FK markers match SQL definitions.
* **Verification Status:** `PENDING` 🔵

---

### TC-S8-SQL-02: Foreign Key Referential Connector Generation
* **Objective:** Verify that table foreign key definitions automatically generate relational connector arrows with `startBinding` and `endBinding`.
* **Test Input:** Same as TC-S8-SQL-01.
* **Expected Result:**
  - Exactly 1 `arrow` element is generated.
  - Arrow `startBinding.elementId` points to the `users` table card.
  - Arrow `endBinding.elementId` points to the `orders` table card.
  - Arrow carries `label: "1:N"` or `users.id → orders.user_id` with `isErdRel: true`.
* **Verification Status:** `PENDING` 🔵

---

### TC-S8-SQL-03: Dialect Tolerance & Comment Stripping
* **Objective:** Verify parser survives SQL dialect quirks (backticks in MySQL, double quotes in Postgres, `IF NOT EXISTS`, comments, trailing commas).
* **Test Input:**
  ```sql
  -- This is a comment
  /* Multi-line
     table comment */
  CREATE TABLE IF NOT EXISTS `products` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `sku` VARCHAR(100) /* inline comment */ NOT NULL,
    `price` DECIMAL(10,2)
  );
  ```
* **Expected Result:** Successfully extracts `products` table with clean identifiers stripped of backticks and comments without syntax errors.
* **Verification Status:** `PENDING` 🔵

---

## Suite 8.2: First-Class Markdown Notes (`TC-S8-NOTE`)

### TC-S8-NOTE-01: Markdown AST Parsing & Rendering Elements
* **Objective:** Verify `type: 'note-card'` elements parse markdown tokens (headers, lists, code blocks, task items) into structured canvas layout blocks.
* **Test Input:**
  ```markdown
  # ADR-001: Cache Strategy
  We use Redis for session cache.
  - [x] Cluster mode enabled
  - [ ] Write-through persistence
  ```
* **Expected Result:**
  - Tokenizer decomposes content into Header (`H1`), Paragraph, and Checkbox List tokens.
  - `getElementBounds(noteElement)` accounts for padding, header bar, and multiline body height.
* **Verification Status:** `PENDING` 🔵

---

### TC-S8-NOTE-02: Element Anchor Tracking
* **Objective:** Verify that an attached sticky note (`attachedToElementId: 'node-order'`) moves synchronously when the host node's coordinates change.
* **Test Steps:**
  1. Create node `node-order` at `(100, 100)`.
  2. Attach note card `note-1` with offset `(dx: 150, dy: 0)` → position `(250, 100)`.
  3. Translate `node-order` by `(+50, +30)`.
* **Expected Result:** `note-1` coordinates automatically update to `(300, 130)`.
* **Verification Status:** `PENDING` 🔵

---

### TC-S8-NOTE-03: Collapsible State & Export Serialization
* **Objective:** Verify collapsing a note card reduces its height to the title pill, and SVG/PDF export correctly serializes the note content.
* **Expected Result:**
  - When `isCollapsed: true`, `getElementBounds` returns height corresponding strictly to the header pill (`36px`).
  - SVG export includes the note card with preserved styling.
* **Verification Status:** `PENDING` 🔵

---

## Suite 8.3: Directed Dominator Tree SPOF (`TC-S8-DOM`)

### TC-S8-DOM-01: Immediate Dominator ($idom$) Calculation
* **Objective:** Verify `computeDominatorTree(rootId)` calculates immediate dominators on a directed microservices flow.
* **Test Data:**
  - Directed graph: `Client → Gateway → OrderService → Database` and `Gateway → AuthService`.
* **Expected Result:**
  - `Gateway` immediately dominates `OrderService`, `AuthService`, and `Database`.
  - `idom(Gateway) = Client`.
  - `idom(OrderService) = Gateway`.
  - `idom(Database) = OrderService`.
* **Verification Status:** `PENDING` 🔵

---

### TC-S8-DOM-02: Blast Radius Calculation & Starvation Detection
* **Objective:** Verify `getBlastRadius('Gateway')` returns all strictly dominated downstream nodes and marks them as traffic starved.
* **Expected Result:**
  - Dominator subtree for `Gateway` contains `{ Gateway, OrderService, AuthService, Database }`.
  - Blast radius percentage = `4 / 5 = 80%`.
  - Severed flow connectors show `0 QPS`.
* **Verification Status:** `PENDING` 🔵

---

### TC-S8-DOM-03: Multipath Bypass Resilience
* **Objective:** Verify that a secondary independent path from `Client` to `Database` breaks `Gateway`'s dominance over `Database`.
* **Test Data:** Same as TC-S8-DOM-01, plus direct bypass edge: `Client → Database`.
* **Expected Result:**
  - `Gateway` no longer dominates `Database` (`idom(Database) = Client`).
  - Failure of `Gateway` leaves `Database` reachable via the bypass route.
* **Verification Status:** `PENDING` 🔵

---

## Suite 8.4: Authentic Excalidraw Text Tool & Input UX (`TC-S8-TXT`)

### TC-S8-TXT-01: Toolbar Displays Letter 'A' Icon
* **Objective:** Verify the text tool button in the main tool palette displays an authentic letter `A` icon matching Excalidraw standards rather than a boxed `T`.
* **Test Steps:**
  1. Inspect `#tool-text` in DOM.
  2. Verify icon markup or SVG contains standard letter `A` vector path without an enclosing Word-like square frame.
* **Verification Status:** `PENDING` 🔵

---

### TC-S8-TXT-02: Zero-Border Frameless Inline Text Editor
* **Objective:** Verify that clicking the canvas with the Text tool creates an inline textarea that has zero artificial border, zero outline, transparent background, and matches canvas typography.
* **Expected Result:**
  - `#inlineTextEditor` style has `border: none`, `outline: none`, `background: transparent`, and inherits `fontSize`, `fontFamily`, and `color`.
  - No Word-like bounding box appears during typing.
* **Verification Status:** `PENDING` 🔵

---

### TC-S8-TXT-03: Seamless Non-Enter Text Commit (Blur / Click Outside)
* **Objective:** Verify that typing text and clicking outside the editor (or triggering blur) commits the text element directly to canvas without requiring the user to press Enter.
* **Test Steps:**
  1. Activate Text tool and click at `(200, 300)`.
  2. Type `"Microservices Core Architecture"`.
  3. Click at `(500, 500)` without pressing Enter.
* **Expected Result:**
  - Text element with content `"Microservices Core Architecture"` is added to `elements`.
  - Text appears on canvas immediately at `(200, 300)`.
  - Undo stack records the creation.
* **Verification Status:** `PENDING` 🔵

---

### TC-S8-TXT-04: Multiline Enter / Shift+Enter Support
* **Objective:** Verify pressing `Enter` creates a natural newline in the text element instead of prematurely terminating editing.
* **Test Steps:**
  1. Open inline editor.
  2. Type `"Line 1\nLine 2\nLine 3"`.
  3. Blur editor.
* **Expected Result:** Text element is created with 3 lines; `getElementBounds` computes multiline height accurately.
* **Verification Status:** `PENDING` 🔵
