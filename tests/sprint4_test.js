/**
 * Sprint 4 Automated Quality Assurance & Verification Suite
 * Executes all Test Cases from doc/test_scenario.md & doc/security_issues.md:
 * - TC-S4-DDL: SQL DDL Code Generation & ANSI/Postgres Export (3 Cases)
 * - TC-S4-MRM: Bi-directional Mermaid.js Sequence & Diagram Sync (3 Cases)
 * - SEC-S4-01: SQL Identifier Sanitization & Injection Prevention (1 Case)
 * - SEC-S4-02: Mermaid AST Sanitization & Markdown Injection Defense (1 Case)
 */

import assert from 'node:assert';
import { 
  generateSqlDdl, 
  generateTableDdl, 
  findErdRelationships, 
  sanitizeSqlIdentifier, 
  normalizeSqlType 
} from '../src/codegen.js';
import { 
  exportToMermaid, 
  importFromMermaid, 
  escapeMermaidLabel, 
  sanitizeMermaidId 
} from '../src/mermaid.js';
import { getErdTemplate, getTemplateElements } from '../src/templates.js';

console.log('🧪 =========================================================================');
console.log('🧪 Starting Sprint 4 Test Suite Execution (doc/test_scenario.md)');
console.log('🧪 =========================================================================\n');

let passedCount = 0;
const totalCount = 8;

// ============================================================================
// Suite 4.1: SQL DDL Code Generation (`TC-S4-DDL`)
// ============================================================================
console.log('--- Suite 4.1: SQL DDL Code Generation (TC-S4-DDL) ---');

// TC-S4-DDL-01: Instant SQL DDL Export from ERD Tables
{
  const usersTable = {
    id: 'tbl-users',
    type: 'erd-table',
    tableName: 'users',
    tableType: 'TABLE',
    columns: [
      { key: 'PK', isPk: true, name: 'id', type: 'UUID' },
      { key: '', isPk: false, name: 'email', type: 'VARCHAR(255)' },
      { key: '', isPk: false, name: 'created_at', type: 'TIMESTAMP' }
    ]
  };

  const sql = generateTableDdl(usersTable, { dialect: 'postgres' });
  
  assert(sql.includes('CREATE TABLE "users"'), 'Must generate CREATE TABLE "users"');
  assert(sql.includes('"id" UUID PRIMARY KEY'), 'Must define id as UUID PRIMARY KEY');
  assert(sql.includes('"email" VARCHAR(255)'), 'Must define email as VARCHAR(255)');
  assert(sql.includes('"created_at" TIMESTAMP'), 'Must define created_at as TIMESTAMP');
  assert(sql.includes('DEFAULT CURRENT_TIMESTAMP'), 'Timestamp should default to CURRENT_TIMESTAMP');

  console.log('✅ TC-S4-DDL-01: Instant SQL DDL Export from ERD Tables passed.');
  passedCount++;
}

// TC-S4-DDL-02: Foreign Key Constraint & Cardinality Mapping in DDL
{
  const usersTable = {
    id: 'tbl-users',
    type: 'erd-table',
    tableName: 'users',
    columns: [
      { key: 'PK', isPk: true, name: 'id', type: 'uuid' },
      { key: '', name: 'email', type: 'varchar(255)' }
    ]
  };

  const ordersTable = {
    id: 'tbl-orders',
    type: 'erd-table',
    tableName: 'orders',
    columns: [
      { key: 'PK', isPk: true, name: 'id', type: 'uuid' },
      { key: 'FK', isFk: true, name: 'user_id', type: 'uuid' },
      { key: '', name: 'total', type: 'integer' }
    ]
  };

  const arrow = {
    id: 'rel-1',
    type: 'arrow',
    x: 100,
    y: 100,
    width: 200,
    height: 0,
    label: '1 : N (user_id)',
    startBinding: { elementId: 'tbl-users' },
    endBinding: { elementId: 'tbl-orders' }
  };

  const elements = [usersTable, ordersTable, arrow];
  const ddl = generateSqlDdl(elements, { dialect: 'postgres' });

  assert(ddl.includes('ALTER TABLE "orders" ADD CONSTRAINT "fk_orders_users"'), 'Must generate ALTER TABLE constraint');
  assert(ddl.includes('FOREIGN KEY ("user_id") REFERENCES "users" ("id")'), 'Must generate correct FOREIGN KEY REFERENCES clause');

  console.log('✅ TC-S4-DDL-02: Foreign Key Constraint & Cardinality Mapping in DDL passed.');
  passedCount++;
}

// TC-S4-DDL-03: Download Schema as .sql File & Dialect Formatting
{
  const erdElements = getErdTemplate();
  assert(erdElements && erdElements.length > 0, 'ERD template must have elements');

  // Test PostgreSQL dialect
  const pgDdl = generateSqlDdl(erdElements, { dialect: 'postgres' });
  assert(pgDdl.includes('DROP TABLE IF EXISTS'), 'Postgres DDL should include DROP TABLE statements');
  assert(pgDdl.includes('CREATE TABLE "users"'), 'Postgres DDL must contain users table');
  assert(pgDdl.includes('CREATE TABLE "orders"'), 'Postgres DDL must contain orders table');
  assert(pgDdl.includes('ALTER TABLE "orders" ADD CONSTRAINT'), 'Postgres DDL must contain orders foreign key constraint');

  // Test MySQL dialect
  const mysqlDdl = generateSqlDdl(erdElements, { dialect: 'mysql' });
  assert(mysqlDdl.includes('CREATE TABLE `users`'), 'MySQL DDL must use backticks');
  assert(mysqlDdl.includes('`id` VARCHAR(36) PRIMARY KEY'), 'MySQL DDL maps UUID to VARCHAR(36)');

  console.log('✅ TC-S4-DDL-03: Download Schema as .sql File & Dialect Formatting passed.');
  passedCount++;
}

// ============================================================================
// Suite 4.2: Bi-directional Mermaid.js Synchronization (`TC-S4-MRM`)
// ============================================================================
console.log('--- Suite 4.2: Bi-directional Mermaid.js Synchronization (TC-S4-MRM) ---');

// TC-S4-MRM-01: Export Diagram to Mermaid Syntax
{
  const seqElements = [
    { id: 'client', type: 'node', x: 100, y: 80, width: 140, height: 70, title: 'Client', badge: 'ACTOR' },
    { id: 'gateway', type: 'node', x: 340, y: 80, width: 140, height: 70, title: 'Gateway', badge: 'EDGE' },
    { id: 'orderSvc', type: 'node', x: 580, y: 80, width: 140, height: 70, title: 'OrderService', badge: 'SERVICE' },
    { id: 'arr1', type: 'arrow', x: 170, y: 180, width: 240, height: 0, label: 'POST /orders', startBinding: { elementId: 'client' }, endBinding: { elementId: 'gateway' } },
    { id: 'arr2', type: 'arrow', x: 410, y: 240, width: 240, height: 0, label: 'CreateOrder()', startBinding: { elementId: 'gateway' }, endBinding: { elementId: 'orderSvc' } },
    { id: 'arr3', type: 'arrow', x: 650, y: 300, width: -240, height: 0, label: '201 Created', strokeStyle: 'dashed', startBinding: { elementId: 'orderSvc' }, endBinding: { elementId: 'gateway' } }
  ];

  const mermaidText = exportToMermaid(seqElements);
  assert(mermaidText.startsWith('sequenceDiagram'), 'Output must start with sequenceDiagram');
  assert(mermaidText.includes('autonumber'), 'Output must include autonumber');
  assert(mermaidText.includes('actor') || mermaidText.includes('participant'), 'Output must declare participants');
  assert(mermaidText.includes('POST /orders'), 'Output must contain message labels');
  assert(mermaidText.includes('-->>') || mermaidText.includes('->>'), 'Output must include sequence arrow syntax');

  console.log('✅ TC-S4-MRM-01: Export Diagram to Mermaid Syntax passed.');
  passedCount++;
}

// TC-S4-MRM-02: Import Diagram from Mermaid Text
{
  const mermaidInput = `graph LR
    A[Client] --> B[API Gateway]
    B --> C[(Postgres DB)]
  `;

  const result = importFromMermaid(mermaidInput);
  assert.strictEqual(result.success, true, 'Import must succeed for valid flowchart markup');
  assert(result.elements && result.elements.length >= 5, 'Must generate at least 3 nodes and 2 arrows');

  const clientNode = result.elements.find(e => e.title === 'Client');
  const gatewayNode = result.elements.find(e => e.title === 'API Gateway');
  const dbNode = result.elements.find(e => e.title === 'Postgres DB');

  assert(clientNode, 'Must find Client node');
  assert(gatewayNode, 'Must find API Gateway node');
  assert(dbNode, 'Must find Postgres DB node');
  assert.strictEqual(dbNode.badge, 'DATABASE', 'DB node with [(...)] syntax must have DATABASE badge');

  // Verify non-overlapping coordinates (Auto-layout)
  assert(clientNode.x < gatewayNode.x, 'Client X must be to the left of Gateway X in LR layout');
  assert(gatewayNode.x < dbNode.x, 'Gateway X must be to the left of DB X in LR layout');

  console.log('✅ TC-S4-MRM-02: Import Diagram from Mermaid Text passed.');
  passedCount++;
}

// TC-S4-MRM-03: Mermaid Error Handling for Malformed Input
{
  const brokenInput = `this is completely invalid mermaid syntax\n%%% random rubbish :::`;
  const result = importFromMermaid(brokenInput);

  assert.strictEqual(result.success, false, 'Must report failure on malformed input');
  assert(result.error && result.error.includes('Unsupported diagram type'), 'Error message must be informative');

  const brokenFlowchart = `graph TD\n  ValidNode\n  Broken Line [[[[[]]]]`;
  const result2 = importFromMermaid(brokenFlowchart);
  assert.strictEqual(result2.success, false, 'Must fail on broken syntax inside flowchart');
  assert(result2.error && result2.error.includes('Syntax error'), 'Must report Syntax error');

  console.log('✅ TC-S4-MRM-03: Mermaid Error Handling for Malformed Input passed.');
  passedCount++;
}

// ============================================================================
// Suite 4.3: Security & Input Hardening (`SEC-S4`)
// ============================================================================
console.log('--- Suite 4.3: Security & Input Hardening (SEC-S4-01 & SEC-S4-02) ---');

// SEC-S4-01: SQL Identifier Sanitization & Injection Prevention
{
  const maliciousTable = {
    id: 'tbl-hack',
    type: 'erd-table',
    tableName: 'users"; DROP TABLE accounts; --',
    columns: [
      { key: 'PK', isPk: true, name: 'id"; DELETE FROM users; --', type: 'uuid' },
      { key: '', name: 'data', type: 'text' }
    ]
  };

  const sql = generateTableDdl(maliciousTable, { dialect: 'postgres' });
  
  // Double quotes inside identifiers must be escaped by doubling (" -> "")
  // and the identifier must remain enclosed in quotes so it cannot break out.
  assert(sql.includes('"users""; DROP TABLE accounts; --"'), 'Must escape internal quotes as "" in table name');
  assert(sql.includes('"id""; DELETE FROM users; --"'), 'Must escape internal quotes as "" in column name');
  assert(!sql.includes('\nDROP TABLE accounts;'), 'Must never execute raw injected SQL statements');

  console.log('✅ SEC-S4-01: SQL Identifier Sanitization & Injection Prevention passed.');
  passedCount++;
}

// SEC-S4-02: Mermaid AST Sanitization & Markdown Injection Defense
{
  const maliciousElements = [
    {
      id: 'n1',
      type: 'node',
      title: 'Service <script>alert(1)</script> [1] --> Node(B);',
      badge: 'SERVICE',
      x: 100,
      y: 100
    }
  ];

  const exported = exportToMermaid(maliciousElements);
  
  assert(!exported.includes('<script>'), 'Must escape HTML tags in Mermaid labels');
  assert(exported.includes('&lt;script&gt;'), 'Must entity encode <script> tags');
  assert(!exported.includes('[1]'), 'Must encode brackets so they do not break Mermaid shape AST');

  console.log('✅ SEC-S4-02: Mermaid AST Sanitization & Markdown Injection Defense passed.');
  passedCount++;
}

console.log('\n=========================================================================');
console.log(`🎉 All ${passedCount} / ${totalCount} Sprint 4 Test Scenarios Passed (100% SUCCESS)`);
console.log('=========================================================================\n');
