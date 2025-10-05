'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageUploaderProps {
  onImageUploaded: (imageUrl: string) => void;
}

export default function ImageUploader({ onImageUploaded }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [alt, setAlt] = useState('');
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5242880) {
      alert('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !alt) {
      alert('Please select a file and provide alt text');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('alt', alt);
      if (caption) {
        formData.append('caption', caption);
      }

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const image = await response.json();

      // Generate Markdown syntax
      const markdownSyntax = caption
        ? `![${image.alt}](${image.url} "${caption}")`
        : `![${image.alt}](${image.url})`;

      onImageUploaded(markdownSyntax);

      // Reset form
      setSelectedFile(null);
      setPreview(null);
      setAlt('');
      setCaption('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">Upload Image</h3>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-drip file:text-white hover:file:bg-drip-dark mb-4"
      />

      {preview && (
        <div className="mb-4">
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

      <div className="space-y-3 mb-4">
        <div>
          <label htmlFor="alt" className="block text-sm font-medium mb-1">
            Alt Text (required for accessibility)
          </label>
          <input
            id="alt"
            type="text"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            maxLength={200}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-drip focus:border-transparent"
            placeholder="Describe the image"
          />
        </div>

        <div>
          <label htmlFor="caption" className="block text-sm font-medium mb-1">
            Caption (optional)
          </label>
          <input
            id="caption"
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={500}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-drip focus:border-transparent"
            placeholder="Image caption"
          />
        </div>
      </div>

      <button
        onClick={handleUpload}
        disabled={!selectedFile || !alt || isUploading}
        className="w-full bg-drip text-white py-2 rounded-lg font-medium hover:bg-drip-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isUploading ? 'Uploading...' : 'Upload & Insert'}
      </button>
    </div>
  );
}
