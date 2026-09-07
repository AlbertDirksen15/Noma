import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildPortable } from './build-portable.mjs';

describe('portable build', () => {
  it('copies production assets and actual launcher templates, and removes stale assets on rebuild', () => {
    const root = mkdtempSync(join(tmpdir(), 'noma-package-'));
    try {
      mkdirSync(resolve(root, 'dist/assets'), { recursive: true });
      mkdirSync(resolve(root, 'scripts'));
      writeFileSync(resolve(root, 'dist/index.html'), '<main>Noma</main>');
      writeFileSync(resolve(root, 'dist/assets/app.js'), 'app');
      const files = ['Noma.cmd', 'Noma.ps1', 'README_RUN.txt', 'scripts/desktop-server.mjs', 'scripts/NomaLauncher.cs'];
      for (const file of files) writeFileSync(resolve(root, file), readFileSync(resolve(file)));
      const target = buildPortable(root);
      expect(readFileSync(resolve(target, 'dist/index.html'), 'utf8')).toContain('Noma');
      expect(readFileSync(resolve(target, 'dist/assets/app.js'), 'utf8')).toBe('app');
      for (const file of files) {
        if (file === 'scripts/NomaLauncher.cs') continue;
        expect(readFileSync(resolve(target, file.replace('scripts/', 'server/')), 'utf8')).toBe(readFileSync(resolve(file), 'utf8'));
      }
      expect(existsSync(resolve(target, 'Noma.exe'))).toBe(true);
      expect(existsSync(resolve(target, 'runtime', 'node.exe'))).toBe(true);
      writeFileSync(resolve(target, 'dist/assets/stale.js'), 'old');
      buildPortable(root);
      expect(existsSync(resolve(target, 'dist/assets/stale.js'))).toBe(false);
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
  it('rejects missing production output', () => {
    const root = mkdtempSync(join(tmpdir(), 'noma-package-'));
    try { expect(() => buildPortable(root)).toThrow('Run npm run build first'); }
    finally { rmSync(root, { recursive: true, force: true }); }
  });
});
