import { z } from 'zod';
import { Category } from './Category';
import { Image, ImageSchema } from './Image';

// Post interface
export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: Category;
  publishedAt: Date;
  updatedAt: Date | null;
  thumbnail: Image | null;
  images: Image[];
  author: string;
}

// Summary interface for list views
export interface PostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: Category;
  publishedAt: string;
  thumbnail: Image | null;
  author: string;
  summary: string;
}

// Create interface
export interface PostCreate {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: Category;
  thumbnail?: string | null;
  author: string;
}

// Update interface
export interface PostUpdate {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  category?: Category;
  thumbnail?: string | null;
}

// Zod validation schemas
export const PostSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  content: z.string().max(50000),
  excerpt: z.string().max(200),
  category: z.enum(['Daily', 'Dev']),
  publishedAt: z.date(),
  updatedAt: z.date().nullable(),
  thumbnail: ImageSchema.nullable(),
  images: z.array(ImageSchema),
  author: z.string(),
});

export const PostCreateSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  content: z.string().max(50000),
  excerpt: z.string().max(200),
  category: z.enum(['Daily', 'Dev']),
  thumbnail: z.string().nullable().optional(),
  author: z.string(),
});

export const PostUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  content: z.string().max(50000).optional(),
  excerpt: z.string().max(200).optional(),
  category: z.enum(['Daily', 'Dev']).optional(),
  thumbnail: z.string().nullable().optional(),
});
