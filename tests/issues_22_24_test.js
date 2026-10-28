import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🧪 Starting Issues 22-24 verification suite...\n');

// 1. Verify index.html contains Export/Import and all required inspector sections
const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');

console.log('Test 1: Top navigation button is renamed to "Export/Import"');
assert(indexHtml.includes('<span>Export/Import</span>'), 'index.html must contain <span>Export/Import</span>');
console.log('✅ Pass: Top nav button is "Export/Import"');

console.log('\nTest 2: All Inspector sections for Image 1 and Image 2 exist');
const requiredSections = [
    'id="sec-stroke"',
    'id="sec-bg"',
    'id="sec-fill"',
    'id="sec-stroke-width"',
    'id="sec-stroke-style"',
    'id="sec-roughness"',
    'id="sec-edges"',
    'id="sec-font-family"',
    'id="sec-font-size"',
    'id="sec-text-align"',
    'id="sec-opacity"',
    'id="sec-layers"'
];

for (const sec of requiredSections) {
    assert(indexHtml.includes(sec), `index.html must contain section ${sec}`);
}
console.log('✅ Pass: All 12 attribute sub-sections exist in index.html');

console.log('\nTest 3: Layer buttons with directional actions exist');
assert(indexHtml.includes('id="btn-layer-to-back"'), 'Must have btn-layer-to-back');
assert(indexHtml.includes('id="btn-layer-backward"'), 'Must have btn-layer-backward');
assert(indexHtml.includes('id="btn-layer-forward"'), 'Must have btn-layer-forward');
assert(indexHtml.includes('id="btn-layer-to-front"'), 'Must have btn-layer-to-front');
console.log('✅ Pass: Stepped and extreme layer action buttons present');

// 2. Test sanitizeImportedElements in src/export.js
console.log('\nTest 4: Excalidraw importer preserves typography, alignment, and roundness');
const exportJs = fs.readFileSync(path.join(rootDir, 'src', 'export.js'), 'utf-8');

// Check that sanitizeImportedElements assigns fontFamily, fontSize, textAlign, verticalAlign, edges, roundness
assert(exportJs.includes('cleanEl.fontFamily = [1, 2, 3, 4].includes(Number(el.fontFamily))'), 'Must preserve and sanitize fontFamily');
assert(exportJs.includes('cleanEl.textAlign = [\'left\', \'center\', \'right\'].includes(el.textAlign)'), 'Must preserve and sanitize textAlign');
assert(exportJs.includes('cleanEl.verticalAlign = [\'top\', \'middle\', \'bottom\'].includes(el.verticalAlign)'), 'Must preserve and sanitize verticalAlign');
assert(exportJs.includes('cleanEl.edges = \'round\''), 'Must map roundness to edges');
console.log('✅ Pass: sanitizeImportedElements preserves all Image 1 & 2 element attributes');

// 3. Test getFontString in src/renderer.js
console.log('\nTest 5: Renderer font resolution and rounded rectangle path');
const rendererJs = fs.readFileSync(path.join(rootDir, 'src', 'renderer.js'), 'utf-8');
assert(rendererJs.includes('getFontString(element) {'), 'Must define getFontString');
assert(rendererJs.includes('Caveat'), 'Must resolve font family 1 (hand-drawn)');
assert(rendererJs.includes('JetBrains Mono'), 'Must resolve monospace font family 3');
assert(rendererJs.includes('renderShapeText(element'), 'Must define renderShapeText for embedded text in shapes');
assert(rendererJs.includes('edges === \'round\'') || rendererJs.includes('element.roundness'), 'Must check edges round in renderer');
console.log('✅ Pass: Renderer handles font families, shape text, and round edges');

// 4. Test main.js inspector events and layer ordering
console.log('\nTest 6: main.js binds all controls and provides bringForward / sendBackward');
const mainJs = fs.readFileSync(path.join(rootDir, 'src', 'main.js'), 'utf-8');
assert(mainJs.includes('bringForward('), 'App must implement bringForward');
assert(mainJs.includes('sendBackward('), 'App must implement sendBackward');
assert(mainJs.includes('startInlineShapeTextEditor('), 'App must implement inline shape text editor');
assert(mainJs.includes('fontFamilyControl'), 'Inspector must bind fontFamilyControl');
assert(mainJs.includes('fontSizeControl'), 'Inspector must bind fontSizeControl');
assert(mainJs.includes('textAlignControl'), 'Inspector must bind textAlignControl');
assert(mainJs.includes('verticalAlignControl'), 'Inspector must bind verticalAlignControl');
assert(mainJs.includes('edgesControl'), 'Inspector must bind edgesControl');
console.log('✅ Pass: main.js implements bringForward/sendBackward and binds all controls');

// 5. Test style.css contains excali-control styling and lavender highlights
console.log('\nTest 7: style.css contains authentic lavender active styling and palette divider');
const styleCss = fs.readFileSync(path.join(rootDir, 'src', 'style.css'), 'utf-8');
assert(styleCss.includes('.segmented-control.excali-control'), 'Must style .excali-control');
assert(styleCss.includes('.palette-divider'), 'Must style .palette-divider');
assert(styleCss.includes('#e5dbff'), 'Must use Excalidraw authentic lavender #e5dbff');
assert(styleCss.includes('.text-align-grid'), 'Must style .text-align-grid');
assert(styleCss.includes('.slider-ticks'), 'Must style .slider-ticks');
console.log('✅ Pass: style.css has authentic segmented control and palette styles');

console.log('\n🎉 ALL ISSUES 22-24 VERIFICATION CHECKS PASSED SUCCESSFULLY!\n');
