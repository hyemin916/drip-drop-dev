# Research & Technology Decisions

**Feature**: Drip Drop Dev Personal Blog
**Date**: 2025-10-05
**Status**: Complete

## Overview

This document consolidates research findings and technology decisions for the Drip Drop Dev blog implementation. All NEEDS CLARIFICATION items from the technical context have been resolved.

---

## 1. Next.js 14 App Router for SSR/SSG Hybrid Applications

### Decision
Use Next.js 14 App Router with hybrid rendering: Static Site Generation (SSG) for public post pages and Server-Side Rendering (SSR) for admin interfaces.

### Rationale
- **Performance**: SSG pre-renders blog posts at build time, enabling instant page loads (p95 < 300ms)
- **SEO**: Static HTML ensures full content visibility to search engines without JavaScript execution
- **Incremental Static Regeneration (ISR)**: Posts can be regenerated on-demand when content changes, balancing performance with freshness
- **File-system routing**: App Router's folder structure naturally maps to blog URL structure (posts/[slug], about, admin/*)
- **React Server Components**: Reduces client-side JavaScript bundle size by rendering components on server

### Alternatives Considered
- **Gatsby**: Rejected due to GraphQL complexity overhead for simple file-based content
- **Astro**: Rejected to maintain single-language TypeScript consistency (Astro encourages multi-framework)
- **Pure React SPA**: Rejected due to poor SEO and slower initial load times

### Implementation Notes
- Use `generateStaticParams` for post pages to pre-render all posts at build time
- Admin routes use dynamic rendering (no static generation) to ensure auth checks run on every request
- Apply ISR with `revalidate: 60` for post pages to automatically update content hourly

---

## 2. File-Based CMS with Markdown and Frontmatter

### Decision
Store posts as Markdown files with YAML frontmatter metadata in a `content/posts/` directory. Use `gray-matter` library to parse frontmatter.

### Rationale
- **Simplicity**: No database setup, migration scripts, or connection pooling complexity
- **Version Control**: Posts are tracked in Git, providing full edit history and rollback capability
- **Portability**: Content easily migrated to any other platform or CMS
- **Developer Experience**: Markdown is familiar, human-readable, and Git-diff friendly
- **Performance**: File system reads are fast; caching layer can optimize repeated access

### Frontmatter Schema
```yaml
---
title: "Post Title"
date: "2025-01-15"
category: "개발" # or "일상"
thumbnail: "/images/custom-thumbnail.png" # optional override
slug: "post-title"
excerpt: "Brief summary for post list"
---
```

### Alternatives Considered
- **PostgreSQL**: Rejected as overkill for personal blog; adds operational complexity
- **SQLite**: Rejected due to deployment complications (file locks, backup strategies)
- **Headless CMS (Sanity/Contentful)**: Rejected to avoid vendor lock-in and external dependencies

### Implementation Notes
- Filename convention: `YYYY-MM-DD-slug.md` for chronological sorting
- Validate frontmatter schema at build time to catch errors early
- Use `fs` module for file operations; cache parsed results in memory during build

---

## 3. Image Optimization with Next.js Image Component and Sharp

### Decision
Use Next.js `<Image>` component for all images, with Sharp library for server-side processing (resizing, format conversion, thumbnail generation).

### Rationale
- **Automatic Optimization**: Next.js Image automatically serves WebP/AVIF formats to supporting browsers
- **Responsive Images**: Generates multiple sizes (srcset) for different viewport widths
- **Lazy Loading**: Built-in support reduces initial page weight
- **Thumbnail Generation**: Sharp can extract first image from Markdown, resize to thumbnail dimensions
- **Performance Budget**: Enforces maximum image sizes to prevent oversized uploads

### Configuration
```typescript
// next.config.js
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 60,
}
```

### Alternatives Considered
- **Cloudinary/Imgix**: Rejected to avoid third-party dependencies and costs
- **Manual optimization**: Rejected due to inconsistent quality and manual effort

### Implementation Notes
- Limit upload size to 5MB per image
- Generate thumbnails at 400x300px for post list cards
- Store original images in `content/images/uploads/`, thumbnails in `public/images/thumbnails/`
- Default placeholder thumbnail: `public/images/placeholders/default-thumbnail.png` (SVG water droplet graphic)

---

## 4. Environment-Based Authentication (No Login UI)

### Decision
Use environment variable `ADMIN_SECRET` for authentication. Admin routes check for matching secret in Authorization header or secure HTTP-only cookie.

### Rationale
- **Simplicity**: No user database, password hashing, session management complexity
- **Security**: Secret stored outside version control (`.env.local`, deployment env vars)
- **Single Owner**: Requirements specify only one authenticated user (blog owner)
- **No UI Overhead**: Eliminates login form, password reset, account management interfaces

### Implementation
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authHeader = request.headers.get('authorization')
    const authCookie = request.cookies.get('admin_auth')

    const secret = process.env.ADMIN_SECRET
    if (authHeader !== `Bearer ${secret}` && authCookie?.value !== secret) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
}
```

### Alternatives Considered
- **NextAuth.js**: Rejected as over-engineering for single-user authentication
- **Password-based login**: Rejected per specification (no login UI required)
- **OAuth (GitHub/Google)**: Rejected to avoid external dependencies

### Implementation Notes
- Set auth cookie on first admin access via browser extension or manual curl request
- Cookie: `HttpOnly`, `Secure`, `SameSite=Strict`, 30-day expiration
- Admin UI displays logout button to clear cookie
- Rotate `ADMIN_SECRET` periodically (documented in deployment guide)

---

## 5. Tailwind CSS Accessibility and WCAG 2.1 AA Compliance

### Decision
Use Tailwind CSS with `@tailwindcss/forms` plugin and custom accessibility utilities to ensure WCAG 2.1 AA compliance.

### Rationale
- **Utility-First**: Rapid prototyping of "Drip Drop" water-themed design
- **Responsive Design**: Built-in breakpoints handle 320px-2560px viewport range
- **Accessibility Primitives**: Tailwind's focus utilities (`focus-visible:ring`) support keyboard navigation
- **Customization**: Theme extension allows water-themed color palette (blues, teals, gradients)

### WCAG 2.1 AA Requirements Mapping
| Requirement | Implementation |
|-------------|----------------|
| **Color Contrast** (4.5:1 for text) | Use `tailwindcss-accessible-colors` plugin to validate palette |
| **Keyboard Navigation** | Add `focus-visible:ring-2` to all interactive elements |
| **Semantic HTML** | Use `<nav>`, `<main>`, `<article>`, `<aside>` tags |
| **ARIA Labels** | Add `aria-label` to icon-only buttons (e.g., category filter) |
| **Alt Text** | Require alt attribute for all images (validated in Markdown parser) |
| **Resizable Text** | Use `rem` units for font sizes (16px base = 1rem) |
| **Focus Indicators** | Visible focus rings on all interactive elements |

### Theme Configuration
```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      drip: {
        light: '#E0F7FA', // Light cyan (water droplet highlight)
        DEFAULT: '#00BCD4', // Cyan (primary water theme)
        dark: '#0097A7', // Dark cyan (hover states)
      },
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      serif: ['Merriweather', 'Georgia', 'serif'], // Post content readability
    },
  },
}
```

### Alternatives Considered
- **Styled-components**: Rejected due to runtime CSS-in-JS performance cost
- **Vanilla CSS**: Rejected due to lack of design system structure

### Implementation Notes
- Test with axe DevTools and Lighthouse accessibility audit (score > 95)
- Ensure minimum font size 16px (1rem) for body text
- Implement skip-to-content link for keyboard users
- Use reduced-motion media query to disable animations for users with motion sensitivity

---

## 6. Markdown Rendering: react-markdown vs MDX

### Decision
Use `react-markdown` with `remark-gfm` plugin for GitHub Flavored Markdown support.

### Rationale
- **Simplicity**: Posts are pure Markdown without JSX interleaving complexity
- **Security**: No arbitrary code execution (MDX allows `<script>` tags)
- **Performance**: No compilation step for MDX → React components
- **Editor Compatibility**: Standard Markdown works in any editor (VS Code, Obsidian, etc.)

### Features Enabled
- **GFM Tables**: Support for tabular data in posts
- **Syntax Highlighting**: Use `rehype-highlight` for code blocks
- **Image Captions**: Custom remark plugin to parse `![alt](url "caption")` syntax

### Alternatives Considered
- **MDX**: Rejected due to security risk (arbitrary JSX execution) and unnecessary complexity
- **Marked.js**: Rejected as less React-idiomatic than react-markdown

### Implementation Notes
```typescript
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

<ReactMarkdown
  remarkPlugins={[remarkGfm, remarkImageCaptions]}
  rehypePlugins={[rehypeHighlight]}
  components={{
    img: ({ src, alt, title }) => (
      <figure>
        <Image src={src} alt={alt} width={800} height={600} />
        {title && <figcaption>{title}</figcaption>}
      </figure>
    ),
  }}
>
  {content}
</ReactMarkdown>
```

---

## 7. Performance Budgeting and Lighthouse CI Integration

### Decision
Implement performance budgets in `next.config.js` and enforce with Lighthouse CI in GitHub Actions.

### Rationale
- **Prevent Regression**: Automated checks block PRs that degrade performance
- **Measurable Goals**: Quantified targets (bundle size, Lighthouse score) prevent subjective "feels slow" debates
- **User Experience**: Ensures constitutional "Performance as a Feature" principle

### Performance Budgets
| Metric | Target | Enforcement |
|--------|--------|-------------|
| **Lighthouse Performance Score** | ≥ 90 | Lighthouse CI fails PR if < 90 |
| **First Contentful Paint (FCP)** | < 1.5s | Lighthouse CI |
| **Largest Contentful Paint (LCP)** | < 2.5s | Lighthouse CI |
| **Total Blocking Time (TBT)** | < 300ms | Lighthouse CI |
| **Cumulative Layout Shift (CLS)** | < 0.1 | Lighthouse CI |
| **JavaScript Bundle Size** | < 200KB gzipped | Webpack bundle analyzer |
| **CSS Bundle Size** | < 50KB gzipped | Webpack bundle analyzer |

### CI Configuration
```yaml
# .github/workflows/lighthouse.yml
- name: Run Lighthouse CI
  uses: treosh/lighthouse-ci-action@v9
  with:
    urls: |
      https://preview-url.vercel.app/
      https://preview-url.vercel.app/posts/sample-post
      https://preview-url.vercel.app/about
    uploadArtifacts: true
    temporaryPublicStorage: true
    budgetPath: .lighthouserc.json
```

### Alternatives Considered
- **Manual performance testing**: Rejected as error-prone and time-consuming
- **WebPageTest**: Rejected in favor of Lighthouse (better Next.js integration)

### Implementation Notes
- Run Lighthouse CI on every PR against Vercel preview deployment
- Store historical performance data in GitHub Actions artifacts
- Set up alerts if performance degrades > 10% week-over-week

---

## Summary of Technology Stack

| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| **Framework** | Next.js | 14.x | SSR/SSG hybrid, App Router, React Server Components |
| **Language** | TypeScript | 5.x | Type safety, better DX |
| **Styling** | Tailwind CSS | 3.x | Utility-first, accessibility plugins, water theme |
| **Content Storage** | File System | - | Markdown + frontmatter, Git version control |
| **Markdown Parser** | react-markdown | 9.x | Security, simplicity, GFM support |
| **Image Processing** | Sharp | 0.33.x | Thumbnail generation, format conversion |
| **Authentication** | Environment Variable | - | Single-owner simplicity |
| **Testing (Unit)** | Vitest | 1.x | Fast, ESM-native, TypeScript support |
| **Testing (E2E)** | Playwright | 1.x | Cross-browser, reliable selectors |
| **CI/CD** | GitHub Actions | - | Lighthouse CI, automated deployments |
| **Deployment** | Vercel | - | Zero-config Next.js optimization |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **File-based storage doesn't scale to 1000+ posts** | Medium | Profile build times; migrate to DB if build > 5min |
| **Environment variable auth compromised** | High | Rotate secret monthly; monitor access logs; consider moving to NextAuth.js if multi-user needed |
| **Tailwind CSS bundle size grows** | Medium | Use PurgeCSS in production build; monitor bundle size in CI |
| **Markdown parsing vulnerabilities** | Low | Sanitize HTML output with `rehype-sanitize` plugin |
| **Image storage fills disk** | Low | Implement image cleanup cron job; set max total size quota |

---

## Open Questions for Implementation Phase

1. **Drip Drop theme specifics**: Confirm water droplet animation style (subtle parallax vs. CSS animation)
2. **Category expansion**: If more than 2 categories needed in future, how to migrate existing posts?
3. **Comment system**: Out of scope for v1, but document integration points for future (giscus/utterances)
4. **Analytics**: Confirm privacy-friendly analytics choice (Plausible vs. self-hosted Umami)

---

**Status**: All NEEDS CLARIFICATION items resolved. Ready for Phase 1 (Design & Contracts).
