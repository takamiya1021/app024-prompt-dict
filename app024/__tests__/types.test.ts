import type { AppSettings, Character, PromptTemplate } from '../types';

describe('Type definitions', () => {
  it('allows constructing Character with mandatory fields', () => {
    const character: Character = {
      id: 'char_001',
      name: 'テストキャラ',
      appearance: '金髪',
      personality: '元気',
      background: 'テスト背景',
      tags: ['テスト'],
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    };

    expect(character.name).toBe('テストキャラ');
  });

  it('accepts optional properties on Character', () => {
    const character: Character = {
      id: 'char_002',
      name: 'オプション',
      appearance: '銀髪',
      personality: 'クール',
      background: '秘密',
      tags: [],
      thumbnail: 'data:image/png;base64,...',
      versionHistory: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 2,
    };

    expect(character.thumbnail).toContain('data:image/png');
  });

  it('ensures PromptTemplate categories are restricted', () => {
    const template: PromptTemplate = {
      id: 'tpl_001',
      name: '画像用',
      category: 'image',
      template: '{{name}}',
      variables: ['name'],
      createdAt: new Date(),
    };

    expect(template.category).toBe('image');
  });

  it('provides AppSettings structure', () => {
    const settings: AppSettings = {
      geminiApiKey: 'sk-xxx',
      defaultTemplate: 'tpl-default',
      gridColumns: 3,
      cardSize: 'medium',
    };

    expect(settings.cardSize).toBe('medium');
  });
});
