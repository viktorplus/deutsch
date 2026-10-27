import { describe, expect, it } from 'vitest';
import { checkAnswer } from '../../src/lib/checkAnswer';
describe('answer checking', () => {
  it('requires case and umlauts in strict German', () => { expect(checkAnswer('der Mann', 'der Mann', true).correct).toBe(true); expect(checkAnswer('der mann', 'der Mann', true).correct).toBe(false); expect(checkAnswer('schon', 'schön', true).correct).toBe(false); });
  it('accepts documented transliterations and spacing only in soft mode', () => { expect(checkAnswer('  die   Strasse! ', 'die Straße', false).correct).toBe(true); expect(checkAnswer('Ich fuehle mich gut.', 'Ich fühle mich gut', false).correct).toBe(true); expect(checkAnswer('schon', 'schön', false).correct).toBe(false); });
  it('never accepts a missing article or reflexive pronoun', () => { expect(checkAnswer('Haus', 'das Haus', false).category).toBe('grammar'); expect(checkAnswer('Ich freue', 'Ich freue mich', false).correct).toBe(false); });
});
