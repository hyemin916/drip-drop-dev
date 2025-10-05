// Category type
export type Category = '일상' | '개발';

// Category info interface
export interface CategoryInfo {
  value: Category;
  label: string;
  description: string;
  slug: string;
  count?: number;
}

// Predefined categories
export const CATEGORIES: Record<Category, CategoryInfo> = {
  '일상': {
    value: '일상',
    label: '일상',
    description: 'Daily life stories and personal reflections',
    slug: 'daily-life',
  },
  '개발': {
    value: '개발',
    label: '개발',
    description: 'Development tutorials and technical insights',
    slug: 'development',
  },
};

// Helper function to get category by slug
export function getCategoryBySlug(slug: string): Category | null {
  const entry = Object.entries(CATEGORIES).find(([, info]) => info.slug === slug);
  return entry ? (entry[0] as Category) : null;
}

// Helper function to validate category
export function isValidCategory(value: unknown): value is Category {
  return value === '일상' || value === '개발';
}
