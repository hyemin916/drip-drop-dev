'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Container } from '@/components/Container';
import clsx from 'clsx';

function NavItem({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <li>
      <Link
        href={href}
        className={clsx(
          'relative block px-3 py-2 transition',
          isActive
            ? 'text-teal-500 dark:text-teal-400'
            : 'hover:text-teal-500 dark:hover:text-teal-400'
        )}
      >
        {children}
        {isActive && (
          <span className="absolute inset-x-1 -bottom-px h-px bg-gradient-to-r from-teal-500/0 via-teal-500/40 to-teal-500/0 dark:from-teal-400/0 dark:via-teal-400/40 dark:to-teal-400/0" />
        )}
      </Link>
    </li>
  );
}

function DesktopNavigation(props: React.ComponentPropsWithoutRef<'nav'>) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const cookies = document.cookie.split(';');
    const hasAuthCookie = cookies.some((cookie) =>
      cookie.trim().startsWith('admin_auth=')
    );
    setIsAuthenticated(hasAuthCookie);
  }, []);

  return (
    <nav {...props}>
      <ul className="flex rounded-full bg-white/90 px-3 text-sm font-medium text-zinc-800 shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur dark:bg-zinc-800/90 dark:text-zinc-200 dark:ring-white/10">
        <NavItem href="/">Home</NavItem>
        <NavItem href="/about">About</NavItem>
        {isAuthenticated && (
          <>
            <NavItem href="/admin/posts/new">New Post</NavItem>
            <NavItem href="/admin/about/edit">Edit About</NavItem>
          </>
        )}
      </ul>
    </nav>
  );
}

function MobileNavItem({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link href={href} className="block py-2">
        {children}
      </Link>
    </li>
  );
}

function MobileNavigation(
  props: React.ComponentPropsWithoutRef<'div'>
) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const cookies = document.cookie.split(';');
    const hasAuthCookie = cookies.some((cookie) =>
      cookie.trim().startsWith('admin_auth=')
    );
    setIsAuthenticated(hasAuthCookie);
  }, []);

  return (
    <div {...props}>
      <ul className="text-base text-zinc-800 dark:text-zinc-300">
        <MobileNavItem href="/">Home</MobileNavItem>
        <MobileNavItem href="/about">About</MobileNavItem>
        {isAuthenticated && (
          <>
            <MobileNavItem href="/admin/posts/new">New Post</MobileNavItem>
            <MobileNavItem href="/admin/about/edit">
              Edit About
            </MobileNavItem>
          </>
        )}
      </ul>
    </div>
  );
}

function MobileNavigationButton({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-zinc-800 shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur dark:bg-zinc-800/90 dark:text-zinc-200 dark:ring-white/10 dark:hover:ring-white/20"
      aria-label="Toggle navigation"
    >
      Menu
      <svg
        viewBox="0 0 8 6"
        aria-hidden="true"
        className="ml-3 h-auto w-2 stroke-zinc-500 group-hover:stroke-zinc-700 dark:group-hover:stroke-zinc-400"
      >
        <path
          d="M1.75 1.75 4 4.25l2.25-2.5"
          fill="none"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="pointer-events-none relative z-50 flex flex-none flex-col">
        <div className="top-0 z-10 h-16 pt-6">
          <Container className="top-[var(--header-top,theme(spacing.6))] w-full">
            <div className="relative flex gap-4">
              <div className="flex flex-1">
                <div className="pointer-events-auto">
                  <Link
                    href="/"
                    aria-label="Home"
                    className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
                  >
                    <h1 className="text-base font-bold">Drip Drop Dev</h1>
                  </Link>
                </div>
              </div>
              <div className="flex flex-1 justify-end md:justify-center">
                <div className="pointer-events-auto md:hidden">
                  <MobileNavigationButton
                    isOpen={isMenuOpen}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                  />
                </div>
                <DesktopNavigation className="pointer-events-auto hidden md:block" />
              </div>
            </div>
          </Container>
        </div>
        {isMenuOpen && (
          <div className="fixed inset-x-0 top-16 z-50 origin-top scale-100 opacity-100">
            <div className="pointer-events-auto mx-4 rounded-2xl bg-white p-6 shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 dark:bg-zinc-800 dark:ring-zinc-700">
              <MobileNavigation />
            </div>
          </div>
        )}
      </header>
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-800/40 backdrop-blur-sm dark:bg-black/80"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
}
