import type { Word } from '../../types';
import { a1Words } from './a1.ts';
import { a2Words } from './a2.ts';
import { b1Words } from './b1.ts';
import { b2Words } from './b2.ts';
import { c1Words } from './c1.ts';
import { c2Words } from './c2.ts';

// Additive curriculum seeds; existing profiles merge by id without replacing old cards.
export const expansionWords: Word[] = [
  ...a1Words, ...a2Words, ...b1Words, ...b2Words, ...c1Words, ...c2Words,
];
