'use client';

import { useEffect, useRef, useState } from 'react';
import type { FC, MouseEvent, KeyboardEvent } from 'react';
import clsx from 'clsx';
import type { Character } from '../../types';

interface CharacterCardProps {
  character: Character;
  selected: boolean;
  onSelect: (id: string) => void;
  onCopyPrompt: (id: string) => Promise<boolean | void> | boolean | void;
}

const COPY_FEEDBACK_DURATION = 2000;

const CharacterCard: FC<CharacterCardProps> = ({ character, selected, onSelect, onCopyPrompt }) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSelect = () => {
    onSelect(character.id);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSelect();
    }
  };

  const handleCopy = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const result = await onCopyPrompt(character.id);
    if (result !== false) {
      setCopied(true);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION);
    }
  };

  useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
    [],
  );

  return (
    <article
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      data-testid="character-card"
      data-selected={selected ? 'true' : 'false'}
      className={clsx(
        'group relative flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-5 text-left shadow-lg transition',
        selected && 'border-purple-400 shadow-purple-500/30',
        !selected && 'hover:border-purple-400/60 hover:shadow-purple-500/10',
      )}
    >
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{character.name}</h2>
          <p className="mt-2 text-sm text-slate-300">{character.personality}</p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 text-sm font-semibold text-white">
          {character.name.slice(0, 2)}
        </div>
      </header>

      <p className="line-clamp-3 text-sm text-slate-300">{character.appearance}</p>
      <p className="line-clamp-3 text-xs text-slate-400">{character.background}</p>

      <div className="flex flex-wrap gap-2">
        {character.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between pt-4">
        <span className="text-xs text-slate-500">更新: {character.updatedAt.toLocaleDateString()}</span>
        <div className="flex items-center gap-2">
          {copied ? (
            <span className="text-xs text-green-300" role="status">
              コピーできたで！
            </span>
          ) : null}
          <button
            type="button"
            className="rounded-full bg-purple-500 px-4 py-1 text-sm font-semibold text-white transition hover:bg-purple-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-300"
            onClick={handleCopy}
          >
            プロンプトをコピー
          </button>
        </div>
      </div>
    </article>
  );
};

export default CharacterCard;
