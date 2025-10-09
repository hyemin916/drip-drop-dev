// Category type
export type Category = 'Daily' | 'Dev';

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
  'Daily': {
    value: 'Daily',
    label: 'Daily',
    description: 'Daily life stories and personal reflections',
    slug: 'daily-life',
  },
  'Dev': {
    value: 'Dev',
    label: 'Dev',
    description: 'Development tutorials and technical insights',
    slug: 'development',
  },
};

// Helper function to get category by slug
export function getCategoryBySlug(slug: string): Category | null {
  const entry = Object.entries(CATEGORIES).find(([, info]) => info.slug === slug);
  return entry ? (entry[0] as Category) : null;
}
