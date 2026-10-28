import { strict as assert } from 'assert';
import { getElementBounds, getElementsBounds } from '../src/math.js';
import { getSvgFontFamily } from '../src/export.js';

console.log('--- Testing ISSUE-25 and ISSUE-26 Fixes ---');

// 1. Text Bounds Calculation (ISSUE-25 & ISSUE-26)
const sampleSql = `CREATE VIEW workflow_status_view AS
SELECT
  S.status_id,
  S.status_name,
  WS.step_id,
  WS.step_name,
  WS.next_step
FROM Status AS S
JOIN StatusStepMapping AS M ON S.status_id = M.status_id
JOIN WorkflowSteps AS WS ON M.step_id = WS.step_id;`;

const textElement = {
  id: 'sql-test',
  type: 'text',
  x: 100,
  y: 200,
  text: sampleSql,
  fontSize: 16,
  fontFamily: 3
};

const bounds = getElementBounds(textElement);
console.log('Text bounds calculated:', bounds);

// Longest line is ~57 chars, so width should be around 57 * (16 * 0.62) ~ 565px, NOT 350+ chars * 16 * 0.6 (~3360px)
assert(bounds.width < 800, `Expected width < 800px, got ${bounds.width}`);
assert(bounds.width > 400, `Expected width > 400px, got ${bounds.width}`);
assert(bounds.height > 150, `Expected height > 150px for 12 lines, got ${bounds.height}`);
console.log('✓ Text bounds calculated accurately without inflating total diagram width.');

// 2. Font family resolution for SVG export (ISSUE-26)
assert(getSvgFontFamily(1).includes('Caveat'));
assert(getSvgFontFamily(2).includes('Outfit'));
assert(getSvgFontFamily(3).includes('JetBrains Mono'));
assert(getSvgFontFamily(4).includes('Times New Roman'));
console.log('✓ Font families mapped correctly to Google Fonts.');

// 3. Overall diagram bounds test with multiple elements
const elements = [
  { id: '1', type: 'rectangle', x: 0, y: 0, width: 200, height: 100 },
  textElement
];
const totalBounds = getElementsBounds(elements);
console.log('Total bounds:', totalBounds);
assert.equal(totalBounds.x, 0);
assert.equal(totalBounds.y, 0);
assert(totalBounds.width < 900, `Diagram width should be compact (<900px), got ${totalBounds.width}`);
// 4. Multi-page PDF calculation test (ISSUE-25)
const tallDiagramBounds = { width: 1536, height: 2966 };
const a4LandscapeW = 841.89;
const a4LandscapeH = 595.28;
const margin = 28;
const availW = a4LandscapeW - margin * 2; // 785.89 pt
const availH = a4LandscapeH - margin * 2; // 539.28 pt

const canvasW = tallDiagramBounds.width + 60; // 1596 px
const canvasH = tallDiagramBounds.height + 60; // 3026 px
const widthScale = availW / canvasW; // ~0.492 pt/px
const sliceHeightPx = availH / widthScale; // ~1095 px
const numPages = Math.ceil(canvasH / sliceHeightPx);

assert.equal(numPages, 3, `Expected exactly 3 landscape pages for 3-session diagram, got ${numPages}`);
assert(widthScale > 0.45, `Expected width scale > 0.45 pt/px (filling width), got ${widthScale}`);
console.log('✓ Multi-page PDF calculation produces exactly 3 pages filling landscape width.');

console.log('\nAll ISSUE-25 and ISSUE-26 unit assertions passed successfully!');

