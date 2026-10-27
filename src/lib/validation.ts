import type { AppState } from '../types';
const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string';
const member = (value: unknown, allowed: readonly string[]): value is string => text(value) && allowed.includes(value);
const date = (value: unknown) => text(value) && Number.isFinite(Date.parse(value));
const nonnegative = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value >= 0;
export function validateState(value: unknown): asserts value is AppState {
  const fail = () => { throw new Error('Данные повреждены или имеют неподдерживаемый формат. Существующие данные не изменены.'); };
  if (!record(value) || value.version !== 1 || !Array.isArray(value.words) || !Array.isArray(value.attempts) || !Array.isArray(value.mistakes) || !record(value.schedules) || !record(value.settings)) return fail();
  const settings = value.settings;
  if (!member(settings.theme, ['light', 'dark']) || typeof settings.strict !== 'boolean' || !member(settings.level, levels) || !Number.isInteger(settings.sessionSize) || Number(settings.sessionSize) < 1 || Number(settings.sessionSize) > 100 || !Number.isInteger(settings.dailyGoal) || Number(settings.dailyGoal) < 1 || Number(settings.dailyGoal) > 1000) return fail();
  const wordIds = new Set<string>();
  for (const word of value.words) {
    if (!record(word) || !text(word.id) || !word.id || wordIds.has(word.id) || !text(word.german) || !word.german.trim() || !text(word.russian) || !word.russian.trim() || !member(word.level, levels) || !['example', 'exampleTranslation', 'topic', 'set'].every(key => text(word[key])) || (word.article !== undefined && !member(word.article, ['der', 'die', 'das'])) || (word.plural !== undefined && !text(word.plural)) || (word.custom !== undefined && typeof word.custom !== 'boolean')) return fail();
    wordIds.add(word.id);
  }
  const attemptIds = new Set<string>();
  for (const attempt of value.attempts) {
    if (!record(attempt) || !['id', 'itemId', 'mode', 'topic', 'userAnswer', 'expected', 'explanation'].every(key => text(attempt[key])) || !attempt.id || attemptIds.has(String(attempt.id)) || !member(attempt.kind, ['word', 'grammar']) || typeof attempt.correct !== 'boolean' || !date(attempt.at) || (attempt.rating !== undefined && !member(attempt.rating, ['again', 'hard', 'good', 'easy']))) return fail();
    attemptIds.add(String(attempt.id));
  }
  const mistakeIds = new Set<string>();
  for (const mistake of value.mistakes) {
    if (!record(mistake) || !['id', 'attemptId', 'itemId', 'topic', 'userAnswer', 'expected', 'explanation'].every(key => text(mistake[key])) || !mistake.id || mistakeIds.has(String(mistake.id)) || !member(mistake.kind, ['word', 'grammar']) || typeof mistake.resolved !== 'boolean' || !date(mistake.at)) return fail();
    mistakeIds.add(String(mistake.id));
  }
  for (const [key, schedule] of Object.entries(value.schedules)) if (!record(schedule) || key !== schedule.itemId || !Number.isInteger(schedule.repetitions) || !nonnegative(schedule.repetitions) || !nonnegative(schedule.interval) || !nonnegative(schedule.ease) || Number(schedule.ease) < 1.3 || !date(schedule.due)) return fail();
}
