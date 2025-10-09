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
}

// Update schema
export const AboutMeUpdateSchema = z.object({
  content: z.string().max(10000),
});
