import { Suspense } from 'react';
import PostCard from '@/components/PostCard';
import CategoryFilter from '@/components/CategoryFilter';
import { PostSummary } from '@/models/Post';

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
    <div>
      <section className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">
          Welcome to Drip Drop Dev
        </h1>
        <p className="text-lg text-gray-600">
          A personal blog about development and daily life
        </p>
      </section>

      <Suspense fallback={<div>Loading filters...</div>}>
        <CategoryFilter />
      </Suspense>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">No posts found.</p>
          <p className="text-gray-400 mt-2">Check back later for new content!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {posts.length > 0 && (
        <div className="flex justify-center gap-4 mt-8">
          {page > 1 && (
            <a
              href={`/?${new URLSearchParams({
                ...(category && { category }),
                page: (page - 1).toString(),
              })}`}
              className="px-4 py-2 bg-drip text-white rounded hover:bg-drip-dark transition-colors"
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
              className="px-4 py-2 bg-drip text-white rounded hover:bg-drip-dark transition-colors"
            >
              Next
            </a>
          )}
        </div>
      )}
    </div>
  );
}
