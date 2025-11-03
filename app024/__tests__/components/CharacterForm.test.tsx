import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CharacterForm, { CharacterFormValues } from '../../app/components/CharacterForm';
import type { Character } from '../../types';

const initialCharacter: Character = {
  id: 'char_001',
  name: '霧野あおい',
  appearance: '銀髪、紫の瞳',
  personality: 'おだやか',
  background: '司書',
  tags: ['司書', '魔法'],
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-02T00:00:00Z'),
  version: 1,
};

describe('CharacterForm', () => {
  it('prefills inputs with initial character data', () => {
    render(<CharacterForm initial={initialCharacter} onSubmit={jest.fn()} />);

    expect(screen.getByLabelText('名前')).toHaveValue('霧野あおい');
    expect(screen.getByLabelText('外見')).toHaveValue('銀髪、紫の瞳');
    expect(screen.getByLabelText('性格・口調')).toHaveValue('おだやか');
    expect(screen.getByLabelText('背景設定')).toHaveValue('司書');
    expect(screen.getByLabelText('タグ')).toHaveValue('司書, 魔法');
  });

  it('calls submit handler with form values', async () => {
    const handleSubmit = jest.fn();
    const user = userEvent.setup();

    render(<CharacterForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText('名前'), '新キャラ');
    await user.type(screen.getByLabelText('外見'), '蒼髪のショート');
    await user.type(screen.getByLabelText('性格・口調'), '明るい');
    await user.type(screen.getByLabelText('背景設定'), '冒険者');
    await user.type(screen.getByLabelText('タグ'), '冒険者, パーティ');

    await user.click(screen.getByRole('button', { name: '保存' }));

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    const payload = handleSubmit.mock.calls[0][0] as CharacterFormValues;
    expect(payload).toEqual({
      name: '新キャラ',
      appearance: '蒼髪のショート',
      personality: '明るい',
      background: '冒険者',
      tags: ['冒険者', 'パーティ'],
    });
  });

  it('fires cancel handler when provided', async () => {
    const handleCancel = jest.fn();
    const user = userEvent.setup();

    render(<CharacterForm onSubmit={jest.fn()} onCancel={handleCancel} initial={initialCharacter} />);

    await user.click(screen.getByRole('button', { name: 'キャンセル' }));

    expect(handleCancel).toHaveBeenCalledTimes(1);
  });
});
