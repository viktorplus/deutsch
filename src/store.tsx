import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { AppState } from './types';
import { expansionWords, starterWords } from './data/words';
import { browserStorage, createSerializedStore } from './lib/storage';
import { mergeBuiltinWords } from './lib/curriculum';
export function createInitialState(): AppState { return { version: 1, words: structuredClone(starterWords), attempts: [], schedules: {}, mistakes: [], settings: { theme: 'light', strict: true, sessionSize: 10, dailyGoal: 15, level: 'A1' } }; }
interface Store { state: AppState; ready: boolean; error: string | null; update: (mutate: (draft: AppState) => void) => Promise<void>; retry: () => Promise<void> }
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(createInitialState); const [ready, setReady] = useState(false); const [error, setError] = useState<string | null>(null);
  const adapter = useRef<ReturnType<typeof createSerializedStore> | null>(null);
  if (!adapter.current) adapter.current = createSerializedStore(window.deutschStorage ?? browserStorage, createInitialState, state => mergeBuiltinWords(state, expansionWords));
  const retry = useCallback(async () => { setReady(false); try { const loaded = await adapter.current!.load(); setState(loaded); setError(null); setReady(true); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Не удалось загрузить данные.'); } }, []);
  useEffect(() => { void retry(); }, [retry]);
  const update = useCallback(async (mutate: (draft: AppState) => void) => { if (!ready) throw new Error('Дождитесь загрузки данных.'); try { const next = await adapter.current!.update(mutate); setState(next); setError(null); } catch (caught) { const message = caught instanceof Error ? caught.message : 'Не удалось сохранить данные.'; setError(message); throw caught; } }, [ready]);
  return <Context.Provider value={{ state, ready, error, update, retry }}>{children}</Context.Provider>;
}
export function useAppStore(): Store { const value = useContext(Context); if (!value) throw new Error('StoreProvider is missing'); return value; }
