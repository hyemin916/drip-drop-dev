import Link from 'next/link';
import Image from 'next/image';
import { PostSummary } from '@/models/Post';
import { CATEGORIES } from '@/models/Category';

interface PostCardProps {
  post: PostSummary;
}

export default function PostCard({ post }: PostCardProps) {
  const categoryInfo = CATEGORIES[post.category];
  const thumbnailUrl = post.thumbnail?.url || '/images/placeholders/default-thumbnail.png';

  return (
    <Link
      href={`/posts/${post.slug}`}
      className="block group hover:shadow-xl transition-shadow rounded-lg overflow-hidden bg-white"
      data-testid="post-card"
      data-category={post.category}
    >
      <div className="relative h-48 bg-gray-200">
        <Image
          src={thumbnailUrl}
          alt={post.thumbnail?.alt || post.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-drip text-white"
          >
            {categoryInfo.label}
          </span>
          <time className="text-sm text-gray-500">
            {new Date(post.publishedAt).toLocaleDateString('ko-KR')}
          </time>
        </div>

        <h3 className="text-xl font-bold mb-2 group-hover:text-drip transition-colors">
          {post.title}
        </h3>

        <p className="text-gray-600 line-clamp-3">{post.excerpt}</p>

        <div className="mt-3 text-sm text-gray-500">
          by {post.author}
        </div>
      </div>
    </Link>
  );
}
