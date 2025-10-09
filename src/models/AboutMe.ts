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

// Update interface
export interface AboutMeUpdate {
  content: string;
  image?: string;
  email?: string;
  github?: string;
  twitter?: string;
  linkedin?: string;
}

// Update schema
export const AboutMeUpdateSchema = z.object({
  content: z.string().max(10000),
  image: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  github: z.string().url().optional().or(z.literal('')),
  twitter: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
});
