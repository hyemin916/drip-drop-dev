import { notFound } from 'next/navigation';
import Link from 'next/link';
import PostContent from '@/components/PostContent';
import { AboutMe } from '@/models/AboutMe';

async function getAboutMe(): Promise<AboutMe | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  try {
    const res = await fetch(`${baseUrl}/api/about`, {
      next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching About Me:', error);
    return null;
  }
}

export const metadata = {
  title: 'About Me - Drip Drop Dev',
  description: 'Learn more about the author of Drip Drop Dev',
};

export default async function AboutPage() {
  const about = await getAboutMe();

  if (!about) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center text-drip hover:text-drip-dark mb-6 transition-colors"
      >
        ← Back to home
      </Link>

      <article>
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            About Me
          </h1>

          <div className="text-gray-600">
            <span>by {about.author}</span>
            {about.updatedAt && (
              <>
                <span> • </span>
                <span className="text-sm">
                  Updated{' '}
                  {new Date(about.updatedAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </>
            )}
          </div>
        </header>

        <PostContent content={about.content} />
      </article>
    </div>
  );
}
