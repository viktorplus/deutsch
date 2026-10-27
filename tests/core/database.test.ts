import { afterEach, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { AppState } from '../../src/types';
const require = createRequire(import.meta.url);
const { createDatabase } = require('../../electron/database.cjs') as { createDatabase: (filename: string) => Promise<{ load(): Promise<AppState | null>; save(state: AppState): Promise<void>; close(): Promise<void> }> };
const directories: string[] = [];
const fixture = (): AppState => ({ version: 1, words: [], attempts: [{ id: 'a1', itemId: 'word1', kind: 'word', mode: 'review', topic: 'Home', userAnswer: 'Haus', expected: 'das Haus', correct: false, explanation: 'Missing article', at: '2026-10-19T12:00:00Z', rating: 'again' }], schedules: { word1: { itemId: 'word1', repetitions: 0, interval: 1, ease: 2, due: '2026-10-20T12:00:00Z' } }, mistakes: [], settings: { theme: 'dark', strict: true, sessionSize: 10, dailyGoal: 15, level: 'A1' } });
async function filename() { const directory = path.resolve('data', `test-${crypto.randomUUID()}`); directories.push(directory); await mkdir(directory, { recursive: true }); return path.join(directory, 'state.sqlite'); }
afterEach(async () => { await Promise.all(directories.splice(0).map(directory => rm(directory, { recursive: true, force: true }))); });
it('persists genuine SQLite state and review history across restart', async () => { const file = await filename(); const database = await createDatabase(file); expect(await database.load()).toBeNull(); await database.save(fixture()); await database.close(); expect((await readFile(file)).subarray(0, 15).toString()).toBe('SQLite format 3'); const restarted = await createDatabase(file); expect(await restarted.load()).toEqual(fixture()); await restarted.close(); });
it('refuses corrupt database and never replaces its bytes', async () => { const file = await filename(); await writeFile(file, 'corrupted database'); await expect(createDatabase(file)).rejects.toThrow('открыть'); expect(await readFile(file, 'utf8')).toBe('corrupted database'); });
it('rejects invalid snapshots while retaining saved history', async () => { const file = await filename(); const database = await createDatabase(file); await database.save(fixture()); const broken = fixture(); broken.attempts[0].at = 'invalid'; await expect(database.save(broken)).rejects.toThrow('повреждены'); expect(await database.load()).toEqual(fixture()); await database.close(); });
