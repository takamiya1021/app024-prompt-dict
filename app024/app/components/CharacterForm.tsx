'use client';

import { useCallback, useState } from 'react';
import type { ChangeEvent, FC, FormEvent } from 'react';

export interface CharacterFormValues {
  name: string;
  appearance: string;
  personality: string;
  background: string;
  tags: string[];
}

interface CharacterFormProps {
  initial?: CharacterFormValues;
  onSubmit: (values: CharacterFormValues) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

const splitTags = (value: string): string[] =>
  value
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

const CharacterForm: FC<CharacterFormProps> = ({
  initial,
  onSubmit,
  onCancel,
  submitLabel = '保存',
}) => {
  const [fields, setFields] = useState({
    name: initial?.name ?? '',
    appearance: initial?.appearance ?? '',
    personality: initial?.personality ?? '',
    background: initial?.background ?? '',
    tagsInput: initial?.tags?.join(', ') ?? '',
  });

  const updateField = useCallback(
    (field: 'name' | 'appearance' | 'personality' | 'background') =>
      (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { value } = event.target;
        setFields((prev) => ({ ...prev, [field]: value }));
      },
    [],
  );

  const handleTagsChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setFields((prev) => ({ ...prev, tagsInput: value }));
  }, []);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      onSubmit({
        name: fields.name.trim(),
        appearance: fields.appearance.trim(),
        personality: fields.personality.trim(),
        background: fields.background.trim(),
        tags: splitTags(fields.tagsInput),
      });
    },
    [fields, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" aria-label="キャラクター編集フォーム">
      <div className="grid gap-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="character-name">
          名前
        </label>
        <input
          id="character-name"
          value={fields.name}
          onChange={updateField('name')}
          className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-white focus:border-purple-400 focus:outline-none"
          placeholder="キャラクター名"
          required
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="character-appearance">
          外見
        </label>
        <textarea
          id="character-appearance"
          value={fields.appearance}
          onChange={updateField('appearance')}
          className="min-h-[120px] rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-white focus:border-purple-400 focus:outline-none"
          placeholder="髪型、瞳の色、服装など"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="character-personality">
          性格・口調
        </label>
        <textarea
          id="character-personality"
          value={fields.personality}
          onChange={updateField('personality')}
          className="min-h-[120px] rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-white focus:border-purple-400 focus:outline-none"
          placeholder="話し方や性格の特徴"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="character-background">
          背景設定
        </label>
        <textarea
          id="character-background"
          value={fields.background}
          onChange={updateField('background')}
          className="min-h-[120px] rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-white focus:border-purple-400 focus:outline-none"
          placeholder="来歴や役割など"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="character-tags">
          タグ
        </label>
        <input
          id="character-tags"
          value={fields.tagsInput}
          onChange={handleTagsChange}
          className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-white focus:border-purple-400 focus:outline-none"
          placeholder="例: 主人公, 魔法使い"
        />
        <p className="text-xs text-slate-400">カンマ区切りで入力するとタグに分割されます。</p>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-600 px-5 py-2 text-sm font-semibold text-slate-200 transition hover:border-purple-400 hover:text-purple-200"
          >
            キャンセル
          </button>
        ) : null}
        <button
          type="submit"
          className="rounded-full bg-purple-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-purple-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-300"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default CharacterForm;
