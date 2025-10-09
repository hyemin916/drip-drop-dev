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
