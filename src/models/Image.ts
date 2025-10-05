import { z } from 'zod';

// Image format type
export type ImageFormat = 'webp' | 'png' | 'jpeg' | 'gif';

// Image interface
export interface Image {
  id: string;
  url: string;
  alt: string;
  caption: string | null;
  width: number;
  height: number;
  format: ImageFormat;
  fileSize: number;
  uploadedAt: Date;
}

// Zod validation schema
export const ImageSchema = z.object({
  id: z.string(),
  url: z.string().startsWith('/images/'),
  alt: z.string().min(1).max(200),
  caption: z.string().max(500).nullable(),
  width: z.number().positive(),
  height: z.number().positive(),
  format: z.enum(['webp', 'png', 'jpeg', 'gif']),
  fileSize: z.number().max(5242880), // 5MB
  uploadedAt: z.date(),
});

// Helper function to get file extension from format
export function getFileExtension(format: ImageFormat): string {
  const extensions: Record<ImageFormat, string> = {
    webp: '.webp',
    png: '.png',
    jpeg: '.jpg',
    gif: '.gif',
  };
  return extensions[format];
}

// Helper function to validate image format
export function isValidImageFormat(mimetype: string): ImageFormat | null {
  const formats: Record<string, ImageFormat> = {
    'image/webp': 'webp',
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpeg',
    'image/gif': 'gif',
  };
  return formats[mimetype] || null;
}
