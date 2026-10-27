import type { AppState, Word } from '../types';

export function mergeBuiltinWords(state: AppState, seeds: readonly Word[]): { state: AppState; changed: boolean } {
  const seedIds = new Set<string>();
  for (const word of seeds) {
    if (seedIds.has(word.id)) throw new Error(`Повторяющийся ID учебной карточки: ${word.id}`);
    seedIds.add(word.id);
  }
  const existing = new Set(state.words.map(word => word.id));
  const additions = seeds.filter(word => !existing.has(word.id));
  if (!additions.length) return { state, changed: false };
  return { state: { ...state, words: [...state.words, ...structuredClone(additions)] }, changed: true };
}
