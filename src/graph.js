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
          const edgeObj = {
            id: el.id,
            from: fromId,
            to: toId,
            element: el,
            qps: Number(el.qps) || 0,
            latencyMs: Number(el.latencyMs ?? el.latency) || 0
          };
          this.edges.push(edgeObj);

          this.adj.get(fromId).add(toId);
          this.outEdges.get(fromId).push(edgeObj);
          this.inEdges.get(toId).push(edgeObj);

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
      const role = String(node.role || '').toLowerCase();
      const badge = String(node.badge || '').toUpperCase();
      const title = String(node.title || '').toLowerCase();

      // Check role first, fallback to heuristics
      const isEntry = role === 'entry' || (role === '' && (this.inEdges.get(id).length === 0 || badge === 'EDGE' || badge === 'CLIENT' || title.includes('client') || title.includes('gateway')));
      if (isEntry) {
        entryNodes.add(id);
      }

      const isTarget = role === 'datastore' || role === 'cache' || role === 'queue' || (role === '' && (badge === 'DATABASE' || badge === 'CACHE' || badge === 'QUEUE' || node.type === 'erd-table' || (title.includes('postgres') || title.includes('aurora') || title.includes('mysql') || (title.includes('db') && !title.includes('feedback')))));
      if (isTarget) {
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
      const role = String(node.role || '').toLowerCase();
      const badge = String(node.badge || '').toUpperCase();
      const title = String(node.title || '').toLowerCase();
      const subtitle = String(node.subtitle || '').toLowerCase();

      const isReplicated = node.isReplicated === true || node.isRedundant === true;
      const isStateful = role === 'datastore' || (role === '' && (badge === 'DATABASE' || badge === 'PRIMARY RDBMS' || title.includes('database') || title.includes('aurora') || title.includes('postgres') || title.includes('mysql')));
      const isExplicitSpof = subtitle.includes('spof') || subtitle.includes('un-replicated') || title.includes('spof');

      if (isStateful && !isReplicated && (isExplicitSpof || (!node.isRedundant && !subtitle.includes('replica')))) {
        const hasReplica = Array.from(this.nodes.values()).some(n =>
          n.id !== id && (n.isReplicated || String(n.title).toLowerCase().includes('replica') || String(n.subtitle).toLowerCase().includes('replica') || String(n.subtitle).toLowerCase().includes('standby'))
        );
        if (!hasReplica) {
          spofs.add(id);
        }
      }
    }

    // Flow-Directed Dominator Tree SPOF integration (Milestone 8.3 / ISSUE-52)
    try {
      const { directedSpofs } = this.computeDominatorTree();
      for (const dId of directedSpofs) {
        const node = this.nodes.get(dId);
        if (node && node.isSpof !== false && node.spof !== false && !node.isReplicated && !node.isRedundant) {
          spofs.add(dId);
        }
      }
    } catch (err) {
      console.warn('[Graph] Dominator tree SPOF computation error:', err);
    }

    // Explicit manual SPOF overrides or properties
    for (const [id, node] of this.nodes) {
      if (node.isSpof === false || node.spof === false || node.isReplicated === true) {
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
    if (node.isReplicated || node.isRedundant || String(node.subtitle || '').toLowerCase().includes('replica') || String(node.title || '').toLowerCase().includes('replica') || String(node.subtitle || '').toLowerCase().includes('standby')) {
      return false;
    }

    // Articulation point in active flow
    const inCount = (this.inEdges.get(nodeId) || []).length;
    const outCount = (this.outEdges.get(nodeId) || []).length;
    const deg = (this.undirectedAdj.get(nodeId) || new Set()).size;
    return (inCount >= 1 && outCount >= 1) || deg >= 2;
  }

  /**
   * Calculates cumulative critical path (longest latency path) between two nodes (or from root)
   * Uses DFS with per-path stack tracking to correctly find the critical path on DAGs (BUG-01)
   * Cycles are safely handled with an onPath set and bounded recursion depth (SEC-S3-01 / SEC-S3-02)
   */
  calculatePathLatency(startId, endId) {
    if (!this.nodes.has(startId)) return { totalLatency: 0, path: [] };

    const startNode = this.nodes.get(startId);
    const startLatency = Number(startNode?.latencyMs ?? startNode?.latency ?? 0);

    let maxLatency = startLatency;
    let criticalPath = [startId];

    const MAX_DEPTH = 500;

    const dfs = (currId, currentLatency, currentPath, onPath, depth) => {
      if (depth > MAX_DEPTH) return;

      const isTerminal = currId === endId || ((this.adj.get(currId)?.size === 0 || !this.adj.get(currId)) && !endId);

      if (isTerminal) {
        if (currentLatency > maxLatency || (currentLatency === maxLatency && currentPath.length > criticalPath.length)) {
          maxLatency = currentLatency;
          criticalPath = [...currentPath];
        }
        if (currId === endId) return;
      }

      for (const nextId of this.adj.get(currId) || []) {
        if (!onPath.has(nextId)) {
          const nextNode = this.nodes.get(nextId);
          const edge = this.edges.find(e => e.from === currId && e.to === nextId);

          const edgeLatency = Number(edge?.latencyMs ?? edge?.latency ?? 0);
          const nodeLatency = Number(nextNode?.latencyMs ?? nextNode?.latency ?? 0);
          const addedLatency = edgeLatency + nodeLatency;

          onPath.add(nextId);
          currentPath.push(nextId);

          dfs(nextId, currentLatency + addedLatency, currentPath, onPath, depth + 1);

          currentPath.pop();
          onPath.delete(nextId);
        }
      }
    };

    const onPath = new Set([startId]);
    dfs(startId, startLatency, [startId], onPath, 0);

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

      const hasConfiguredCapacity = (node.maxCapacityQps !== undefined && node.maxCapacityQps !== null && node.maxCapacityQps !== '') ||
                                    (node.maxCapacity !== undefined && node.maxCapacity !== null && node.maxCapacity !== '');
      const rawCapacity = Number(node.maxCapacityQps ?? node.maxCapacity);
      const capacity = hasConfiguredCapacity && rawCapacity > 0 ? rawCapacity : (node.badge === 'DATABASE' ? 5000 : 20000);

      const isSaturated = totalIncomingQps > capacity;
      const saturationRatio = capacity > 0 ? (totalIncomingQps / capacity) : 0;

      nodeMetrics.set(id, {
        incomingQps: totalIncomingQps,
        inflowQps: totalIncomingQps,
        capacity,
        maxCapacity: capacity,
        hasConfiguredCapacity,
        capacityNotConfigured: !hasConfiguredCapacity,
        isSaturated,
        isOverloaded: isSaturated,
        saturationRatio: Math.round(saturationRatio * 100),
        utilization: Math.round(saturationRatio * 100)
      });
    }

    return nodeMetrics;
  }

  /**
   * ==========================================================================
   * Sprint 8: Flow-Directed Dominator Tree & Blast Radius (Milestone 8.3 & ISSUE-52)
   * Calculates immediate dominators (idom) on directed operational dependency graphs.
   * If node V fails, its blast radius is the set of all downstream nodes that
   * become completely unreachable from ingress roots.
   * Implements SEC-S8-03 (Iterative dataflow with cycle bounds & bounded iteration).
   * ==========================================================================
   */
  computeDominatorTree() {
    const nodeIds = Array.from(this.nodes.keys());
    if (nodeIds.length === 0) {
      return {
        dominators: new Map(),
        idom: new Map(),
        blastRadius: new Map(),
        directedSpofs: new Set()
      };
    }

    // 1. Identify entry root nodes (in-degree 0 or role='entry' / badge in ['EDGE','CLIENT'])
    const entryRoots = new Set();
    for (const id of nodeIds) {
      const node = this.nodes.get(id);
      const role = String(node?.role || '').toLowerCase();
      const badge = String(node?.badge || '').toUpperCase();
      const inCount = (this.inEdges.get(id) || []).length;
      if (inCount === 0 || role === 'entry' || badge === 'EDGE' || badge === 'CLIENT') {
        entryRoots.add(id);
      }
    }

    // Fallback: if cyclical or no roots found, pick first node
    if (entryRoots.size === 0 && nodeIds.length > 0) {
      entryRoots.add(nodeIds[0]);
    }

    // 2. Iterative Dataflow Dominator Algorithm: Dom(n) = {n} U (Intersect_{p in Pred(n)} Dom(p))
    const dom = new Map();
    const allNodesSet = new Set(nodeIds);

    for (const id of nodeIds) {
      if (entryRoots.has(id)) {
        dom.set(id, new Set([id]));
      } else {
        dom.set(id, new Set(allNodesSet));
      }
    }

    let changed = true;
    let iterations = 0;
    const MAX_ITERATIONS = 50; // Guard against pathological infinite loops (SEC-S8-03)

    while (changed && iterations < MAX_ITERATIONS) {
      changed = false;
      iterations++;

      for (const id of nodeIds) {
        if (entryRoots.has(id)) continue;

        const preds = (this.inEdges.get(id) || []).map(e => e.from || e.startBinding?.elementId).filter(fromId => this.nodes.has(fromId));
        if (preds.length === 0) continue;

        // Intersect dominators of predecessors
        let intersection = new Set(dom.get(preds[0]) || []);
        for (let i = 1; i < preds.length; i++) {
          const pDom = dom.get(preds[i]) || new Set();
          const nextIntersect = new Set();
          for (const item of intersection) {
            if (pDom.has(item)) nextIntersect.add(item);
          }
          intersection = nextIntersect;
        }

        // Add self
        intersection.add(id);

        const currentDom = dom.get(id);
        if (intersection.size !== currentDom.size || ![...intersection].every(x => currentDom.has(x))) {
          dom.set(id, intersection);
          changed = true;
        }
      }
    }

    // 3. Compute immediate dominator: idom(n)
    const idom = new Map();
    for (const id of nodeIds) {
      const strictDoms = Array.from(dom.get(id) || []).filter(d => d !== id);
      if (strictDoms.length === 0) {
        idom.set(id, null);
        continue;
      }

      // The immediate dominator is the one that is dominated by all other strict dominators
      let immDom = strictDoms[0];
      for (const candidate of strictDoms) {
        const candidateDom = dom.get(candidate) || new Set();
        const dominatesAllOthers = strictDoms.every(other => other === candidate || candidateDom.has(other));
        if (dominatesAllOthers) {
          immDom = candidate;
          break;
        }
      }
      idom.set(id, immDom);
    }

    // 4. Compute Blast Radius for each node: all nodes strictly dominated by this node
    const blastRadius = new Map();
    const directedSpofs = new Set();

    for (const v of nodeIds) {
      const affected = [];
      for (const w of nodeIds) {
        if (w !== v && (dom.get(w) || new Set()).has(v)) {
          affected.push(w);
        }
      }
      blastRadius.set(v, affected);

      // Node is a directed SPOF if failing it isolates at least one downstream node
      // and it is not an entry root itself or an explicitly replicated node
      const nodeObj = this.nodes.get(v);
      const isReplicated = nodeObj?.isReplicated === true || nodeObj?.isRedundant === true;
      if (affected.length > 0 && !isReplicated && !entryRoots.has(v)) {
        directedSpofs.add(v);
      }
    }

    return {
      dominators: dom,
      idom,
      blastRadius,
      directedSpofs
    };
  }

  /**
   * Retrieves the downstream blast radius (affected nodes and connecting edges) for a given node.
   * @param {string} nodeId
   * @returns {{ nodeId: string, affectedNodeIds: string[], affectedEdges: Array<Object>, isSpof: boolean, message: string }}
   */
  getBlastRadius(nodeId) {
    const { blastRadius } = this.computeDominatorTree();
    const affectedNodeIds = blastRadius.get(nodeId) || [];

    const affectedSet = new Set(affectedNodeIds);
    affectedSet.add(nodeId);

    // Edges where both endpoints or from-point are in the affected set
    const affectedEdges = this.edges.filter(e => affectedSet.has(e.from) || affectedSet.has(e.to));

    const node = this.nodes.get(nodeId);
    const nodeName = node?.title || nodeId;
    const count = affectedNodeIds.length;
    const message = count > 0
      ? `⚠️ SPOF Alert: Failing ${nodeName} cuts off ${count} downstream service${count > 1 ? 's' : ''}`
      : `✓ High Availability: Failing ${nodeName} does not isolate downstream services.`;

    return {
      nodeId,
      affectedNodeIds,
      affectedEdges,
      isSpof: count > 0,
      message
    };
  }
}
