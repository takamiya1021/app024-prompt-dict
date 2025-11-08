export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (!text) {
    return false;
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.warn('Clipboard API copy failed, falling back to execCommand', error);
    }
  }

  if (typeof document === 'undefined') {
    return false;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();

  const execCommand = (document as Document & {
    execCommand?: (commandId: string) => boolean;
  }).execCommand;

  let success = false;
  try {
    success = typeof execCommand === 'function' ? execCommand.call(document, 'copy') : false;
  } catch (error) {
    console.error('execCommand copy failed', error);
  } finally {
    document.body.removeChild(textarea);
  }

  return success;
};
