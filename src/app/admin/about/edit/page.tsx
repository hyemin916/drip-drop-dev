'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import PostContent from '@/components/PostContent';
import { AboutMe } from '@/models/AboutMe';

export default function EditAboutPage() {
  const router = useRouter();
  const [about, setAbout] = useState<AboutMe | null>(null);
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await fetch('/api/about');

        if (!res.ok) {
          throw new Error('Failed to fetch About Me');
        }

        const data = await res.json();
        setAbout(data);
        setContent(data.content);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchAbout();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/about', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update About Me');
      }

      router.push('/about');
    } catch (err) {
      console.error('Failed to update:', err);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !about) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-xl text-red-500">Error: {error || 'About Me not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Edit About Me</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
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
              maxLength={10000}
              rows={20}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-drip focus:border-transparent font-mono text-sm"
              placeholder="Write about yourself in Markdown..."
            />
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-drip text-white py-3 rounded-lg font-medium hover:bg-drip-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
