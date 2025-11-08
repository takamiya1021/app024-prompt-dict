'use client';

import type { ChangeEvent, FC } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar: FC<SearchBarProps> = ({ value, onChange }) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="relative">
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder="キャラ名や特徴で検索"
        aria-label="キャラクター検索"
        className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-2 pl-11 text-sm text-white placeholder:text-slate-500 focus:border-purple-400 focus:outline-none"
      />
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
    </div>
  );
};

export default SearchBar;
