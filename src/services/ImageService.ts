import { put } from '@vercel/blob';
import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { Image, isValidImageFormat } from '@/models/Image';
import crypto from 'crypto';

const MAX_FILE_SIZE = 5242880; // 5MB
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'images', 'uploads');

export interface UploadImageOptions {
  buffer: Buffer;
  originalName: string;
  mimetype: string;
  alt: string;
  caption?: string | null;
}

export class ImageService {
  /**
   * Upload and process image (Vercel Blob in production, local storage in development)
   */
  static async uploadImage(options: UploadImageOptions): Promise<Image> {
    const { buffer, mimetype, alt, caption } = options;

    // Validate file size
    if (buffer.length > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Validate format
    const format = isValidImageFormat(mimetype);
    if (!format) {
      throw new Error(`Unsupported image format: ${mimetype}`);
    }

    // Generate unique ID
    const id = crypto.createHash('sha256').update(buffer).digest('hex').substring(0, 16);
    const fileName = `${id}.webp`;

    // Get image metadata
    const metadata = await sharp(buffer).metadata();

    // Optimize image
    const optimizedBuffer = await sharp(buffer)
      .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    let url: string;

    // Use Vercel Blob in production, local storage in development
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Upload to Vercel Blob Storage
      const blob = await put(fileName, optimizedBuffer, {
        access: 'public',
        contentType: 'image/webp',
        addRandomSuffix: true,
      });
      url = blob.url;
    } else {
      // Save to local public directory
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      const uploadPath = path.join(UPLOAD_DIR, fileName);
      await fs.writeFile(uploadPath, optimizedBuffer);
      url = `/images/uploads/${fileName}`;
    }

    return {
      id,
      url,
      alt,
      caption: caption || null,
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: 'webp',
      fileSize: optimizedBuffer.length,
      uploadedAt: new Date(),
    };
  }
}
