import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypePrism from '@mapbox/rehype-prism';
import Image from 'next/image';

interface PostContentProps {
  content: string;
}

export default function PostContent({ content }: PostContentProps) {
  return (
    <div className="markdown-body mt-8 pb-16 sm:pb-0 bg-transparent">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypePrism]}
        components={{
          img: ({ src, alt, title }) => {
            if (!src) return null;

            return (
              <figure className="my-8">
                <div className="relative w-full h-96">
                  <Image
                    src={src}
                    alt={alt || ''}
                    fill
                    className="object-contain rounded-lg"
                    sizes="(max-width: 768px) 100vw, 800px"
                    unoptimized={src.startsWith('http')}
                  />
                </div>
                {title && (
                  <figcaption className="text-center text-sm text-gray-600 mt-2 dark:text-gray-400">
                    {title}
                  </figcaption>
                )}
              </figure>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
