import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../../app/components/SearchBar';
import TagFilter from '../../app/components/TagFilter';

const TAGS = ['主人公', 'サポート', '敵'];

describe('SearchBar', () => {
  it('calls onChange when user types', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(<SearchBar value="" onChange={handleChange} />);

    await user.type(screen.getByPlaceholderText('キャラ名や特徴で検索'), '霧野');

    expect(handleChange).toHaveBeenCalled();
  });
});

describe('TagFilter', () => {
  it('renders list of tags and toggles selection', async () => {
    const user = userEvent.setup();
    const handleToggle = jest.fn();

    render(<TagFilter tags={TAGS} selected={['主人公']} onToggle={handleToggle} />);

    expect(screen.getByRole('button', { name: '主人公' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: '敵' }));

    expect(handleToggle).toHaveBeenCalledWith('敵');
  });
});
