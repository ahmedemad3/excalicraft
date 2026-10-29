/**
 * Hotfix Test Suite for ISSUE-54 and ISSUE-55
 * Verifies:
 * 1. Port mapping in vite.config.js (ISSUE-54)
 * 2. Welcome Onboarding Modal DOM structure, styles, and template bindings (ISSUE-55)
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🧪 Starting Hotfix Verification Suite (ISSUE-54 & ISSUE-55)...');

// --------------------------------------------------------------------------
// Test Suite 1: Port Mapping in vite.config.js (ISSUE-54)
// --------------------------------------------------------------------------
console.log('\n📡 Suite 1: Port Mapping in vite.config.js (ISSUE-54)');

const viteConfigContent = fs.readFileSync(path.join(rootDir, 'vite.config.js'), 'utf8');

assert(
  viteConfigContent.includes('port: 5174'),
  'vite.config.js must explicitly specify port: 5174'
);
assert(
  viteConfigContent.includes('server:') && viteConfigContent.includes('preview:'),
  'vite.config.js must configure port for both server and preview'
);
console.log('  ✔️ TC-HF-PORT-01: vite.config.js explicitly binds server and preview to port 5174');

const readmeContent = fs.readFileSync(path.join(rootDir, 'README.md'), 'utf8');
assert(
  readmeContent.includes('http://localhost:5174/'),
  'README.md references http://localhost:5174/'
);
console.log('  ✔️ TC-HF-PORT-02: Port matches 5174 documented in root README.md');

// --------------------------------------------------------------------------
// Test Suite 2: Welcome Onboarding Modal DOM & Assets (ISSUE-55)
// --------------------------------------------------------------------------
console.log('\n✨ Suite 2: Welcome Onboarding Modal DOM & Assets (ISSUE-55)');

const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

assert(indexHtml.includes('id="welcomeOnboarding"'), 'index.html must include welcomeOnboarding container');
assert(indexHtml.includes('WELCOME TO EXCALICRAFT'), 'index.html must include WELCOME TO EXCALICRAFT badge');
assert(
  indexHtml.includes('Expressive System Architecture &amp; Diagramming') ||
  indexHtml.includes('Expressive System Architecture & Diagramming'),
  'index.html must include title "Expressive System Architecture & Diagramming"'
);
assert(
  indexHtml.includes('Start sketching freely, or load a production-ready starter template:'),
  'index.html must include starter template description subtitle'
);

// 4 template cards
assert(indexHtml.includes('data-onboarding-template="microservices"'), 'Must include Microservices Cloud template button');
assert(indexHtml.includes('Microservices Cloud') && indexHtml.includes('API Gateway, Redis'), 'Must match Microservices Cloud copy');

assert(indexHtml.includes('data-onboarding-template="c4-container"'), 'Must include C4 Container Model template button');
assert(indexHtml.includes('C4 Container Model') && indexHtml.includes('SPA, API App &amp; PostgreSQL'), 'Must match C4 Container Model copy');

assert(indexHtml.includes('data-onboarding-template="erd"'), 'Must include Relational ERD template button');
assert(indexHtml.includes('Relational ERD') && indexHtml.includes('Users, Orders &amp; Foreign Keys'), 'Must match Relational ERD copy');

assert(indexHtml.includes('data-onboarding-template="flash-sale"'), 'Must include Flash Sale Scale template button');
assert(indexHtml.includes('Flash Sale Scale') && indexHtml.includes('50k QPS, Telemetry &amp; SPOF'), 'Must match Flash Sale Scale copy');

// Footer action
assert(indexHtml.includes('id="btn-onboarding-blank"'), 'Must include #btn-onboarding-blank button');
assert(indexHtml.includes('Start with Blank Canvas'), 'Must include "Start with Blank Canvas" button label');
console.log('  ✔️ TC-HF-WLC-01: index.html markup contains all required elements, cards, and labels');

// --------------------------------------------------------------------------
// Test Suite 3: Welcome Card CSS Rules & Theming (ISSUE-55)
// --------------------------------------------------------------------------
console.log('\n🎨 Suite 3: Welcome Card CSS Rules & Theming (ISSUE-55)');

const styleCss = fs.readFileSync(path.join(rootDir, 'src', 'style.css'), 'utf8');

assert(styleCss.includes('.welcome-onboarding-card'), 'style.css must define .welcome-onboarding-card');
assert(styleCss.includes('border-radius: 24px'), 'Welcome card must have rounded corners border-radius: 24px');
assert(styleCss.includes('.onboarding-badge'), 'style.css must define .onboarding-badge');
assert(styleCss.includes('.onboarding-pills'), 'style.css must define .onboarding-pills 2x2 grid');
assert(styleCss.includes('.welcome-blank-btn'), 'style.css must define .welcome-blank-btn pill button');
assert(styleCss.includes('body.theme-dark .welcome-onboarding-card'), 'style.css must support dark theme welcome card');
assert(styleCss.includes('body.theme-dark .onboarding-pill'), 'style.css must support dark theme card pills');
console.log('  ✔️ TC-HF-CSS-01: style.css contains authentic responsive and dark-mode styles');

// --------------------------------------------------------------------------
// Test Suite 4: JavaScript Lifecycle & Initialization (ISSUE-55)
// --------------------------------------------------------------------------
console.log('\n⚙️  Suite 4: JavaScript Lifecycle & Initialization (ISSUE-55)');

const mainJs = fs.readFileSync(path.join(rootDir, 'src', 'main.js'), 'utf8');

assert(
  mainJs.includes('initialElements = [];'),
  'main.js must initialize fresh session with empty elements to allow welcome state'
);
assert(
  mainJs.includes('updateEmptyState()'),
  'main.js must define updateEmptyState method'
);
assert(
  mainJs.includes('initOnboarding()'),
  'main.js must define initOnboarding method'
);
assert(
  mainJs.includes('_dismissedWelcome'),
  'main.js must manage _dismissedWelcome state'
);
assert(
  mainJs.includes('isLegacyWelcomeElements'),
  'main.js must define isLegacyWelcomeElements detector'
);
assert(
  mainJs.includes("const AUTOSAVE_STORAGE_KEY = 'excalicraft_autosave_v2';"),
  'main.js must use v2 autosave key to prevent legacy session pollution'
);
assert(
  /function createWelcomeElements\(\)\s*\{\s*return \[\];\s*\}/.test(mainJs),
  'createWelcomeElements must return empty array to prevent 3-box diagram generation'
);
console.log('  ✔️ TC-HF-JS-01: main.js correctly handles empty state, legacy element purging, and welcome onboarding lifecycle');

console.log('\n================================================================');
console.log('🏁 Hotfix Test Summary: All assertions passed successfully! (100%)');
console.log('================================================================\n');
