'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import PostContent from './PostContent';
import ImageUpload from './ImageUpload';
import { CATEGORIES, Category } from '@/models/Category';

interface MarkdownEditorProps {
  initialTitle?: string;
  initialSlug?: string;
  initialContent?: string;
  initialExcerpt?: string;
  initialCategory?: Category;
  initialThumbnail?: string | null;
  onSubmit: (data: {
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    category: Category;
    thumbnail: string | null;
  }) => Promise<void>;
  submitLabel?: string;
}

export default function MarkdownEditor({
  initialTitle = '',
  initialSlug = '',
  initialContent = '',
  initialExcerpt = '',
  initialCategory = 'Dev',
  initialThumbnail = null,
  onSubmit,
  submitLabel = 'Publish',
}: MarkdownEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [content, setContent] = useState(initialContent);
  const [excerpt, setExcerpt] = useState(initialExcerpt);
  const [category, setCategory] = useState<Category>(initialCategory);
  const [thumbnail, setThumbnail] = useState<string | null>(initialThumbnail);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contentImages, setContentImages] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({
        title,
        slug,
        content,
        excerpt,
        category,
        thumbnail,
      });
    } catch (error) {
      console.error('Failed to submit:', error);
      alert('Failed to save post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-generate slug from title
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!initialSlug) {
      const autoSlug = newTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      setSlug(autoSlug);
    }
  };

  // Extract images from markdown content
  useEffect(() => {
    const imageRegex = /!\[.*?\]\((.*?)\)/g;
    const matches = Array.from(content.matchAll(imageRegex));
    const urls = matches.map(match => match[1]).filter(url => url.trim());
    setContentImages(urls);
  }, [content]);

  // Insert image markdown at cursor position
  const handleContentImageUpload = (url: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const imageMarkdown = `![Image](${url})`;

    const newContent =
      content.substring(0, start) +
      imageMarkdown +
      content.substring(end);

    setContent(newContent);

    // Set cursor after inserted image
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + imageMarkdown.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
          maxLength={200}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-drip focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium mb-2">
          Slug
        </label>
        <input
          id="slug"
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          pattern="[a-z0-9-]+"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-drip focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-2">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-drip focus:border-transparent"
        >
          {Object.values(CATEGORIES).map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium mb-2">
          Excerpt
        </label>
        <textarea
          id="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          required
          maxLength={200}
          rows={2}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-drip focus:border-transparent"
        />
      </div>

      {/* Thumbnail Selection */}
      <div>
        <label htmlFor="thumbnail" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Thumbnail (optional)
        </label>
        {contentImages.length > 0 ? (
          <div className="space-y-3">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Select an image from your content or leave empty to use the first image
            </p>
            <div className="grid grid-cols-3 gap-3">
              {contentImages.map((imageUrl, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setThumbnail(imageUrl)}
                  className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                    thumbnail === imageUrl
                      ? 'border-drop-500 ring-2 ring-drop-500'
                      : 'border-zinc-300 dark:border-zinc-700 hover:border-drop-300'
                  }`}
                >
                  <Image
                    src={imageUrl}
                    alt={`Thumbnail option ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  {thumbnail === imageUrl && (
                    <div className="absolute inset-0 bg-drop-500/20 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-drop-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
            {thumbnail && (
              <button
                type="button"
                onClick={() => setThumbnail(null)}
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
              >
                Clear selection (use first image as default)
              </button>
            )}
          </div>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
            Add images to your content to select a thumbnail
          </p>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="content" className="block text-sm font-medium">
            Content (Markdown)
          </label>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-sm text-drip hover:text-drip-dark"
          >
            {showPreview ? 'Edit' : 'Preview'}
          </button>
        </div>

        {/* Content Image Upload */}
        {!showPreview && (
          <div className="mb-3">
            <ImageUpload
              currentImageUrl=""
              onImageUploaded={handleContentImageUpload}
              label="Insert Image to Content"
              resetAfterUpload={true}
            />
          </div>
        )}

        {showPreview ? (
          <div className="border rounded-lg p-4 min-h-[400px] bg-gray-50">
            <PostContent content={content} />
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            maxLength={50000}
            rows={20}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-drip focus:border-transparent font-mono text-sm"
            placeholder="Write your post content in Markdown..."
          />
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-drip text-white py-3 rounded-lg font-medium hover:bg-drip-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
