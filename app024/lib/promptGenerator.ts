import type { Character, PromptTemplate } from '../types';
import { renderTemplate } from './templateEngine';

export type PromptContext = Record<string, string>;

const joinTags = (tags: string[]): string => (tags.length ? tags.join(', ') : '');

export const buildPromptContext = (character: Character): PromptContext => ({
  name: character.name,
  appearance: character.appearance,
  personality: character.personality,
  background: character.background,
  tags: joinTags(character.tags),
  summary: `${character.name}: ${character.appearance}. 性格: ${character.personality}. 背景: ${character.background}.`,
});

export const generatePrompt = (
  character: Character,
  template: PromptTemplate,
  extraContext: PromptContext = {},
): string => {
  const context = {
    ...buildPromptContext(character),
    ...extraContext,
  };

  return renderTemplate(template.template, context);
};
