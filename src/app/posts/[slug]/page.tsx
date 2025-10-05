import { notFound } from 'next/navigation';
import Link from 'next/link';
import PostContent from '@/components/PostContent';
import { Post } from '@/models/Post';
import { CATEGORIES } from '@/models/Category';

async function getPost(slug: string): Promise<Post | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  try {
    const res = await fetch(`${baseUrl}/api/posts/${slug}`, {
      next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

export async function generateStaticParams() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  try {
    const res = await fetch(`${baseUrl}/api/posts?limit=100`);
    const posts = await res.json();

    return posts.map((post: Post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found - Drip Drop Dev',
    };
  }

  return {
    title: `${post.title} - Drip Drop Dev`,
    description: post.excerpt,
  };
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  const categoryInfo = CATEGORIES[post.category];

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center text-drip hover:text-drip-dark mb-6 transition-colors"
      >
        ← Back to posts
      </Link>

      <article>
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-drip text-white">
              {categoryInfo.label}
            </span>
            <time className="text-sm text-gray-500">
              {new Date(post.publishedAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            {post.title}
          </h1>

          <div className="flex items-center gap-2 text-gray-600">
            <span>by {post.author}</span>
            {post.updatedAt && (
              <>
                <span>•</span>
                <span className="text-sm">
                  Updated{' '}
                  {new Date(post.updatedAt).toLocaleDateString('ko-KR')}
                </span>
              </>
            )}
          </div>
        </header>

        <PostContent content={post.content} />
      </article>
    </div>
  );
}
