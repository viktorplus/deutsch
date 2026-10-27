import { expect, it } from 'vitest';
import { createSerializedStore } from '../../src/lib/storage';
import { validateState } from '../../src/lib/validation';
import type { AppState } from '../../src/types';
const fresh = (): AppState => ({ version: 1, words: [], attempts: [], schedules: {}, mistakes: [], settings: { theme: 'light', strict: true, sessionSize: 10, dailyGoal: 15, level: 'A1' } });
it('hydrates without writing defaults and serializes concurrent changes', async () => { let stored = fresh(); stored.settings.dailyGoal = 30; let saves = 0; const store = createSerializedStore({ load: async () => stored, save: async state => { await Promise.resolve(); stored = state; saves++; } }, fresh); expect((await store.load()).settings.dailyGoal).toBe(30); expect(saves).toBe(0); await Promise.all([store.update(d => { d.settings.dailyGoal++; }), store.update(d => { d.settings.dailyGoal++; })]); expect(stored.settings.dailyGoal).toBe(32); });
it('failed persistence leaves the previous state intact and permits retry', async () => { let fail = true; let stored = fresh(); const store = createSerializedStore({ load: async () => stored, save: async state => { if (fail) throw new Error('Disk full'); stored = state; } }, fresh); await store.load(); await expect(store.update(d => { d.settings.dailyGoal = 99; })).rejects.toThrow('Disk full'); expect(stored.settings.dailyGoal).toBe(15); fail = false; await store.update(d => { d.settings.dailyGoal++; }); expect(stored.settings.dailyGoal).toBe(16); });
it('persists an upgraded existing profile before publishing and serializes concurrent updates', async () => {
  let stored = fresh(); let release!: () => void; let saving!: () => void;
  const saveStarted = new Promise<void>(resolve => { saving = resolve; });
  const saveAllowed = new Promise<void>(resolve => { release = resolve; });
  const store = createSerializedStore({ load: async () => stored, save: async state => { saving(); await saveAllowed; stored = structuredClone(state); } }, fresh,
    state => { state.settings.dailyGoal = 30; return { state, changed: true }; });
  let published = false; const loading = store.load().then(state => { published = true; return state; });
  await Promise.race([saveStarted, loading]);
  expect(published).toBe(false); expect(stored.settings.dailyGoal).toBe(15);
  const update = store.update(draft => { draft.settings.dailyGoal++; });
  release(); expect((await loading).settings.dailyGoal).toBe(30);
  expect((await update).settings.dailyGoal).toBe(31); expect(stored.settings.dailyGoal).toBe(31);
});
it('failed upgrade save retains disk bytes and the previous snapshot, then safely retries', async () => {
  let bytes = JSON.stringify(fresh()); let upgrading = false; let fail = true;
  const store = createSerializedStore({ load: async () => JSON.parse(bytes), save: async state => { if (fail) throw new Error('Disk full'); bytes = JSON.stringify(state); } }, fresh,
    state => { if (upgrading) state.settings.dailyGoal = 30; return { state, changed: upgrading }; });
  await store.load(); const before = bytes; upgrading = true;
  await expect(store.load()).rejects.toThrow('Disk full'); expect(bytes).toBe(before);
  fail = false;
  expect((await store.update(draft => { draft.settings.dailyGoal++; })).settings.dailyGoal).toBe(16);
  expect((await store.load()).settings.dailyGoal).toBe(30);
  expect(JSON.parse(bytes).settings.dailyGoal).toBe(30);
});
it('does not upgrade or persist fresh initialization and skips unchanged saves', async () => {
  let existing: AppState | null = null; let upgrades = 0; let saves = 0;
  const store = createSerializedStore({ load: async () => existing, save: async () => { saves++; } }, fresh,
    state => { upgrades++; return { state, changed: false }; });
  expect(await store.load()).toEqual(fresh()); expect(upgrades).toBe(0); expect(saves).toBe(0);
  existing = fresh(); await store.load(); expect(upgrades).toBe(1); expect(saves).toBe(0);
});
it('validates loaded and upgraded states without overwriting invalid data', async () => {
  let stored: unknown = { ...fresh(), version: 2 }; let upgrades = 0; let saves = 0;
  const store = createSerializedStore({ load: async () => stored as AppState, save: async () => { saves++; } }, fresh,
    state => { upgrades++; state.settings.dailyGoal = 0; return { state, changed: true }; });
  await expect(store.load()).rejects.toThrow('повреждены'); expect(upgrades).toBe(0);
  stored = fresh(); await expect(store.load()).rejects.toThrow('повреждены');
  expect(stored).toEqual(fresh()); expect(saves).toBe(0);
  await expect(store.update(draft => { draft.settings.dailyGoal++; })).rejects.toThrow('загружаются');
});
it('rejects corrupt history and unsupported schemas', () => { expect(() => validateState({ ...fresh(), version: 2 })).toThrow('повреждены'); expect(() => validateState({ ...fresh(), attempts: [{ id: 'broken' }] })).toThrow('повреждены'); });
it.each([['theme', ['light']], ['level', ['A1']]])('rejects non-string settings enum %s', (key, malformed) => { const value = fresh(); expect(() => validateState(value)).not.toThrow(); expect(() => validateState({ ...value, settings: { ...value.settings, [String(key)]: malformed } })).toThrow('повреждены'); });
it.each([['kind', ['word']], ['rating', ['good']]])('rejects non-string attempt enum %s', (key, malformed) => { const value = { ...fresh(), attempts: [{ id: 'a', itemId: 'w', kind: 'word', mode: 'review', topic: 'Home', userAnswer: 'Haus', expected: 'Haus', correct: true, explanation: '', at: '2026-10-19T12:00:00Z', rating: 'good' }] }; expect(() => validateState(value)).not.toThrow(); expect(() => validateState({ ...value, attempts: [{ ...value.attempts[0], [String(key)]: malformed }] })).toThrow('повреждены'); });
it.each([['level', ['A1']], ['article', ['das']]])('rejects non-string vocabulary enum %s', (key, malformed) => { const word = { id: 'w', german: 'Haus', russian: 'дом', article: 'das', level: 'A1', example: '', exampleTranslation: '', topic: 'Home', set: 'Test' }; const value = { ...fresh(), words: [word] }; expect(() => validateState(value)).not.toThrow(); expect(() => validateState({ ...value, words: [{ ...word, [String(key)]: malformed }] })).toThrow('повреждены'); });
it('rejects non-string mistake kind', () => { const mistake = { id: 'm', attemptId: 'a', itemId: 'w', kind: 'word', topic: 'Home', userAnswer: 'Haus', expected: 'das Haus', explanation: '', at: '2026-10-19T12:00:00Z', resolved: false }; const value = { ...fresh(), mistakes: [mistake] }; expect(() => validateState(value)).not.toThrow(); expect(() => validateState({ ...value, mistakes: [{ ...mistake, kind: ['word'] }] })).toThrow('повреждены'); });
