import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const args = process.argv.slice(2);
const port = Number(args[args.indexOf('--port') + 1]) || Number(process.env.PORT) || 5173;
const host = args.includes('--host') ? (args[args.indexOf('--host') + 1] || '0.0.0.0') : '127.0.0.1';
const root = resolve('.');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const path = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!path.startsWith(root + sep) || pathname.split('/').some(part => part.startsWith('.')) || !types[extname(path)]) {
      res.writeHead(404); res.end('Not found'); return;
    }
    const content = await readFile(path);
    res.writeHead(200, { 'Content-Type': `${types[extname(path)]}; charset=utf-8`, 'Cache-Control': 'no-store' });
    res.end(content);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, host, () => console.log(`Mini Crossword: http://${host}:${port}`));
