# ExcaliCraft

**One free, local-first tool for architecture diagrams: whiteboard, C4, cloud, ERD, Mermaid, and animated flows in a single canvas.**

![C4 context diagram with animated traffic](img/c4_context_architecture.gif)

ExcaliCraft started from a simple annoyance: a typical architecture write-up needs a whiteboard (Excalidraw), a box-and-arrow editor (Draw.io), a C4 tool, an ERD tool, and a Mermaid editor. ExcaliCraft puts them in one place, runs entirely in your browser, and adds something static tools can't: **animated flows** that show how traffic moves through the system and where it bunches up.

---

## One tool instead of five

| You'd normally open… | In ExcaliCraft |
|---|---|
| **Excalidraw** for a hand-drawn whiteboard | Rough.js hand-drawn style, freehand pen, images, and `.excalidraw` import |
| **Draw.io / Lucidchart** for architecture boxes | Architecture node cards, cloud and tech icons, VPC / subnet / cluster boundaries, swimlanes |
| **A C4 tool** | C4 Person, System, Container, Component, Database, Queue, and boundaries; import and export as Mermaid C4 |
| **dbdiagram / DrawSQL** for ERDs | ERD table cards with PK/FK and typed columns, **export to SQL DDL** (PostgreSQL, MySQL, ANSI) |
| **Mermaid Live Editor** | Export to Mermaid and import Mermaid text back onto the canvas |
| **A notes app** | A text tool today; first-class notes are on the [roadmap](#roadmap) |

---

## What makes it different: the flow overlay

Turn on the overlay (`Alt + M`) and the diagram starts moving:

- **Animated packets** travel along connectors, so direction and relative traffic are visible at a glance.
- **Single points of failure** are highlighted. Nodes are analyzed with Tarjan's articulation-point algorithm, and nodes marked as replicas or standbys are not flagged.
- **Hop latencies** can be set per connector and node, with a path total.
- **Capacity warnings** show a utilization badge when the QPS entering a node exceeds its capacity.

The overlay is a **visual aid built from numbers you enter**. It is not a load-test or a queueing simulation. See [Known limitations](#known-limitations) for exactly what it does and doesn't compute.

| Flash-sale traffic and bottlenecks | Multi-region high availability |
|:--:|:--:|
| ![Flash sale](img/flash_sale_high_concurrency.gif) | ![Global HA](img/global_ha_multi_region.gif) |

---

## Features

**Drawing**
- Tools: select, hand, rectangle, diamond, ellipse, arrow, elbow (stepped) arrow, line, freehand pen, text, eraser, image, architecture node
- Undo / redo, copy / paste / cut, duplicate, grid toggle, minimap, presentation mode
- Autosave to your browser's local storage

**Diagram types**
- Architecture and cloud (AWS, GCP, Azure icons and common tech such as Kafka, Redis, Postgres)
- C4 model (context, container, component)
- ERD with a column editor
- UML sequence diagrams with lifelines and activation boxes
- State machines (initial, composite, final states)
- Flowcharts and swimlane activity diagrams

**16 built-in templates**
C4 Context · C4 Container · Flash Sale (high concurrency) · Multi-Region HA · Fintech PCI-DSS VPC · AWS Serverless · GCP Data & AI Pipeline · Azure Enterprise · Event-Driven Microservices · Modular Monolith · Monolithic 3-Tier · Sequence Diagram · Database ERD · State Machine · Logic Flowchart · Business Activity (swimlanes)

### Import and export

| Format | Export | Import |
|---|:--:|:--:|
| PNG | ✅ (whole diagram or selection) | |
| SVG | ✅ | Excalidraw-embedded SVG scenes |
| PDF | ✅ multi-page | |
| Animated GIF | ✅ looping | |
| JSON | ✅ | ✅ |
| `.excalidraw` | | ✅ |
| Images (PNG, JPG, SVG, WebP, GIF) | | ✅ |
| Mermaid | ✅ flowchart, sequence, state, C4 | ✅ flowchart (basic), sequence, `erDiagram`, C4 |
| SQL DDL | ✅ PostgreSQL / MySQL / ANSI, with foreign keys | not yet |

![ERD](img/database_schema_erd.gif)

---

## Keyboard shortcuts

| Action | Key |
|---|---|
| Select | `V` or `1` |
| Rectangle / Diamond / Ellipse | `R` / `D` / `C` (or `2` / `3` / `4`) |
| Arrow / Elbow arrow | `A` / `O` or `Shift + A` |
| Line / Pen / Text / Eraser | `L` / `P` / `T` / `E` (or `6` / `7` / `8` / `9`) |
| Architecture node | `N` or `0` |
| Image | `I` |
| Hand (pan) | `H` |
| Flow overlay | `Alt + M` |
| Minimap | `M` |
| Presentation mode | `F` |
| Grid | `G` |
| Save / Undo / Redo / Duplicate | `Ctrl + S` / `Ctrl + Z` / `Ctrl + Y` / `Ctrl + D` |
| Shortcut help | `?` |

(Use `Cmd` instead of `Ctrl` on macOS.)

---

## Getting started

Requires a recent Node.js (20 or newer).

```bash
git clone https://github.com/ahmedemad3/excalicraft.git
cd excalicraft
npm install
npm run dev        # Vite prints the local URL
```

Production build:

```bash
npm run build
npm run preview
```

### Run the tests

The tests are plain Node scripts (no `npm test` script yet):

```bash
for f in tests/*.js; do node "$f" || break; done
```

### Regenerating the README GIFs (contributors)

The dev server includes a small helper endpoint (`/api/save-gif`) that writes GIFs into `img/`. With `npm run dev` running, open the browser console and call `generateAllTemplateGifs()`. This helper exists only in the dev server. Don't run the dev server with `--host` on an untrusted network.

---

## Privacy

Diagrams stay in your browser (autosaved to local storage). The app has no backend and sends no diagram data anywhere. The only external request is loading fonts from Google Fonts.

---

## Known limitations

This is an early release. Please read this before relying on it:

- **Latency total:** the path total currently reports the first path found between two nodes, which is not always the longest. On diagrams with parallel branches it can under-report. *(Known bug, fix planned.)*
- **Capacity defaults:** if you don't set a node's capacity, ExcaliCraft assumes 20,000 QPS (5,000 for databases). Built-in templates therefore show no saturation until you enter real numbers.
- **SPOF detection** uses undirected articulation points plus heuristics on node titles and badges (for example "client", "gateway", "db", "postgres", "replica", "standby"). Mark replicas explicitly and check the result against your own judgment.
- **Mermaid import** does not yet support chained edges (`A --> B --> C`), `subgraph`, `stateDiagram`, or `classDiagram`. An unsupported construct rejects the whole input.
- **SQL** is export only. There is no `CREATE TABLE` import yet.
- **Notes:** there is no dedicated notes element yet, only the text tool.
- **Excalidraw compatibility** covers importing `.excalidraw`/JSON files and Excalidraw-embedded SVG scenes. Round-trip fidelity for every Excalidraw feature is not guaranteed.

---

## Roadmap

1. Fix the critical-path latency calculation
2. SQL → ERD import (`CREATE TABLE`, keys, constraints)
3. Complete Mermaid import (chained edges, `subgraph`, state and class diagrams, per-line error reporting)
4. First-class notes (markdown notes and per-element notes, included in exports)
5. Explicit node properties (role, replicas, capacity) instead of title-based heuristics
6. Directed SPOF analysis (dominators) with "affected paths" highlighting
7. Arabic / RTL text support
8. CI, `npm test`, and a live demo

---

## Project structure

```
excalicraft/
├── index.html          # App shell, toolbars, inspector, export modal
├── vite.config.js      # Vite config + dev-only /api/save-gif helper
├── src/
│   ├── main.js         # Studio controller: tools, selection, inspector, shortcuts, autosave
│   ├── renderer.js     # Canvas rendering (Rough.js sketch style + crisp cards, C4, boundaries)
│   ├── graph.js        # Graph analysis: SPOF (Tarjan), path latency, capacity
│   ├── templates.js    # The 16 built-in templates
│   ├── mermaid.js      # Mermaid import / export
│   ├── codegen.js      # SQL DDL generation from ERD tables
│   ├── export.js       # PNG, SVG, PDF, GIF, JSON export; Excalidraw SVG import
│   ├── presenter.js    # Presentation mode
│   ├── minimap.js      # Minimap
│   ├── history.js      # Undo / redo
│   ├── icons.js        # Icon registry
│   ├── math.js         # Geometry and hit testing
│   └── style.css
├── tests/              # Node test scripts
├── tools/              # Helper scripts
└── img/                # README GIFs
```

Built with [Vite](https://vitejs.dev/), [Rough.js](https://roughjs.com/), [jsPDF](https://github.com/parallax/jsPDF), [gifenc](https://github.com/mattdesl/gifenc), and [Lucide](https://lucide.dev/).

---

## Contributing

Issues and pull requests are welcome. For anything non-trivial, please open an issue first so we can agree on the approach. Run the test scripts above before submitting.

## License

MIT, see [LICENSE](LICENSE).
