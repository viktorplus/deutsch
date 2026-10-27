import { expect, it, vi } from 'vitest';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import vm from 'node:vm';
const require = createRequire(import.meta.url);
async function boot(override?: string, packaged = false, development = false) {
  let startup: Promise<unknown> = Promise.resolve();
  const database = { load: vi.fn(), save: vi.fn() }; const createDatabase = vi.fn(async () => database);
  const showErrorBox = vi.fn(); const quit = vi.fn(); const onHeadersReceived = vi.fn();
  const app = { isPackaged: packaged, getPath: () => 'C:\\mock-user-profile', requestSingleInstanceLock: () => true, on: vi.fn(), quit, whenReady: () => ({ then: (callback: () => Promise<unknown>) => { startup = callback(); return startup; } }) };
  class Window { webContents = { setWindowOpenHandler: vi.fn(), on: vi.fn() }; loadURL = vi.fn(async () => {}); }
  const electron = { app, BrowserWindow: Window, ipcMain: { handle: vi.fn() }, session: { defaultSession: { webRequest: { onHeadersReceived }, setPermissionRequestHandler: vi.fn() } }, dialog: { showErrorBox, showMessageBox: vi.fn(async () => {}) } };
  const source = await readFile(path.resolve('electron/main.cjs'), 'utf8');
  vm.runInNewContext(source, { require: (name: string) => name === 'electron' ? electron : name === './database.cjs' ? { createDatabase } : require(name), __dirname: path.resolve('electron'), process: { argv: development ? ['--dev'] : [], env: override === undefined ? {} : { DEUTSCHMASTER_DATA_DIR: override } } });
  await startup.catch(() => {});
  await Promise.resolve();
  const csp = () => { let policy = ''; const handler = onHeadersReceived.mock.calls[0][0]; handler({ responseHeaders: {} }, (response: { responseHeaders: Record<string, string[]> }) => { policy = response.responseHeaders['Content-Security-Policy'][0]; }); return policy; };
  return { createDatabase, showErrorBox, quit, csp };
}
it('allows an isolated smoke profile inside the workspace', async () => { const directory = path.resolve('data', 'electron-smoke'); const result = await boot(directory); expect(result.createDatabase).toHaveBeenCalledWith(path.join(directory, 'deutschmaster.sqlite')); });
it('rejects a development profile outside the workspace without opening a database', async () => { const result = await boot(path.resolve('..', 'outside-profile')); expect(result.createDatabase).not.toHaveBeenCalled(); expect(result.showErrorBox).toHaveBeenCalled(); });
it('keeps the packaged per-user directory even when an override is present', async () => { const result = await boot(path.resolve('data', 'electron-smoke'), true); expect(result.createDatabase).toHaveBeenCalledWith(path.join('C:\\mock-user-profile', 'deutschmaster.sqlite')); });
it('allows the Vite inline React preamble only in development', async () => { const result = await boot(undefined, false, true); const scriptPolicy = result.csp().split(';').find(directive => directive.trim().startsWith('script-src')); expect(scriptPolicy).toContain("'unsafe-inline'"); });
it.each([false, true])('keeps production script CSP strict when packaged=%s', async packaged => { const result = await boot(undefined, packaged, packaged); const scriptPolicy = result.csp().split(';').find(directive => directive.trim().startsWith('script-src')); expect(scriptPolicy?.trim()).toBe("script-src 'self'"); });
