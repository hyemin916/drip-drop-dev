'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Header() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if admin_auth cookie exists
    const cookies = document.cookie.split(';');
    const hasAuthCookie = cookies.some(
      (cookie) => cookie.trim().startsWith('admin_auth=')
    );
    setIsAuthenticated(hasAuthCookie);
  }, []);

  return (
    <header className="bg-drip text-white shadow-md">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold hover:text-drip-light transition-colors"
          >
            Drip Drop Dev
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/"
              className={`hover:text-drip-light transition-colors ${
                pathname === '/' ? 'underline' : ''
              }`}
            >
              Home
            </Link>

            <Link
              href="/about"
              className={`hover:text-drip-light transition-colors ${
                pathname === '/about' ? 'underline' : ''
              }`}
            >
              About
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  href="/admin/posts/new"
                  className="hover:text-drip-light transition-colors"
                >
                  New Post
                </Link>

                <Link
                  href="/admin/about/edit"
                  className="hover:text-drip-light transition-colors"
                >
                  Edit About
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
