'use client';

import { CATEGORIES } from '@/models/Category';
import clsx from 'clsx';

const ALL_CATEGORY = 'All';

interface CategoryFilterProps {
  currentCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export default function CategoryFilter({ currentCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-6 mb-8">
      <button
        onClick={() => onCategoryChange(null)}
        className={clsx(
          'relative pb-1 text-sm font-medium transition-colors cursor-pointer',
          !currentCategory
            ? 'text-zinc-900 dark:text-zinc-100'
            : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
        )}
      >
        {ALL_CATEGORY}
        <span
          className={clsx(
            'absolute inset-x-0 -bottom-px h-0.5 bg-drip origin-left transition-transform duration-300 ease-out',
            !currentCategory ? 'scale-x-100' : 'scale-x-0'
          )}
        />
      </button>

      {Object.values(CATEGORIES).map((category) => (
        <button
          key={category.slug}
          onClick={() => onCategoryChange(category.slug)}
          className={clsx(
            'relative pb-1 text-sm font-medium transition-colors cursor-pointer',
            currentCategory === category.slug
              ? 'text-zinc-900 dark:text-zinc-100'
              : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          )}
        >
          {category.label}
          <span
            className={clsx(
              'absolute inset-x-0 -bottom-px h-0.5 bg-drip origin-left transition-transform duration-300 ease-out',
              currentCategory === category.slug ? 'scale-x-100' : 'scale-x-0'
            )}
          />
        </button>
      ))}
    </div>
  );
}
