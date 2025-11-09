import { act } from '@testing-library/react';
import type { Character, PromptTemplate } from '../types';
import { useCharacterStore } from '../store/useCharacterStore';

describe('useCharacterStore', () => {
  const createCharacter = (overrides: Partial<Character> = {}): Character => ({
    id: 'char_001',
    name: 'テストキャラ',
    appearance: '黒髪',
    personality: '明るい',
    background: 'テスト背景',
    tags: ['テスト'],
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
    version: 1,
    ...overrides,
  });

  const createTemplate = (overrides: Partial<PromptTemplate> = {}): PromptTemplate => ({
    id: 'tpl_001',
    name: 'テンプレ',
    category: 'image',
    template: '{{name}}',
    variables: ['name'],
    createdAt: new Date('2025-01-01T00:00:00Z'),
    ...overrides,
  });

  beforeEach(() => {
    act(() => {
      useCharacterStore.getState().reset();
    });
  });

  it('adds a character to the store', () => {
    const character = createCharacter();

    act(() => {
      useCharacterStore.getState().addCharacter(character);
    });

    expect(useCharacterStore.getState().characters).toHaveLength(1);
    expect(useCharacterStore.getState().characters[0].id).toBe(character.id);
  });

  it('updates a character and bumps the version', () => {
    const character = createCharacter();

    act(() => {
      useCharacterStore.getState().addCharacter(character);
      useCharacterStore
        .getState()
        .updateCharacter(character.id, {
          name: '更新後キャラ',
        });
    });

    const updated = useCharacterStore.getState().characters[0];
    expect(updated.name).toBe('更新後キャラ');
    expect(updated.version).toBeGreaterThan(character.version);
  });

  it('removes a character from the store', () => {
    const character = createCharacter();

    act(() => {
      useCharacterStore.getState().addCharacter(character);
      useCharacterStore.getState().removeCharacter(character.id);
    });

    expect(useCharacterStore.getState().characters).toHaveLength(0);
  });

  it('saves and restores character versions', () => {
    const character = createCharacter();

    act(() => {
      useCharacterStore.getState().addCharacter(character);
      useCharacterStore.getState().saveVersion(character.id, '初期版');
      useCharacterStore
        .getState()
        .updateCharacter(character.id, { name: '最新版' });
      useCharacterStore.getState().restoreVersion(character.id, 1);
    });

    const restored = useCharacterStore.getState().characters[0];
    expect(restored.name).toBe('テストキャラ');
  });

  it('keeps only the latest 10 version snapshots', () => {
    const character = createCharacter();

    act(() => {
      useCharacterStore.getState().addCharacter(character);
    });

    for (let i = 0; i < 12; i += 1) {
      // 保存してから名前を更新しバージョンを進める
      act(() => {
        useCharacterStore.getState().saveVersion(character.id, `v${i}`);
        useCharacterStore.getState().updateCharacter(character.id, {
          name: `キャラ${i}`,
        });
      });
    }

    const history = useCharacterStore.getState().characters[0].versionHistory ?? [];
    expect(history).toHaveLength(10);
    expect(history[0].changeDescription).toBe('v2');
    expect(history[history.length - 1].changeDescription).toBe('v11');
  });

  it('restoring creates a new version entry', () => {
    const character = createCharacter();

    act(() => {
      useCharacterStore.getState().addCharacter(character);
      useCharacterStore.getState().saveVersion(character.id, '初期版');
      useCharacterStore.getState().updateCharacter(character.id, { name: '更新版' });
      useCharacterStore.getState().restoreVersion(character.id, 1);
    });

    const restored = useCharacterStore.getState().characters[0];
    expect(restored.name).toBe('テストキャラ');
    expect(restored.version).toBeGreaterThan(2);
    expect(restored.versionHistory?.length).toBeGreaterThan(0);
  });

  it('manages prompt templates', () => {
    const template = createTemplate();

    act(() => {
      useCharacterStore.getState().addTemplate(template);
      useCharacterStore
        .getState()
        .updateTemplate(template.id, { name: '更新テンプレ' });
    });

    expect(useCharacterStore.getState().templates[0].name).toBe('更新テンプレ');

    act(() => {
      useCharacterStore.getState().removeTemplate(template.id);
    });

    expect(useCharacterStore.getState().templates).toHaveLength(0);
  });
});
