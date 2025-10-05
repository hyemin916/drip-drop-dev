import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Drip Drop Dev',
  description: 'Personal blog with development and daily life stories',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
