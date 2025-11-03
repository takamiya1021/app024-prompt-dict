import { act } from '@testing-library/react';
import {
  attachStorePersistence,
  clearState,
  loadState,
  saveState,
  STORAGE_KEY,
} from '../lib/storage';
import { useCharacterStore } from '../store/useCharacterStore';
import type { PersistedState } from '../types';

describe('storage utilities', () => {
  const createPersistedState = (): PersistedState => ({
    characters: [
      {
        id: 'char_001',
        name: 'テストキャラ',
        appearance: '黒髪',
        personality: '明るい',
        background: 'テスト背景',
        tags: ['テスト'],
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-01T00:00:00Z'),
        version: 1,
      },
    ],
    templates: [
      {
        id: 'tpl_001',
        name: 'テンプレ',
        category: 'image',
        template: '{{name}}',
        variables: ['name'],
        createdAt: new Date('2025-01-01T00:00:00Z'),
      },
    ],
    settings: {
      geminiApiKey: 'sk-xxx',
      defaultTemplate: 'tpl_001',
      gridColumns: 3,
      cardSize: 'medium',
    },
    selectedCharacterId: null,
    selectedTags: [],
    searchQuery: '',
  });

  beforeEach(() => {
    localStorage.clear();
    useCharacterStore.getState().reset();
  });

  it('saves app state to localStorage', () => {
    const state = createPersistedState();

    saveState(state);

    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
  });

  it('loads state from localStorage and revives dates', () => {
    const state = createPersistedState();
    saveState(state);

    const loaded = loadState();

    expect(loaded).not.toBeNull();
    expect(loaded?.characters[0].createdAt).toBeInstanceOf(Date);
    expect(loaded?.templates[0].createdAt).toBeInstanceOf(Date);
  });

  it('hydrates and persists via store attachment', () => {
    const state = createPersistedState();
    saveState(state);
    useCharacterStore.getState().reset();

    jest.useFakeTimers();

    const detach = attachStorePersistence(useCharacterStore, { debounceMs: 25 });

    expect(useCharacterStore.getState().characters).toHaveLength(1);

    act(() => {
      useCharacterStore.getState().updateCharacter('char_001', { name: '更新キャラ' });
    });

    jest.advanceTimersByTime(30);

    const stored = localStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();
    const parsed = stored ? JSON.parse(stored) : null;
    expect(parsed?.characters[0].name).toBe('更新キャラ');

    detach();
    jest.useRealTimers();
  });

  it('clears stored data', () => {
    const state = createPersistedState();
    saveState(state);

    clearState();

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
