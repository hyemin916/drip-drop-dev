# Quickstart Guide

**Feature**: Drip Drop Dev Personal Blog
**Purpose**: Validate end-to-end user workflows through automated integration tests
**Date**: 2025-10-05

---

## Overview

This guide provides step-by-step instructions for testing the complete user journeys from the feature specification. Each scenario maps to acceptance criteria and can be automated as integration tests.

---

## Prerequisites

### Environment Setup
```bash
# Clone repository
git clone https://github.com/username/dripdrop-dev.git
cd dripdrop-dev

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local and set:
# ADMIN_SECRET=your-secret-here (min 32 characters)
# OWNER_NAME="Your Name"
# OWNER_EMAIL="your@email.com"

# Start development server
npm run dev
# Server runs at http://localhost:3000
```

### Test Authentication
```bash
# Set authentication cookie (for admin features)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Authorization: Bearer your-secret-here" \
  -c cookies.txt

# Or manually set cookie in browser DevTools:
# Name: admin_auth
# Value: your-secret-here
# HttpOnly: true
# Secure: true (production only)
# SameSite: Strict
```

---

## Scenario 1: Browse Posts as Visitor (Public Access)

**Maps to**: FR-003, FR-013, FR-015, FR-016, Acceptance Scenario #2

### Steps

1. **Navigate to homepage**
   ```
   URL: http://localhost:3000
   Expected: Post list page loads with thumbnails
   ```

2. **Verify post list displays**
   - [ ] Page shows "Drip Drop Dev" in header
   - [ ] Post cards display with:
     - Thumbnail image
     - Title
     - Excerpt (max 200 chars)
     - Category badge ("일상" or "개발")
     - Published date
   - [ ] Posts sorted by newest first

3. **Filter by category "개발"**
   ```
   Action: Click "개발" category filter
   Expected: Only posts with category="개발" display
   ```

4. **Filter by category "일상"**
   ```
   Action: Click "일상" category filter
   Expected: Only posts with category="일상" display
   ```

5. **Reset filter to "전체"**
   ```
   Action: Click "전체" filter
   Expected: All posts display again
   ```

6. **Click post to view detail**
   ```
   Action: Click on a post card
   URL: http://localhost:3000/posts/[slug]
   Expected: Full post content displays with:
     - Markdown rendered with proper formatting
     - Images with captions below
     - "Drip Drop Dev" in header
     - Back to list link
   ```

### Automation (Playwright)
```typescript
test('Browse posts as visitor', async ({ page }) => {
  await page.goto('/');

  // Verify header
  await expect(page.getByText('Drip Drop Dev')).toBeVisible();

  // Verify post cards
  const postCards = page.locator('[data-testid="post-card"]');
  await expect(postCards).toHaveCount(10); // assuming 10 posts

  // Filter by category
  await page.click('text=개발');
  const devPosts = page.locator('[data-testid="post-card"][data-category="개발"]');
  await expect(devPosts.count()).toBeGreaterThan(0);

  // View post detail
  await postCards.first().click();
  await expect(page).toHaveURL(/\/posts\/[a-z0-9-]+/);
  await expect(page.locator('article')).toBeVisible();
});
```

---

## Scenario 2: Read About Me Page (Public Access)

**Maps to**: FR-018, Acceptance Scenario #3

### Steps

1. **Navigate to About Me**
   ```
   Action: Click "About" link in header
   URL: http://localhost:3000/about
   Expected: About Me page loads with Markdown content
   ```

2. **Verify content displays**
   - [ ] Markdown content rendered correctly
   - [ ] Images (if any) display with captions
   - [ ] "Drip Drop Dev" in header
   - [ ] Consistent styling with blog theme

### Automation (Playwright)
```typescript
test('Read About Me page', async ({ page }) => {
  await page.goto('/about');

  await expect(page.locator('article')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('About');
});
```

---

## Scenario 3: Create New Post (Authenticated Owner)

**Maps to**: FR-002, FR-005, FR-007, FR-011, Acceptance Scenario #1, #4

### Steps

1. **Authenticate as owner**
   ```
   Prerequisite: Set admin_auth cookie (see Prerequisites section)
   ```

2. **Navigate to admin dashboard**
   ```
   URL: http://localhost:3000/admin/posts/new
   Expected: Post creation form displays
   ```

3. **Fill post form**
   - Title: "My First Post"
   - Slug: "my-first-post" (auto-generated from title)
   - Category: Select "개발"
   - Content: Write Markdown with image syntax:
     ```markdown
     # Hello World

     This is my first post!

     ![Test Image](/images/test.png "This is a caption")
     ```
   - Excerpt: "A brief summary of this post"

4. **Upload image (optional)**
   ```
   Action: Click "Upload Image" button
   File: test.png (< 5MB)
   Alt text: "Test Image"
   Caption: "This is a caption"
   Expected: Image uploaded, URL inserted into content
   ```

5. **Submit post**
   ```
   Action: Click "Publish" button
   Expected:
     - Form validates successfully
     - Post saved to content/posts/YYYY-MM-DD-my-first-post.md
     - Redirect to /posts/my-first-post
     - Thumbnail auto-generated from first image
   ```

6. **Verify post appears in list**
   ```
   URL: http://localhost:3000
   Expected: New post appears at top of list with thumbnail
   ```

### Automation (Playwright)
```typescript
test('Create new post as owner', async ({ page, context }) => {
  // Set auth cookie
  await context.addCookies([{
    name: 'admin_auth',
    value: process.env.ADMIN_SECRET,
    domain: 'localhost',
    path: '/',
    httpOnly: true,
  }]);

  await page.goto('/admin/posts/new');

  // Fill form
  await page.fill('[name="title"]', 'My First Post');
  await page.fill('[name="slug"]', 'my-first-post');
  await page.selectOption('[name="category"]', '개발');
  await page.fill('[name="content"]', '# Hello World\n\nThis is my first post!');
  await page.fill('[name="excerpt"]', 'A brief summary');

  // Submit
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/posts/my-first-post');

  // Verify in list
  await page.goto('/');
  await expect(page.getByText('My First Post')).toBeVisible();
});
```

---

## Scenario 4: Edit Existing Post (Authenticated Owner)

**Maps to**: FR-002, FR-011 (manual thumbnail override)

### Steps

1. **Navigate to post edit page**
   ```
   URL: http://localhost:3000/admin/posts/my-first-post/edit
   Expected: Edit form pre-filled with existing post data
   ```

2. **Modify content**
   - Update title: "My First Post (Updated)"
   - Add new paragraph to content
   - Change category from "개발" to "일상"

3. **Override thumbnail**
   ```
   Action: Upload new thumbnail image
   Expected: Custom thumbnail replaces auto-generated one
   ```

4. **Submit changes**
   ```
   Action: Click "Update" button
   Expected:
     - Post file updated
     - updatedAt timestamp set to current time
     - Redirect to /posts/my-first-post
     - Changes reflected immediately
   ```

### Automation (Playwright)
```typescript
test('Edit existing post', async ({ page, context }) => {
  await context.addCookies([{ name: 'admin_auth', value: process.env.ADMIN_SECRET }]);

  await page.goto('/admin/posts/my-first-post/edit');

  await page.fill('[name="title"]', 'My First Post (Updated)');
  await page.selectOption('[name="category"]', '일상');

  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/posts/my-first-post');
  await expect(page.getByText('My First Post (Updated)')).toBeVisible();
});
```

---

## Scenario 5: Edit About Me Page (Authenticated Owner)

**Maps to**: FR-019, Acceptance Scenario #3

### Steps

1. **Navigate to About Me edit page**
   ```
   URL: http://localhost:3000/admin/about/edit
   Expected: Markdown editor with existing About Me content
   ```

2. **Modify content**
   - Update Markdown content with new bio information
   - Add image with caption

3. **Submit changes**
   ```
   Action: Click "Save" button
   Expected:
     - About Me file updated (content/about/me.md)
     - Redirect to /about
     - Changes displayed immediately
   ```

### Automation (Playwright)
```typescript
test('Edit About Me page', async ({ page, context }) => {
  await context.addCookies([{ name: 'admin_auth', value: process.env.ADMIN_SECRET }]);

  await page.goto('/admin/about/edit');

  await page.fill('[name="content"]', '# About Me\n\nUpdated bio content...');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/about');
  await expect(page.getByText('Updated bio content')).toBeVisible();
});
```

---

## Scenario 6: Filter Posts by Category (Public Access)

**Maps to**: FR-014, Acceptance Scenario #2

### Steps

1. **Navigate to homepage**
   ```
   URL: http://localhost:3000
   Expected: Default view shows all posts (전체 filter active)
   ```

2. **Apply "개발" filter**
   ```
   Action: Click "개발" category button
   Expected:
     - URL updates to /?category=development
     - Only posts with category="개발" display
     - "개발" button has active state styling
   ```

3. **Apply "일상" filter**
   ```
   Action: Click "일상" category button
   Expected:
     - URL updates to /?category=daily-life
     - Only posts with category="일상" display
     - "일상" button has active state styling
   ```

4. **Clear filter**
   ```
   Action: Click "전체" button
   Expected:
     - URL updates to / (no query param)
     - All posts display
     - "전체" button has active state styling
   ```

### Automation (Playwright)
```typescript
test('Filter posts by category', async ({ page }) => {
  await page.goto('/');

  // All posts visible initially
  const allPosts = await page.locator('[data-testid="post-card"]').count();
  expect(allPosts).toBeGreaterThan(0);

  // Filter by 개발
  await page.click('text=개발');
  await expect(page).toHaveURL('/?category=development');
  const devPosts = await page.locator('[data-testid="post-card"][data-category="개발"]').count();
  expect(devPosts).toBeLessThanOrEqual(allPosts);

  // Filter by 일상
  await page.click('text=일상');
  await expect(page).toHaveURL('/?category=daily-life');

  // Clear filter
  await page.click('text=전체');
  await expect(page).toHaveURL('/');
});
```

---

## Scenario 7: Verify Non-Owner Cannot Access Admin

**Maps to**: FR-004, Acceptance Scenario #4, Edge Case

### Steps

1. **Clear authentication cookies**
   ```
   Action: Clear all cookies or use incognito window
   ```

2. **Attempt to access admin page**
   ```
   URL: http://localhost:3000/admin/posts/new
   Expected:
     - Redirect to / (homepage)
     - Or 403 Forbidden error
     - Admin UI not visible
   ```

3. **Verify post creation form hidden**
   - [ ] No "New Post" button visible on homepage
   - [ ] No "Edit" buttons on post detail pages
   - [ ] No "Edit About" button on About Me page

### Automation (Playwright)
```typescript
test('Non-owner cannot access admin', async ({ page }) => {
  await page.goto('/admin/posts/new');

  // Should redirect to homepage
  await expect(page).toHaveURL('/');

  // Verify no admin UI elements
  await expect(page.locator('text=New Post')).not.toBeVisible();
});
```

---

## Scenario 8: Verify Accessibility (WCAG 2.1 AA)

**Maps to**: FR-021, Constitution: User Experience Consistency

### Steps

1. **Run Lighthouse accessibility audit**
   ```bash
   npm run lighthouse -- --only=accessibility
   Expected: Score ≥ 95
   ```

2. **Verify keyboard navigation**
   - [ ] Tab through all interactive elements
   - [ ] Focus indicators visible (focus-visible:ring)
   - [ ] Skip-to-content link works
   - [ ] No keyboard traps

3. **Verify color contrast**
   ```
   Tool: axe DevTools browser extension
   Expected: All text meets 4.5:1 contrast ratio (7:1 for large text)
   ```

4. **Verify semantic HTML**
   - [ ] `<nav>` for navigation
   - [ ] `<main>` for main content
   - [ ] `<article>` for posts
   - [ ] Proper heading hierarchy (h1 → h2 → h3)

5. **Verify image alt text**
   - [ ] All images have alt attributes
   - [ ] Captions use `<figcaption>` tags

### Automation (Playwright + axe)
```typescript
import { injectAxe, checkA11y } from 'axe-playwright';

test('Accessibility compliance', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);
  await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: { html: true },
  });
});
```

---

## Scenario 9: Verify Performance Budget

**Maps to**: FR-020, Constitution: Performance as a Feature

### Steps

1. **Measure Lighthouse performance score**
   ```bash
   npm run lighthouse
   Expected:
     - Performance score ≥ 90
     - FCP < 1.5s
     - LCP < 2.5s
     - TBT < 300ms
     - CLS < 0.1
   ```

2. **Verify bundle sizes**
   ```bash
   npm run analyze
   Expected:
     - Main JS bundle < 200KB gzipped
     - CSS bundle < 50KB gzipped
   ```

3. **Test image optimization**
   - [ ] Images served in WebP/AVIF format
   - [ ] Thumbnails sized appropriately (400x300px)
   - [ ] Lazy loading applied to below-fold images

### Automation (Lighthouse CI)
```yaml
# .lighthouserc.json
{
  "ci": {
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "first-contentful-paint": ["error", {"maxNumericValue": 1500}],
        "largest-contentful-paint": ["error", {"maxNumericValue": 2500}]
      }
    }
  }
}
```

---

## Edge Cases & Error Scenarios

### 1. Post Without Images
```
Given: Post has no images in content
When: Post is published
Then: Default placeholder thumbnail displays in list
```

### 2. Image Without Caption
```
Given: Image uploaded without caption
When: Post is rendered
Then: Image displays without <figcaption> tag (valid)
```

### 3. Invalid Category
```
Given: Attempt to create post with category="invalid"
When: Form submitted
Then: Validation error: "Category must be 일상 or 개발"
```

### 4. Long Markdown Content
```
Given: Post content exceeds 50,000 characters
When: Form submitted
Then: Validation error: "Content exceeds maximum length"
```

### 5. Oversized Image Upload
```
Given: Upload image file > 5MB
When: File selected
Then: Error: "File size must be less than 5MB"
```

---

## Automated Test Suite Summary

### Test Coverage
- **E2E Tests**: 9 scenarios (Playwright)
- **Contract Tests**: 8 API endpoints (Vitest + OpenAPI validation)
- **Unit Tests**: 15+ services/utils (Vitest)
- **Accessibility Tests**: axe-core integration
- **Performance Tests**: Lighthouse CI

### Running Tests
```bash
# All tests
npm test

# E2E tests only
npm run test:e2e

# Unit tests only
npm run test:unit

# Contract tests only
npm run test:contract

# Accessibility tests
npm run test:a11y

# Performance tests
npm run test:perf
```

### CI/CD Pipeline
```yaml
# .github/workflows/test.yml
- name: Run all tests
  run: |
    npm run test:unit
    npm run test:contract
    npm run test:e2e
    npm run test:a11y
    npm run test:perf
```

---

## Success Criteria Checklist

- [ ] All 9 scenarios pass automated tests
- [ ] Lighthouse performance score ≥ 90
- [ ] Lighthouse accessibility score ≥ 95
- [ ] Bundle size under budget (200KB JS, 50KB CSS)
- [ ] All contract tests pass (8/8 endpoints)
- [ ] Manual QA on 3 browsers (Chrome, Firefox, Safari)
- [ ] Mobile responsiveness verified (320px - 2560px)

---

**Status**: Quickstart scenarios defined. Ready for test implementation in Phase 3.
