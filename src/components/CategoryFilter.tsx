'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { CATEGORIES, Category } from '@/models/Category';

const ALL_CATEGORY = '전체';

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

  const isActive = (categorySlug: string | null) => {
    return currentCategory === categorySlug;
  };

  return (
    <div className="flex gap-2 mb-8">
      <button
        onClick={() => handleCategoryClick(null)}
        className={`px-4 py-2 rounded-full font-medium transition-colors ${
          !currentCategory
            ? 'bg-drip text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        {ALL_CATEGORY}
      </button>

      {Object.values(CATEGORIES).map((category) => (
        <button
          key={category.slug}
          onClick={() => handleCategoryClick(category.slug)}
          className={`px-4 py-2 rounded-full font-medium transition-colors ${
            currentCategory === category.slug
              ? 'bg-drip text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
