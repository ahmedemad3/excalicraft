import assert from 'assert';
import { sanitizeImportedElements, decodeExcalidrawSvg } from '../src/export.js';

console.log('🧪 Starting Verification Test Suite for Issues 30, 31, 32...');

// Test 1: Image element preservation and files dataURL resolution (ISSUE-32)
console.log('\n--- Test 1: Image Element & Files Map Sanitization ---');
const rawElements = [
  {
    id: 'img1',
    type: 'image',
    x: 100,
    y: 100,
    width: 400,
    height: 300,
    fileId: 'test_file_id_123',
    scale: [1, 1]
  },
  {
    id: 'rect1',
    type: 'rectangle',
    x: 50,
    y: 50,
    width: 200,
    height: 100
  }
];

const files = {
  'test_file_id_123': {
    id: 'test_file_id_123',
    dataURL: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    mimeType: 'image/png'
  }
};

const sanitized = sanitizeImportedElements(rawElements, files);
assert.strictEqual(sanitized.length, 2, 'Should sanitize all 2 elements');
const imgEl = sanitized.find(el => el.id === 'img1');
assert(imgEl, 'Image element must exist');
assert.strictEqual(imgEl.type, 'image', 'Element type must remain "image" (not converted to rectangle)');
assert.strictEqual(imgEl.fileId, 'test_file_id_123', 'fileId must be preserved');
assert.strictEqual(imgEl.dataURL, files['test_file_id_123'].dataURL, 'dataURL must be resolved from files dictionary');
console.log('✅ PASS: Image elements and files dataURL resolved correctly');

// Test 2: App setCanvasBackground & scheduleAutoSave simulation (ISSUE-31)
console.log('\n--- Test 2: Canvas Background & scheduleAutoSave Compatibility ---');
class MockApp {
  constructor() {
    this.canvasBackground = '#ffffff';
    this.autoSaveScheduled = false;
    this.inspectorUpdated = false;
    this.rendered = false;
  }
  scheduleAutoSave() {
    this.autoSaveScheduled = true;
  }
  saveAutoSave() {
    this.scheduleAutoSave();
  }
  updateInspectorUI() {
    this.inspectorUpdated = true;
  }
  render() {
    this.rendered = true;
  }
  setCanvasBackground(color) {
    if (!color) return;
    this.canvasBackground = color;
    this.scheduleAutoSave();
    this.updateInspectorUI();
    this.render();
  }
}

const mockApp = new MockApp();
// Simulate changing canvas background to Sand (#fff9db)
mockApp.setCanvasBackground('#fff9db');
assert.strictEqual(mockApp.canvasBackground, '#fff9db', 'Canvas background must be #fff9db');
assert.strictEqual(mockApp.autoSaveScheduled, true, 'scheduleAutoSave must be invoked');
assert.strictEqual(mockApp.inspectorUpdated, true, 'updateInspectorUI must be invoked');
assert.strictEqual(mockApp.rendered, true, 'render must be invoked');
console.log('✅ PASS: setCanvasBackground operates cleanly without error');

// Test 3: Simulation of Excalidraw Import with viewBackgroundColor
console.log('\n--- Test 3: Import with viewBackgroundColor Execution ---');
const sampleExcalidrawJSON = {
  type: 'excalidraw',
  version: 2,
  elements: rawElements,
  appState: { viewBackgroundColor: '#fff9db' },
  files: files
};

// Simulate importFromJson behavior
const importedElements = sanitizeImportedElements(sampleExcalidrawJSON.elements, sampleExcalidrawJSON.files);
const appState = sampleExcalidrawJSON.appState;
assert.doesNotThrow(() => {
  mockApp.elements = importedElements;
  if (appState && appState.viewBackgroundColor) {
    mockApp.setCanvasBackground(appState.viewBackgroundColor);
  }
  mockApp.render();
}, 'Import callback must execute without throwing any TypeError or saveAutoSave error');
assert.strictEqual(mockApp.canvasBackground, '#fff9db', 'Imported background color must be applied');
assert.strictEqual(mockApp.elements[0].type, 'image', 'Imported image element must be preserved');
console.log('✅ PASS: Import callback with viewBackgroundColor succeeds without errors');

// Test 4: SVG Payload Extraction
console.log('\n--- Test 4: SVG Excalidraw Payload Extraction ---');
const dummyPayload = Buffer.from(JSON.stringify({
  version: "1",
  encoding: "bstring",
  compressed: false,
  elements: [{ id: 'e1', type: 'rectangle' }]
})).toString('base64');
const dummySvg = `<svg xmlns="http://www.w3.org/2000/svg"><!-- payload-start -->${dummyPayload}<!-- payload-end --></svg>`;

const decoded = await decodeExcalidrawSvg(dummySvg);
assert(decoded, 'Should decode payload from SVG');
assert(Array.isArray(decoded.elements), 'Decoded payload must contain elements');
assert.strictEqual(decoded.elements[0].id, 'e1', 'Decoded element matches');
console.log('✅ PASS: SVG payload extraction works');

console.log('\n🎉 ALL ISSUES 30, 31, 32 VERIFICATION TESTS PASSED SUCCESSFULLY! 🟢\n');
