'use client';

import { useRef, useState } from 'react';
import type { FC, ChangeEvent } from 'react';
import { parseCharactersFromJSON } from '../../lib/importUtils';
import type { Character } from '../../types';

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (characters: Character[]) => Promise<void> | void;
}

const ImportDialog: FC<ImportDialogProps> = ({ open, onClose, onImport }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) {
    return null;
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const characters = parseCharactersFromJSON(text);
      await onImport(characters);
      onClose();
    } catch (err) {
      setError('ファイルの読み込みに失敗しました。内容を確認してください。');
      console.error(err);
    } finally {
      setLoading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 p-6 text-white shadow-2xl">
        <header className="mb-4">
          <h2 className="text-2xl font-semibold">キャラクターを読み込み</h2>
          <p className="text-sm text-slate-400">JSONファイルを選択するとキャラクターを追加できます。</p>
        </header>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-200" htmlFor="import-file">
            JSONファイルを選択
          </label>
          <input
            id="import-file"
            ref={inputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileChange}
            disabled={loading}
            aria-label="JSONファイルを選択"
            className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm text-white"
          />
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
        </div>

        <div className="mt-6 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-600 px-5 py-2 text-sm font-semibold text-slate-200 transition hover:border-purple-400 hover:text-purple-200"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportDialog;
