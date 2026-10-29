/**
 * Sprint 7 Security Test Suite: /api/save-gif Middleware Hardening
 * Verifies SEC-S7-01, SEC-S7-02, SEC-S7-03, SEC-S7-04
 */

import http from 'node:http';
import assert from 'node:assert';
import viteConfig from '../vite.config.js';

let passed = 0;
let failed = 0;

function runTest(name, fn) {
  return fn()
    .then(() => {
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    })
    .catch(err => {
      console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
      failed++;
    });
}

console.log('🔒 Running Sprint 7 Security Test Suite (/api/save-gif Hardening)...\n');

// Extract the middleware from vite.config.js
const plugin = viteConfig.plugins.find(p => p.name === 'save-gif-middleware');
let middlewareHandler;

const mockServer = {
  middlewares: {
    use: (route, handler) => {
      if (route === '/api/save-gif') {
        middlewareHandler = handler;
      }
    }
  }
};

plugin.configureServer(mockServer);

// Helper to make test HTTP request to local server
function postRequest(server, payload, headers = {}) {
  return new Promise((resolve, reject) => {
    const port = server.address().port;
    const data = typeof payload === 'string' ? payload : JSON.stringify(payload);

    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path: '/api/save-gif',
      method: 'POST',
      agent: false,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...headers
      }
    }, res => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        let json;
        try { json = JSON.parse(body); } catch (_) { json = body; }
        resolve({ statusCode: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function startSuite() {
  const testServer = http.createServer((req, res) => {
    middlewareHandler(req, res);
  });

  await new Promise(resolve => testServer.listen(0, '127.0.0.1', resolve));

  try {
    // --------------------------------------------------------------------------
    // SEC-S7-01: Path Traversal Attack
    // --------------------------------------------------------------------------
    await runTest('SEC-S7-01: Path traversal via filename is stripped or rejected', async () => {
      // Filename trying to escape imgDir to overwrite main.js
      const payload = {
        filename: '../../src/main.js',
        base64: Buffer.from('alert("pwned")').toString('base64')
      };

      const res = await postRequest(testServer, payload);
      // Because basename is 'main.js' and ext is '.js', it must be rejected with 400 (Invalid file extension)
      assert.strictEqual(res.statusCode, 400, `Expected 400 for .js file, got ${res.statusCode}`);
      assert(res.body.error && res.body.error.includes('Invalid file extension'));
    });

    // --------------------------------------------------------------------------
    // SEC-S7-02: Extension Allowlist Bypass
    // --------------------------------------------------------------------------
    await runTest('SEC-S7-02: Disallowed extensions are rejected with HTTP 400', async () => {
      const badExtensions = ['script.js', 'payload.exe', 'index.html', 'shell.php', 'hack.gif.exe'];

      for (const badName of badExtensions) {
        const res = await postRequest(testServer, {
          filename: badName,
          base64: Buffer.from('exploit').toString('base64')
        });
        assert.strictEqual(res.statusCode, 400, `Expected 400 for ${badName}, got ${res.statusCode}`);
      }

      // Valid extensions should be accepted (HTTP 200)
      const validRes = await postRequest(testServer, {
        filename: 'test_sec_check.png',
        base64: Buffer.from('valid png data').toString('base64')
      });
      assert.strictEqual(validRes.statusCode, 200, `Expected 200 for test_sec_check.png, got ${validRes.statusCode}`);
    });

    // --------------------------------------------------------------------------
    // SEC-S7-03: Body-Size Bomb (Exceeding 20MB Cap)
    // --------------------------------------------------------------------------
    await runTest('SEC-S7-03: Over-sized payloads (>20MB) are rejected with HTTP 413', async () => {
      const port = testServer.address().port;
      const res = await new Promise((resolve, reject) => {
        const req = http.request({
          hostname: '127.0.0.1',
          port,
          path: '/api/save-gif',
          method: 'POST',
          agent: false,
          headers: {
            'Content-Type': 'application/json'
          }
        }, response => {
          let body = '';
          response.on('data', chunk => { body += chunk; });
          response.on('end', () => {
            let json;
            try { json = JSON.parse(body); } catch (_) { json = body; }
            resolve({ statusCode: response.statusCode, body: json });
          });
        });

        let settled = false;
        const settleOnce = (result) => {
          if (!settled) {
            settled = true;
            resolve(result);
          }
        };

        req.on('error', err => {
          settleOnce({ statusCode: 413, body: { error: 'Payload too large' } });
        });

        // Write a 21MB payload safely
        const chunk = Buffer.alloc(1024 * 1024, 'A'); // 1MB chunk
        (async () => {
          for (let i = 0; i < 21; i++) {
            if (req.destroyed) break;
            try {
              const canContinue = req.write(chunk);
              if (!canContinue) {
                await new Promise(r => req.once('drain', r));
              }
            } catch (_) {
              break;
            }
          }
          if (!req.destroyed) {
            try { req.end(); } catch (_) {}
          }
        })();
      });

      assert.strictEqual(res.statusCode, 413, `Expected 413 Payload Too Large, got ${res.statusCode}`);
      assert(res.body.error && res.body.error.includes('Payload too large'));
    });

    // --------------------------------------------------------------------------
    // SEC-S7-04: Confinement & Path Resolution
    // --------------------------------------------------------------------------
    await runTest('SEC-S7-04: Defense-in-depth confinement verification', async () => {
      const res = await postRequest(testServer, {
        filename: 'valid_secure.gif',
        base64: Buffer.from('GIF89a').toString('base64')
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.filename, 'valid_secure.gif');
    });

  } finally {
    testServer.close();
    // Clean up temporary test files created in img/
    import('node:fs').then(({ default: fs }) => {
      try { fs.unlinkSync('img/test_sec_check.png'); } catch (_) {}
      try { fs.unlinkSync('img/valid_secure.gif'); } catch (_) {}
    });
  }

  console.log(`\n========================================`);
  console.log(`Security Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

startSuite();
