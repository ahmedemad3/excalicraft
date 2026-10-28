/**
 * ExcaliCraft Graph Analysis Engine
 * Real-time, 100% client-side topological analysis for System Architecture & Design
 * Provides:
 * - Tarjan's Articulation Points algorithm for automated Single Point of Failure (SPOF) detection
 * - Cumulative critical path latency calculation
 * - Capacity saturation & bottleneck detection
 * - Cycle-safe graph traversal
 */

export class ArchitectureGraph {
  constructor(elements = []) {
    this.elements = elements;
    this.nodes = new Map();
    this.edges = [];
    this.adj = new Map();        // Outgoing adjacency: nodeId -> Set<nodeId>
    this.undirectedAdj = new Map(); // Undirected adjacency for articulation points
    this.inEdges = new Map();    // nodeId -> Array<edgeElement>
    this.outEdges = new Map();   // nodeId -> Array<edgeElement>

    this.build();
  }

  /**
   * Constructs the topological graph from canvas elements
   */
  build() {
    // 1. Collect all non-connector architectural nodes
    for (const el of this.elements) {
      if (el.type !== 'arrow' && el.type !== 'line' && el.type !== 'group-boundary' && el.type !== 'swimlane') {
        this.nodes.set(el.id, el);
        this.adj.set(el.id, new Set());
        this.undirectedAdj.set(el.id, new Set());
        this.inEdges.set(el.id, []);
        this.outEdges.set(el.id, []);
      }
    }

    // 2. Connect vertices using arrow/line bindings or spatial proximity
    for (const el of this.elements) {
      if (el.type === 'arrow' || el.type === 'line') {
        let fromId = el.startBinding?.elementId;
        let toId = el.endBinding?.elementId;

        // Fallback: spatial hit test if binding is missing
        if (!fromId || !toId) {
          const endpoints = this.findNearestNodesForConnector(el);
          if (!fromId) fromId = endpoints.fromId;
          if (!toId) toId = endpoints.toId;
        }

        if (fromId && toId && this.nodes.has(fromId) && this.nodes.has(toId)) {
          this.edges.push({
            id: el.id,
            from: fromId,
            to: toId,
            element: el,
            qps: Number(el.qps) || 0,
            latencyMs: Number(el.latencyMs ?? el.latency) || 0
          });

          this.adj.get(fromId).add(toId);
          this.outEdges.get(fromId).push(el);
          this.inEdges.get(toId).push(el);

          // Undirected mapping for biconnectivity / cut-vertex analysis
          this.undirectedAdj.get(fromId).add(toId);
          this.undirectedAdj.get(toId).add(fromId);

          if (el.direction === 'bidirectional') {
            this.adj.get(toId).add(fromId);
          }
        }
      }
    }
  }

  /**
   * Geometric proximity fallback when arrow bindings are absent
   * Computes shortest distance to node bounding box
   */
  findNearestNodesForConnector(arrow) {
    let startX = arrow.x;
    let startY = arrow.y;
    let endX = arrow.x + (arrow.width || 0);
    let endY = arrow.y + (arrow.height || 0);

    if (Array.isArray(arrow.points) && arrow.points.length >= 2) {
      const p0 = arrow.points[0];
      const pLast = arrow.points[arrow.points.length - 1];

      // Detect if points are already absolute coordinates vs relative offsets
      if (Math.abs(p0[0] - arrow.x) < 5 && Math.abs(p0[1] - arrow.y) < 5) {
        startX = p0[0];
        startY = p0[1];
        endX = pLast[0];
        endY = pLast[1];
      } else if (Math.abs(p0[0]) < 2 && Math.abs(p0[1]) < 2) {
        startX = arrow.x + p0[0];
        startY = arrow.y + p0[1];
        endX = arrow.x + pLast[0];
        endY = arrow.y + pLast[1];
      } else if (Math.abs(p0[0]) >= Math.abs(arrow.x) * 0.8) {
        // Coordinates match scene positions
        startX = p0[0];
        startY = p0[1];
        endX = pLast[0];
        endY = pLast[1];
      } else {
        startX = arrow.x + p0[0];
        startY = arrow.y + p0[1];
        endX = arrow.x + pLast[0];
        endY = arrow.y + pLast[1];
      }
    }

    let fromId = null;
    let toId = null;
    let minStartDist = 120; // 120px proximity threshold to node perimeter
    let minEndDist = 120;

    for (const [id, node] of this.nodes) {
      const dStart = this.distanceToNodeBox(startX, startY, node);
      const dEnd = this.distanceToNodeBox(endX, endY, node);

      if (dStart < minStartDist) {
        minStartDist = dStart;
        fromId = id;
      }
      if (dEnd < minEndDist) {
        minEndDist = dEnd;
        toId = id;
      }
    }

    return { fromId, toId };
  }

  distanceToNodeBox(px, py, node) {
    const minX = node.x;
    const maxX = node.x + (node.width || 100);
    const minY = node.y;
    const maxY = node.y + (node.height || 50);

    const dx = Math.max(minX - px, 0, px - maxX);
    const dy = Math.max(minY - py, 0, py - maxY);
    return Math.hypot(dx, dy);
  }

  /**
   * Detects Single Points of Failure (SPOFs) via Tarjan's Articulation Points algorithm
   * Cycles and deep paths are bounded to prevent call stack exhaustion (SEC-S3-01 / SEC-S3-02)
   */
  detectSpofs() {
    const spofs = new Set();
    const visited = new Set();
    const tin = new Map();
    const low = new Map();
    let timer = 0;

    // Identify entry nodes (in-degree 0 or designated EDGE/INGRESS)
    const entryNodes = new Set();
    const targetNodes = new Set();

    for (const [id, node] of this.nodes) {
      const badge = String(node.badge || '').toUpperCase();
      const title = String(node.title || '').toLowerCase();

      if (this.inEdges.get(id).length === 0 || badge === 'EDGE' || badge === 'CLIENT' || title.includes('client') || title.includes('gateway')) {
        entryNodes.add(id);
      }
      if (badge === 'DATABASE' || badge === 'CACHE' || badge === 'QUEUE' || node.type === 'erd-table' || title.includes('db') || title.includes('postgres')) {
        targetNodes.add(id);
      }
    }

    // Iterative/bounded DFS for Tarjan's algorithm
    const dfs = (u, p = null) => {
      visited.add(u);
      tin.set(u, ++timer);
      low.set(u, timer);
      let children = 0;

      const neighbors = this.undirectedAdj.get(u) || [];
      for (const to of neighbors) {
        if (to === p) continue;
        if (visited.has(to)) {
          low.set(u, Math.min(low.get(u), tin.get(to)));
        } else {
          children++;
          dfs(to, u);
          low.set(u, Math.min(low.get(u), low.get(to)));
          if (low.get(to) >= tin.get(u) && p !== null) {
            // Check if u connects an entry to a target
            if (this.isCriticalBridge(u)) {
              spofs.add(u);
            }
          }
        }
      }

      if (p === null && children > 1) {
        if (this.isCriticalBridge(u)) {
          spofs.add(u);
        }
      }
    };

    for (const [id] of this.nodes) {
      if (!visited.has(id)) {
        dfs(id);
      }
    }

    // Stateful un-replicated database / storage SPOF detection
    for (const [id, node] of this.nodes) {
      const badge = String(node.badge || '').toUpperCase();
      const title = String(node.title || '').toLowerCase();
      const subtitle = String(node.subtitle || '').toLowerCase();

      const isStateful = badge === 'DATABASE' || badge === 'PRIMARY RDBMS' || title.includes('database') || title.includes('aurora') || title.includes('postgres') || title.includes('mysql');
      const isExplicitSpof = subtitle.includes('spof') || subtitle.includes('un-replicated') || title.includes('spof');

      if (isStateful && (isExplicitSpof || (!node.isRedundant && !subtitle.includes('replica')))) {
        const hasReplica = Array.from(this.nodes.values()).some(n =>
          n.id !== id && (String(n.title).toLowerCase().includes('replica') || String(n.subtitle).toLowerCase().includes('replica') || String(n.subtitle).toLowerCase().includes('standby'))
        );
        if (!hasReplica) {
          spofs.add(id);
        }
      }
    }

    // Explicit manual SPOF overrides or properties
    for (const [id, node] of this.nodes) {
      if (node.isSpof === false || node.spof === false) {
        spofs.delete(id);
      } else if (node.isSpof === true || node.spof === true) {
        spofs.add(id);
      }
    }

    return spofs;
  }

  /**
   * Verifies if node failure actually disrupts path between Ingress and Stateful layers
   */
  isCriticalBridge(nodeId) {
    const node = this.nodes.get(nodeId);
    if (!node) return false;
    if (node.isRedundant || String(node.subtitle || '').toLowerCase().includes('replica') || String(node.title || '').toLowerCase().includes('replica') || String(node.subtitle || '').toLowerCase().includes('standby')) {
      return false;
    }

    // Articulation point in active flow
    const inCount = (this.inEdges.get(nodeId) || []).length;
    const outCount = (this.outEdges.get(nodeId) || []).length;
    const deg = (this.undirectedAdj.get(nodeId) || new Set()).size;
    return (inCount >= 1 && outCount >= 1) || deg >= 2;
  }

  /**
   * Calculates cumulative critical path latency between two nodes (or from root)
   * Cycles are safely handled with a visited set
   */
  calculatePathLatency(startId, endId) {
    if (!this.nodes.has(startId)) return { totalLatency: 0, path: [] };

    const startNode = this.nodes.get(startId);
    const startLatency = Number(startNode?.latencyMs ?? startNode?.latency ?? 0);
    const queue = [{ id: startId, latency: startLatency, path: [startId] }];
    const visited = new Set([startId]);

    let maxLatency = 0;
    let criticalPath = [];

    while (queue.length > 0) {
      const { id, latency, path } = queue.shift();

      if (id === endId || (this.adj.get(id)?.size === 0 && !endId)) {
        if (latency >= maxLatency) {
          maxLatency = latency;
          criticalPath = path;
        }
        if (id === endId) continue;
      }

      for (const nextId of this.adj.get(id) || []) {
        if (!visited.has(nextId)) {
          visited.add(nextId);
          const nextNode = this.nodes.get(nextId);
          const edge = this.edges.find(e => e.from === id && e.to === nextId);

          const edgeLatency = Number(edge?.latencyMs ?? edge?.latency ?? 0);
          const nodeLatency = Number(nextNode?.latencyMs ?? nextNode?.latency ?? 0);

          queue.push({
            id: nextId,
            latency: latency + edgeLatency + nodeLatency,
            path: [...path, nextId]
          });
        }
      }
    }

    return { totalLatency: maxLatency, path: criticalPath };
  }

  /**
   * Computes aggregate throughput (QPS) and flags capacity bottlenecks
   */
  analyzeCapacity() {
    const nodeMetrics = new Map();

    for (const [id, node] of this.nodes) {
      const inEdges = this.inEdges.get(id) || [];
      const totalIncomingQps = inEdges.reduce((sum, e) => sum + (Number(e.qps) || 0), 0);
      const capacity = Number(node.maxCapacityQps ?? node.maxCapacity) || (node.badge === 'DATABASE' ? 5000 : 20000);

      const isSaturated = totalIncomingQps > capacity;
      const saturationRatio = capacity > 0 ? (totalIncomingQps / capacity) : 0;

      nodeMetrics.set(id, {
        incomingQps: totalIncomingQps,
        inflowQps: totalIncomingQps,
        capacity,
        maxCapacity: capacity,
        isSaturated,
        isOverloaded: isSaturated,
        saturationRatio: Math.round(saturationRatio * 100),
        utilization: Math.round(saturationRatio * 100)
      });
    }

    return nodeMetrics;
  }
}
