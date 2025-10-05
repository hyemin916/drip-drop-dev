# Data Model

**Feature**: Drip Drop Dev Personal Blog
**Date**: 2025-10-05
**Based on**: Spec FR-005 through FR-019, Key Entities

---

## Overview

This document defines the data structures for the Drip Drop Dev blog. All entities use TypeScript interfaces for type safety. Since content is stored as Markdown files with frontmatter, entities represent both the file structure and runtime TypeScript types.

---

## Entity Definitions

### 1. Post

Represents a blog article with Markdown content, category assignment, images, and thumbnail.

**TypeScript Interface**:
```typescript
interface Post {
  id: string;                    // Unique identifier (slug)
  title: string;                  // Post title
  slug: string;                   // URL-friendly identifier
  content: string;                // Markdown content body
  excerpt: string;                // Brief summary (max 200 chars)
  category: Category;             // "일상" | "개발"
  publishedAt: Date;              // Publication timestamp
  updatedAt: Date | null;         // Last modification timestamp
  thumbnail: Image | null;        // Featured image (auto-selected or manual override)
  images: Image[];                // All images embedded in content
  author: string;                 // Blog owner name (always same value)
}
```

**File Representation** (`content/posts/YYYY-MM-DD-slug.md`):
```markdown
---
title: "My First Post"
slug: "my-first-post"
excerpt: "A brief summary of this post"
category: "개발"
publishedAt: "2025-01-15T10:00:00Z"
updatedAt: "2025-01-16T14:30:00Z"
thumbnail: "/images/custom-thumbnail.png" # optional override
author: "Blog Owner"
---

# Post Content

Markdown content here with ![image](url "caption") syntax...
```

**Validation Rules**:
- `title`: Required, 1-200 characters
- `slug`: Required, unique, lowercase, alphanumeric + hyphens only
- `content`: Required, max 50,000 characters
- `excerpt`: Required, max 200 characters
- `category`: Required, must be "일상" or "개발"
- `publishedAt`: Required, ISO 8601 format
- `thumbnail`: Optional, if null use auto-generated from first image or default placeholder

**State Transitions**:
```
[Draft] --publish--> [Published] --update--> [Published]
                                  --delete--> [Deleted]
```

---

### 2. Category

Represents a classification for posts. Fixed set of two values.

**TypeScript Type**:
```typescript
type Category = "일상" | "개발";

interface CategoryInfo {
  value: Category;
  label: string;          // Display name
  description: string;    // Category description
  slug: string;           // URL segment
  count?: number;         // Post count (computed at runtime)
}
```

**Predefined Values**:
```typescript
const CATEGORIES: Record<Category, CategoryInfo> = {
  "일상": {
    value: "일상",
    label: "일상",
    description: "Daily life stories and personal reflections",
    slug: "daily-life",
  },
  "개발": {
    value: "개발",
    label: "개발",
    description: "Development tutorials and technical insights",
    slug: "development",
  },
};
```

**Validation Rules**:
- Must be one of the two predefined values
- Cannot be null or empty

---

### 3. Image

Represents an uploaded image file with optional caption, embedded within a post.

**TypeScript Interface**:
```typescript
interface Image {
  id: string;                // Unique identifier (filename hash)
  url: string;               // Public URL path
  alt: string;               // Alternative text (accessibility)
  caption: string | null;    // Optional caption (from Markdown title attribute)
  width: number;             // Image width in pixels
  height: number;            // Image height in pixels
  format: ImageFormat;       // "webp" | "png" | "jpeg" | "gif"
  fileSize: number;          // Size in bytes
  uploadedAt: Date;          // Upload timestamp
}

type ImageFormat = "webp" | "png" | "jpeg" | "gif";
```

**File Storage**:
- Original: `content/images/uploads/{id}.{ext}`
- Thumbnail: `public/images/thumbnails/{id}-thumb.webp` (400x300px)

**Validation Rules**:
- `url`: Required, must start with `/images/`
- `alt`: Required, 1-200 characters (accessibility requirement)
- `caption`: Optional, max 500 characters
- `format`: Required, supported formats only
- `fileSize`: Max 5MB (5,242,880 bytes)
- `width`, `height`: Must be > 0

**Processing Pipeline**:
```
Upload → Validate (size, format) → Generate thumbnail → Optimize (Sharp) → Store
```

---

### 4. AboutMe

Represents the content of the About Me page, editable by the blog owner.

**TypeScript Interface**:
```typescript
interface AboutMe {
  id: "about-me";            // Fixed identifier (singleton)
  content: string;            // Markdown content
  updatedAt: Date;            // Last modification timestamp
  author: string;             // Blog owner name
}
```

**File Representation** (`content/about/me.md`):
```markdown
---
updatedAt: "2025-01-15T10:00:00Z"
author: "Blog Owner"
---

# About Me

Markdown content describing the blog owner...
```

**Validation Rules**:
- `content`: Required, max 10,000 characters
- `updatedAt`: Required, ISO 8601 format
- Only one instance allowed (singleton pattern)

**State Transitions**:
```
[Not Exists] --create--> [Exists] --update--> [Exists]
```

---

### 5. BlogOwner (Authentication Context)

Represents the authenticated blog owner. Not persisted in files; stored in environment configuration.

**TypeScript Interface**:
```typescript
interface BlogOwner {
  name: string;               // Display name
  email: string | null;       // Optional contact email
  isAuthenticated: boolean;   // Auth status (runtime only)
}

interface AuthContext {
  owner: BlogOwner | null;
  secret: string;             // from process.env.ADMIN_SECRET
}
```

**Environment Variables**:
```env
ADMIN_SECRET=your-secret-here
OWNER_NAME="Blog Owner Name"
OWNER_EMAIL="owner@example.com"  # optional
```

**Validation Rules**:
- `secret`: Required, min 32 characters
- `name`: Required, 1-100 characters
- `email`: Optional, valid email format if provided

---

## Entity Relationships

```
┌─────────────┐
│  BlogOwner  │ (1:1 auth context)
└──────┬──────┘
       │ creates/edits
       ├────────────────────┐
       │                    │
       ▼                    ▼
┌──────────┐         ┌────────────┐
│   Post   │──┬──────│  AboutMe   │
└──────────┘  │      └────────────┘
       │      │
       │      └─► (1:1) Category
       │
       └─► (1:N) Image
              ├─► thumbnail (1:1, nullable)
              └─► images[] (1:N)
```

**Relationship Rules**:
- Each Post MUST have exactly one Category
- Each Post MAY have zero or more Images
- Each Post MAY have one thumbnail Image (or default placeholder)
- AboutMe has no relationships (singleton)
- BlogOwner owns all Posts and AboutMe (not enforced in data, enforced in auth middleware)

---

## Index & Query Patterns

### Post Queries
1. **List all posts** (paginated, newest first):
   ```typescript
   getAllPosts({ page: number, limit: number, category?: Category }): Promise<Post[]>
   ```

2. **Get post by slug**:
   ```typescript
   getPostBySlug(slug: string): Promise<Post | null>
   ```

3. **Filter by category**:
   ```typescript
   getPostsByCategory(category: Category): Promise<Post[]>
   ```

4. **Get recent posts** (for homepage):
   ```typescript
   getRecentPosts(limit: number): Promise<Post[]>
   ```

### AboutMe Queries
1. **Get About Me content**:
   ```typescript
   getAboutMe(): Promise<AboutMe | null>
   ```

### Image Queries
1. **Get all images for a post**:
   ```typescript
   getPostImages(postId: string): Promise<Image[]>
   ```

---

## Computed Fields

Some fields are derived at runtime rather than stored:

### Post.images
Extracted from Markdown content by parsing `![alt](url "caption")` syntax:
```typescript
function extractImagesFromMarkdown(content: string): Image[] {
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)(?:\s+"([^"]*)")?\)/g;
  const matches = [...content.matchAll(imageRegex)];
  return matches.map(match => ({
    alt: match[1],
    url: match[2],
    caption: match[3] || null,
    // width, height, format, fileSize fetched from file system
  }));
}
```

### Post.thumbnail (auto-generation)
If frontmatter `thumbnail` is null:
```typescript
function getThumbnail(post: Post): Image | null {
  if (post.thumbnail) return post.thumbnail; // manual override
  if (post.images.length > 0) return post.images[0]; // first image
  return DEFAULT_PLACEHOLDER_IMAGE; // default
}
```

### CategoryInfo.count
Counted at runtime:
```typescript
function getCategoryCount(category: Category, posts: Post[]): number {
  return posts.filter(p => p.category === category).length;
}
```

---

## Validation Schema (Zod)

Using Zod for runtime validation:

```typescript
import { z } from 'zod';

const PostSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  content: z.string().max(50000),
  excerpt: z.string().max(200),
  category: z.enum(["일상", "개발"]),
  publishedAt: z.date(),
  updatedAt: z.date().nullable(),
  thumbnail: ImageSchema.nullable(),
  images: z.array(ImageSchema),
  author: z.string(),
});

const ImageSchema = z.object({
  id: z.string(),
  url: z.string().startsWith("/images/"),
  alt: z.string().min(1).max(200),
  caption: z.string().max(500).nullable(),
  width: z.number().positive(),
  height: z.number().positive(),
  format: z.enum(["webp", "png", "jpeg", "gif"]),
  fileSize: z.number().max(5242880), // 5MB
  uploadedAt: z.date(),
});

const AboutMeSchema = z.object({
  id: z.literal("about-me"),
  content: z.string().max(10000),
  updatedAt: z.date(),
  author: z.string(),
});
```

---

## Migration & Versioning

**Initial Version**: v1.0.0 (this document)

**Future Considerations**:
- If adding tags: Add `tags: string[]` to Post interface, update file frontmatter
- If adding drafts: Add `status: "draft" | "published"` to Post interface
- If supporting multiple authors: Change `author: string` to `authorId: string`, add Author entity

**Backward Compatibility**:
- All changes must be backward compatible with existing Markdown files
- Migration scripts must handle missing fields gracefully (default values)

---

## Performance Considerations

### Caching Strategy
- **Build-time**: Parse all Markdown files once during `next build`
- **Runtime (SSR)**: Cache parsed posts in memory (Node.js LRU cache)
- **Runtime (SSG)**: No caching needed (static HTML generated)

### Optimization Techniques
1. **Lazy image loading**: Images below fold use `loading="lazy"`
2. **Incremental static regeneration**: Revalidate post pages every 60s
3. **Partial hydration**: Use React Server Components for post content (no client JS needed)

### Scaling Limits
- **File count**: 1,000+ Markdown files = ~5s build time (acceptable)
- **Image count**: 10,000+ images = ~500MB storage (manageable with CDN)

---

**Status**: Data model complete. Ready for contract generation.
