export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type Rating = 'again' | 'hard' | 'good' | 'easy';
export type Page = 'home' | 'words' | 'grammar' | 'review' | 'mistakes' | 'dictionary' | 'statistics' | 'settings';
export interface Word { id: string; german: string; russian: string; article?: 'der' | 'die' | 'das'; plural?: string; example: string; exampleTranslation: string; level: Level; topic: string; set: string; custom?: boolean }
export interface GrammarExercise { id: string; prompt: string; answer: string; alternatives?: string[]; explanation: string }
export interface GrammarTopic { id: string; level: Level; title: string; explanation: string; table: string[][]; examples: { german: string; russian: string }[]; exercises: GrammarExercise[]; finalTest: GrammarExercise[] }
export interface Schedule { itemId: string; repetitions: number; interval: number; ease: number; due: string }
export interface Attempt { id: string; itemId: string; kind: 'word' | 'grammar'; mode: string; topic: string; userAnswer: string; expected: string; correct: boolean; explanation: string; at: string; rating?: Rating }
export interface Mistake { id: string; attemptId: string; itemId: string; kind: 'word' | 'grammar'; topic: string; userAnswer: string; expected: string; explanation: string; at: string; resolved: boolean }
export interface Settings { theme: 'light' | 'dark'; strict: boolean; sessionSize: number; dailyGoal: number; level: Level }
export interface AppState { version: 1; words: Word[]; attempts: Attempt[]; schedules: Record<string, Schedule>; mistakes: Mistake[]; settings: Settings }
export interface StorageAPI { load(): Promise<AppState | null>; save(state: AppState): Promise<void> }
declare global { interface Window { deutschStorage?: StorageAPI } }
