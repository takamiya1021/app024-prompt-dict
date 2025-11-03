import { create } from 'zustand';
import type {
  AppSettings,
  Character,
  CharacterSnapshot,
  CharacterVersion,
  PromptTemplate,
} from '../types';

type CharacterStoreData = {
  characters: Character[];
  templates: PromptTemplate[];
  selectedCharacterId: string | null;
  selectedTags: string[];
  searchQuery: string;
  settings: AppSettings;
};

const createInitialSettings = (): AppSettings => ({
  defaultTemplate: '',
  gridColumns: 3,
  cardSize: 'medium',
});

const createInitialDataState = (): CharacterStoreData => ({
  characters: [],
  templates: [],
  selectedCharacterId: null,
  selectedTags: [],
  searchQuery: '',
  settings: createInitialSettings(),
});

const generateId = (prefix: string): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const incrementVersion = (character: Character, proposed?: number): number => {
  if (typeof proposed === 'number' && proposed > character.version) {
    return proposed;
  }
  return character.version + 1;
};

const toSnapshot = (character: Character): CharacterSnapshot => {
  const { versionHistory, ...snapshot } = character;
  void versionHistory;
  return snapshot;
};

const normaliseVersionHistory = (history?: CharacterVersion[]): CharacterVersion[] | undefined =>
  history?.map((entry) => ({
    ...entry,
    changedAt: new Date(entry.changedAt),
    character: {
      ...entry.character,
      createdAt: new Date(entry.character.createdAt),
      updatedAt: new Date(entry.character.updatedAt),
    },
  }));

export interface CharacterStoreState extends CharacterStoreData {
  addCharacter: (character: Character) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  removeCharacter: (id: string) => void;
  duplicateCharacter: (id: string) => void;
  setSelectedCharacter: (id: string | null) => void;
  setSelectedTags: (tags: string[]) => void;
  setSearchQuery: (query: string) => void;
  addTemplate: (template: PromptTemplate) => void;
  updateTemplate: (id: string, updates: Partial<PromptTemplate>) => void;
  removeTemplate: (id: string) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  saveVersion: (characterId: string, description?: string) => void;
  restoreVersion: (characterId: string, version: number) => void;
  exportCharacters: (ids?: string[]) => string;
  importCharacters: (jsonData: string) => void;
  filteredCharacters: () => Character[];
  allTags: () => string[];
  reset: () => void;
}

export const useCharacterStore = create<CharacterStoreState>((set, get) => ({
  ...createInitialDataState(),
  addCharacter: (character) =>
    set((state) => ({
      characters: [...state.characters, { ...character }],
    })),
  updateCharacter: (id, updates) =>
    set((state) => ({
      characters: state.characters.map((character) => {
        if (character.id !== id) {
          return character;
        }

        const nextVersion = incrementVersion(character, updates.version);
        return {
          ...character,
          ...updates,
          version: nextVersion,
          updatedAt: updates.updatedAt ?? new Date(),
        };
      }),
    })),
  removeCharacter: (id) =>
    set((state) => ({
      characters: state.characters.filter((character) => character.id !== id),
      selectedCharacterId: state.selectedCharacterId === id ? null : state.selectedCharacterId,
    })),
  duplicateCharacter: (id) =>
    set((state) => {
      const original = state.characters.find((character) => character.id === id);
      if (!original) {
        return {} as CharacterStoreData;
      }

      const duplicateId = generateId('char');
      const duplicate: Character = {
        ...original,
        id: duplicateId,
        name: `${original.name} Copy`,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        versionHistory: [],
      };

      return {
        characters: [...state.characters, duplicate],
      } as CharacterStoreData;
    }),
  setSelectedCharacter: (id) =>
    set({
      selectedCharacterId: id,
    }),
  setSelectedTags: (tags) =>
    set({
      selectedTags: tags,
    }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  addTemplate: (template) =>
    set((state) => ({
      templates: [...state.templates, { ...template }],
    })),
  updateTemplate: (id, updates) =>
    set((state) => ({
      templates: state.templates.map((template) =>
        template.id === id
          ? {
              ...template,
              ...updates,
              updatedAt: updates.updatedAt ?? new Date(),
            }
          : template,
      ),
    })),
  removeTemplate: (id) =>
    set((state) => ({
      templates: state.templates.filter((template) => template.id !== id),
    })),
  updateSettings: (updates) =>
    set((state) => ({
      settings: { ...state.settings, ...updates },
    })),
  saveVersion: (characterId, description) =>
    set((state) => ({
      characters: state.characters.map((character) => {
        if (character.id !== characterId) {
          return character;
        }

        const history = character.versionHistory ?? [];
        const versionEntry: CharacterVersion = {
          version: character.version,
          character: toSnapshot(character),
          changedAt: new Date(),
          changeDescription: description,
        };

        return {
          ...character,
          versionHistory: [...history, versionEntry],
        };
      }),
    })),
  restoreVersion: (characterId, version) =>
    set((state) => ({
      characters: state.characters.map((character) => {
        if (character.id !== characterId || !character.versionHistory) {
          return character;
        }

        const entry = character.versionHistory.find((historyItem) => historyItem.version === version);
        if (!entry) {
          return character;
        }

        return {
          ...character,
          ...entry.character,
          version: entry.version,
          updatedAt: new Date(),
        };
      }),
    })),
  exportCharacters: (ids = []) => {
    const characters = get().characters;
    const target = ids.length ? characters.filter((character) => ids.includes(character.id)) : characters;
    return JSON.stringify(target);
  },
  importCharacters: (jsonData) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (!Array.isArray(parsed)) {
        return;
      }

      const normalisedCharacters: Character[] = parsed.map((character) => ({
        ...character,
        createdAt: new Date(character.createdAt),
        updatedAt: new Date(character.updatedAt),
        versionHistory: normaliseVersionHistory(character.versionHistory),
      }));

      set((state) => ({
        characters: [...state.characters, ...normalisedCharacters],
      }));
    } catch (error) {
      console.error('Failed to import characters', error);
    }
  },
  filteredCharacters: () => {
    const { characters, searchQuery, selectedTags } = get();
    const trimmedQuery = searchQuery.trim().toLowerCase();

    return characters.filter((character) => {
      const matchesQuery =
        trimmedQuery.length === 0 ||
        [character.name, character.appearance, character.personality, character.background]
          .some((field) => field.toLowerCase().includes(trimmedQuery));

      const matchesTags =
        selectedTags.length === 0 || selectedTags.every((tag) => character.tags.includes(tag));

      return matchesQuery && matchesTags;
    });
  },
  allTags: () => {
    const { characters } = get();
    const tags = new Set<string>();
    characters.forEach((character) => {
      character.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  },
  reset: () => set(() => createInitialDataState()),
}));
