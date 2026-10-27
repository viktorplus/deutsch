import { createHash } from 'node:crypto';
import { expect, it } from 'vitest';
import * as vocabulary from '../../src/data/words';
import type { Word } from '../../src/types';

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
const legacyIds = [
  ...Array.from({ length: 32 }, (_, index) => `starter-n-${index + 1}`),
  ...Array.from({ length: 16 }, (_, index) => `starter-v-${index + 1}`),
];

it('provides at least sixty complete cards for each teaching level', () => {
  expect(vocabulary.starterWords.length).toBeGreaterThanOrEqual(360);
  for (const level of levels) {
    expect(vocabulary.starterWords.filter(word => word.level === level).length, level).toBeGreaterThanOrEqual(60);
  }
});

it('exposes only additive expansion seeds and preserves every legacy field and its order', () => {
  // SHA-256 of the original 48 public records at baseline b068850, before expansion.
  const legacy = vocabulary.starterWords.slice(0, 48);
  expect(legacy.map(word => word.id)).toEqual(legacyIds);
  expect(createHash('sha256').update(JSON.stringify(legacy)).digest('hex'))
    .toBe('f85df0ead433da88d123d67891826a0b1f632e3e835d0c0c71cbe11b1542d3ce');
  expect(vocabulary).toHaveProperty('expansionWords');
  const additions = (vocabulary as typeof vocabulary & { expansionWords: Word[] }).expansionWords;
  expect(additions.length).toBeGreaterThanOrEqual(312);
  expect(vocabulary.starterWords.slice(48)).toEqual(additions);
  for (const word of additions) {
    expect(word.id).toMatch(/^expansion-(a1|a2|b1|b2|c1|c2)-[a-z0-9-]+$/);
    expect(legacyIds).not.toContain(word.id);
  }
});

it('keeps normalized headwords and ids unique with useful original bilingual metadata', () => {
  const words = vocabulary.starterWords;
  expect(new Set(words.map(word => word.id)).size).toBe(words.length);
  const keys = words.map(word => `${word.article ?? ''} ${word.german}`.normalize('NFC').toLocaleLowerCase('de').trim().replace(/\s+/g, ' '));
  expect(new Set(keys).size).toBe(words.length);
  for (const word of words) {
    for (const field of [word.german, word.russian, word.example, word.exampleTranslation, word.topic, word.set]) {
      expect(field.trim().length, word.id).toBeGreaterThan(1);
    }
    expect(levels).toContain(word.level);
    expect(word.russian, word.id).toMatch(/[А-Яа-яЁё]/);
    expect(word.exampleTranslation, word.id).toMatch(/[А-Яа-яЁё]/);
    expect(word.topic, word.id).toMatch(/[А-Яа-яЁё]/);
    expect(word.set, word.id).toMatch(/[А-Яа-яЁё]/);
    if (/^[A-ZÄÖÜ]/u.test(word.german)) {
      expect(['der', 'die', 'das'], word.id).toContain(word.article);
      expect(word.plural?.trim().length, word.id).toBeGreaterThan(1);
    }
    expect(word.custom).not.toBe(true);
  }
  // These lexical fixtures exercise umlauts, singular-only metadata and retained reflexivity.
  expect(words.find(word => word.german === 'Arzt')).toMatchObject({ article: 'der', plural: 'Ärzte', russian: 'врач', level: 'A1' });
  expect(words.find(word => word.german === 'Ermessen')).toMatchObject({ article: 'das', plural: 'только единственное число', level: 'C2' });
  expect(words.find(word => word.german === 'sich auseinandersetzen')).toMatchObject({ level: 'C1', russian: 'критически разбирать' });
});
