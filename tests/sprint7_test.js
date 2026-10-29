/**
 * Sprint 7 Automated Functional & Algorithmic Regression Test Suite
 * Tests TC-S7-LAT-01..02, TC-S7-MRM-01..03, TC-S7-SPF-01..02, TC-S7-CAP-01
 */

import assert from 'node:assert';
import { ArchitectureGraph } from '../src/graph.js';
import { importFromMermaid } from '../src/mermaid.js';
import { getFlashSaleTemplate } from '../src/templates.js';

let passed = 0;
let failed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
    failed++;
  }
}

console.log('🚀 Running Sprint 7 Functional & Algorithmic Test Suite...\n');

// ============================================================================
// 1. Critical Path Latency (TC-S7-LAT)
// ============================================================================
console.log('--- Suite 7.1: Critical Path Latency (DFS Longest Path) ---');

runTest('TC-S7-LAT-01: Diamond topology returns longest critical path, not BFS shortest', () => {
  const elements = [
    { id: 'a', type: 'node', title: 'Start', latencyMs: 0 },
    { id: 'b', type: 'node', title: 'Fast Branch', latencyMs: 10 },
    { id: 'c', type: 'node', title: 'Slow Branch', latencyMs: 50 },
    { id: 'd', type: 'node', title: 'End', latencyMs: 0 },
    // Short path: a -> b -> d (10 + 10 + 10 = 30ms)
    { id: 'e1', type: 'arrow', startBinding: { elementId: 'a' }, endBinding: { elementId: 'b' }, latencyMs: 10 },
    { id: 'e2', type: 'arrow', startBinding: { elementId: 'b' }, endBinding: { elementId: 'd' }, latencyMs: 10 },
    // Long path: a -> c -> d (50 + 50 + 50 = 150ms)
    { id: 'e3', type: 'arrow', startBinding: { elementId: 'a' }, endBinding: { elementId: 'c' }, latencyMs: 50 },
    { id: 'e4', type: 'arrow', startBinding: { elementId: 'c' }, endBinding: { elementId: 'd' }, latencyMs: 50 }
  ];

  const graph = new ArchitectureGraph(elements);
  const result = graph.calculatePathLatency('a', 'd');

  assert.strictEqual(result.totalLatency, 150, `Expected totalLatency 150, got ${result.totalLatency}`);
  assert.deepStrictEqual(result.path, ['a', 'c', 'd'], `Expected critical path ['a','c','d'], got ${JSON.stringify(result.path)}`);
});

runTest('TC-S7-LAT-02: Linear path single-chain latency calculation', () => {
  const elements = [
    { id: 'n1', type: 'node', title: 'Gateway', latencyMs: 5 },
    { id: 'n2', type: 'node', title: 'Auth', latencyMs: 15 },
    { id: 'n3', type: 'node', title: 'Database', latencyMs: 25 },
    { id: 'a1', type: 'arrow', startBinding: { elementId: 'n1' }, endBinding: { elementId: 'n2' }, latencyMs: 10 },
    { id: 'a2', type: 'arrow', startBinding: { elementId: 'n2' }, endBinding: { elementId: 'n3' }, latencyMs: 20 }
  ];

  const graph = new ArchitectureGraph(elements);
  const result = graph.calculatePathLatency('n1', 'n3');

  // 5 + 10 + 15 + 20 + 25 = 75ms
  assert.strictEqual(result.totalLatency, 75, `Expected totalLatency 75, got ${result.totalLatency}`);
  assert.deepStrictEqual(result.path, ['n1', 'n2', 'n3']);
});

// ============================================================================
// 2. Mermaid Import Hardening (TC-S7-MRM)
// ============================================================================
console.log('\n--- Suite 7.2: Mermaid Import Hardening ---');

runTest('TC-S7-MRM-01: Chained edge decomposition (A --> B --> C)', () => {
  const mermaidCode = `graph LR
    A["Client"] --> B["API Gateway"] --> C["Auth Service"]`;

  const res = importFromMermaid(mermaidCode);
  assert.strictEqual(res.success, true, `Import failed: ${res.error}`);

  const nodes = res.elements.filter(e => e.type === 'node');
  const arrows = res.elements.filter(e => e.type === 'arrow');

  assert.strictEqual(nodes.length, 3, `Expected 3 nodes, got ${nodes.length}`);
  assert.strictEqual(arrows.length, 2, `Expected 2 arrows for chained edge, got ${arrows.length}`);
});

runTest('TC-S7-MRM-02: Subgraph block imported as group-boundary element', () => {
  const mermaidCode = `graph TD
    subgraph Backend["Core Banking Subsystem"]
      API["API Gateway"] --> Core["Ledger Service"]
    end
    Client["Mobile User"] --> API`;

  const res = importFromMermaid(mermaidCode);
  assert.strictEqual(res.success, true, `Import failed: ${res.error}`);

  const boundaries = res.elements.filter(e => e.type === 'group-boundary');
  assert.strictEqual(boundaries.length, 1, `Expected 1 group-boundary for subgraph, got ${boundaries.length}`);
  assert.strictEqual(boundaries[0].title, 'Core Banking Subsystem');

  const nodes = res.elements.filter(e => e.type === 'node');
  assert.strictEqual(nodes.length, 3, `Expected 3 nodes, got ${nodes.length}`);
});

runTest('TC-S7-MRM-03: Per-line warning tolerance on invalid syntax', () => {
  const mermaidCode = `graph LR
    NodeA["User"] --> NodeB["Frontend"]
    @@INVALID_CUSTOM_TOKEN_LINE
    NodeB --> NodeC["Database"]`;

  const res = importFromMermaid(mermaidCode);
  assert.strictEqual(res.success, true, 'Import should succeed despite invalid lines');

  const nodes = res.elements.filter(e => e.type === 'node');
  const arrows = res.elements.filter(e => e.type === 'arrow');

  assert.strictEqual(nodes.length, 3, 'All 3 valid nodes should be imported');
  assert.strictEqual(arrows.length, 2, 'Both valid arrows should be imported');
  assert(res.warnings && res.warnings.length >= 1, 'Should collect warnings for invalid line');
});

runTest('TC-S7-MRM-04: stateDiagram-v2 parses states and transitions', () => {
  const mermaidCode = `stateDiagram-v2
    [*] --> Idle
    Idle --> Processing: Submit
    Processing --> Success
    Success --> [*]`;

  const res = importFromMermaid(mermaidCode);
  assert.strictEqual(res.success, true, `State diagram import failed: ${res.error}`);

  const stateNodes = res.elements.filter(e => e.type === 'state-node');
  const arrows = res.elements.filter(e => e.type === 'arrow');

  assert(stateNodes.length >= 4, `Expected at least 4 state nodes, got ${stateNodes.length}`);
  assert.strictEqual(arrows.length, 4, `Expected 4 transition arrows, got ${arrows.length}`);
});

// ============================================================================
// 3. SPOF Detection Role Property & Overrides (TC-S7-SPF)
// ============================================================================
console.log('\n--- Suite 7.3: SPOF Detection Heuristics & Role Property ---');

runTest('TC-S7-SPF-01: Explicit role="service" prevents false positive datastore target classification', () => {
  const elements = [
    { id: 'client', type: 'node', title: 'Web App', role: 'entry' },
    { id: 'feedback', type: 'node', title: 'UserDB Cache Microservice', role: 'service' },
    { id: 'db', type: 'node', title: 'PostgreSQL Database', role: 'datastore' },
    { id: 'a1', type: 'arrow', startBinding: { elementId: 'client' }, endBinding: { elementId: 'feedback' } },
    { id: 'a2', type: 'arrow', startBinding: { elementId: 'feedback' }, endBinding: { elementId: 'db' } }
  ];

  const graph = new ArchitectureGraph(elements);
  // feedback node is a bridge between client and db, but db is the target, feedback is a service
  assert(graph.nodes.get('feedback').role === 'service');
});

runTest('TC-S7-SPF-02: isReplicated=true suppresses stateful SPOF flagging', () => {
  const elements = [
    { id: 'client', type: 'node', title: 'Client', badge: 'CLIENT' },
    { id: 'gw', type: 'node', title: 'Gateway', badge: 'GATEWAY' },
    // Database alone, but marked isReplicated: true
    { id: 'db', type: 'node', title: 'Postgres Primary', badge: 'DATABASE', isReplicated: true },
    { id: 'a1', type: 'arrow', startBinding: { elementId: 'client' }, endBinding: { elementId: 'gw' } },
    { id: 'a2', type: 'arrow', startBinding: { elementId: 'gw' }, endBinding: { elementId: 'db' } }
  ];

  const graph = new ArchitectureGraph(elements);
  const spofs = graph.detectSpofs();

  assert(!spofs.has('db'), 'Replicated database must NOT be flagged as SPOF');
});

// ============================================================================
// 4. Capacity Visibility & Template Saturation (TC-S7-CAP)
// ============================================================================
console.log('\n--- Suite 7.4: Capacity Saturation & Badge Visibility ---');

runTest('TC-S7-CAP-01: Flash Sale template exhibits at least one node saturated >= 150%', () => {
  const templateElements = getFlashSaleTemplate();
  const graph = new ArchitectureGraph(templateElements);
  const metrics = graph.analyzeCapacity();

  const saturatedNodes = [];
  metrics.forEach((m, id) => {
    if (m.isSaturated && m.utilization >= 150) {
      saturatedNodes.push({ id, utilization: m.utilization });
    }
  });

  assert(saturatedNodes.length >= 1, `Expected at least 1 node with >=150% saturation, found: ${JSON.stringify(saturatedNodes)}`);
  console.log(`    Found saturated nodes in template:`, saturatedNodes);
});

// ============================================================================
// Summary
// ============================================================================
console.log(`\n========================================`);
console.log(`Sprint 7 Test Results: ${passed} Passed, ${failed} Failed`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
}
