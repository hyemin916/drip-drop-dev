import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { Image, isValidImageFormat } from '@/models/Image';
import crypto from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'content', 'images', 'uploads');
const THUMBNAIL_DIR = path.join(process.cwd(), 'public', 'images', 'thumbnails');
const MAX_FILE_SIZE = 5242880; // 5MB

export interface UploadImageOptions {
  buffer: Buffer;
  originalName: string;
  mimetype: string;
  alt: string;
  caption?: string | null;
}

export class ImageService {
  /**
   * Upload and process image
   */
  static async uploadImage(options: UploadImageOptions): Promise<Image> {
    const { buffer, originalName, mimetype, alt, caption } = options;

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
    const ext = path.extname(originalName);
    const fileName = `${id}${ext}`;

    // Ensure directories exist
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.mkdir(THUMBNAIL_DIR, { recursive: true });

    // Save original image
    const uploadPath = path.join(UPLOAD_DIR, fileName);
    await fs.writeFile(uploadPath, buffer);

    // Get image metadata
    const metadata = await sharp(buffer).metadata();

    // Generate thumbnail
    const thumbnailFileName = `${id}-thumb.webp`;
    const thumbnailPath = path.join(THUMBNAIL_DIR, thumbnailFileName);
    await sharp(buffer).resize(400, 300, { fit: 'cover' }).webp({ quality: 80 }).toFile(thumbnailPath);

    return {
      id,
      url: `/images/uploads/${fileName}`,
      alt,
      caption: caption || null,
      width: metadata.width || 0,
      height: metadata.height || 0,
      format,
      fileSize: buffer.length,
      uploadedAt: new Date(),
    };
  }
}
