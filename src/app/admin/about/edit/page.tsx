'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import PostContent from '@/components/PostContent';
import ImageUpload from '@/components/ImageUpload';
import { AboutMe } from '@/models/AboutMe';

export default function EditAboutPage() {
  const router = useRouter();
  const [about, setAbout] = useState<AboutMe | null>(null);
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [email, setEmail] = useState('');
  const [github, setGithub] = useState('');
  const [twitter, setTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');
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
        setImage(data.image || '');
        setEmail(data.email || '');
        setGithub(data.github || '');
        setTwitter(data.twitter || '');
        setLinkedin(data.linkedin || '');
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
        body: JSON.stringify({
          content,
          image,
          email,
          github,
          twitter,
          linkedin,
        }),
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-zinc-800 dark:text-zinc-100">Edit About Me</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image */}
        <ImageUpload
          currentImageUrl={image}
          onImageUploaded={setImage}
          label="Profile Image"
        />

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-drop-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            placeholder="your@email.com"
          />
        </div>

        {/* GitHub */}
        <div>
          <label htmlFor="github" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            GitHub URL
          </label>
          <input
            id="github"
            type="url"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-drop-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            placeholder="https://github.com/username"
          />
        </div>

        {/* Twitter */}
        <div>
          <label htmlFor="twitter" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Twitter/X URL
          </label>
          <input
            id="twitter"
            type="url"
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-drop-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            placeholder="https://twitter.com/username"
          />
        </div>

        {/* LinkedIn */}
        <div>
          <label htmlFor="linkedin" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            LinkedIn URL
          </label>
          <input
            id="linkedin"
            type="url"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-drop-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            placeholder="https://linkedin.com/in/username"
          />
        </div>

        {/* Content */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="content" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Content (Markdown)
            </label>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-drop-600 hover:text-drop-500 dark:text-drop-400 dark:hover:text-drop-300 font-medium"
            >
              {showPreview ? 'Edit' : 'Preview'}
            </button>
          </div>

          {showPreview ? (
            <div className="border border-zinc-300 dark:border-zinc-700 rounded-lg p-4 min-h-[400px] bg-zinc-50 dark:bg-zinc-900">
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
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-drop-500 focus:border-transparent font-mono text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              placeholder="Write about yourself in Markdown..."
            />
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-drop-600 text-white py-3 rounded-lg font-medium hover:bg-drop-500 transition-colors disabled:bg-zinc-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
