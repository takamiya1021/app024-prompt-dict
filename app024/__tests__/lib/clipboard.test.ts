import { copyToClipboard } from '../../lib/clipboard';

describe('copyToClipboard', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
      writable: true,
    });
  });

  it('uses navigator.clipboard when available', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    const result = await copyToClipboard('テスト');

    expect(writeText).toHaveBeenCalledWith('テスト');
    expect(result).toBe(true);
  });

  it('falls back to execCommand when clipboard API is unavailable', async () => {
    const execCommand = jest.fn().mockReturnValue(true);
    const documentWithExec = document as Document & { execCommand?: (commandId: string) => boolean };
    const original = documentWithExec.execCommand;
    documentWithExec.execCommand = execCommand;

    const result = await copyToClipboard('fallback');

    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(result).toBe(true);

    documentWithExec.execCommand = original;
  });
});
