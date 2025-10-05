
# Implementation Plan: Drip Drop Dev Personal Blog

**Branch**: `001-drip-drop-dev` | **Date**: 2025-10-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/Users/hyemin/hamlog/specs/001-drip-drop-dev/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code, or `AGENTS.md` for all other agents).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 8. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Drip Drop Dev is a personal blog platform enabling the owner to create and manage Markdown-based posts with images and captions, organized by categories (일상/개발). All visitors can browse and read posts, filtered by category or viewing all posts. The blog features environment-based authentication for the owner, auto-generated thumbnails with manual override, and a distinctive "Drip Drop" water-themed design maintaining excellent readability.

**Technical Approach**: Modern web application with Next.js frontend for SSR/SSG capabilities, file-based content storage for simplicity (Markdown + frontmatter), and Tailwind CSS for theme implementation with accessibility compliance.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 14.x (App Router)
**Primary Dependencies**: Next.js, React 18, Tailwind CSS, react-markdown, gray-matter, sharp (image processing)
**Storage**: File-based (Markdown files with frontmatter metadata, local image storage)
**Testing**: Vitest for unit tests, Playwright for E2E integration tests
**Target Platform**: Web (SSR/SSG, deployable to Vercel/Netlify)
**Project Type**: web (frontend + lightweight backend API routes)
**Performance Goals**:
- Page load p95 < 1.5s (Lighthouse score > 90)
- Image optimization with Next.js Image component
- Static generation for post pages (ISR with revalidation)
**Constraints**:
- Initial response time p95 < 300ms
- Accessibility WCAG 2.1 AA compliance
- Mobile-responsive design (320px-2560px)
**Scale/Scope**:
- ~100 posts initially, scalable to 1000+
- Single authenticated owner
- Public read-only access

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Code Quality First**:
- [x] Complexity expectations documented (functions ≤ 50 lines, cyclomatic ≤ 10)
- [x] Public API contracts defined upfront (REST API routes for CRUD operations)
- [x] Code style enforcement planned (ESLint + Prettier, TypeScript strict mode)

**Test-Driven Development**:
- [x] TDD approach confirmed: tests written FIRST, approved, fail, then implement
- [x] Coverage target ≥ 80% for new code (Vitest coverage reporting)
- [x] Contract tests identified for all external interfaces (API routes, file system operations)
- [x] Integration tests planned for all user workflows (E2E with Playwright)

**User Experience Consistency**:
- [x] Design patterns consistent with existing interfaces (new project, establishing patterns)
- [x] Error messages planned with recovery guidance (form validation, 404 pages, error boundaries)
- [x] Response time expectations defined (operations > 200ms show loading states)
- [x] Accessibility requirements specified (WCAG 2.1 AA - semantic HTML, ARIA labels, keyboard navigation)

**Performance as a Feature**:
- [x] Performance targets defined (p95 < 1.5s page load, p95 < 300ms API response)
- [x] Resource consumption limits specified (image size limits, Markdown size limits)
- [x] Performance regression tests planned (Lighthouse CI in GitHub Actions)
- [x] Performance budgets documented (bundle size < 200KB gzipped for main JS)

**Incremental Delivery**:
- [x] Feature broken into ≤ 3-day increments (Phase 1: Read-only blog, Phase 2: Admin editing, Phase 3: Image management)
- [x] Each increment delivers end-to-end value (visitors can read posts after Phase 1)
- [x] Feature flags or dark launch strategy considered (environment variables for feature toggles)
- [x] Backward compatibility or migration path planned (file-based storage ensures data portability)

## Project Structure

### Documentation (this feature)
```
specs/001-drip-drop-dev/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
│   ├── posts-api.yaml   # OpenAPI spec for posts endpoints
│   ├── about-api.yaml   # OpenAPI spec for about page endpoint
│   └── images-api.yaml  # OpenAPI spec for image upload endpoint
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
backend/
├── src/
│   ├── models/
│   │   ├── Post.ts
│   │   ├── AboutMe.ts
│   │   └── Image.ts
│   ├── services/
│   │   ├── PostService.ts
│   │   ├── AboutMeService.ts
│   │   ├── ImageService.ts
│   │   ├── MarkdownService.ts
│   │   └── AuthService.ts
│   └── api/
│       ├── posts/
│       ├── about/
│       └── images/
└── tests/
    ├── contract/
    │   ├── posts.contract.test.ts
    │   ├── about.contract.test.ts
    │   └── images.contract.test.ts
    ├── integration/
    │   ├── post-lifecycle.test.ts
    │   ├── category-filtering.test.ts
    │   └── image-upload.test.ts
    └── unit/
        ├── PostService.test.ts
        ├── MarkdownService.test.ts
        └── AuthService.test.ts

frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Post list
│   │   ├── about/
│   │   │   └── page.tsx       # About Me page
│   │   ├── posts/
│   │   │   └── [slug]/
│   │   │       └── page.tsx   # Post detail
│   │   └── admin/
│   │       ├── posts/
│   │       │   ├── new/
│   │       │   └── [id]/edit/
│   │       └── about/edit/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── PostCard.tsx
│   │   ├── PostContent.tsx
│   │   ├── CategoryFilter.tsx
│   │   ├── MarkdownEditor.tsx
│   │   └── ImageUploader.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   └── styles/
│       └── globals.css
└── tests/
    ├── e2e/
    │   ├── post-browsing.spec.ts
    │   ├── category-filter.spec.ts
    │   ├── post-creation.spec.ts
    │   └── about-editing.spec.ts
    └── components/
        ├── PostCard.test.tsx
        └── MarkdownEditor.test.tsx

content/
├── posts/
│   ├── 2025-01-15-first-post.md
│   └── ...
├── about/
│   └── me.md
└── images/
    ├── uploads/
    └── placeholders/
        └── default-thumbnail.png
```

**Structure Decision**: Web application structure selected due to requirement for both public read access (frontend) and owner-only editing (backend API routes). Using Next.js App Router to consolidate both concerns in a single project with API routes for backend logic and React components for frontend UI. File-based content storage (content/ directory) for simplicity and portability, avoiding database complexity for this personal blog use case.

## Phase 0: Outline & Research

**Research Tasks Identified**:
1. Next.js 14 App Router best practices for SSR/SSG hybrid applications
2. File-based CMS patterns with Markdown and frontmatter
3. Image optimization strategies with Next.js Image component and sharp library
4. Environment-based authentication patterns for Next.js (no login UI)
5. Tailwind CSS accessibility patterns and WCAG 2.1 AA compliance
6. Markdown rendering libraries (react-markdown vs. MDX)
7. Performance budgeting and Lighthouse CI integration

**Output**: research.md with consolidated findings and decisions

## Phase 1: Design & Contracts

*Prerequisites: research.md complete*

**Artifacts to Generate**:
1. `data-model.md`: Post, AboutMe, Image, Category entities with TypeScript interfaces
2. `contracts/posts-api.yaml`: OpenAPI spec for POST /api/posts, GET /api/posts, GET /api/posts/[id], PUT /api/posts/[id], DELETE /api/posts/[id]
3. `contracts/about-api.yaml`: OpenAPI spec for GET /api/about, PUT /api/about
4. `contracts/images-api.yaml`: OpenAPI spec for POST /api/images/upload
5. Contract tests for each endpoint (must fail initially)
6. `quickstart.md`: User journey validation tests
7. `CLAUDE.md`: Agent context file with project tech stack and recent changes

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, CLAUDE.md

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Contract tests for posts API (5 endpoints) [P]
- Contract tests for about API (2 endpoints) [P]
- Contract tests for images API (1 endpoint) [P]
- Model creation tasks (Post, AboutMe, Image, Category) [P]
- Service layer tasks (PostService, AboutMeService, ImageService, MarkdownService, AuthService)
- API route implementation tasks
- Frontend component tasks (Header, PostCard, PostContent, CategoryFilter, MarkdownEditor, ImageUploader)
- Page implementation tasks (post list, post detail, about, admin pages)
- Integration test tasks for user workflows
- E2E test tasks with Playwright

**Ordering Strategy**:
- TDD order: Tests before implementation
- Dependency order: Models → Services → API routes → Components → Pages
- Infrastructure first: Auth, Markdown rendering, Image handling
- Read-only features before admin features (incremental delivery)
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 35-40 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation with Lighthouse)

## Complexity Tracking
*No constitutional violations identified - all checks passed*

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command) - research.md generated
- [x] Phase 1: Design complete (/plan command) - data-model.md, contracts/, quickstart.md, CLAUDE.md generated
- [x] Phase 2: Task planning complete (/plan command - approach documented)
- [x] Phase 3: Tasks generated (/tasks command) - tasks.md with 70 numbered tasks
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS (no violations)
- [x] Post-Design Constitution Check: PASS (no new violations introduced)
- [x] All NEEDS CLARIFICATION resolved (via research.md)
- [x] Complexity deviations documented (none - all checks passed)

---
*Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`*
