# Tasks: Drip Drop Dev Personal Blog

**Input**: Design documents from `/Users/hyemin/hamlog/specs/001-drip-drop-dev/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md
**Tech Stack**: Next.js 14 (App Router), TypeScript 5, Tailwind CSS, Vitest, Playwright
**Structure**: Web application (Next.js unified project with API routes)

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Tech stack: Next.js 14, TypeScript, Tailwind CSS, file-based storage
   → Structure: Next.js App Router with API routes, content/ directory
2. Load optional design documents:
   → data-model.md: 5 entities (Post, AboutMe, Image, Category, BlogOwner)
   → contracts/: 3 API specs (posts, about, images)
   → quickstart.md: 9 test scenarios
3. Generate tasks by category:
   → Setup: Next.js init, dependencies, Tailwind config, content directories
   → Tests: 8 contract tests, 4 integration tests, 9 E2E scenarios
   → Core: 5 models, 5 services, 8 API routes, 6 components, 5 pages
   → Integration: Auth middleware, Markdown rendering, image processing
   → Polish: Unit tests, Lighthouse CI, accessibility audit
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file/dependencies = sequential
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001-T048)
6. Dependencies: Setup → Tests → Models → Services → APIs → UI → Polish
7. Return: SUCCESS (48 tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
**Next.js App Router structure** (unified frontend/backend in single project):
- `src/app/`: Pages and layouts
- `src/app/api/`: API route handlers
- `src/models/`: TypeScript interfaces and types
- `src/services/`: Business logic (file operations, Markdown parsing)
- `src/components/`: React components
- `src/lib/`: Utilities (auth, API client)
- `content/`: Markdown files and images
- `tests/`: Vitest and Playwright tests

---

## Phase 3.1: Setup & Infrastructure

- [x] **T001** Initialize Next.js 14 project with TypeScript and App Router
  - Run `npx create-next-app@14 . --typescript --tailwind --app --use-npm`
  - Configure `next.config.js` for images, performance budgets
  - File: `package.json`, `next.config.js`, `tsconfig.json`

- [x] **T002** [P] Install core dependencies
  - `npm install gray-matter react-markdown remark-gfm rehype-highlight sharp zod`
  - `npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom`
  - File: `package.json`

- [x] **T003** [P] Install development and testing tools
  - `npm install -D @playwright/test eslint-config-next prettier tailwindcss-accessible-colors`
  - `npm install -D @types/node @types/react @types/react-dom`
  - File: `package.json`

- [x] **T004** [P] Configure ESLint and Prettier
  - Create `.eslintrc.json` with Next.js strict rules
  - Create `.prettierrc` with 2-space indentation, single quotes
  - Add `lint` and `format` scripts to package.json
  - Files: `.eslintrc.json`, `.prettierrc`

- [x] **T005** [P] Configure Vitest for unit testing
  - Create `vitest.config.ts` with React plugin and coverage settings (≥80%)
  - Create `tests/setup.ts` for test utilities
  - Add `test` and `test:coverage` scripts
  - Files: `vitest.config.ts`, `tests/setup.ts`

- [x] **T006** [P] Configure Playwright for E2E testing
  - Run `npx playwright install`
  - Create `playwright.config.ts` with Chrome/Firefox/Safari browsers
  - Add `test:e2e` script
  - File: `playwright.config.ts`

- [x] **T007** [P] Configure Tailwind CSS with Drip Drop theme
  - Edit `tailwind.config.ts`: add drip colors, accessible fonts, WCAG plugin
  - Create `src/app/globals.css` with base styles, focus rings
  - Files: `tailwind.config.ts`, `src/app/globals.css`

- [x] **T008** Create content directory structure
  - `mkdir -p content/posts content/about content/images/uploads content/images/placeholders`
  - Create `public/images/thumbnails/` directory
  - Create placeholder SVG: `public/images/placeholders/default-thumbnail.png`
  - Files: Directory structure, placeholder image

- [x] **T009** [P] Set up environment variables
  - Create `.env.example` with `ADMIN_SECRET`, `OWNER_NAME`, `OWNER_EMAIL`
  - Add `.env.local` to `.gitignore`
  - Document auth setup in `README.md`
  - Files: `.env.example`, `.gitignore`, `README.md`

---

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests (API Routes)

- [x] **T010** [P] Contract test: GET /api/posts (list all posts)
  - Create `tests/contract/posts.get-list.test.ts`
  - Test: returns 200, array of PostSummary objects, pagination
  - Test: filters by category query parameter
  - Verify OpenAPI spec compliance (posts-api.yaml)
  - File: `tests/contract/posts.get-list.test.ts`

- [x] **T011** [P] Contract test: POST /api/posts (create post)
  - Create `tests/contract/posts.post.test.ts`
  - Test: returns 201 with created Post, validates request schema
  - Test: returns 401 without auth, 400 for invalid data
  - Verify OpenAPI spec compliance
  - File: `tests/contract/posts.post.test.ts`

- [x] **T012** [P] Contract test: GET /api/posts/[slug] (get post by slug)
  - Create `tests/contract/posts.get-by-slug.test.ts`
  - Test: returns 200 with full Post object
  - Test: returns 404 for non-existent slug
  - Verify OpenAPI spec compliance
  - File: `tests/contract/posts.get-by-slug.test.ts`

- [x] **T013** [P] Contract test: PUT /api/posts/[slug] (update post)
  - Create `tests/contract/posts.put.test.ts`
  - Test: returns 200 with updated Post, validates request schema
  - Test: returns 401 without auth, 404 for non-existent slug
  - Verify OpenAPI spec compliance
  - File: `tests/contract/posts.put.test.ts`

- [x] **T014** [P] Contract test: DELETE /api/posts/[slug] (delete post)
  - Create `tests/contract/posts.delete.test.ts`
  - Test: returns 204 on successful deletion
  - Test: returns 401 without auth, 404 for non-existent slug
  - Verify OpenAPI spec compliance
  - File: `tests/contract/posts.delete.test.ts`

- [x] **T015** [P] Contract test: GET /api/about (get About Me)
  - Create `tests/contract/about.get.test.ts`
  - Test: returns 200 with AboutMe object
  - Test: returns 404 if not exists
  - Verify OpenAPI spec compliance (about-api.yaml)
  - File: `tests/contract/about.get.test.ts`

- [x] **T016** [P] Contract test: PUT /api/about (update About Me)
  - Create `tests/contract/about.put.test.ts`
  - Test: returns 200 with updated AboutMe
  - Test: returns 401 without auth, 400 for invalid content
  - Verify OpenAPI spec compliance
  - File: `tests/contract/about.put.test.ts`

- [x] **T017** [P] Contract test: POST /api/images/upload (upload image)
  - Create `tests/contract/images.upload.test.ts`
  - Test: returns 201 with Image object, validates multipart/form-data
  - Test: returns 401 without auth, 400 for invalid format, 413 for > 5MB
  - Verify OpenAPI spec compliance (images-api.yaml)
  - File: `tests/contract/images.upload.test.ts`

### Integration Tests (User Workflows)

- [x] **T018** [P] Integration test: Post lifecycle (create → read → update → delete)
  - Create `tests/integration/post-lifecycle.test.ts`
  - Test complete CRUD flow with file system verification
  - Verify frontmatter parsing, Markdown content handling
  - File: `tests/integration/post-lifecycle.test.ts`

- [x] **T019** [P] Integration test: Category filtering
  - Create `tests/integration/category-filtering.test.ts`
  - Test filtering posts by "일상" and "개발" categories
  - Verify category count calculation
  - File: `tests/integration/category-filtering.test.ts`

- [x] **T020** [P] Integration test: Image upload and thumbnail generation
  - Create `tests/integration/image-upload.test.ts`
  - Test image upload, Sharp processing, thumbnail generation
  - Verify auto-thumbnail selection and manual override
  - File: `tests/integration/image-upload.test.ts`

- [x] **T021** [P] Integration test: Markdown parsing with images and captions
  - Create `tests/integration/markdown-parsing.test.ts`
  - Test extracting images from Markdown with `![alt](url "caption")` syntax
  - Verify caption rendering, image metadata extraction
  - File: `tests/integration/markdown-parsing.test.ts`

---

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Models & Types

- [ ] **T022** [P] Create Post model with TypeScript interface and Zod schema
  - Create `src/models/Post.ts`
  - Define `Post` interface, `PostSummary`, `PostCreate`, `PostUpdate` types
  - Export `PostSchema` Zod validator
  - File: `src/models/Post.ts`

- [ ] **T023** [P] Create Category model with predefined values
  - Create `src/models/Category.ts`
  - Define `Category` type, `CategoryInfo` interface, `CATEGORIES` constant
  - File: `src/models/Category.ts`

- [ ] **T024** [P] Create Image model with TypeScript interface
  - Create `src/models/Image.ts`
  - Define `Image` interface, `ImageFormat` type, `ImageSchema` Zod validator
  - File: `src/models/Image.ts`

- [ ] **T025** [P] Create AboutMe model with TypeScript interface
  - Create `src/models/AboutMe.ts`
  - Define `AboutMe` interface, `AboutMeSchema` Zod validator
  - File: `src/models/AboutMe.ts`

- [ ] **T026** [P] Create BlogOwner model and AuthContext
  - Create `src/models/BlogOwner.ts`
  - Define `BlogOwner`, `AuthContext` interfaces
  - File: `src/models/BlogOwner.ts`

### Services (Business Logic)

- [ ] **T027** Create MarkdownService for parsing files with frontmatter
  - Create `src/services/MarkdownService.ts`
  - Implement `parseMarkdownFile(path)`, `extractFrontmatter(content)`
  - Use `gray-matter` library, handle Zod validation errors
  - File: `src/services/MarkdownService.ts`

- [ ] **T028** Create PostService for CRUD operations on Markdown files
  - Create `src/services/PostService.ts`
  - Implement `getAllPosts()`, `getPostBySlug()`, `createPost()`, `updatePost()`, `deletePost()`
  - Use `fs/promises` for file operations, MarkdownService for parsing
  - Depends on: T022 (Post model), T027 (MarkdownService)
  - File: `src/services/PostService.ts`

- [ ] **T029** Create ImageService for upload and thumbnail generation
  - Create `src/services/ImageService.ts`
  - Implement `uploadImage(file)`, `generateThumbnail(imagePath)`, `getImageMetadata(path)`
  - Use `sharp` library for processing, validate format and size
  - Depends on: T024 (Image model)
  - File: `src/services/ImageService.ts`

- [ ] **T030** Create AboutMeService for singleton content management
  - Create `src/services/AboutMeService.ts`
  - Implement `getAboutMe()`, `updateAboutMe(content)`
  - Handle `content/about/me.md` file operations
  - Depends on: T025 (AboutMe model), T027 (MarkdownService)
  - File: `src/services/AboutMeService.ts`

- [ ] **T031** Create AuthService for environment-based authentication
  - Create `src/services/AuthService.ts`
  - Implement `verifyAdminSecret(secret)`, `getOwnerInfo()`
  - Read from `process.env.ADMIN_SECRET`, validate minimum 32 characters
  - Depends on: T026 (BlogOwner model)
  - File: `src/services/AuthService.ts`

### API Routes

- [ ] **T032** Implement GET /api/posts (list posts with pagination and filtering)
  - Create `src/app/api/posts/route.ts`
  - Handle query params: `page`, `limit`, `category`
  - Return PostSummary[] with pagination metadata
  - Depends on: T028 (PostService)
  - File: `src/app/api/posts/route.ts`

- [ ] **T033** Implement POST /api/posts (create new post)
  - Add POST handler to `src/app/api/posts/route.ts`
  - Validate auth header, parse request body with Zod
  - Call PostService.createPost(), return 201 with created Post
  - Depends on: T028 (PostService), T031 (AuthService)
  - File: `src/app/api/posts/route.ts`

- [ ] **T034** Implement GET /api/posts/[slug] (get post by slug)
  - Create `src/app/api/posts/[slug]/route.ts`
  - Return full Post object with rendered Markdown
  - Return 404 if post not found
  - Depends on: T028 (PostService)
  - File: `src/app/api/posts/[slug]/route.ts`

- [ ] **T035** Implement PUT /api/posts/[slug] (update post)
  - Add PUT handler to `src/app/api/posts/[slug]/route.ts`
  - Validate auth, parse request body, update file
  - Return updated Post with new `updatedAt` timestamp
  - Depends on: T028 (PostService), T031 (AuthService)
  - File: `src/app/api/posts/[slug]/route.ts`

- [ ] **T036** Implement DELETE /api/posts/[slug] (delete post)
  - Add DELETE handler to `src/app/api/posts/[slug]/route.ts`
  - Validate auth, delete Markdown file
  - Return 204 on success
  - Depends on: T028 (PostService), T031 (AuthService)
  - File: `src/app/api/posts/[slug]/route.ts`

- [ ] **T037** Implement GET /api/about (get About Me content)
  - Create `src/app/api/about/route.ts`
  - Return AboutMe object with Markdown content
  - Depends on: T030 (AboutMeService)
  - File: `src/app/api/about/route.ts`

- [ ] **T038** Implement PUT /api/about (update About Me)
  - Add PUT handler to `src/app/api/about/route.ts`
  - Validate auth, update `content/about/me.md`
  - Depends on: T030 (AboutMeService), T031 (AuthService)
  - File: `src/app/api/about/route.ts`

- [ ] **T039** Implement POST /api/images/upload (upload and process image)
  - Create `src/app/api/images/upload/route.ts`
  - Handle multipart/form-data, validate file size (≤5MB) and format
  - Generate thumbnail with Sharp, return Image object
  - Depends on: T029 (ImageService), T031 (AuthService)
  - File: `src/app/api/images/upload/route.ts`

### Middleware

- [ ] **T040** Create authentication middleware for admin routes
  - Create `src/middleware.ts`
  - Check `/admin/*` routes for auth cookie or Authorization header
  - Redirect to `/` if unauthorized
  - Depends on: T031 (AuthService)
  - File: `src/middleware.ts`

---

## Phase 3.4: Frontend UI Components & Pages

### Shared Components

- [ ] **T041** [P] Create Header component with navigation and blog name
  - Create `src/components/Header.tsx`
  - Display "Drip Drop Dev" in header, navigation links (Home, About)
  - Show admin links (New Post, Edit About) only if authenticated
  - File: `src/components/Header.tsx`

- [ ] **T042** [P] Create PostCard component for post list display
  - Create `src/components/PostCard.tsx`
  - Display thumbnail, title, excerpt, category badge, published date
  - Use Next.js `<Image>` component for optimization
  - File: `src/components/PostCard.tsx`

- [ ] **T043** [P] Create CategoryFilter component for filtering posts
  - Create `src/components/CategoryFilter.tsx`
  - Render buttons for "전체", "일상", "개발" with active state
  - Update URL query parameter on click
  - File: `src/components/CategoryFilter.tsx`

- [ ] **T044** [P] Create PostContent component for rendering Markdown
  - Create `src/components/PostContent.tsx`
  - Use `react-markdown` with `remark-gfm` and `rehype-highlight`
  - Render images with captions using custom component
  - File: `src/components/PostContent.tsx`

- [ ] **T045** [P] Create MarkdownEditor component for admin post creation/editing
  - Create `src/components/MarkdownEditor.tsx`
  - Textarea for Markdown input, live preview with PostContent
  - Category selector, thumbnail upload button
  - File: `src/components/MarkdownEditor.tsx`

- [ ] **T046** [P] Create ImageUploader component for image upload
  - Create `src/components/ImageUploader.tsx`
  - File input, drag-and-drop support, preview before upload
  - Call POST /api/images/upload, insert Markdown syntax on success
  - File: `src/components/ImageUploader.tsx`

### Public Pages

- [ ] **T047** Create root layout with Header and global styles
  - Create `src/app/layout.tsx`
  - Include Header component, apply Tailwind globals.css
  - Set metadata: title "Drip Drop Dev", description, favicon
  - Depends on: T041 (Header)
  - File: `src/app/layout.tsx`

- [ ] **T048** Create homepage (post list with category filter)
  - Create `src/app/page.tsx`
  - Fetch posts from API, render PostCard grid, CategoryFilter
  - Implement pagination, handle category query parameter
  - Depends on: T042 (PostCard), T043 (CategoryFilter)
  - File: `src/app/page.tsx`

- [ ] **T049** Create post detail page ([slug])
  - Create `src/app/posts/[slug]/page.tsx`
  - Fetch post by slug, render PostContent with metadata
  - Use `generateStaticParams` for SSG, `revalidate: 60` for ISR
  - Depends on: T044 (PostContent)
  - File: `src/app/posts/[slug]/page.tsx`

- [ ] **T050** Create About Me page
  - Create `src/app/about/page.tsx`
  - Fetch About Me content from API, render with PostContent
  - Depends on: T044 (PostContent)
  - File: `src/app/about/page.tsx`

### Admin Pages (Protected)

- [ ] **T051** Create admin post creation page
  - Create `src/app/admin/posts/new/page.tsx`
  - Render MarkdownEditor, handle form submission to POST /api/posts
  - Redirect to `/posts/[slug]` on success
  - Depends on: T045 (MarkdownEditor), T046 (ImageUploader)
  - File: `src/app/admin/posts/new/page.tsx`

- [ ] **T052** Create admin post edit page
  - Create `src/app/admin/posts/[slug]/edit/page.tsx`
  - Fetch existing post, populate MarkdownEditor, submit to PUT /api/posts/[slug]
  - Depends on: T045 (MarkdownEditor)
  - File: `src/app/admin/posts/[slug]/edit/page.tsx`

- [ ] **T053** Create admin About Me edit page
  - Create `src/app/admin/about/edit/page.tsx`
  - Fetch About Me content, render MarkdownEditor, submit to PUT /api/about
  - Depends on: T045 (MarkdownEditor)
  - File: `src/app/admin/about/edit/page.tsx`

---

## Phase 3.5: End-to-End Tests (Playwright)

- [ ] **T054** [P] E2E test: Browse posts as visitor (quickstart scenario 1)
  - Create `tests/e2e/post-browsing.spec.ts`
  - Test: navigate to homepage, verify post list, click post card, view detail
  - File: `tests/e2e/post-browsing.spec.ts`

- [ ] **T055** [P] E2E test: Filter posts by category (quickstart scenario 6)
  - Create `tests/e2e/category-filter.spec.ts`
  - Test: click category filters, verify filtered results
  - File: `tests/e2e/category-filter.spec.ts`

- [ ] **T056** [P] E2E test: Read About Me page (quickstart scenario 2)
  - Create `tests/e2e/about-page.spec.ts`
  - Test: navigate to About Me, verify content displays
  - File: `tests/e2e/about-page.spec.ts`

- [ ] **T057** [P] E2E test: Create new post as owner (quickstart scenario 3)
  - Create `tests/e2e/post-creation.spec.ts`
  - Test: set auth cookie, navigate to new post page, submit form, verify created
  - File: `tests/e2e/post-creation.spec.ts`

- [ ] **T058** [P] E2E test: Edit existing post (quickstart scenario 4)
  - Create `tests/e2e/post-editing.spec.ts`
  - Test: edit post, change category, override thumbnail, verify updates
  - File: `tests/e2e/post-editing.spec.ts`

- [ ] **T059** [P] E2E test: Edit About Me page (quickstart scenario 5)
  - Create `tests/e2e/about-editing.spec.ts`
  - Test: set auth cookie, edit About Me, verify changes
  - File: `tests/e2e/about-editing.spec.ts`

- [ ] **T060** [P] E2E test: Verify non-owner cannot access admin (quickstart scenario 7)
  - Create `tests/e2e/admin-auth.spec.ts`
  - Test: without auth, attempt to access admin routes, verify redirect/403
  - File: `tests/e2e/admin-auth.spec.ts`

- [ ] **T061** [P] E2E test: Accessibility compliance (quickstart scenario 8)
  - Create `tests/e2e/accessibility.spec.ts`
  - Test: inject axe, run checkA11y on all pages, verify WCAG 2.1 AA
  - File: `tests/e2e/accessibility.spec.ts`

---

## Phase 3.6: Polish & Optimization

### Unit Tests

- [ ] **T062** [P] Unit tests for MarkdownService
  - Create `tests/unit/MarkdownService.test.ts`
  - Test: parseMarkdownFile, extractFrontmatter, error handling
  - File: `tests/unit/MarkdownService.test.ts`

- [ ] **T063** [P] Unit tests for PostService
  - Create `tests/unit/PostService.test.ts`
  - Test: getAllPosts pagination, getPostBySlug, createPost validation
  - File: `tests/unit/PostService.test.ts`

- [ ] **T064** [P] Unit tests for ImageService
  - Create `tests/unit/ImageService.test.ts`
  - Test: uploadImage validation, generateThumbnail Sharp processing
  - File: `tests/unit/ImageService.test.ts`

- [ ] **T065** [P] Unit tests for AuthService
  - Create `tests/unit/AuthService.test.ts`
  - Test: verifyAdminSecret, getOwnerInfo, env variable validation
  - File: `tests/unit/AuthService.test.ts`

### Performance & Quality

- [ ] **T066** Configure Lighthouse CI for performance budgets
  - Create `.lighthouserc.json` with thresholds (performance ≥90, FCP <1.5s, LCP <2.5s)
  - Create `.github/workflows/lighthouse.yml` for CI automation
  - Files: `.lighthouserc.json`, `.github/workflows/lighthouse.yml`

- [ ] **T067** Performance optimization: Code splitting and lazy loading
  - Use `next/dynamic` for admin components (MarkdownEditor, ImageUploader)
  - Verify bundle size <200KB gzipped (run `npm run build` and analyze)
  - File: Components with dynamic imports

- [ ] **T068** Create sample content for testing
  - Create 3 sample posts in `content/posts/` (2 개발, 1 일상)
  - Create `content/about/me.md` with sample bio
  - Add sample images to `content/images/uploads/`
  - Files: Markdown files in content/

### Documentation

- [ ] **T069** [P] Update README.md with setup instructions
  - Document: installation, env variables, running dev server, building for production
  - Include quickstart guide, deployment instructions (Vercel)
  - File: `README.md`

- [ ] **T070** [P] Create deployment guide
  - Document Vercel deployment: connect repo, set env vars, configure domains
  - Document performance monitoring setup
  - File: `docs/DEPLOYMENT.md`

---

## Dependencies

**Critical Path**:
1. **Setup (T001-T009)** → All other phases
2. **Tests (T010-T021)** → Models & Services (T022-T031)
3. **Models (T022-T026)** → Services (T027-T031)
4. **Services (T027-T031)** → API Routes (T032-T039)
5. **API Routes (T032-T039)** → Frontend (T041-T053)
6. **Frontend (T041-T053)** → E2E Tests (T054-T061)
7. **All Implementation** → Polish (T062-T070)

**Blocking Dependencies**:
- T027 (MarkdownService) blocks T028, T030
- T028 (PostService) blocks T032-T036
- T029 (ImageService) blocks T039
- T030 (AboutMeService) blocks T037-T038
- T031 (AuthService) blocks T033, T035, T036, T038, T039, T040
- T041 (Header) blocks T047
- T042 (PostCard) blocks T048
- T044 (PostContent) blocks T049, T050
- T045 (MarkdownEditor) blocks T051, T052, T053

---

## Parallel Execution Examples

### Contract Tests (Run T010-T017 together):
```
Task: "Contract test GET /api/posts in tests/contract/posts.get-list.test.ts"
Task: "Contract test POST /api/posts in tests/contract/posts.post.test.ts"
Task: "Contract test GET /api/posts/[slug] in tests/contract/posts.get-by-slug.test.ts"
Task: "Contract test PUT /api/posts/[slug] in tests/contract/posts.put.test.ts"
Task: "Contract test DELETE /api/posts/[slug] in tests/contract/posts.delete.test.ts"
Task: "Contract test GET /api/about in tests/contract/about.get.test.ts"
Task: "Contract test PUT /api/about in tests/contract/about.put.test.ts"
Task: "Contract test POST /api/images/upload in tests/contract/images.upload.test.ts"
```

### Models (Run T022-T026 together):
```
Task: "Create Post model in src/models/Post.ts"
Task: "Create Category model in src/models/Category.ts"
Task: "Create Image model in src/models/Image.ts"
Task: "Create AboutMe model in src/models/AboutMe.ts"
Task: "Create BlogOwner model in src/models/BlogOwner.ts"
```

### Components (Run T041-T046 together):
```
Task: "Create Header component in src/components/Header.tsx"
Task: "Create PostCard component in src/components/PostCard.tsx"
Task: "Create CategoryFilter component in src/components/CategoryFilter.tsx"
Task: "Create PostContent component in src/components/PostContent.tsx"
Task: "Create MarkdownEditor component in src/components/MarkdownEditor.tsx"
Task: "Create ImageUploader component in src/components/ImageUploader.tsx"
```

---

## Notes

- **[P] tasks**: Different files, no dependencies, safe to run in parallel
- **Sequential tasks**: Modify same file or have dependencies
- **TDD enforcement**: Verify all tests fail before implementing (T010-T021 → T022-T053)
- **Commit strategy**: Commit after each completed task or logical group
- **Coverage target**: ≥80% for all services and utilities

---

## Validation Checklist
*GATE: Verify before marking tasks complete*

- [x] All 3 contract files have corresponding tests (T010-T017)
- [x] All 5 entities have model tasks (T022-T026)
- [x] All 5 services have implementation tasks (T027-T031)
- [x] All 8 API endpoints have implementation tasks (T032-T039)
- [x] All 6 components have implementation tasks (T041-T046)
- [x] All 5 pages have implementation tasks (T047-T053)
- [x] All 9 quickstart scenarios have E2E tests (T054-T061)
- [x] Tests come before implementation (Phase 3.2 → 3.3)
- [x] Parallel tasks are truly independent (verified file paths)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Dependencies documented and blocking relationships clear

---

**Total Tasks**: 70
**Estimated Time**: 18-22 days (3-day increments per phase)
**Coverage**: ≥80% target via Vitest and Playwright
**Performance**: Lighthouse ≥90, FCP <1.5s, bundle <200KB

**Status**: Tasks ready for execution via `/implement` command
