'use client';

import type { FC } from 'react';
import type { CharacterVersion } from '../../types';

interface VersionHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  versions: CharacterVersion[];
  currentVersion: number;
  onRestore: (version: number) => void;
  onSaveSnapshot: () => void;
}

const formatDateTime = (date: Date) =>
  new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

const VersionHistoryDialog: FC<VersionHistoryDialogProps> = ({
  open,
  onClose,
  versions,
  currentVersion,
  onRestore,
  onSaveSnapshot,
}) => {
  if (!open) {
    return null;
  }

  const sorted = [...versions].sort((a, b) => b.version - a.version);

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 p-6 text-white shadow-2xl">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">バージョン履歴</h2>
            <p className="text-sm text-slate-400">最新バージョン: v{currentVersion}</p>
          </div>
          <button
            type="button"
            onClick={onSaveSnapshot}
            className="rounded-full bg-purple-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-400"
          >
            スナップショットを保存
          </button>
        </header>

        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
          {sorted.length === 0 ? (
            <p className="text-sm text-slate-400">まだスナップショットがありません。</p>
          ) : (
            sorted.map((entry) => (
              <div key={entry.version} className="rounded-2xl border border-slate-700 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">バージョン v{entry.version}</p>
                    <p className="text-xs text-slate-400">{formatDateTime(entry.changedAt)}</p>
                    {entry.changeDescription && (
                      <p className="text-xs text-slate-300">{entry.changeDescription}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label={`バージョン${entry.version}を復元`}
                    className="rounded-full border border-purple-400 px-3 py-1 text-xs font-semibold text-purple-200 transition disabled:cursor-not-allowed disabled:border-slate-700 disabled:text-slate-500"
                    onClick={() => onRestore(entry.version)}
                    disabled={entry.version === currentVersion}
                  >
                    バージョン{entry.version}を復元
                  </button>
                </div>
              </div>
            ))
          )}
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

export default VersionHistoryDialog;
