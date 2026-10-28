/**
 * Unit Test Suite for Orthogonal Stepped (Elbow) Flow Arrow
 */

import assert from 'assert';
import {
  getOrthogonalArrowPoints,
  getOrthogonalWaypointHandles,
  getElementBounds,
  hitTest,
  normalizeElement
} from '../src/math.js';

console.log('Testing Orthogonal Stepped Flow Arrow Geometry & Interactions...');

// Test 1: getOrthogonalArrowPoints vertical-first (vertical distance >= horizontal distance)
const vertArrow = {
  id: 'arrow-1',
  type: 'arrow',
  routing: 'orthogonal',
  x: 100,
  y: 100,
  width: 200,
  height: 300,
  elbowRatio: 0.5
};

const vertPts = getOrthogonalArrowPoints(vertArrow);
assert.strictEqual(vertPts.length, 4, 'Should produce 4 orthogonal points');
assert.deepStrictEqual(vertPts[0], { x: 100, y: 100 }, 'p0 start point');
assert.deepStrictEqual(vertPts[1], { x: 100, y: 250 }, 'p1 stepped corner 1 (startY + dy * 0.5)');
assert.deepStrictEqual(vertPts[2], { x: 300, y: 250 }, 'p2 stepped corner 2 (endX, midY)');
assert.deepStrictEqual(vertPts[3], { x: 300, y: 400 }, 'p3 destination point (endX, endY)');
console.log('✓ Test 1 Passed: Vertical-first orthogonal points computed accurately');

// Test 2: Custom elbow ratio
const customRatioArrow = {
  ...vertArrow,
  elbowRatio: 0.25
};
const ratioPts = getOrthogonalArrowPoints(customRatioArrow);
assert.deepStrictEqual(ratioPts[1], { x: 100, y: 175 }, 'midY is at 25% of height');
assert.deepStrictEqual(ratioPts[2], { x: 300, y: 175 });
console.log('✓ Test 2 Passed: Custom elbowRatio adjusts middle segment');

// Test 3: Horizontal-first orientation
const horizArrow = {
  id: 'arrow-2',
  type: 'arrow',
  routing: 'orthogonal',
  elbowOrientation: 'horizontal',
  x: 50,
  y: 50,
  width: 400,
  height: 100,
  elbowRatio: 0.6
};
const horizPts = getOrthogonalArrowPoints(horizArrow);
assert.deepStrictEqual(horizPts[0], { x: 50, y: 50 });
assert.deepStrictEqual(horizPts[1], { x: 50 + 400 * 0.6, y: 50 }); // x: 290, y: 50
assert.deepStrictEqual(horizPts[2], { x: 290, y: 150 });
assert.deepStrictEqual(horizPts[3], { x: 450, y: 150 });
console.log('✓ Test 3 Passed: Horizontal-first orthogonal routing verified');

// Test 4: getOrthogonalWaypointHandles
const handles = getOrthogonalWaypointHandles(vertArrow);
assert.strictEqual(handles.length, 5, 'Should return start, seg1, mid, seg2, end handles');
assert.strictEqual(handles[0].id, 'start');
assert.strictEqual(handles[1].id, 'seg1');
assert.strictEqual(handles[2].id, 'mid');
assert.strictEqual(handles[3].id, 'seg2');
assert.strictEqual(handles[4].id, 'end');
assert.deepStrictEqual(handles[2], { id: 'mid', x: 200, y: 250, type: 'elbow' });
console.log('✓ Test 4 Passed: 3 segment waypoint handles correctly positioned');

// Test 5: getElementBounds for orthogonal arrow
const bounds = getElementBounds(vertArrow);
assert.ok(bounds.x <= 100 - 16, 'Bounds x encompasses start point');
assert.ok(bounds.y <= 100 - 16, 'Bounds y encompasses start point');
assert.ok(bounds.x + bounds.width >= 300 + 16, 'Bounds width covers end point');
assert.ok(bounds.y + bounds.height >= 400 + 16, 'Bounds height covers destination');
console.log('✓ Test 5 Passed: getElementBounds encompasses full orthogonal span');

// Test 6: hitTest along each of the 3 orthogonal segments
// Segment 1: (100, 100) -> (100, 250)
assert.strictEqual(hitTest(100, 180, vertArrow), true, 'Hit on segment 1');
// Segment 2: (100, 250) -> (300, 250)
assert.strictEqual(hitTest(200, 250, vertArrow), true, 'Hit on segment 2');
// Segment 3: (300, 250) -> (300, 400)
assert.strictEqual(hitTest(300, 320, vertArrow), true, 'Hit on segment 3');
// Miss point
assert.strictEqual(hitTest(150, 150, vertArrow), false, 'Miss point far from segments');
console.log('✓ Test 6 Passed: hitTest verifies all 3 orthogonal segments');

// Test 7: normalizeElement preserves elbow-arrow
const normEl = normalizeElement({
  id: 'elbow-test',
  type: 'elbow-arrow',
  x: 200,
  y: 300,
  width: -100,
  height: -150
});
assert.strictEqual(normEl.width, -100, 'Width not flipped for elbow-arrow');
assert.strictEqual(normEl.height, -150, 'Height not flipped for elbow-arrow');
console.log('✓ Test 7 Passed: normalizeElement preserves directional coordinates');

console.log('\nAll Orthogonal Stepped Flow Arrow tests passed successfully! 🎉');
