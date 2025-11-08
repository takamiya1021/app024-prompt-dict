'use client';

import type { FC } from 'react';
import clsx from 'clsx';

interface TagFilterProps {
  tags: string[];
  selected: string[];
  onToggle: (tag: string) => void;
}

const TagFilter: FC<TagFilterProps> = ({ tags, selected, onToggle }) => {
  if (!tags.length) {
    return null;
  }

  const isSelected = (tag: string) => selected.includes(tag);

  return (
    <div className="flex flex-wrap gap-2" aria-label="タグフィルター">
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          aria-pressed={isSelected(tag)}
          onClick={() => onToggle(tag)}
          className={clsx(
            'rounded-full px-4 py-1 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-300',
            isSelected(tag)
              ? 'bg-purple-500 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700',
          )}
        >
          {tag}
        </button>
      ))}
    </div>
  );
};

export default TagFilter;
