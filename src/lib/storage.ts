import type { AppState, StorageAPI } from '../types';
import { validateState } from './validation';
export const STORAGE_KEY = 'deutschmaster.state.v1';
export const browserStorage: StorageAPI = {
  async load() { const raw = localStorage.getItem(STORAGE_KEY); if (raw === null) return null; const value: unknown = JSON.parse(raw); validateState(value); return value; },
  async save(state: AppState) { validateState(state); localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); },
};
export function createSerializedStore(storage: StorageAPI, initial: () => AppState, upgrade?: (state: AppState) => { state: AppState; changed: boolean }) {
  let snapshot: AppState | null = null;
  let queue: Promise<unknown> = Promise.resolve();
  return {
    load(): Promise<AppState> {
      const job = queue.then(async () => {
        const loaded = await storage.load();
        if (loaded !== null) validateState(loaded);
        const candidate = structuredClone(loaded ?? initial());
        validateState(candidate);
        const result = loaded !== null && upgrade ? upgrade(candidate) : { state: candidate, changed: false };
        validateState(result.state);
        if (result.changed) await storage.save(result.state);
        snapshot = structuredClone(result.state);
        return structuredClone(snapshot);
      });
      queue = job.catch(() => undefined);
      return job;
    },
    update(mutate: (draft: AppState) => void): Promise<AppState> {
      const job = queue.then(async () => {
        if (!snapshot) throw new Error('Данные ещё загружаются.');
        const draft = structuredClone(snapshot); mutate(draft); validateState(draft); await storage.save(draft); snapshot = draft; return structuredClone(draft);
      });
      queue = job.catch(() => undefined);
      return job;
    },
  };
}
