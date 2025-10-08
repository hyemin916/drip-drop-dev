import { z } from 'zod';

// AboutMe interface
export interface AboutMe {
  id: 'about-me';
  content: string;
  updatedAt: Date;
  author: string;
  image?: string;
  email?: string;
  github?: string;
  twitter?: string;
  linkedin?: string;
}

// Zod validation schema
export const AboutMeSchema = z.object({
  id: z.literal('about-me'),
  content: z.string().max(10000),
  updatedAt: z.date(),
  author: z.string(),
  image: z.string().optional(),
  email: z.string().email().optional(),
  github: z.string().url().optional(),
  twitter: z.string().url().optional(),
  linkedin: z.string().url().optional(),
});

// Update interface
export interface AboutMeUpdate {
  content: string;
}

// Update schema
export const AboutMeUpdateSchema = z.object({
  content: z.string().max(10000),
});
