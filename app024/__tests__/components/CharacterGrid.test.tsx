import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CharacterGrid from '../../app/components/CharacterGrid';
import type { Character } from '../../types';

const createCharacter = (overrides: Partial<Character>): Character => ({
  id: `char_${overrides.id ?? Math.random()}`,
  name: 'テストキャラ',
  appearance: '外見',
  personality: '性格',
  background: '背景',
  tags: ['タグ'],
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-02T00:00:00Z'),
  version: 1,
  ...overrides,
});

describe('CharacterGrid', () => {
  it('renders character cards', () => {
    const characters = [createCharacter({ id: '1', name: 'A' }), createCharacter({ id: '2', name: 'B' })];

    render(
      <CharacterGrid
        characters={characters}
        selectedId={null}
        onSelect={jest.fn()}
        onCopyPrompt={jest.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'A' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'B' })).toBeInTheDocument();
  });

  it('highlights selected character', () => {
    const characters = [createCharacter({ id: '1' })];

    render(
      <CharacterGrid
        characters={characters}
        selectedId="1"
        onSelect={jest.fn()}
        onCopyPrompt={jest.fn()}
      />,
    );

    expect(screen.getByTestId('character-card')).toHaveAttribute('data-selected', 'true');
  });

  it('forwards select handler from card', async () => {
    const user = userEvent.setup();
    const handleSelect = jest.fn();
    const characters = [createCharacter({ id: '1', name: 'A' })];

    render(
      <CharacterGrid
        characters={characters}
        selectedId={null}
        onSelect={handleSelect}
        onCopyPrompt={jest.fn()}
      />,
    );

    await user.click(screen.getByRole('heading', { name: 'A' }));

    expect(handleSelect).toHaveBeenCalledWith('1');
  });
});
