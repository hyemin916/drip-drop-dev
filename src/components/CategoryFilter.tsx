'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { CATEGORIES } from '@/models/Category';
import clsx from 'clsx';

const ALL_CATEGORY = 'All';

export default function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');

  const handleCategoryClick = (categorySlug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (categorySlug) {
      params.set('category', categorySlug);
    } else {
      params.delete('category');
    }

    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-6 mb-8">
      <button
        onClick={() => handleCategoryClick(null)}
        className={clsx(
          'relative pb-1 text-sm font-medium transition-colors',
          !currentCategory
            ? 'text-zinc-900 dark:text-zinc-100'
            : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
        )}
      >
        {ALL_CATEGORY}
        <span
          className={clsx(
            'absolute inset-x-0 -bottom-px h-0.5 bg-teal-500 dark:bg-teal-400 origin-left transition-transform duration-300 ease-out',
            !currentCategory ? 'scale-x-100' : 'scale-x-0'
          )}
        />
      </button>

      {Object.values(CATEGORIES).map((category) => (
        <button
          key={category.slug}
          onClick={() => handleCategoryClick(category.slug)}
          className={clsx(
            'relative pb-1 text-sm font-medium transition-colors',
            currentCategory === category.slug
              ? 'text-zinc-900 dark:text-zinc-100'
              : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          )}
        >
          {category.label}
          <span
            className={clsx(
              'absolute inset-x-0 -bottom-px h-0.5 bg-teal-500 dark:bg-teal-400 origin-left transition-transform duration-300 ease-out',
              currentCategory === category.slug ? 'scale-x-100' : 'scale-x-0'
            )}
          />
        </button>
      ))}
    </div>
  );
}
