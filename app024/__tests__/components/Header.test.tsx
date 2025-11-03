import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '../../app/components/Header';

describe('Header', () => {
  it('shows app title and character count', () => {
    render(<Header characterCount={5} onCreateCharacter={jest.fn()} />);

    expect(screen.getByRole('heading', { name: 'キャラプロンプト辞書' })).toBeInTheDocument();
    expect(screen.getByText('キャラクター: 5名')).toBeInTheDocument();
  });

  it('invokes create handler when button is pressed', async () => {
    const user = userEvent.setup();
    const handleCreate = jest.fn();

    render(<Header characterCount={0} onCreateCharacter={handleCreate} />);

    await user.click(screen.getByRole('button', { name: '新規キャラ作成' }));

    expect(handleCreate).toHaveBeenCalledTimes(1);
  });
});
