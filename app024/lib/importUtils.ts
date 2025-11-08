import type { Character } from '../types';

const isString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

export const validateCharactersPayload = (payload: Partial<Character>[]): payload is Character[] => {
  if (!Array.isArray(payload)) {
    return false;
  }

  return payload.every((character) =>
    isString(character.id) &&
    isString(character.name) &&
    typeof character.version === 'number' &&
    Array.isArray(character.tags),
  );
};

export const parseCharactersFromJSON = (json: string): Character[] => {
  const raw = JSON.parse(json);
  if (!validateCharactersPayload(raw)) {
    throw new Error('Invalid character payload');
  }

  return raw.map((character) => ({
    ...character,
    createdAt: character.createdAt ? new Date(character.createdAt) : new Date(),
    updatedAt: character.updatedAt ? new Date(character.updatedAt) : new Date(),
  }));
};
