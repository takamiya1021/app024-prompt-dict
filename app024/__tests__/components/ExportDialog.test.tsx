import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExportDialog from '../../app/components/ExportDialog';
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

describe('ExportDialog', () => {
  it('triggers download when exporting JSON', async () => {
    const user = userEvent.setup();
    const handleClose = jest.fn();
    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;
    const createSpy = jest.fn(() => 'blob:mock');
    const revokeSpy = jest.fn();
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: createSpy,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: revokeSpy,
    });
    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(
      <ExportDialog
        open
        onClose={handleClose}
        characters={characters}
      />,
    );

    await user.click(
      screen.getByRole('button', {
        name: (accessibleName) => accessibleName.startsWith('JSONでダウンロード'),
      }),
    );

    await waitFor(() => expect(createSpy).toHaveBeenCalled());
    expect(clickSpy).toHaveBeenCalled();

    clickSpy.mockRestore();
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: originalCreate,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: originalRevoke,
    });
  });
});
