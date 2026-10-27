import type { AppState } from '../types';
export function localDay(date: Date): string { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
export interface DayStats { date: string; total: number; correct: number; words: number; grammar: number }
export interface Stats { studiedWords: number; dueCount: number; correct: number; total: number; accuracy: number; streak: number; todayCount: number; todayWords: number; todayGrammar: number; days: DayStats[] }
export function getStats(state: AppState, now = new Date()): Stats {
  const daysMap = new Map<string, DayStats>();
  for (const attempt of state.attempts) {
    const date = localDay(new Date(attempt.at));
    const day = daysMap.get(date) ?? { date, total: 0, correct: 0, words: 0, grammar: 0 };
    day.total++; day.correct += Number(attempt.correct); day[attempt.kind === 'word' ? 'words' : 'grammar']++;
    daysMap.set(date, day);
  }
  const today = daysMap.get(localDay(now));
  const cursor = new Date(now); cursor.setHours(12, 0, 0, 0);
  if (!today) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (daysMap.has(localDay(cursor))) { streak++; cursor.setDate(cursor.getDate() - 1); }
  const correct = state.attempts.filter(attempt => attempt.correct).length;
  const activeWords = new Set(state.words.map(word => word.id));
  return { studiedWords: new Set(state.attempts.filter(a => a.kind === 'word' && activeWords.has(a.itemId)).map(a => a.itemId)).size, dueCount: Object.values(state.schedules).filter(s => activeWords.has(s.itemId) && Date.parse(s.due) <= now.getTime()).length, correct, total: state.attempts.length, accuracy: state.attempts.length ? Math.round(correct / state.attempts.length * 100) : 0, streak, todayCount: today?.total ?? 0, todayWords: today?.words ?? 0, todayGrammar: today?.grammar ?? 0, days: [...daysMap.values()].sort((a, b) => a.date.localeCompare(b.date)) };
}
