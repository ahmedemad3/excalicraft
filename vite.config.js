import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    {
      name: 'save-gif-middleware',
      configureServer(server) {
        server.middlewares.use('/api/save-gif', (req, res) => {
          if (req.method === 'POST') {
            const MAX_BODY_SIZE = 20 * 1024 * 1024; // 20MB limit
            let body = '';
            let exceeded = false;

            req.on('data', chunk => {
              if (exceeded) return;
              body += chunk;
              if (body.length > MAX_BODY_SIZE) {
                exceeded = true;
                res.statusCode = 413;
                res.setHeader('Connection', 'close');
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Payload too large. Maximum size is 20MB.' }));
                req.destroy();
              }
            });

            req.on('end', () => {
              if (exceeded) return;
              try {
                const { filename, base64 } = JSON.parse(body);

                if (!filename || typeof filename !== 'string') {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Missing or invalid filename.' }));
                  return;
                }

                // Strip directory traversal sequences
                const safeName = path.basename(filename);

                // Allowlist extensions
                const allowedExts = ['.gif', '.png'];
                const ext = path.extname(safeName).toLowerCase();
                if (!allowedExts.includes(ext)) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Invalid file extension. Only .gif and .png are allowed.' }));
                  return;
                }

                const imgDir = path.resolve(__dirname, 'img');
                if (!fs.existsSync(imgDir)) {
                  fs.mkdirSync(imgDir, { recursive: true });
                }

                const targetFile = path.resolve(imgDir, safeName);

                // Confinement check (defense-in-depth)
                if (!targetFile.startsWith(imgDir)) {
                  res.statusCode = 403;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Access denied: Directory traversal detected.' }));
                  return;
                }

                const buffer = Buffer.from(base64 || '', 'base64');
                fs.writeFileSync(targetFile, buffer);
                console.log(`[ViteAPI] Successfully saved ${targetFile} (${buffer.length} bytes)`);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, filename: safeName, size: buffer.length }));
              } catch (err) {
                console.error('[ViteAPI] Error saving file:', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message }));
              }
            });
          } else {
            res.statusCode = 405;
            res.end();
          }
        });
      }
    }
  ]
});
