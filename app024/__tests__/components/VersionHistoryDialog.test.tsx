import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { CharacterVersion } from '../../types';
import VersionHistoryDialog from '../../app/components/VersionHistoryDialog';

describe('VersionHistoryDialog', () => {
  const versions: CharacterVersion[] = [
    {
      version: 1,
      character: {
        id: 'char_001',
        name: '初期',
        appearance: '',
        personality: '',
        background: '',
        tags: [],
        thumbnail: undefined,
        version: 1,
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-01T00:00:00Z'),
      },
      changedAt: new Date('2025-01-02T00:00:00Z'),
      changeDescription: '初期版',
    },
    {
      version: 2,
      character: {
        id: 'char_001',
        name: '二代目',
        appearance: '',
        personality: '',
        background: '',
        tags: [],
        thumbnail: undefined,
        version: 2,
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-03T00:00:00Z'),
      },
      changedAt: new Date('2025-01-03T00:00:00Z'),
      changeDescription: '改訂',
    },
  ];

  it('renders version entries and restores when button pressed', async () => {
    const user = userEvent.setup();
    const handleRestore = jest.fn();

    render(
      <VersionHistoryDialog
        open
        onClose={jest.fn()}
        currentVersion={3}
        versions={versions}
        onRestore={handleRestore}
        onSaveSnapshot={jest.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'バージョン2を復元' }));
    expect(handleRestore).toHaveBeenCalledWith(2);
  });

  it('disables restore for current version and saves snapshot', async () => {
    const user = userEvent.setup();
    const handleSave = jest.fn();

    render(
      <VersionHistoryDialog
        open
        onClose={jest.fn()}
        currentVersion={2}
        versions={versions}
        onRestore={jest.fn()}
        onSaveSnapshot={handleSave}
      />,
    );

    expect(screen.getByRole('button', { name: 'バージョン2を復元' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'スナップショットを保存' }));
    expect(handleSave).toHaveBeenCalled();
  });
});
