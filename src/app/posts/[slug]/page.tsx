import { notFound } from 'next/navigation';
import Link from 'next/link';
import PostContent from '@/components/PostContent';
import { Post } from '@/models/Post';
import { CATEGORIES } from '@/models/Category';
import { Container } from '@/components/Container';

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
    <Container className="mt-16 lg:mt-32">
      <div className="xl:relative">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/"
            className="group mb-8 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 transition lg:absolute lg:-left-5 lg:-mt-2 lg:mb-0 xl:-top-1.5 xl:left-0 xl:mt-0 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0 dark:ring-white/10 dark:hover:border-zinc-700 dark:hover:ring-white/20"
            aria-label="Go back to posts"
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
              className="h-4 w-4 stroke-zinc-500 transition group-hover:stroke-zinc-700 dark:stroke-zinc-500 dark:group-hover:stroke-zinc-400"
            >
              <path
                d="M7.25 11.25 3.75 8m0 0 3.5-3.25M3.75 8h8.5"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>

          <article>
            <header className="flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <span className="inline-flex items-center rounded-full bg-drip-500/10 px-3 py-1 text-xs font-medium text-drip-600 ring-1 ring-inset ring-drip-500/20 dark:bg-drip-400/10 dark:text-drip-400 dark:ring-drip-400/20">
                  {categoryInfo.label}
                </span>
                <time
                  dateTime={post.publishedAt}
                  className="flex items-center text-sm text-zinc-400 dark:text-zinc-500"
                >
                  <span className="h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500 mr-3" />
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
                {post.title}
              </h1>

              <div className="mt-6 flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                <span>by {post.author}</span>
                {post.updatedAt && (
                  <>
                    <span>•</span>
                    <span>
                      Updated {new Date(post.updatedAt).toLocaleDateString('en-US')}
                    </span>
                  </>
                )}
              </div>
            </header>

            <PostContent content={post.content} />
          </article>
        </div>
      </div>
    </Container>
  );
}
