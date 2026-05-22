'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import PostContent from './PostContent';
import ImageUpload from './ImageUpload';
import { CATEGORIES, Category } from '@/models/Category';

const DRAFTS_KEY = 'post-drafts';

interface Draft {
  slug: string;
  content: string;
  excerpt: string;
  category: Category;
  thumbnail: string | null;
  savedAt: string;
}

type DraftMap = Record<string, Draft>;

function loadDrafts(): DraftMap {
  try {
    return JSON.parse(localStorage.getItem(DRAFTS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveDrafts(drafts: DraftMap) {
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

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
  const [drafts, setDrafts] = useState<DraftMap>({});
  const [showDrafts, setShowDrafts] = useState(false);
  const [draftToast, setDraftToast] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDrafts(loadDrafts());
  }, []);

  const saveDraft = () => {
    const key = title || 'Untitled';
    const updated = {
      ...drafts,
      [key]: { slug, content, excerpt, category, thumbnail, savedAt: new Date().toISOString() },
    };
    saveDrafts(updated);
    setDrafts(updated);
    setDraftToast(true);
    setTimeout(() => setDraftToast(false), 2500);
  };

  const applyDraft = (draftTitle: string) => {
    const draft = drafts[draftTitle];
    if (!draft) return;
    setTitle(draftTitle);
    setSlug(draft.slug);
    setContent(draft.content);
    setExcerpt(draft.excerpt);
    setCategory(draft.category);
    setThumbnail(draft.thumbnail);
    setShowDrafts(false);
  };

  const deleteDraft = (draftTitle: string) => {
    const updated = Object.fromEntries(Object.entries(drafts).filter(([k]) => k !== draftTitle)) as DraftMap;
    saveDrafts(updated);
    setDrafts(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({ title, slug, content, excerpt, category, thumbnail });
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
    <>
    {draftToast && (
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-3 text-sm font-medium text-white shadow-xl dark:bg-white dark:text-zinc-900">
        <svg className="h-4 w-4 shrink-0 text-green-400 dark:text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Draft saved
      </div>
    )}
    <form onSubmit={handleSubmit} className="space-y-6">
      {Object.keys(drafts).length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <button
            type="button"
            onClick={() => setShowDrafts(v => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-amber-800 dark:text-amber-200"
          >
            <span>{Object.keys(drafts).length} saved draft{Object.keys(drafts).length > 1 ? 's' : ''}</span>
            <span>{showDrafts ? '▲' : '▼'}</span>
          </button>
          {showDrafts && (
            <ul className="divide-y divide-amber-200 border-t border-amber-200 dark:divide-amber-800 dark:border-amber-800">
              {Object.entries(drafts).map(([draftTitle, draft]) => (
                <li key={draftTitle} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-800 dark:text-zinc-100">{draftTitle}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{new Date(draft.savedAt).toLocaleString()}</p>
                  </div>
                  <div className="flex shrink-0 gap-3">
                    <button type="button" onClick={() => applyDraft(draftTitle)} className="text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100 font-medium">
                      Load
                    </button>
                    <button type="button" onClick={() => deleteDraft(draftTitle)} className="text-zinc-400 hover:text-red-500 dark:hover:text-red-400">
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
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

      <div className="flex gap-3">
        <button
          type="button"
          onClick={saveDraft}
          className="flex-1 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 py-3 rounded-lg font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Save Draft
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-drip text-white py-3 rounded-lg font-medium hover:bg-drip-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
    </>
  );
}
