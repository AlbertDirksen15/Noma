import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';

export const DEFAULT_DESKTOP_PORT = 3847;
export const DESKTOP_HOST = '127.0.0.1';

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

const contentType = (filePath) => MIME_TYPES[filePath.slice(filePath.lastIndexOf('.'))] ?? 'application/octet-stream';

const safePath = (distDir, pathname) => {
  const root = resolve(distDir);
  const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
  const candidate = resolve(root, relative);
  return candidate === root || candidate.startsWith(`${root}${sep}`) ? candidate : null;
};

const sendFile = (response, filePath) => {
  response.writeHead(200, { 'Content-Type': contentType(filePath), 'Cache-Control': 'no-cache' });
  response.end(readFileSync(filePath));
};

export const createDesktopServer = (distDir) => createServer((request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
    const candidate = safePath(distDir, pathname);
    if (!candidate) {
      response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Forbidden');
      return;
    }
    if (existsSync(candidate) && statSync(candidate).isFile()) {
      sendFile(response, candidate);
      return;
    }
    if (pathname.includes('.')) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }
    const indexPath = resolve(distDir, 'index.html');
    if (!existsSync(indexPath)) throw new Error(`Build output not found: ${indexPath}`);
    sendFile(response, indexPath);
  } catch (error) {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(error instanceof Error ? error.message : 'Internal server error');
  }
});

export const startDesktopServer = ({ distDir = resolve(process.cwd(), 'dist'), port = DEFAULT_DESKTOP_PORT } = {}) => new Promise((resolveServer, reject) => {
  const tryPort = (candidate) => {
    const server = createDesktopServer(distDir);
    server.once('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        tryPort(candidate + 1);
        return;
      }
      reject(error);
    });
    server.listen(candidate, DESKTOP_HOST, () => resolveServer({ server, port: server.address().port }));
  };
  tryPort(port);
});

export const ensureDist = (distDir) => {
  const indexPath = resolve(distDir, 'index.html');
  if (!existsSync(indexPath)) throw new Error(`Build output is missing: ${indexPath}. Run npm run build first.`);
  return indexPath;
};

export const openBrowser = (url) => {
  const child = process.platform === 'win32'
    ? spawn('cmd.exe', ['/c', 'start', '', url], { detached: true, stdio: 'ignore' })
    : process.platform === 'darwin'
      ? spawn('open', [url], { detached: true, stdio: 'ignore' })
      : spawn('xdg-open', [url], { detached: true, stdio: 'ignore' });
  child.on('error', (error) => console.error(`Could not open browser automatically: ${error.message}`));
  child.unref();
};

const isMain = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  const portArg = process.argv.find((argument) => argument.startsWith('--port='));
  const distArg = process.argv.find((argument) => argument.startsWith('--dist='));
  const port = portArg ? Number(portArg.slice('--port='.length)) : Number(process.env.NOMA_PORT ?? DEFAULT_DESKTOP_PORT);
  const distDir = distArg ? resolve(distArg.slice('--dist='.length)) : resolve(process.cwd(), 'dist');
  const shouldOpen = process.argv.includes('--open');
  try { ensureDist(distDir); } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
  if (process.exitCode) process.exit();
  startDesktopServer({ distDir, port }).then(({ port: actualPort }) => {
    const url = `http://${DESKTOP_HOST}:${actualPort}`;
    console.log(`Noma desktop mode listening on ${url}`);
    if (actualPort !== port) console.log(`Port ${port} was busy; selected ${actualPort}`);
    if (shouldOpen) openBrowser(url);
  }).catch((error) => {
    console.error('Unable to start Noma desktop mode:', error);
    process.exitCode = 1;
  });
}
