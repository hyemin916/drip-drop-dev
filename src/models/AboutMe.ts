import { z } from 'zod';

// AboutMe interface
export interface AboutMe {
  id: 'about-me';
  content: string;
  updatedAt: Date;
  author: string;
}

// Zod validation schema
export const AboutMeSchema = z.object({
  id: z.literal('about-me'),
  content: z.string().max(10000),
  updatedAt: z.date(),
  author: z.string(),
});

// Update interface
export interface AboutMeUpdate {
  content: string;
}

// Update schema
export const AboutMeUpdateSchema = z.object({
  content: z.string().max(10000),
});
