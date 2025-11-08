import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PromptPreview from '../../app/components/PromptPreview';

const SAMPLE_PROMPTS = {
  image: 'image prompt text',
  text: 'text prompt text',
};

describe('PromptPreview', () => {
  it('renders current prompt, copies, and shows feedback', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const handleCopy = jest.fn().mockResolvedValue(true);

    try {
      render(
        <PromptPreview
          prompts={SAMPLE_PROMPTS}
          current="image"
          onChangeTemplate={jest.fn()}
          onCopy={handleCopy}
          templates={[{ id: 'image', name: '画像用' }, { id: 'text', name: '文章用' }]}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'コピー' }));

      expect(handleCopy).toHaveBeenCalledWith('image prompt text');
      expect(await screen.findByText('コピーしました')).toBeInTheDocument();

      await act(async () => {
        jest.advanceTimersByTime(2500);
      });
      await waitFor(() => expect(screen.queryByText('コピーしました')).not.toBeInTheDocument());
    } finally {
      jest.useRealTimers();
    }
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
