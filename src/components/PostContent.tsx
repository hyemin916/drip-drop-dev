import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypePrism from '@mapbox/rehype-prism';
import Image from 'next/image';
import { Prose } from './Prose';

interface PostContentProps {
  content: string;
}

export default function PostContent({ content }: PostContentProps) {
  return (
    <Prose className="mt-8">
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
                  />
                </div>
                {title && (
                  <figcaption className="text-center text-sm text-gray-600 mt-2">
                    {title}
                  </figcaption>
                )}
              </figure>
            );
          },
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-drip hover:text-drip-dark underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          code: ({ className, children }) => {
            const match = /language-(\w+)/.exec(className || '');
            return match ? (
              <code className={className}>{children}</code>
            ) : (
              <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </Prose>
  );
}
