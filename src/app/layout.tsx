import type { Metadata } from 'next'
import './globals.css'
import { Container } from '@/components/Container'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'Drip Drop Dev',
  description: 'Personal blog with development and daily life stories',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex h-full bg-zinc-50 dark:bg-black">
        <div className="flex w-full">
          <div className="fixed inset-0 flex justify-center sm:px-8">
            <div className="flex w-full max-w-7xl lg:px-8">
              <div className="w-full bg-white ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-300/20" />
            </div>
          </div>
          <div className="relative flex w-full flex-col">
            <Header />
            <main className="flex-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
