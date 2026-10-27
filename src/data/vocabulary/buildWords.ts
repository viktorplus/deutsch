import type { Level, Word } from '../../types';

// Explicit slugs are permanent migration identifiers, independent of array positions.
export type VocabularyEntry = [
  slug: string, german: string, russian: string, example: string,
  exampleTranslation: string, topic: string, article?: Word['article'], plural?: string,
];

export function buildWords(level: Level, set: string, entries: VocabularyEntry[]): Word[] {
  return entries.map(([slug, german, russian, example, exampleTranslation, topic, article, plural]) => ({
    id: `expansion-${level.toLowerCase()}-${slug}`,
    german, russian, example, exampleTranslation, topic, level, set,
    ...(article ? { article, plural } : {}),
  }));
}
