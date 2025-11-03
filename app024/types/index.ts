export type CharacterTag = string;

export type PromptTemplateCategory = 'image' | 'text' | 'custom';

export interface PromptTemplate {
  id: string;
  name: string;
  category: PromptTemplateCategory;
  template: string;
  description?: string;
  variables: string[];
  createdAt: Date;
  updatedAt?: Date;
}

export type CharacterID = string;

export interface Character {
  id: CharacterID;
  name: string;
  appearance: string;
  personality: string;
  background: string;
  tags: CharacterTag[];
  thumbnail?: string;
  version: number;
  versionHistory?: CharacterVersion[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CharacterVersion {
  version: number;
  character: CharacterSnapshot;
  changedAt: Date;
  changeDescription?: string;
}

export type CharacterSnapshot = Omit<Character, 'versionHistory'>;

export type CardSize = 'small' | 'medium' | 'large';

export interface AppSettings {
  geminiApiKey?: string;
  defaultTemplate: string;
  gridColumns: number;
  cardSize: CardSize;
}

export interface PersistedState {
  characters: Character[];
  templates: PromptTemplate[];
  settings: AppSettings;
  selectedCharacterId: string | null;
  selectedTags: string[];
  searchQuery: string;
}
