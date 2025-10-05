# Drip Drop Dev

Personal blog platform with Markdown-based posts, categories, and image management.

## Features

- **Markdown Posts**: Create and manage blog posts with Markdown syntax
- **Categories**: Filter posts by "일상" (Daily Life) or "개발" (Development)
- **Image Management**: Upload images with captions and automatic thumbnail generation
- **About Me Page**: Customizable about page with Markdown content
- **Authentication**: Environment-based admin authentication (no login UI)
- **Accessibility**: WCAG 2.1 AA compliant
- **Performance**: Optimized with Next.js SSG/ISR, bundle size < 200KB

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS with custom "Drip Drop" theme
- **Content**: File-based Markdown with frontmatter (gray-matter)
- **Image Processing**: Sharp
- **Testing**: Vitest (unit), Playwright (E2E)
- **Validation**: Zod schemas

## Getting Started

### Prerequisites

- Node.js 20+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dripdrop-dev.git
cd dripdrop-dev
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and set:
- `ADMIN_SECRET`: Your admin authentication secret (minimum 32 characters)
- `OWNER_NAME`: Your display name
- `OWNER_EMAIL`: Your email (optional)

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication Setup

To access admin features (create/edit posts):

1. Set `ADMIN_SECRET` in `.env.local` (minimum 32 characters)
2. Set cookie in browser DevTools:
   - Name: `admin_auth`
   - Value: `<your-admin-secret>`
   - HttpOnly: `true`
   - Secure: `true` (production only)
   - SameSite: `Strict`

Or use the authentication API:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Authorization: Bearer <your-admin-secret>" \
  -c cookies.txt
```

## Project Structure

```
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── models/           # TypeScript interfaces and types
│   ├── services/         # Business logic
│   └── lib/              # Utilities
├── content/
│   ├── posts/            # Markdown blog posts
│   ├── about/            # About Me content
│   └── images/           # Uploaded images
├── tests/
│   ├── contract/         # API contract tests
│   ├── integration/      # Integration tests
│   ├── e2e/              # Playwright E2E tests
│   └── unit/             # Vitest unit tests
└── public/               # Static assets
```

## Creating Content

### Writing a New Post

Create a new Markdown file in `content/posts/` with the filename format: `YYYY-MM-DD-slug.md`

```markdown
---
title: "Your Post Title"
slug: "your-post-slug"
excerpt: "Brief summary (max 200 chars)"
category: "개발"  # or "일상"
publishedAt: "2025-10-05T10:00:00Z"
author: "Your Name"
thumbnail: "/images/custom-thumbnail.png"  # optional
---

# Your Post Content

Write your content here using Markdown syntax...

![Image Alt Text](/images/your-image.png "Optional caption")
```

### Editing About Me

Edit `content/about/me.md`:

```markdown
---
updatedAt: "2025-10-05T10:00:00Z"
author: "Your Name"
---

# About Me

Your about me content in Markdown...
```

## Available Scripts

- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run unit tests
- `npm run test:coverage` - Run tests with coverage
- `npm run test:e2e` - Run E2E tests with Playwright

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Set environment variables:
   - `ADMIN_SECRET`
   - `OWNER_NAME`
   - `OWNER_EMAIL`
4. Deploy

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

## Performance

- **Lighthouse Score**: ≥90
- **Page Load (p95)**: <1.5s
- **API Response (p95)**: <300ms
- **Bundle Size**: <200KB gzipped

## License

MIT
