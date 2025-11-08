import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CharacterCard from '../../app/components/CharacterCard';
import type { Character } from '../../types';

const baseCharacter: Character = {
  id: 'char_001',
  name: '霧野あおい',
  appearance: '銀髪のバンス、紫の瞳、紫と黒の衣装',
  personality: '落ち着いた喋り、語尾に「〜なのです」',
  background: '異世界の司書',
  tags: ['司書', '異世界'],
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-02T00:00:00Z'),
  version: 1,
};

describe('CharacterCard', () => {
  it('renders character information', () => {
    render(
      <CharacterCard
        character={baseCharacter}
        onSelect={jest.fn()}
        onCopyPrompt={jest.fn()}
        selected={false}
      />,
    );

    expect(screen.getByRole('heading', { name: baseCharacter.name })).toBeInTheDocument();
    expect(screen.getByText('銀髪のバンス、紫の瞳、紫と黒の衣装')).toBeInTheDocument();
    expect(screen.getByText('異世界')).toBeInTheDocument();
  });

  it('shows selected state', () => {
    render(
      <CharacterCard
        character={baseCharacter}
        onSelect={jest.fn()}
        onCopyPrompt={jest.fn()}
        selected
      />,
    );

    expect(screen.getByTestId('character-card')).toHaveAttribute('data-selected', 'true');
  });

  it('handles prompt copy interaction and shows feedback', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const handleCopy = jest.fn().mockResolvedValue(true);

    try {
      render(
        <CharacterCard
          character={baseCharacter}
          onSelect={jest.fn()}
          onCopyPrompt={handleCopy}
          selected={false}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'プロンプトをコピー' }));

      expect(handleCopy).toHaveBeenCalledWith(baseCharacter.id);
      expect(await screen.findByText('コピーできたで！')).toBeInTheDocument();

      await act(async () => {
        jest.advanceTimersByTime(2500);
      });
      await waitFor(() => expect(screen.queryByText('コピーできたで！')).not.toBeInTheDocument());
    } finally {
      jest.useRealTimers();
    }
  });
});
