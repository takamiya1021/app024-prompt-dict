import { parseCharactersFromJSON, validateCharactersPayload } from '../../lib/importUtils';
import type { Character } from '../../types';

describe('importUtils', () => {
  it('parses and revives dates from JSON', () => {
    const payload = [
      {
        id: 'char_001',
        name: '霧野あおい',
        appearance: '銀髪',
        personality: '穏やか',
        background: '司書',
        tags: ['司書'],
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-02T00:00:00.000Z',
        version: 1,
      },
    ];

    const result = parseCharactersFromJSON(JSON.stringify(payload));
    expect(result[0].createdAt).toBeInstanceOf(Date);
    expect(result[0].name).toBe('霧野あおい');
  });

  it('validates required fields', () => {
    const valid: Partial<Character> = {
      id: 'char_001',
      name: 'ok',
      appearance: 'x',
      personality: 'y',
      background: 'z',
      tags: [],
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(validateCharactersPayload([valid])).toBe(true);
    expect(validateCharactersPayload([{ ...valid, name: undefined }])).toBe(false);
  });
});
