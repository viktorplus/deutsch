import { chromium, expect } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const profile = path.join(root, 'artifacts', `launcher-smoke-${randomUUID()}`);
await mkdir(profile, { recursive: true });
const server = createServer(); server.listen(0, '127.0.0.1'); await once(server, 'listening');
const port = server.address().port; await new Promise(resolve => server.close(resolve));
const child = spawn(process.execPath, [path.join(root, 'scripts/start-electron.mjs'), '--dev', `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(profile, 'chromium')}`], { cwd: root, env: { ...process.env, ELECTRON_RUN_AS_NODE: '1', DEUTSCHMASTER_DATA_DIR: profile }, stdio: 'pipe', windowsHide: true });
let output = ''; child.stdout.on('data', chunk => { output += chunk; }); child.stderr.on('data', chunk => { output += chunk; });
const exited = once(child, 'exit'); let browser;
try {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline && !browser) {
    try { browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`); }
    catch { if (child.exitCode !== null) throw new Error(`Launcher exited early: ${output}`); await new Promise(resolve => setTimeout(resolve, 200)); }
  }
  if (!browser) throw new Error(`Launcher did not expose a browser: ${output}`);
  const page = browser.contexts()[0].pages()[0];
  page.on('pageerror', error => { output += `\nRenderer error: ${error.message}`; });
  page.on('console', entry => { if (entry.type() === 'error') output += `\nRenderer console: ${entry.text()}`; });
  await page.waitForURL('http://127.0.0.1:5173/', { timeout: 20000 });
  await page.reload();
  await expect(page.getByText('Офлайн · SQLite', { exact: true })).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('button', { name: 'Начать обучение' })).toBeVisible();
  await page.close();
  const [code] = await exited; expect(code).toBe(0);
  console.log('Launcher cleared ELECTRON_RUN_AS_NODE and forwarded a clean Electron exit.');
} catch (error) { if (browser) { const page = browser.contexts()[0].pages()[0]; console.error(`Renderer URL: ${page?.url()}`); await page?.screenshot({ path: path.join(profile, 'failure.png') }); } console.error(output.slice(-4000)); throw error; }
finally { if (browser) await browser.close(); if (child.exitCode === null) child.kill('SIGTERM'); }
