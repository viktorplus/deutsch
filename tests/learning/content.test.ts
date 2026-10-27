import { expect, it } from 'vitest';
import { starterWords } from '../../src/data/words';
const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
it('delivers at least 360 complete cards with at least 60 at each learning level', () => {
  expect(starterWords.length).toBeGreaterThanOrEqual(360);
  for (const level of levels) expect(starterWords.filter(word => word.level === level).length).toBeGreaterThanOrEqual(60);
  expect(new Set(starterWords.map(w => w.id)).size).toBe(starterWords.length);
  for (const word of starterWords) {
    expect(levels).toContain(word.level);
    for (const field of [word.german,word.russian,word.example,word.exampleTranslation,word.topic,word.set]) expect(field.length).toBeGreaterThan(0);
    if (/^[A-ZÄÖÜ]/.test(word.german)) { expect(word.article).toBeTruthy(); expect(word.plural).toBeTruthy(); }
  }
});
import { grammarTopics } from '../../src/data/grammar';
it('has at least 35 taught topics with substantial independent final tests and specific feedback', () => {
  expect(grammarTopics.length).toBeGreaterThanOrEqual(35);
  expect(grammarTopics.filter(t => t.level === 'A1')).toHaveLength(7);
  expect(grammarTopics.filter(t => t.level === 'A2')).toHaveLength(7);
  for (const [level, minimum] of [['B1', 7], ['B2', 5], ['C1', 5], ['C2', 4]] as const)
    expect(grammarTopics.filter(topic => topic.level === level).length).toBeGreaterThanOrEqual(minimum);
  expect(new Set(grammarTopics.map(topic => topic.id)).size).toBe(grammarTopics.length);
  const exercises = grammarTopics.flatMap(topic => [...topic.exercises, ...topic.finalTest]);
  expect(new Set(exercises.map(exercise => exercise.id)).size).toBe(exercises.length);
  for (const topic of grammarTopics) {
    expect(topic.exercises.length).toBeGreaterThanOrEqual(6);
    expect(topic.finalTest.length).toBeGreaterThanOrEqual(3);
    expect(topic.table.length).toBeGreaterThan(1); expect(topic.examples.length).toBeGreaterThan(0);
    const practice = new Set(topic.exercises.map(e=>e.answer));
    for (const exercise of topic.finalTest) { expect(practice.has(exercise.answer)).toBe(false); expect(exercise.explanation.length).toBeGreaterThan(10); }
  }
});
