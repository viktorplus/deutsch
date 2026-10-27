import { expect, it } from 'vitest';
import { scheduleReview } from '../../src/lib/sm2';
it('schedules successful repetitions at one then six days', () => { const now = new Date('2026-10-19T12:00:00Z'); const first = scheduleReview(undefined, 'good', now); expect(first.interval).toBe(1); expect(first.due).toBe('2026-10-20T12:00:00.000Z'); expect(scheduleReview({ ...first, itemId: 'a' }, 'good', now).interval).toBe(6); });
it('relearning resets repetitions and clamps easiness', () => { const result = scheduleReview({ itemId: 'a', repetitions: 5, interval: 100, ease: 1.3, due: '' }, 'again'); expect(result.repetitions).toBe(0); expect(result.ease).toBe(1.3); });
