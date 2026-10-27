import type { GrammarExercise, GrammarTopic, Level } from '../../types';

export type Question = [prompt: string, answer: string, explanation: string, alternatives?: string[]];

function question(id: string, item: Question): GrammarExercise {
  const [prompt, answer, explanation, alternatives] = item;
  return { id, prompt, answer, explanation, ...(alternatives ? { alternatives } : {}) };
}

export function lesson(
  id: string, level: Level, title: string, explanation: string,
  table: string[][], examples: GrammarTopic['examples'], items: Question[],
): GrammarTopic {
  return {
    id, level, title, explanation, table, examples,
    exercises: items.slice(0, 6).map((item, index) => question(`${id}-practice-${index + 1}`, item)),
    finalTest: items.slice(6).map((item, index) => question(`${id}-final-${index + 1}`, item)),
  };
}

export function extendLegacy(topic: GrammarTopic, items: Question[]): GrammarTopic {
  // IDs 1-3 and final ID 4 are historical references in persisted attempts.
  return {
    ...topic,
    exercises: [...topic.exercises, ...items.slice(0, 3).map((item, index) => question(`${topic.id}-${index + 5}`, item))],
    finalTest: [...topic.finalTest, ...items.slice(3).map((item, index) => question(`${topic.id}-${index + 8}`, item))],
  };
}
