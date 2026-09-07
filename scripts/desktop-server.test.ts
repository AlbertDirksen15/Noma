import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { createServer, get } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { DEFAULT_DESKTOP_PORT, DESKTOP_HOST, ensureDist, isNomaDesktopServer, shutdownDesktopServer, startDesktopServer } from './desktop-server.mjs';

const runningServers: Array<{ close: () => void }> = [];
const temporaryDirectories: string[] = [];

const request = (url: string) => new Promise<{ status: number; body: string }>((resolve, reject) => {
  get(url, (response) => {
    let body = '';
    response.setEncoding('utf8');
    response.on('data', (chunk) => { body += chunk; });
    response.on('end', () => resolve({ status: response.statusCode ?? 0, body }));
  }).on('error', reject);
});

afterEach(() => {
  runningServers.splice(0).forEach((server) => server.close());
  temporaryDirectories.splice(0).forEach((directory) => rmSync(directory, { recursive: true, force: true }));
});

describe('desktop local server', () => {
  it('rejects files reached through a directory link outside dist', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'noma-links-'));
    temporaryDirectories.push(directory);
    const dist = join(directory, 'dist');
    const outside = join(directory, 'outside');
    mkdirSync(dist);
    mkdirSync(outside);
    writeFileSync(join(dist, 'index.html'), 'Noma');
    writeFileSync(join(outside, 'secret.txt'), 'private');
    symlinkSync(outside, join(dist, 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
    const started = await startDesktopServer({ distDir: dist, port: 0 });
    runningServers.push(started.server);
    const response = await request(`http://127.0.0.1:${started.port}/linked/secret.txt`);
    expect(response.status).toBe(403);
    expect(response.body).not.toContain('private');
  });

  it('rejects a directory named index.html as missing build output', () => {
    const directory = mkdtempSync(join(tmpdir(), 'noma-index-'));
    temporaryDirectories.push(directory);
    mkdirSync(join(directory, 'index.html'));
    expect(() => ensureDist(directory)).toThrow('Run npm run build first');
  });

  it('serves static files and falls back to index for SPA routes', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'noma-desktop-'));
    temporaryDirectories.push(directory);
    mkdirSync(join(directory, 'assets'));
    writeFileSync(join(directory, 'index.html'), '<main>Noma</main>');
    writeFileSync(join(directory, 'assets', 'app.js'), 'console.log("noma")');
    const started = await startDesktopServer({ distDir: directory, port: 0 });
    runningServers.push(started.server);

    expect((await request(`http://127.0.0.1:${started.port}/`)).body).toBe('<main>Noma</main>');
    expect((await request(`http://127.0.0.1:${started.port}/%ZZ`)).status).toBe(400);
    expect((await request(`http://127.0.0.1:${started.port}/..%5Cpackage.json`)).status).toBe(403);
    expect((await request(`http://127.0.0.1:${started.port}/assets/app.js`)).status).toBe(200);
    expect((await request(`http://127.0.0.1:${started.port}/note/example`)).body).toContain('Noma');
    expect((await request(`http://127.0.0.1:${started.port}/missing.js`)).status).toBe(404);
    expect((await request(`http://127.0.0.1:${started.port}/..%2Fpackage.json`)).status).toBe(403);
    expect(await isNomaDesktopServer(started.port)).toBe(true);
    expect(started.server.address()).toMatchObject({ address: '127.0.0.1' });
  });

  it('does not mistake another local server for Noma', async () => {
    const other = createServer((_request, response) => response.end('other'));
    await new Promise<void>((resolveListen) => other.listen(0, DESKTOP_HOST, resolveListen));
    runningServers.push(other);
    const address = other.address();
    expect(address).not.toBeNull();
    expect(await isNomaDesktopServer((address as { port: number }).port)).toBe(false);
  });

  it('selects the next localhost port when the default is occupied', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'noma-desktop-'));
    temporaryDirectories.push(directory);
    writeFileSync(join(directory, 'index.html'), 'Noma');
    const occupied = await startDesktopServer({ distDir: directory, port: 0 });
    runningServers.push(occupied.server);
    const started = await startDesktopServer({ distDir: directory, port: occupied.port });
    runningServers.push(started.server);

    expect(started.port).not.toBe(occupied.port);
  });

  it('reports a clear error when the production build is missing', () => {
    expect(() => ensureDist(join(tmpdir(), 'noma-dist-does-not-exist'))).toThrow('Run npm run build first');
  });
});

it('validates port configuration and gracefully closes its listener', async () => {
  expect(DEFAULT_DESKTOP_PORT).toBe(3847);
  expect(DESKTOP_HOST).toBe('127.0.0.1');
  for (const port of [-1, 65536, NaN, 1.5]) {
    await expect(startDesktopServer({ port })).rejects.toThrow('Port must');
  }
  const started = await startDesktopServer({ port: 0 });
  await shutdownDesktopServer(started.server);
  expect(started.server.listening).toBe(false);
});
