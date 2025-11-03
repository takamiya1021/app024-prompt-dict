'use client';

import type { FC } from 'react';
import { useMemo } from 'react';

interface HeaderProps {
  characterCount: number;
  onCreateCharacter: () => void;
}

const Header: FC<HeaderProps> = ({ characterCount, onCreateCharacter }) => {
  const characterLabel = useMemo(
    () => `キャラクター: ${characterCount}名`,
    [characterCount],
  );

  return (
    <header className="flex flex-col gap-4 rounded-xl bg-slate-900/70 p-6 text-white shadow-lg md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-400">Characters Library</p>
        <h1 className="text-2xl font-semibold md:text-3xl">キャラプロンプト辞書</h1>
        <p className="mt-1 text-sm text-slate-300" data-testid="character-count">
          {characterLabel}
        </p>
      </div>
      <button
        type="button"
        onClick={onCreateCharacter}
        className="inline-flex items-center justify-center rounded-full bg-purple-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-purple-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-300"
      >
        新規キャラ作成
      </button>
    </header>
  );
};

export default Header;
