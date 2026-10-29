/**
 * Master Test Runner for Excalicraft
 * Runs all unit, integration, and security test suites sequentially.
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testSuites = [
  'sprint3_test.js',
  'sprint4_test.js',
  'issues_verification_test.js',
  'issues_17_21_test.js',
  'issues_22_24_test.js',
  'issues_25_26_test.js',
  'issues_30_32_test.js',
  'elbow_arrow_test.js',
  'image_ctrls_test.js',
  'sprint7_test.js',
  'sprint7_security_test.js'
];

console.log('================================================================');
console.log(`🧪 Excalicraft Master Test Suite (${testSuites.length} Test Suites)`);
console.log('================================================================\n');

let failedSuites = [];

for (const suite of testSuites) {
  const suitePath = path.join(__dirname, suite);
  console.log(`\n▶️  Executing ${suite}...`);
  console.log('----------------------------------------------------------------');
  const result = spawnSync(process.execPath, [suitePath], {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });

  if (result.status !== 0) {
    console.error(`❌ Suite ${suite} exited with code ${result.status}`);
    failedSuites.push(suite);
  } else {
    console.log(`✔️  Suite ${suite} passed cleanly.`);
  }
}

console.log('\n================================================================');
console.log('🏁 Test Run Summary:');
console.log(`Total Suites:  ${testSuites.length}`);
console.log(`Passed Suites: ${testSuites.length - failedSuites.length}`);
console.log(`Failed Suites: ${failedSuites.length}`);
console.log('================================================================');

if (failedSuites.length > 0) {
  console.error(`\n❌ Failed suites: ${failedSuites.join(', ')}`);
  process.exit(1);
} else {
  console.log('\n🎉 ALL TEST SUITES PASSED CLEANLY! (100% SUCCESS)\n');
  process.exit(0);
}
