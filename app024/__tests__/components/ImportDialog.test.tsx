import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImportDialog from '../../app/components/ImportDialog';
import type { Character } from '../../types';

describe('ImportDialog', () => {
  it('reads file and triggers import handler', async () => {
    const user = userEvent.setup();
    const handleImport = jest.fn().mockResolvedValue(true);
    const characters: Character[] = [
      {
        id: 'char_001',
        name: '霧野あおい',
        appearance: '銀髪、紫の瞳',
        personality: '落ち着いた話し方',
        background: '異世界の司書',
        tags: ['司書', '異世界'],
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
        updatedAt: new Date('2025-01-02T00:00:00.000Z'),
        version: 1,
      },
    ];
    const file = new File([JSON.stringify(characters)], 'characters.json', { type: 'application/json' });

    render(<ImportDialog open onClose={jest.fn()} onImport={handleImport} />);

    const input = screen.getByLabelText('JSONファイルを選択');
    await user.upload(input, file);

    await waitFor(() => expect(handleImport).toHaveBeenCalled());
  });
});
