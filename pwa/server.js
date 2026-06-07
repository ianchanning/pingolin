import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 5173;

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.mjs': 'text/javascript',
    '.wasm': 'application/wasm',
    '.css': 'text/css',
    '.ico': 'image/x-icon',
    '.png': 'image/png',
    '.json': 'application/json',
    '.webmanifest': 'application/manifest+json'
};

const server = http.createServer((req, res) => {
    // Basic SPA routing: if file doesn't exist, serve index.html
    let urlPath = req.url.split('?')[0];
    let filePath = path.join(__dirname, 'public', urlPath === '/' ? 'index.html' : urlPath);
    
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(__dirname, 'public', 'index.html');
    }

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'text/plain';

    // MANDATORY HEADERS FOR OPFS (Steel & Stone Durability)
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', contentType);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.statusCode = 500;
            res.end(`Ritual Error: ${err.code}`);
        } else {
            res.end(data);
        }
    });
});

server.listen(PORT, () => {
    console.log(`[Pingolin Server] Awoken at http://localhost:${PORT}`);
    console.log(`[Pingolin Server] Cross-Origin Isolation: ENABLED`);
});
