'use client';

import { useMemo } from 'react';
import type { FC } from 'react';
import { exportCharactersToCSV, exportCharactersToJSON } from '../../lib/exportUtils';
import type { Character } from '../../types';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  characters: Character[];
}

const downloadFile = (data: string, mimeType: string, filename: string) => {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const ExportDialog: FC<ExportDialogProps> = ({ open, onClose, characters }) => {
  const isEmpty = characters.length === 0;
  const formattedCount = useMemo(() => `${characters.length}件`, [characters.length]);

  if (!open) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 p-6 text-white shadow-2xl">
        <header className="mb-4">
          <h2 className="text-2xl font-semibold">キャラクターを書き出し</h2>
          <p className="text-sm text-slate-400">選択中のキャラクター: {formattedCount}</p>
        </header>

        <div className="space-y-4">
          <button
            type="button"
            disabled={isEmpty}
            onClick={() => {
              const data = exportCharactersToJSON(characters);
              downloadFile(data, 'application/json', 'characters.json');
            }}
            className="w-full rounded-2xl bg-purple-500 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:bg-slate-700"
          >
            JSONでダウンロード
            <span className="block text-xs font-normal text-purple-100">バックアップや他ツールへの再取り込み向け</span>
          </button>

          <button
            type="button"
            disabled={isEmpty}
            onClick={() => {
              const csv = exportCharactersToCSV(characters);
              downloadFile(csv, 'text/csv', 'characters.csv');
            }}
            className="w-full rounded-2xl bg-indigo-500 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-700"
          >
            CSVでダウンロード
            <span className="block text-xs font-normal text-indigo-100">スプレッドシートで編集する時に便利</span>
          </button>
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

export default ExportDialog;
