'use client';

import { useRouter } from 'next/navigation';
import MarkdownEditor from '@/components/MarkdownEditor';
import { Category } from '@/models/Category';

export default function NewPostPage() {
  const router = useRouter();

  const handleSubmit = async (data: {
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    category: Category;
    thumbnail: string | null;
  }) => {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        ...data,
        author: process.env.NEXT_PUBLIC_OWNER_NAME || 'Blog Owner',
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to create post');
    }

    const post = await res.json();
    router.push(`/posts/${post.slug}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Create New Post</h1>
      <MarkdownEditor onSubmit={handleSubmit} submitLabel="Publish Post" />
    </div>
  );
}
