import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('portable launcher sources', () => {
  it('keeps the Windows launcher templates and portable build script in the repository', () => {
    const root = resolve(process.cwd());
    expect(existsSync(resolve(root, 'Noma.cmd'))).toBe(true);
    expect(existsSync(resolve(root, 'Noma.ps1'))).toBe(true);
    expect(existsSync(resolve(root, 'README_RUN.txt'))).toBe(true);
    expect(existsSync(resolve(root, 'scripts', 'build-portable.mjs'))).toBe(true);
  });
});
