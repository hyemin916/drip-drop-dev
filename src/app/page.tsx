import { Suspense } from 'react';
import PostCard from '@/components/PostCard';
import CategoryFilter from '@/components/CategoryFilter';
import { PostSummary } from '@/models/Post';
import { Container } from '@/components/Container';
import { Card } from '@/components/Card';

async function getPosts(category?: string, page = 1, limit = 10): Promise<PostSummary[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (category) {
    params.append('category', category);
  }

  try {
    const res = await fetch(`${baseUrl}/api/posts?${params.toString()}`, {
      next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
    });

    if (!res.ok) {
      console.error('Failed to fetch posts:', res.statusText);
      return [];
    }

    const data = await res.json();
    return data.posts || [];
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: { category?: string; page?: string };
}) {
  const category = searchParams.category;
  const page = parseInt(searchParams.page || '1', 10);

  const posts = await getPosts(category, page);

  return (
    <Container className="mt-16 sm:mt-32">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
          Welcome to Drip Drop Dev
        </h1>
        <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
          A personal blog about development and daily life. Sharing thoughts, code, and experiences.
        </p>
      </header>

      <div className="mt-12">
        <Suspense fallback={<div className="text-zinc-500">Loading filters...</div>}>
          <CategoryFilter />
        </Suspense>
      </div>

      {posts.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-lg text-zinc-500 dark:text-zinc-400">No posts found.</p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-2">Check back later for new content!</p>
        </div>
      ) : (
        <div className="mt-16 sm:mt-20">
          <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
            <div className="flex max-w-3xl flex-col space-y-16">
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

      {posts.length > 0 && (
        <div className="mt-16 flex justify-center gap-4">
          {page > 1 && (
            <a
              href={`/?${new URLSearchParams({
                ...(category && { category }),
                page: (page - 1).toString(),
              })}`}
              className="inline-flex items-center gap-2 justify-center rounded-md py-2 px-3 text-sm font-medium text-zinc-900 ring-1 ring-zinc-900/10 transition hover:bg-zinc-900/5 dark:text-zinc-100 dark:ring-white/10 dark:hover:bg-white/5"
            >
              Previous
            </a>
          )}
          {posts.length === 10 && (
            <a
              href={`/?${new URLSearchParams({
                ...(category && { category }),
                page: (page + 1).toString(),
              })}`}
              className="inline-flex items-center gap-2 justify-center rounded-md py-2 px-3 text-sm font-medium text-zinc-900 ring-1 ring-zinc-900/10 transition hover:bg-zinc-900/5 dark:text-zinc-100 dark:ring-white/10 dark:hover:bg-white/5"
            >
              Next
            </a>
          )}
        </div>
      )}
    </Container>
  );
}
