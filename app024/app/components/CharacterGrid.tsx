'use client';

import type { FC } from 'react';
import CharacterCard from './CharacterCard';
import type { Character } from '../../types';

interface CharacterGridProps {
  characters: Character[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCopyPrompt: (id: string) => void;
  emptyMessage?: string;
}

const CharacterGrid: FC<CharacterGridProps> = ({
  characters,
  selectedId,
  onSelect,
  onCopyPrompt,
  emptyMessage = 'キャラクターがまだ登録されていません。',
}) => {
  if (!characters.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 py-16 text-center text-slate-400">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <section
      aria-label="キャラクター一覧"
      className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
    >
      {characters.map((character) => (
        <CharacterCard
          key={character.id}
          character={character}
          selected={character.id === selectedId}
          onSelect={onSelect}
          onCopyPrompt={onCopyPrompt}
        />
      ))}
    </section>
  );
};

export default CharacterGrid;
