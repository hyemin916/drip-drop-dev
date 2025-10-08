'use client';

import { useState } from 'react';
import PostContent from './PostContent';
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

      <div>
        <label htmlFor="thumbnail" className="block text-sm font-medium mb-2">
          Custom Thumbnail URL (optional)
        </label>
        <input
          id="thumbnail"
          type="text"
          value={thumbnail || ''}
          onChange={(e) => setThumbnail(e.target.value || null)}
          placeholder="/images/..."
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-drip focus:border-transparent"
        />
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

        {showPreview ? (
          <div className="border rounded-lg p-4 min-h-[400px] bg-gray-50">
            <PostContent content={content} />
          </div>
        ) : (
          <textarea
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
