import type { Character } from '../types';

const replacer = (_key: string, value: unknown) => {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value;
};

export const exportCharactersToJSON = (characters: Character[]): string =>
  JSON.stringify(characters, replacer, 2);

const escapeCSV = (value: string) => {
  if (value.includes('"') || value.includes(',') || value.includes('\n') || value.includes('|')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

export const exportCharactersToCSV = (characters: Character[]): string => {
  const header = ['id', 'name', 'appearance', 'personality', 'background', 'tags'];
  const rows = characters.map((character) => [
    character.id,
    character.name,
    character.appearance,
    character.personality,
    character.background,
    character.tags.join('|'),
  ]);

  const csvLines = [header, ...rows]
    .map((columns) => columns.map((column) => escapeCSV(column ?? '')).join(','))
    .join('\n');

  return `${csvLines}\n`;
};
