import { expect, it } from 'vitest';
import { mergeBuiltinWords } from '../../src/lib/curriculum';
import type { AppState, Word } from '../../src/types';

const word = (id: string): Word => ({ id, german: 'Haus', russian: 'дом', article: 'das', plural: 'Häuser', example: 'Das Haus ist klein.', exampleTranslation: 'Дом маленький.', level: 'A1', topic: 'Home', set: 'Test' });
const profile = (): AppState => ({
  version: 1, words: [{ ...word('starter-n-1'), russian: 'мой перевод' }, { ...word('personal'), custom: true }],
  attempts: [{ id: 'old-attempt', itemId: 'starter-n-1', kind: 'word', mode: 'review', topic: 'Home', userAnswer: 'Haus', expected: 'das Haus', correct: false, explanation: 'article', at: '2026-10-19T12:00:00Z' }],
  schedules: { 'starter-n-1': { itemId: 'starter-n-1', repetitions: 3, interval: 12, ease: 2.3, due: '2026-11-10T12:00:00Z' } },
  mistakes: [{ id: 'old-mistake', attemptId: 'old-attempt', itemId: 'starter-n-1', kind: 'word', topic: 'Home', userAnswer: 'Haus', expected: 'das Haus', explanation: 'article', at: '2026-10-19T12:00:00Z', resolved: false }],
  settings: { theme: 'dark', strict: false, sessionSize: 3, dailyGoal: 35, level: 'C1' },
});

it('purely appends missing expansion IDs once while preserving every existing profile field', () => {
  const original = profile(); const before = structuredClone(original);
  const seeds = [word('expansion-a1-1'), word('expansion-b1-1')];
  const upgraded = mergeBuiltinWords(original, seeds);
  expect(upgraded.changed).toBe(true);
  expect(upgraded.state).toEqual({ ...before, words: [...before.words, ...seeds] });
  expect(original).toEqual(before);
  expect(upgraded.state.words.some(item => item.id === 'starter-n-2')).toBe(false);
  expect(mergeBuiltinWords(upgraded.state, seeds)).toEqual({ state: upgraded.state, changed: false });
  upgraded.state.words[2].russian = 'changed';
  expect(seeds[0].russian).toBe('дом');
});

it('rejects duplicate seed IDs even when the ID already exists in personal cards', () => {
  const state = profile();
  expect(() => mergeBuiltinWords(state, [word('personal'), word('personal')])).toThrow('Повторяющийся ID');
});

it('keeps existing custom collisions and edits instead of replacing them with seeds', () => {
  const state = profile();
  expect(mergeBuiltinWords(state, [word('personal'), word('starter-n-1')])).toEqual({ state, changed: false });
});
