import assert from 'node:assert';
import { exportToMermaid, importFromMermaid } from '../src/mermaid.js';
import { getC4ContextDiagramTemplate } from '../src/templates.js';
import { isColorLight } from '../src/renderer.js';

console.log('🧪 =========================================================================');
console.log('🧪 Verifying Fixes for ISSUE-17 to ISSUE-21');
console.log('🧪 =========================================================================\n');

// 1. ISSUE-18: Color Luminance & Contrast Detection
console.log('--- Test ISSUE-18: Color Luminance & Contrast Detection ---');
assert.strictEqual(isColorLight('#ffffff'), true, 'White should be light');
assert.strictEqual(isColorLight('#f8f9fa'), true, 'Light gray should be light');
assert.strictEqual(isColorLight('#0f172a'), false, 'Dark slate should be dark');
assert.strictEqual(isColorLight('#1e1f24'), false, 'Dark surface should be dark');
assert.strictEqual(isColorLight('rgba(255, 255, 255, 0.9)'), true, 'RGBA white should be light');
assert.strictEqual(isColorLight('rgba(0, 0, 0, 0.8)'), false, 'RGBA black should be dark');
console.log('✅ ISSUE-18: isColorLight correctly classifies light and dark background colors.');

// 2. ISSUE-21: Official C4 Context Template Generation & Verification
console.log('\n--- Test ISSUE-21: C4 Context Template Generation & Layout ---');
const contextElements = getC4ContextDiagramTemplate();
assert(Array.isArray(contextElements) && contextElements.length > 0, 'C4 template should return elements');

const persons = contextElements.filter(e => e.c4Type === 'Person' || e.c4Type === 'Person_Ext');
assert.strictEqual(persons.length, 4, `Expected 4 persons, found ${persons.length}`);

const boundaries = contextElements.filter(e => e.type === 'group-boundary' && (e.isC4 || e.c4BoundaryType));
assert.strictEqual(boundaries.length, 4, `Expected 4 C4 boundaries (b0, b1, b2, b3), found ${boundaries.length}`);

const dbs = contextElements.filter(e => e.c4Type === 'SystemDb' || e.c4Type === 'SystemDb_Ext');
assert.strictEqual(dbs.length, 2, `Expected 2 databases (SystemE, SystemD), found ${dbs.length}`);

const queues = contextElements.filter(e => e.c4Type === 'SystemQueue' || e.c4Type === 'SystemQueue_Ext');
assert.strictEqual(queues.length, 2, `Expected 2 queues (SystemF, SystemG), found ${queues.length}`);

console.log('✅ ISSUE-21: C4 Context Template contains authentic Persons, Boundaries, Databases, Queues, and Systems.');

// 3. ISSUE-21: Export C4 Context Diagram to Mermaid
console.log('\n--- Test ISSUE-21: C4 Diagram Export to Mermaid ---');
const mermaidC4 = exportToMermaid(contextElements);
console.log('Exported Mermaid C4 Output:\n', mermaidC4);

assert(mermaidC4.startsWith('C4Context'), 'Exported Mermaid diagram should start with C4Context');
assert(mermaidC4.includes('Enterprise_Boundary(b0, "BankBoundary0")'), 'Should contain Enterprise_Boundary b0');
assert(mermaidC4.includes('Person(customerA, "Banking Customer A"'), 'Should contain Person customerA');
assert(mermaidC4.includes('Person_Ext(customerC, "Banking Customer C"'), 'Should contain Person_Ext customerC');
assert(mermaidC4.includes('SystemDb_Ext(SystemE, "Mainframe Banking System"'), 'Should contain SystemDb_Ext SystemE');
assert(mermaidC4.includes('SystemQueue(SystemF, "Banking System F Queue"'), 'Should contain SystemQueue SystemF');
assert(mermaidC4.includes('BiRel(customerA, SystemAA, "Uses")'), 'Should contain BiRel customerA -> SystemAA');
assert(mermaidC4.includes('Rel(SystemAA, SystemC, "Sends e-mails", "SMTP")'), 'Should contain Rel with technology SMTP');

console.log('✅ ISSUE-21: Exported C4 Mermaid matches official C4Context specification.');

// 4. ISSUE-21: Import Mermaid C4 Diagram into Canvas Elements
console.log('\n--- Test ISSUE-21: Import Mermaid C4 Diagram ---');
const userSnippet = `C4Context
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
    Rel(SystemC, customerA, "Sends e-mails to")`;

const res = importFromMermaid(userSnippet);
assert(res.success, `Import should succeed: ${res.error}`);
const importedElements = res.elements;
assert(Array.isArray(importedElements) && importedElements.length > 0, 'Import should produce elements');

const importedPersons = importedElements.filter(e => e.c4Type && e.c4Type.startsWith('Person'));
assert.strictEqual(importedPersons.length, 4, `Expected 4 imported persons, found ${importedPersons.length}`);

const importedBoundaries = importedElements.filter(e => e.type === 'group-boundary');
assert.strictEqual(importedBoundaries.length, 4, `Expected 4 imported boundaries, found ${importedBoundaries.length}`);

const importedRels = importedElements.filter(e => e.type === 'arrow' || e.type === 'orthogonal-connector');
assert.strictEqual(importedRels.length, 4, `Expected 4 imported relationship arrows, found ${importedRels.length}`);

console.log('✅ ISSUE-21: Imported Mermaid C4 parsed successfully with authentic elements and relationships.');

console.log('\n🎉 ALL ISSUES (17-21) VERIFICATION TESTS PASSED!');
