'use client';

import { useState, useEffect } from 'react';
import CategoryFilter from '@/components/CategoryFilter';
import { PostSummary } from '@/models/Post';
import { Container } from '@/components/Container';
import { Card } from '@/components/Card';

export default function BlogPage() {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });

      if (currentCategory) {
        params.append('category', currentCategory);
      }

      try {
        const res = await fetch(`${baseUrl}/api/posts?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
        } else {
          setPosts([]);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [currentCategory, page]);

  const handleCategoryChange = (category: string | null) => {
    setCurrentCategory(category);
    setPage(1); // Reset to page 1 when category changes
  };

  return (
    <Container className="mt-16 sm:mt-32">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
          Writing on software development, learning, and more.
        </h1>
        <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
          개발하면서 배운 것들, 경험한 것들, 그리고 일상의 생각들을 기록합니다.
        </p>
      </header>

      <div className="mt-12">
        <CategoryFilter
          currentCategory={currentCategory}
          onCategoryChange={handleCategoryChange}
        />
      </div>

      {loading ? (
        <div className="mt-16 text-center">
          <p className="text-lg text-zinc-500 dark:text-zinc-400">Loading...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-lg text-zinc-500 dark:text-zinc-400">No posts found.</p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-2">Check back later for new content!</p>
        </div>
      ) : (
        <div className="mt-16 sm:mt-20">
          <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
            <div className="flex flex-col space-y-16">
              {posts.map((post) => (
                <Card as="article" key={post.id}>
                  <Card.Thumbnail
                    src={post.thumbnail?.url}
                    alt={post.thumbnail?.alt || post.title}
                  />
                  <div className="flex flex-col items-start flex-1">
                    <Card.Eyebrow
                      as="time"
                      dateTime={post.publishedAt}
                      decorate
                    >
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Card.Eyebrow>
                    <Card.Title href={`/posts/${post.slug}`}>
                      {post.title}
                    </Card.Title>
                    <Card.Description>{post.summary}</Card.Description>
                    <Card.Cta>Read article</Card.Cta>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div className="mt-16 flex justify-center gap-4">
          {page > 1 && (
            <button
              onClick={() => setPage(page - 1)}
              className="inline-flex items-center gap-2 justify-center rounded-md py-2 px-3 text-sm font-medium text-zinc-900 ring-1 ring-zinc-900/10 transition hover:bg-zinc-900/5 dark:text-zinc-100 dark:ring-white/10 dark:hover:bg-white/5 cursor-pointer"
            >
              Previous
            </button>
          )}
          {posts.length === 10 && (
            <button
              onClick={() => setPage(page + 1)}
              className="inline-flex items-center gap-2 justify-center rounded-md py-2 px-3 text-sm font-medium text-zinc-900 ring-1 ring-zinc-900/10 transition hover:bg-zinc-900/5 dark:text-zinc-100 dark:ring-white/10 dark:hover:bg-white/5 cursor-pointer"
            >
              Next
            </button>
          )}
        </div>
      )}
    </Container>
  );
}
