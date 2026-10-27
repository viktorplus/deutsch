import { _electron as electron, expect } from '@playwright/test';
import { mkdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const executablePath = path.join(root, 'release', 'win-unpacked', 'DeutschMaster.exe');
const packageVersion = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')).version;
expect(packageVersion).toBe('1.1.0');
const profile = path.join(root, 'artifacts', `packaged-smoke-${randomUUID()}`);
await mkdir(profile, { recursive: true });
const environment = { ...process.env };
delete environment.ELECTRON_RUN_AS_NODE;
const launch = () => electron.launch({ executablePath, args: [`--user-data-dir=${profile}`], cwd: root, env: environment, timeout: 60000 });
let application;
async function verifyIsolation() {
  const runtime = await application.evaluate(({ app }) => ({ userData: app.getPath('userData'), sessionData: app.getPath('sessionData'), packaged: app.isPackaged, appPath: app.getAppPath(), executable: process.execPath, version: app.getVersion() }));
  expect(runtime.packaged).toBe(true);
  expect(path.resolve(runtime.executable)).toBe(executablePath);
  expect(path.resolve(runtime.userData)).toBe(profile);
  expect(path.resolve(runtime.sessionData)).toBe(profile);
  expect(runtime.appPath).toContain('app.asar');
  expect(runtime.version).toBe(packageVersion);
  return runtime;
}
async function verifyCurriculum(page) {
  const state = await page.evaluate(() => window.deutschStorage.load());
  expect(state.words.length).toBeGreaterThanOrEqual(360);
  const cardsByLevel = {};
  for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) {
    cardsByLevel[level] = state.words.filter(word => word.level === level).length;
    expect(cardsByLevel[level]).toBeGreaterThanOrEqual(60);
  }
  await page.getByRole('button', { name: 'Грамматика', exact: true }).click();
  await page.getByRole('combobox', { name: 'Уровень', exact: true }).selectOption('C2');
  const topics = page.locator('button.panel').filter({ has: page.locator('h3') });
  expect(await topics.count()).toBeGreaterThanOrEqual(4);
  const c2Topic = await topics.first().locator('h3').innerText();
  await topics.first().click();
  const practice = await page.getByRole('button', { name: /^Практика ·/ }).innerText();
  const final = await page.getByRole('button', { name: /^Итоговый тест ·/ }).innerText();
  expect(Number(practice.match(/\d+/)?.[0])).toBeGreaterThanOrEqual(6);
  expect(Number(final.match(/\d+/)?.[0])).toBeGreaterThanOrEqual(3);
  return { cardsByLevel, c2Topic };
}
try {
  application = await launch();
  const runtime = await verifyIsolation();
  let page = await application.firstWindow();
  await expect(page.getByText('Офлайн · SQLite', { exact: true })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.getByRole('button', { name: 'Настройки', exact: true }).click();
  await page.getByLabel('Дневная цель, ответов').fill('9');
  await page.getByRole('button', { name: 'Сохранить настройки' }).click();
  await expect(page.getByRole('status')).toContainText('Настройки сохранены');
  const curriculum = await verifyCurriculum(page);
  await application.close(); application = undefined;
  expect((await stat(path.join(profile, 'deutschmaster.sqlite'))).size).toBeGreaterThan(0);
  application = await launch(); await verifyIsolation(); page = await application.firstWindow();
  await page.getByRole('button', { name: 'Настройки', exact: true }).click();
  await expect(page.getByLabel('Дневная цель, ответов')).toHaveValue('9');
  expect(await verifyCurriculum(page)).toEqual(curriculum);
  await page.getByRole('button', { name: 'Главная', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Начать обучение' })).toBeVisible();
  await page.screenshot({ path: path.join(root, 'artifacts', 'screenshots', 'packaged-home.png'), fullPage: true });
  console.log(JSON.stringify({ result: 'Packaged EXE version, six-level curriculum, bundled SQLite/WASM and save/restart passed', ...runtime, ...curriculum, profile }));
} finally { if (application) await application.close(); }
