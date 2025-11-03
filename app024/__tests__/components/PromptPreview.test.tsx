import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PromptPreview from '../../app/components/PromptPreview';

const SAMPLE_PROMPTS = {
  image: 'image prompt text',
  text: 'text prompt text',
};

describe('PromptPreview', () => {
  it('renders current prompt and allows copying', async () => {
    const user = userEvent.setup();
    const handleCopy = jest.fn();

    render(
      <PromptPreview
        prompts={SAMPLE_PROMPTS}
        current="image"
        onChangeTemplate={jest.fn()}
        onCopy={handleCopy}
        templates={[{ id: 'image', name: '画像用' }, { id: 'text', name: '文章用' }]}
      />,
    );

    expect(screen.getByText('image prompt text')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'コピー' }));

    expect(handleCopy).toHaveBeenCalledWith('image prompt text');
  });

  it('switches templates when select changes', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(
      <PromptPreview
        prompts={SAMPLE_PROMPTS}
        current="image"
        onChangeTemplate={handleChange}
        onCopy={jest.fn()}
        templates={[{ id: 'image', name: '画像用' }, { id: 'text', name: '文章用' }]}
      />,
    );

    await user.selectOptions(screen.getByLabelText('テンプレート'), 'text');

    expect(handleChange).toHaveBeenCalledWith('text');
  });
});
