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
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const { filename, base64 } = JSON.parse(body);
                const imgDir = path.resolve(__dirname, 'img');
                if (!fs.existsSync(imgDir)) {
                  fs.mkdirSync(imgDir, { recursive: true });
                }
                const buffer = Buffer.from(base64, 'base64');
                const targetFile = path.join(imgDir, filename);
                fs.writeFileSync(targetFile, buffer);
                console.log(`[ViteAPI] Successfully saved ${targetFile} (${buffer.length} bytes)`);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, filename, size: buffer.length }));
              } catch (err) {
                console.error('[ViteAPI] Error saving file:', err);
                res.statusCode = 500;
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
