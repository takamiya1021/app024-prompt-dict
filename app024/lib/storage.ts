import type { StoreApi } from 'zustand';
import type {
  AppSettings,
  Character,
  CharacterVersion,
  PersistedState,
  PromptTemplate,
} from '../types';

export const STORAGE_KEY = 'app024.characterStore';

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const reviveVersionHistory = (history: unknown): CharacterVersion[] | undefined => {
  if (!Array.isArray(history)) {
    return undefined;
  }

  return history.map((entry) => {
    const record = entry as CharacterVersion & { changedAt: string };
    const { character, changedAt, ...rest } = record;
    const revivedCharacter = reviveCharacter(character as Character);
    return {
      ...rest,
      character: revivedCharacter,
      changedAt: new Date(changedAt),
    };
  });
};

const reviveCharacter = (character: unknown): Character => {
  const record = character as Character & {
    createdAt: string;
    updatedAt: string;
    versionHistory?: CharacterVersion[];
  };

  return {
    ...record,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
    versionHistory: reviveVersionHistory(record.versionHistory),
  };
};

const reviveTemplate = (template: unknown): PromptTemplate => {
  const record = template as PromptTemplate & { createdAt: string; updatedAt?: string };
  return {
    ...record,
    createdAt: new Date(record.createdAt),
    updatedAt: record.updatedAt ? new Date(record.updatedAt) : undefined,
  };
};

const reviveSettings = (settings: unknown): AppSettings => {
  const record = settings as AppSettings;
  return {
    ...record,
  };
};

const reviveState = (raw: unknown): PersistedState | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const state = raw as PersistedState & {
    characters: unknown[];
    templates: unknown[];
    settings: unknown;
  };

  return {
    characters: state.characters.map(reviveCharacter),
    templates: state.templates.map(reviveTemplate),
    settings: reviveSettings(state.settings),
    selectedCharacterId: state.selectedCharacterId ?? null,
    selectedTags: Array.isArray(state.selectedTags) ? state.selectedTags : [],
    searchQuery: typeof state.searchQuery === 'string' ? state.searchQuery : '',
  };
};

export const saveState = (state: PersistedState, key: string = STORAGE_KEY): void => {
  if (!isBrowser()) {
    return;
  }

  try {
    const serialised = JSON.stringify(state);
    window.localStorage.setItem(key, serialised);
  } catch (error) {
    console.error('Failed to save state', error);
  }
};

export const loadState = (key: string = STORAGE_KEY): PersistedState | null => {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return reviveState(parsed);
  } catch (error) {
    console.error('Failed to load state', error);
    return null;
  }
};

export const clearState = (key: string = STORAGE_KEY): void => {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear state', error);
  }
};

const extractPersistableState = (state: PersistedState): PersistedState => ({
  characters: state.characters,
  templates: state.templates,
  settings: state.settings,
  selectedCharacterId: state.selectedCharacterId,
  selectedTags: state.selectedTags,
  searchQuery: state.searchQuery,
});

type Debounced<T> = ((value: T) => void) & {
  flush: () => void;
  cancel: () => void;
};

const createDebounced = <T>(fn: (value: T) => void, delay: number): Debounced<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastValue: T | undefined;

  const debounced = ((value: T) => {
    lastValue = value;
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = undefined;
      if (lastValue !== undefined) {
        fn(lastValue);
      }
    }, delay);
  }) as Debounced<T>;

  debounced.flush = () => {
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
      if (lastValue !== undefined) {
        fn(lastValue);
      }
    }
  };

  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = undefined;
    lastValue = undefined;
  };

  return debounced;
};

type PersistableSlice = PersistedState;

type StoreSlice<T> = Pick<StoreApi<T>, 'getState' | 'setState' | 'subscribe'>;

interface PersistenceOptions {
  key?: string;
  debounceMs?: number;
}

export const attachStorePersistence = <T extends PersistableSlice>(
  store: StoreSlice<T>,
  options: PersistenceOptions = {},
): (() => void) => {
  if (!isBrowser()) {
    return () => {};
  }

  const key = options.key ?? STORAGE_KEY;
  const debounceMs = options.debounceMs ?? 300;

  const persisted = loadState(key);
  if (persisted) {
    store.setState(persisted as Partial<T>);
  }

  const debouncedSave = createDebounced((slice: PersistedState) => {
    saveState(slice, key);
  }, debounceMs);

  const unsubscribe = store.subscribe((state) => {
    const snapshot = extractPersistableState(state as unknown as PersistedState);
    debouncedSave(snapshot);
  });

  return () => {
    unsubscribe();
    debouncedSave.flush();
  };
};
