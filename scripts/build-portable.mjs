import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

export const portableRoot = (projectDir = process.cwd()) => resolve(projectDir, 'release', 'Noma-portable');

const cscPath = () => resolve(process.env.WINDIR ?? 'C:\\Windows', 'Microsoft.NET', 'Framework64', 'v4.0.30319', 'csc.exe');

export const buildWindowsLauncher = (root, target, compiler = cscPath()) => {
  const source = resolve(root, 'scripts', 'NomaLauncher.cs');
  if (!existsSync(source)) throw new Error(`Native launcher source is missing: ${source}`);
  if (!existsSync(compiler)) throw new Error(`Windows C# compiler is missing: ${compiler}`);
  try {
    execFileSync(compiler, ['/nologo', '/target:winexe', '/r:System.Windows.Forms.dll', '/r:System.Drawing.dll', `/out:${resolve(target, 'Noma.exe')}`, source], { stdio: 'pipe' });
  } catch (error) {
    throw new Error(`Could not build Noma.exe: ${error instanceof Error ? error.message : error}`);
  }
};

export const buildPortable = (projectDir = process.cwd()) => {
  const root = resolve(projectDir);
  const dist = resolve(root, 'dist');
  if (!existsSync(resolve(dist, 'index.html'))) throw new Error('Build output is missing. Run npm run build first.');
  const target = portableRoot(root);
  try {
    rmSync(target, { recursive: true, force: true });
  } catch (error) {
    if (!['EPERM', 'EACCES', 'EBUSY'].includes(error?.code)) throw error;
    console.warn(`Could not fully clean ${target}; reusing the existing portable folder.`);
  }
  mkdirSync(target, { recursive: true });
  cpSync(dist, resolve(target, 'dist'), { recursive: true });
  cpSync(resolve(root, 'scripts', 'desktop-server.mjs'), resolve(target, 'server', 'desktop-server.mjs'));
  cpSync(resolve(root, 'Noma.cmd'), resolve(target, 'Noma.cmd'));
  cpSync(resolve(root, 'Noma.ps1'), resolve(target, 'Noma.ps1'));
  cpSync(resolve(root, 'README_RUN.txt'), resolve(target, 'README_RUN.txt'));
  cpSync(process.execPath, resolve(target, 'runtime', 'node.exe'));
  buildWindowsLauncher(root, target);
  return target;
};

const isMain = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  try {
    const target = buildPortable();
    console.log(`Portable Noma folder created: ${target}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
