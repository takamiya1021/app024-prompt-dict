import { exportCharactersToJSON, exportCharactersToCSV } from '../../lib/exportUtils';
import type { Character } from '../../types';

const characters: Character[] = [
  {
    id: 'char_001',
    name: '霧野あおい',
    appearance: '銀髪、紫の瞳',
    personality: '落ち着いた話し方',
    background: '異世界の司書',
    tags: ['司書', '異世界'],
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-02T00:00:00Z'),
    version: 1,
  },
];

describe('exportUtils', () => {
  it('exports characters to JSON string', () => {
    const json = exportCharactersToJSON(characters);
    const parsed = JSON.parse(json);
    expect(parsed[0].name).toBe('霧野あおい');
    expect(parsed[0].tags).toEqual(['司書', '異世界']);
  });

  it('exports characters to CSV format', () => {
    const csv = exportCharactersToCSV(characters);
    expect(csv).toContain('id,name,appearance,personality,background,tags');
    expect(csv).toContain('char_001');
    expect(csv).toContain('"司書|異世界"');
  });
});
