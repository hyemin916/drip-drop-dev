'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import MarkdownEditor from '@/components/MarkdownEditor';
import { Post } from '@/models/Post';
import { Category } from '@/models/Category';

export default function EditPostPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${params.slug}`);

        if (!res.ok) {
          throw new Error('Failed to fetch post');
        }

        const data = await res.json();
        setPost(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.slug]);

  const handleSubmit = async (data: {
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    category: Category;
    thumbnail: string | null;
  }) => {
    const res = await fetch(`/api/posts/${params.slug}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to update post');
    }

    const updatedPost = await res.json();
    router.push(`/posts/${updatedPost.slug}`);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-xl text-red-500">Error: {error || 'Post not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Edit Post</h1>
      <MarkdownEditor
        initialTitle={post.title}
        initialSlug={post.slug}
        initialContent={post.content}
        initialExcerpt={post.excerpt}
        initialCategory={post.category}
        initialThumbnail={post.thumbnail?.url || null}
        onSubmit={handleSubmit}
        submitLabel="Update Post"
      />
    </div>
  );
}
