import type { Character, PromptTemplate } from '../../types';
import { generatePrompt, buildPromptContext } from '../../lib/promptGenerator';

const character: Character = {
  id: 'char_001',
  name: '霧野あおい',
  appearance: '銀髪、紫の瞳、黒を基調とした衣装',
  personality: '丁寧な口調で静かに語る',
  background: '異世界図書館の司書',
  tags: ['司書', '異世界'],
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-02T00:00:00Z'),
  version: 1,
};

const template: PromptTemplate = {
  id: 'image',
  name: '画像用',
  category: 'image',
  template: '{{name}} | {{appearance}} | Tags: {{tags}}',
  variables: ['name', 'appearance', 'tags'],
  createdAt: new Date('2025-01-01T00:00:00Z'),
};

describe('promptGenerator', () => {
  it('builds context strings from character', () => {
    const context = buildPromptContext(character);
    expect(context.name).toBe('霧野あおい');
    expect(context.tags).toBe('司書, 異世界');
    expect(context.summary).toContain('丁寧な口調');
  });

  it('generates prompt by replacing template variables', () => {
    const prompt = generatePrompt(character, template);
    expect(prompt).toContain('霧野あおい');
    expect(prompt).toContain('銀髪');
    expect(prompt).toContain('司書, 異世界');
  });
});
