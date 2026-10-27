import type { Rating, Schedule } from '../types';
export function scheduleReview(previous: Schedule | undefined, rating: Rating, now = new Date()): Omit<Schedule, 'itemId'> {
  const quality = { again: 1, hard: 3, good: 4, easy: 5 }[rating];
  const priorEase = previous?.ease ?? 2.5;
  const ease = Math.max(1.3, priorEase + .1 - (5 - quality) * (.08 + (5 - quality) * .02));
  const repetitions = quality < 3 ? 0 : (previous?.repetitions ?? 0) + 1;
  const interval = repetitions === 0 || repetitions === 1 ? 1 : repetitions === 2 ? 6 : Math.max(1, Math.round((previous?.interval ?? 1) * priorEase));
  return { repetitions, interval, ease: Math.round(ease * 100) / 100, due: new Date(now.getTime() + interval * 86_400_000).toISOString() };
}
