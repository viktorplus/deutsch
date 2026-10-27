const { app, BrowserWindow, ipcMain, session, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');
const { pathToFileURL } = require('node:url');
const { createDatabase } = require('./database.cjs');
let window;
let database;
const rendererPath = path.join(__dirname, '..', 'dist', 'index.html');
const development = !app.isPackaged && process.argv.includes('--dev');
const allowedURL = development ? 'http://127.0.0.1:5173/' : pathToFileURL(rendererPath).href;
async function dataDirectory() {
  if (app.isPackaged) return app.getPath('userData');
  const root = path.resolve(__dirname, '..');
  const override = process.env.DEUTSCHMASTER_DATA_DIR;
  if (!override) return path.join(root, 'data');
  const directory = path.resolve(root, override);
  const inside = (base, target) => { const relative = path.relative(base, target); return !relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative); };
  if (!path.isAbsolute(override) || !inside(root, directory)) throw new Error('DEUTSCHMASTER_DATA_DIR должен быть абсолютным путём внутри папки проекта.');
  let ancestor = directory;
  let realAncestor;
  while (realAncestor === undefined) {
    try { realAncestor = await fs.realpath(ancestor); }
    catch (error) { if (error.code !== 'ENOENT') throw error; ancestor = path.dirname(ancestor); }
  }
  const realDirectory = path.resolve(realAncestor, path.relative(ancestor, directory));
  if (!inside(await fs.realpath(root), realDirectory)) throw new Error('DEUTSCHMASTER_DATA_DIR не может вести за пределы проекта через ссылку.');
  return directory;
}
function authorized(event) {
  if (!window || event.sender !== window.webContents || event.senderFrame !== window.webContents.mainFrame || event.senderFrame.url !== allowedURL) throw new Error('Доступ к хранилищу запрещён.');
  if (!database) throw new Error('Хранилище недоступно. Перезапустите приложение.');
}
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { if (window) { if (window.isMinimized()) window.restore(); window.focus(); } });
  app.whenReady().then(async () => {
    const directory = await dataDirectory();
    try { database = await createDatabase(path.join(directory, 'deutschmaster.sqlite')); }
    catch (error) { await dialog.showMessageBox({ type: 'error', title: 'Ошибка хранилища', message: error.message, detail: 'Существующая база данных не будет перезаписана.' }); }
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => callback({ responseHeaders: { ...details.responseHeaders, 'Content-Security-Policy': [development ? "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' ws://127.0.0.1:5173; object-src 'none'; base-uri 'none'" : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'none'"] } }));
    ipcMain.handle('storage:load', async event => { authorized(event); return database.load(); });
    ipcMain.handle('storage:save', async (event, state) => { authorized(event); await database.save(state); });
    window = new BrowserWindow({ width: 1440, height: 980, minWidth: 360, minHeight: 600, backgroundColor: '#f6f8fc', title: 'DeutschMaster', autoHideMenuBar: true, webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true, webSecurity: true } });
    window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    window.webContents.on('will-navigate', (event, url) => { if (url !== allowedURL) event.preventDefault(); });
    session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
    await window.loadURL(allowedURL);
  }).catch(error => { dialog.showErrorBox('Ошибка запуска', error.message); app.quit(); });
  app.on('window-all-closed', () => app.quit());
}
