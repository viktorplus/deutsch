import { expect, it } from 'vitest';
import { getStats, localDay } from '../../src/lib/stats';
import type { AppState, Attempt } from '../../src/types';
const state = (): AppState => ({ version: 1, words: [], attempts: [], schedules: {}, mistakes: [], settings: { theme: 'light', strict: true, sessionSize: 10, dailyGoal: 15, level: 'A1' } });
it('reports honest zeros before activity', () => { expect(getStats(state()).total).toBe(0); expect(getStats(state()).accuracy).toBe(0); expect(getStats(state()).streak).toBe(0); });
it('counts local days and preserves yesterday streak before today starts', () => { const current = new Date(2026, 9, 19, 12); const data = state(); const make = (day: number, correct: boolean): Attempt => ({ id: String(day), itemId: 'w', kind: 'word', mode: 'write', topic: 'test', userAnswer: '', expected: '', correct, explanation: '', at: new Date(2026, 9, day, 23, 59).toISOString() }); data.attempts = [make(17, true), make(18, false)]; const stats = getStats(data, current); expect(stats.streak).toBe(2); expect(stats.todayCount).toBe(0); expect(stats.accuracy).toBe(50); expect(stats.days[1].date).toBe(localDay(new Date(2026, 9, 18))); });
