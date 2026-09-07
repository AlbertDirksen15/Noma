import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { get } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { ensureDist, startDesktopServer } from './desktop-server.mjs';

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
  it('serves static files and falls back to index for SPA routes', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'noma-desktop-'));
    temporaryDirectories.push(directory);
    mkdirSync(join(directory, 'assets'));
    writeFileSync(join(directory, 'index.html'), '<main>Noma</main>');
    writeFileSync(join(directory, 'assets', 'app.js'), 'console.log("noma")');
    const started = await startDesktopServer({ distDir: directory, port: 0 });
    runningServers.push(started.server);

    expect((await request(`http://127.0.0.1:${started.port}/assets/app.js`)).status).toBe(200);
    expect((await request(`http://127.0.0.1:${started.port}/note/example`)).body).toContain('Noma');
    expect((await request(`http://127.0.0.1:${started.port}/missing.js`)).status).toBe(404);
    expect((await request(`http://127.0.0.1:${started.port}/..%2Fpackage.json`)).status).toBe(403);
    expect(started.server.address()).toMatchObject({ address: '127.0.0.1' });
  });

  it('selects the next localhost port when the default is occupied', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'noma-desktop-'));
    temporaryDirectories.push(directory);
    writeFileSync(join(directory, 'index.html'), 'Noma');
    const occupied = await startDesktopServer({ distDir: directory, port: 0 });
    runningServers.push(occupied.server);
    const started = await startDesktopServer({ distDir: directory, port: occupied.port });
    runningServers.push(started.server);

    expect(started.port).toBe(occupied.port + 1);
  });

  it('reports a clear error when the production build is missing', () => {
    expect(() => ensureDist(join(tmpdir(), 'noma-dist-does-not-exist'))).toThrow('Run npm run build first');
  });
});
