/**
 * Sprint 8 Comprehensive Test Suite
 * Validates Milestones 8.1 - 8.4:
 * - TC-S8-SQL-01..03: SQL DDL Reverse Parser & Schema Generator
 * - TC-S8-NOTE-01..03: First-Class Markdown Notes & ADR Cards
 * - TC-S8-DOM-01..03: Directed Dominator Tree SPOF & Blast Radius
 * - TC-S8-TXT-01..04: Authentic Excalidraw Text Tool & Input UX
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseSqlToErd } from '../src/codegen.js';
import { ArchitectureGraph } from '../src/graph.js';
// Lightweight DOM mock for headless Node.js SVG serialization test
if (typeof globalThis.document === 'undefined') {
  class MockElement {
    constructor(tag) {
      this.tagName = tag;
      this.attrs = {};
      this.children = [];
      this._textContent = '';
      this.style = {};
    }
    set textContent(text) {
      this._textContent = String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
    get textContent() { return this._textContent; }
    setAttribute(k, v) { this.attrs[k] = String(v); }
    getAttribute(k) { return this.attrs[k]; }
    appendChild(child) {
      this.children.push(child);
      return child;
    }
    get outerHTML() {
      const attrStr = Object.entries(this.attrs).map(([k, v]) => ` ${k}="${v}"`).join('');
      const childStr = this.children.map(c => typeof c === 'string' ? c : c.outerHTML).join('');
      return `<${this.tagName}${attrStr}>${this._textContent}${childStr}</${this.tagName}>`;
    }
  }
  globalThis.document = {
    createElementNS(ns, tag) { return new MockElement(tag); },
    createElement(tag) { return new MockElement(tag); }
  };
  globalThis.XMLSerializer = class XMLSerializer {
    serializeToString(node) {
      return node ? node.outerHTML : '';
    }
  };
}

import { exportToSvg } from '../src/export.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Starting Sprint 8 Test Suite...\n');

let passedTests = 0;
let totalTests = 0;

function test(description, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✔️ ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ ${description}`);
    console.error(err);
    process.exitCode = 1;
  }
}

// ============================================================================
// Suite 1: SQL DDL -> ERD Reverse Parser (TC-S8-SQL-01..03)
// ============================================================================
console.log('📦 Suite 1: SQL DDL -> ERD Reverse Parser');

test('TC-S8-SQL-01: Parse standard PostgreSQL CREATE TABLE with PK and FK references', () => {
  const sql = `
    -- Schema definition
    CREATE TABLE users (
      id UUID PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      created_at TIMESTAMP
    );

    CREATE TABLE orders (
      order_id BIGINT PRIMARY KEY,
      user_id UUID REFERENCES users(id),
      total_amount DECIMAL(10,2),
      status VARCHAR(32)
    );
  `;

  const result = parseSqlToErd(sql, { startX: 100, startY: 100 });
  assert.strictEqual(result.tablesCount, 2, 'Should detect 2 tables');
  assert.strictEqual(result.relationshipsCount, 1, 'Should detect 1 FK relationship');

  const usersTable = result.elements.find(el => el.tableName === 'users');
  assert(usersTable, 'users table should exist');
  assert.strictEqual(usersTable.type, 'erd-table');
  assert.strictEqual(usersTable.columns.length, 3);
  assert(usersTable.columns.find(c => c.name === 'id' && c.isPk));

  const ordersTable = result.elements.find(el => el.tableName === 'orders');
  assert(ordersTable, 'orders table should exist');
  assert.strictEqual(ordersTable.type, 'erd-table');
  const fkCol = ordersTable.columns.find(c => c.name === 'user_id');
  assert(fkCol && fkCol.isFk, 'user_id column should be marked as FK');

  // Verify relational arrow connector created between users and orders
  const connector = result.elements.find(el => el.type === 'arrow');
  assert(connector, 'Should create arrow connector for FK relation');
  assert.strictEqual(connector.startBinding?.elementId, usersTable.id);
  assert.strictEqual(connector.endBinding?.elementId, ordersTable.id);
  assert(connector.label.includes('FK: user_id -> id'));
});

test('TC-S8-SQL-02: Parse MySQL backtick dialect and explicit table CONSTRAINT clauses', () => {
  const sql = `
    CREATE TABLE \`accounts\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`account_name\` varchar(100) DEFAULT NULL,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE \`transactions\` (
      \`txn_id\` varchar(64) NOT NULL,
      \`account_id\` int(11) NOT NULL,
      \`amount\` decimal(12,4) NOT NULL,
      PRIMARY KEY (\`txn_id\`),
      CONSTRAINT \`fk_txn_account\` FOREIGN KEY (\`account_id\`) REFERENCES \`accounts\` (\`id\`) ON DELETE CASCADE
    );
  `;

  const result = parseSqlToErd(sql);
  assert.strictEqual(result.tablesCount, 2);
  assert.strictEqual(result.relationshipsCount, 1);

  const accTable = result.elements.find(el => el.tableName === 'accounts');
  assert(accTable, 'accounts table parsed with backticks');
  assert(accTable.columns.find(c => c.name === 'id' && c.isPk));

  const txnTable = result.elements.find(el => el.tableName === 'transactions');
  assert(txnTable, 'transactions table parsed with backticks');
  const fkCol = txnTable.columns.find(c => c.name === 'account_id');
  assert(fkCol && fkCol.isFk, 'account_id must be recognized as FK from table CONSTRAINT');
});

test('TC-S8-SQL-03: Security ceiling - Rejects payload exceeding 5MB (SEC-S8-01)', () => {
  const hugePayload = 'CREATE TABLE big (id INT);' + ' '.repeat(5 * 1024 * 1024 + 10);
  assert.throws(
    () => parseSqlToErd(hugePayload),
    /exceeds.*5MB/i,
    'Should throw size limit error for oversized SQL payload'
  );
});

// ============================================================================
// Suite 2: First-Class Markdown Notes & ADR Cards (TC-S8-NOTE-01..03)
// ============================================================================
console.log('\n📝 Suite 2: First-Class Markdown Notes & ADR Cards');

test('TC-S8-NOTE-01: Note SVG serialization with sticky card styling and markdown content', () => {
  const noteElement = {
    id: 'note-01',
    type: 'note',
    cardStyle: 'sticky',
    x: 100,
    y: 100,
    width: 220,
    height: 180,
    title: 'Architectural Discussion',
    content: '# Architecture Note\n- [x] Verified zero single point of failure\n- [ ] Database replication\n`const x = 42;`',
    themeColor: '#fff9db',
    backgroundColor: '#fff9db',
    seed: 1234
  };

  const svg = exportToSvg([noteElement], { returnString: true });
  assert(svg.includes('<svg'), 'Should output valid SVG');
  assert(svg.includes('Architecture Note') || svg.includes('Architectural Discussion'), 'Should include note text in SVG');
  assert(svg.includes('data-element-id="note-01"'), 'Should contain note element id');
});

test('TC-S8-NOTE-02: ADR Card with status badge (PROPOSED, ACCEPTED, SUPERSEDED)', () => {
  const adrElement = {
    id: 'adr-01',
    type: 'note',
    cardStyle: 'adr',
    status: 'ACCEPTED',
    x: 200,
    y: 150,
    width: 320,
    height: 240,
    title: 'ADR-004: CQRS Implementation',
    content: '## Context\nNeed event-driven read projections.\n\n## Decision\nAdopt CQRS with Kafka.\n\n## Consequences\nHigh throughput.',
    themeColor: '#2f9e44',
    seed: 5678
  };

  const svg = exportToSvg([adrElement], { returnString: true });
  assert(svg.includes('ACCEPTED'), 'ADR SVG must render status badge');
  assert(svg.includes('ADR-004: CQRS Implementation'), 'ADR SVG must render title');
});

test('TC-S8-NOTE-03: XML character escaping in Markdown notes to prevent injection (SEC-S8-02)', () => {
  const maliciousNote = {
    id: 'note-xss',
    type: 'note',
    cardStyle: 'sticky',
    x: 50,
    y: 50,
    width: 200,
    height: 150,
    title: '<script>alert("xss")</script>',
    content: 'Payload: <img src="x" onerror="steal()"/> & "double quotes"',
    seed: 9999
  };

  const svg = exportToSvg([maliciousNote], { returnString: true });
  assert(!svg.includes('<script>'), 'Must not render unescaped <script> tag');
  assert(!svg.includes('onerror='), 'Must not render unescaped onerror handler');
  assert(svg.includes('&lt;script&gt;') || svg.includes('&lt;img'), 'Must escape HTML/XML characters');
});

// ============================================================================
// Suite 3: Directed Dominator Tree SPOF & Blast Radius (TC-S8-DOM-01..03)
// ============================================================================
console.log('\n🌳 Suite 3: Directed Dominator Tree SPOF & Blast Radius');

test('TC-S8-DOM-01: Linear Chain Dominance: A -> B -> C', () => {
  const elements = [
    { id: 'node-A', type: 'node', title: 'API Gateway', role: 'entry', x: 50, y: 100, width: 120, height: 60 },
    { id: 'node-B', type: 'node', title: 'Auth Service', x: 220, y: 100, width: 120, height: 60 },
    { id: 'node-C', type: 'node', title: 'Orders DB', role: 'datastore', x: 400, y: 100, width: 120, height: 60 },
    { id: 'edge-1', type: 'arrow', startBinding: { elementId: 'node-A' }, endBinding: { elementId: 'node-B' }, points: [[50,100], [220,100]] },
    { id: 'edge-2', type: 'arrow', startBinding: { elementId: 'node-B' }, endBinding: { elementId: 'node-C' }, points: [[220,100], [400,100]] }
  ];

  const graph = new ArchitectureGraph(elements);
  const domResult = graph.computeDominatorTree();

  // In A -> B -> C:
  // Node B dominates Node C
  const domC = domResult.dominators.get('node-C');
  assert(domC.has('node-A'), 'A dominates C');
  assert(domC.has('node-B'), 'B dominates C');
  assert(domC.has('node-C'), 'C dominates itself');

  // Immediate dominator of C is B
  assert.strictEqual(domResult.idom.get('node-C'), 'node-B', 'idom(C) must be B');

  // Blast radius of B includes C
  const blastB = graph.getBlastRadius('node-B');
  assert(blastB.isSpof, 'B must be flagged as a SPOF');
  assert(blastB.affectedNodeIds.includes('node-C'), 'Blast radius of B must include C');
});

test('TC-S8-DOM-02: Diamond Redundant Paths: A -> (B, C) -> D removes single point of failure', () => {
  const elements = [
    { id: 'node-A', type: 'node', title: 'Load Balancer', role: 'entry', x: 50, y: 150, width: 100, height: 50 },
    { id: 'node-B', type: 'node', title: 'Worker 1 (Replica)', isReplicated: true, x: 200, y: 50, width: 100, height: 50 },
    { id: 'node-C', type: 'node', title: 'Worker 2 (Replica)', isReplicated: true, x: 200, y: 250, width: 100, height: 50 },
    { id: 'node-D', type: 'node', title: 'Backend Store', x: 380, y: 150, width: 100, height: 50 },
    { id: 'e1', type: 'arrow', startBinding: { elementId: 'node-A' }, endBinding: { elementId: 'node-B' } },
    { id: 'e2', type: 'arrow', startBinding: { elementId: 'node-A' }, endBinding: { elementId: 'node-C' } },
    { id: 'e3', type: 'arrow', startBinding: { elementId: 'node-B' }, endBinding: { elementId: 'node-D' } },
    { id: 'e4', type: 'arrow', startBinding: { elementId: 'node-C' }, endBinding: { elementId: 'node-D' } }
  ];

  const graph = new ArchitectureGraph(elements);
  const domResult = graph.computeDominatorTree();

  // In diamond A -> (B, C) -> D:
  // Neither B nor C dominates D because traffic can bypass via the alternate branch
  const domD = domResult.dominators.get('node-D');
  assert(domD.has('node-A'), 'Entry A dominates D');
  assert(!domD.has('node-B'), 'Worker B must NOT strictly dominate D');
  assert(!domD.has('node-C'), 'Worker C must NOT strictly dominate D');

  const blastB = graph.getBlastRadius('node-B');
  assert(!blastB.affectedNodeIds.includes('node-D'), 'Failing Worker B must not isolate D');
});

test('TC-S8-DOM-03: Directed SPOF identification and detection iteration guard (SEC-S8-03)', () => {
  // Cyclic topology check to ensure algorithm terminates within max 50 iterations
  const cyclicElements = [
    { id: 'c1', type: 'node', title: 'Node 1', role: 'entry' },
    { id: 'c2', type: 'node', title: 'Node 2' },
    { id: 'c3', type: 'node', title: 'Node 3' },
    { id: 'a1', type: 'arrow', startBinding: { elementId: 'c1' }, endBinding: { elementId: 'c2' } },
    { id: 'a2', type: 'arrow', startBinding: { elementId: 'c2' }, endBinding: { elementId: 'c3' } },
    { id: 'a3', type: 'arrow', startBinding: { elementId: 'c3' }, endBinding: { elementId: 'c2' } } // cycle
  ];

  const graph = new ArchitectureGraph(cyclicElements);
  const dom = graph.computeDominatorTree();
  assert(dom.dominators.size === 3, 'Must successfully terminate and compute dominators on cyclic graphs');
  assert(dom.dominators.get('c2').has('c1'), 'c1 must dominate c2');
});

// ============================================================================
// Suite 4: Authentic Excalidraw Text Tool & Input UX (TC-S8-TXT-01..04)
// ============================================================================
console.log('\n🔤 Suite 4: Authentic Excalidraw Text Tool & Input UX');

test('TC-S8-TXT-01: index.html Text Tool displays typography Letter A icon instead of boxed T', () => {
  const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  assert(indexHtml.includes('id="tool-text"'), 'tool-text button must exist');
  assert(indexHtml.includes('M5 19L12 4l7 15'), 'tool-text must use letter A diagonal strokes');
  assert(indexHtml.includes('M7.5 14h9'), 'tool-text must use letter A crossbar');
});

test('TC-S8-TXT-02: CSS floating text editor has transparent borderless styling', () => {
  const css = fs.readFileSync(path.join(__dirname, '../src/style.css'), 'utf8');
  assert(css.includes('#inlineTextEditor'), '#inlineTextEditor styles must exist in style.css');
  assert(css.includes('background: transparent'), 'Text editor must have transparent background');
  assert(css.includes('border: none'), 'Text editor must have no border');
  assert(css.includes('outline: none'), 'Text editor must have no outline focus ring');
});

test('TC-S8-TXT-03: JavaScript commit lifecycle contains active synchronous commit function for canvas click-outside', () => {
  const mainJs = fs.readFileSync(path.join(__dirname, '../src/main.js'), 'utf8');
  assert(mainJs.includes('this.activeInlineTextCommit'), 'main.js must track active inline text commit');
  assert(mainJs.includes('onPointerDown(e) {'), 'onPointerDown must execute active commit');
});

test('TC-S8-TXT-04: Multi-line text support: Enter creates newlines while Escape / Ctrl+Enter / Blur commits', () => {
  const mainJs = fs.readFileSync(path.join(__dirname, '../src/main.js'), 'utf8');
  assert(mainJs.includes("if (e.key === 'Escape')"), 'Must commit and exit on Escape');
  assert(mainJs.includes("e.ctrlKey || e.metaKey") && mainJs.includes("e.key === 'Enter'"), 'Must commit on Ctrl+Enter');
  assert(mainJs.includes("textarea.addEventListener('input'"), 'Must resize dynamically on multi-line text input');
});

console.log(`\n================================================================`);
console.log(`🏁 Sprint 8 Test Summary: ${passedTests}/${totalTests} Tests Passed`);
console.log(`================================================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
} else {
  console.log('🎉 SPRINT 8 SUITE VERIFICATION SUCCESS!\n');
  process.exit(0);
}
