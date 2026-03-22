---
title: 'Static Content Migration to Payload CMS'
slug: 'static-content-migration-payload-cms'
created: '2026-03-22'
status: 'ready-for-dev'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['Next.js 16', 'Payload CMS v3.80+', 'PostgreSQL', '@payloadcms/plugin-form-builder', 'schema-ld / JSON-LD']
files_to_modify:
  - 'website/payload.config.ts'
  - 'website/app/(frontend)/page.tsx'
  - 'website/app/(frontend)/layout.tsx'
  - 'website/app/(frontend)/coaches/page.tsx'
  - 'website/app/(frontend)/legacy/page.tsx'
  - 'website/app/(frontend)/legacy/layout.tsx'
  - 'website/app/(frontend)/philosophy/page.tsx'
  - 'website/app/(frontend)/schedule/page.tsx'
  - 'website/components/Header.tsx'
  - 'website/components/Footer.tsx'
  - 'website/components/JoinModalBody.tsx'
  - 'website/lib/navigation.ts'
  - 'website/scripts/seed-content.ts'
  - 'website/lib/payload.ts'
  - 'website/lib/structured-data.ts'
  - 'website/lib/sync-pages.ts'
  - 'website/components/JoinModalTrigger.tsx'
  - 'website/components/DynamicForm.tsx'
  - 'website/components/CoachBioModal.tsx'
  - 'website/README.md'
  - 'docs/payload-cms-integration-guide.md'
code_patterns:
  - 'Server Components with async data fetching via Payload Local API (getPayload)'
  - 'Client sub-components for interactive elements (modals)'
  - 'JSON-LD structured data injection via script tags in layout/page head'
  - 'Payload collection/global definitions inline in payload.config.ts'
test_patterns: []
---

# Tech-Spec: Static Content Migration to Payload CMS

**Created:** 2026-03-22

## Overview

### Problem Statement

All website content for Gaines Boxing Club is hardcoded directly in TSX files across 5 pages, 4 components, and 1 navigation config. Any text change, image swap, SEO metadata update, or content addition requires a code deployment. No content management layer exists -- the only Payload CMS collections currently scaffolded are the built-in `users` and `media` (both empty).

Additionally, the site has zero structured data (JSON-LD), which severely limits organic search visibility for local business, events, and person-based queries.

### Solution

1. **Model all content** in Payload CMS collections and globals, following the project's existing schema isolation pattern (`gaines_boxing_club__cms`).
2. **Refactor all pages** from client-side rendered (`"use client"`) to server-side rendered (Server Components) that fetch content from Payload at request time, pushing interactive elements (modals) into isolated client sub-components.
3. **Seed all existing hardcoded content** into Payload via the REST API using the MCP API key.
4. **Integrate `@payloadcms/plugin-form-builder`** for CMS-driven form definitions (join modal, future forms).
5. **Implement comprehensive JSON-LD structured data** (Organization, LocalBusiness, WebSite, WebPage, BreadcrumbList, Event, Person) powered by CMS data.
6. **Auto-sync pages from hardcoded nav** so that `pages` collection entries are automatically created from `lib/navigation.ts` routes.

### Scope

**In Scope:**

- Payload collections: `coaches`, `events`, `quotes`, `timeline-milestones`, `philosophy-pillars`, `training-schedule`, `pages`
- Payload globals: `site-settings`
- Payload plugins: `@payloadcms/plugin-form-builder` (creates `forms` + `form-submissions` collections)
- Image migration: upload all 8 static images from `public/images/` to the `media` collection via REST API
- SSR refactor: convert all `"use client"` pages to Server Components; extract modals into client sub-components
- Content seeding: seed all existing hardcoded content into Payload via REST API
- SEO metadata: CMS-editable per-page `seoTitle`, `seoDescription`, `ogImage` via `pages` collection
- JSON-LD structured data: Organization, LocalBusiness (hours, address, phone, geo), WebSite, WebPage, BreadcrumbList, Event, Person
- Auto-sync: utility to create/update `pages` entries from `navLinks` invoked via standalone CLI or seed script (no fragile "app startup" hooks).
- Registry updates in `docs/payload-cms-integration-guide.md`

**Out of Scope:**

- Navigation links (staying hardcoded in `lib/navigation.ts`)
- Visual/design changes (layouts, CSS, animations stay identical)
- Production deployment or Docker config changes
- Auth/user management beyond what Payload ships
- Blog, news, or any net-new content types not currently on the site
- Dynamic page routing (pages remain filesystem-based in Next.js)
- Payload Live Preview (deferred to a future epic to control immediate migration scope)

## Context for Development

### Codebase Patterns

- **Route Groups**: App uses `(frontend)` and `(payload)` route groups. All frontend pages live under `app/(frontend)/`.
- **Layout**: `app/(frontend)/layout.tsx` is the root layout with `<html>`, `<body>`, Header, Footer, and `ModalProvider`. It must remain a Server Component (it already is).
- **ModalProvider**: Wraps pages in a client-side context for modal management. Interactive pages (`page.tsx` files with `"use client"`) use `useModal()`. The migration needs to separate data-fetching (server) from modal triggers (client sub-components).
- **Payload Schema Isolation**: Uses `schemaName: 'gaines_boxing_club__cms'` in `postgresAdapter` (double underscore convention).
- **API Access**: Two data access patterns:
  - **Local API** (`getPayload()`) -- for all Server Component data fetching. Runs in-process, zero HTTP overhead, fully typed. Import `getPayload` from `payload` and `config` from `@payload-config`.
  - **REST API** (`http://localhost:3000/api/`) -- for the seed script (runs outside Next.js process) and client-side form submissions. Uses Bearer token `d47109a7-d749-44af-8e88-8a71e6b1bac8`.
- **Naming**: Tenant ID uses underscores (`gaines_boxing_club`). Collection slugs use kebab-case.
- **Metadata Pattern**: Legacy page uses a separate `layout.tsx` with `Metadata` export (not page-level). Philosophy and Schedule use page-level `metadata`. All will be replaced with dynamic `generateMetadata()` functions powered by the `pages` collection.
- **ModalProvider Constraint**: `ModalProvider.tsx` accepts `React.ReactNode` for `body` and `title` props. This is compatible with the refactored `DynamicForm` component, which will be passed as a client-rendered React element. The ModalProvider itself stays unchanged.
- **No Existing Tests**: The project has zero project-level test files. Integration testing will be manual (visual regression + CMS round-trip verification).
- **TailwindCSS v4**: Uses `@tailwindcss/postcss` v4 with PostCSS. No Tailwind config file -- v4 uses CSS-based configuration.

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `website/payload.config.ts` | Payload configuration -- add collections, globals, plugins here |
| `website/app/(frontend)/layout.tsx` | Root frontend layout -- inject JSON-LD `<script>` tags here |
| `website/app/(frontend)/page.tsx` | Home page -- 4 sections of hardcoded content |
| `website/app/(frontend)/coaches/page.tsx` | Coaches page -- 2 coach profiles with bios/certs in modal data objects |
| `website/app/(frontend)/legacy/page.tsx` | Legacy page -- Sam Gaines bio, stats, 4 timeline entries |
| `website/app/(frontend)/philosophy/page.tsx` | Philosophy page -- statement, 4 pillars array, CTA |
| `website/app/(frontend)/schedule/page.tsx` | Schedule page -- training hours, featured event, 3 fight cards |
| `website/components/Footer.tsx` | Footer -- contact info (address, phone, email), tagline, social icons |
| `website/components/Header.tsx` | Header -- uses `navLinks`, has "Join Club" modal trigger |
| `website/components/JoinModalBody.tsx` | Join form -- to be replaced with dynamic form from form-builder |
| `website/components/ModalProvider.tsx` | Modal context provider -- stays client-side, no content migration needed |
| `website/app/(frontend)/legacy/layout.tsx` | Legacy sub-layout with Metadata export -- will be refactored or removed |
| `website/lib/navigation.ts` | Hardcoded nav links array -- stays hardcoded, used as source for pages auto-sync |
| `website/public/images/` | 8 static images to upload to Payload media collection |
| `docs/payload-cms-integration-guide.md` | Living doc -- update registries on every collection/global added |

### Technical Decisions

1. **Route as page key**: The `pages` collection uses the filesystem route (e.g., `/`, `/legacy`) as the primary lookup key. No GUID needed -- routes are filesystem-determined and stable. A `syncPages` utility reads `navLinks` and upserts page documents by route.

2. **Local API for server-side, REST for external**: Server Components use Payload's Local API (`getPayload()`) for data fetching -- it's in-process, zero-latency, and fully typed. The REST API is used only by the seed script (which runs as a standalone process via `tsx`) and by client-side form submissions (`DynamicForm` POSTing to `/api/form-submissions`).

3. **Form builder plugin for forms**: Using `@payloadcms/plugin-form-builder` instead of rolling a custom forms collection. It provides `forms` and `form-submissions` collections out of the box. **Crucially, the plugin will be configured to allow public `read` access for `forms` and public `create` access for `form-submissions`**, so the client-side UI can fetch schemas and submit data without exposing the master MCP API key.

4. **Structured data from CMS data**: JSON-LD schemas are assembled server-side from the same Payload data used to render pages. `site-settings` global feeds Organization/LocalBusiness/WebSite schemas. `pages` feeds WebPage schema. `coaches` feeds Person schema. `events` feeds Event schema. All injected as `<script type="application/ld+json">` in the layout or per-page.

5. **Dynamic `generateMetadata()` replaces static `metadata` exports**: Each page/layout that currently exports a static `metadata` object will be refactored to export a `generateMetadata()` async function that queries the `pages` collection via Local API. This includes the Legacy page's `layout.tsx` metadata export.

6. **SSR with client islands & Cache Invalidation**: Pages become async Server Components. Because the Payload Local API bypasses the Next.js network cache, cache invalidation is necessary. All collections/globals will include an `afterChange` hook that calls Next.js `revalidateTag` (e.g., `revalidateTag('payload-coaches')`) to granularly purge specific cached data without invalidating the entire website. Interactive elements are extracted into `"use client"` sub-components that receive data as props.

7. **Content seeding via REST API**: All existing hardcoded content is seeded into Payload using a TypeScript seed script (`scripts/seed-content.ts`) run via `npx tsx`, using the documented API key.

## Implementation Plan

### Story 1: Payload Collection & Global Definitions

**Goal**: Define all Payload collections, globals, and plugins in `payload.config.ts`.

#### Tasks

1. **Install Dependencies & Override Built-in Media**
   - File: `website/package.json`
   - Action: `npm install @payloadcms/plugin-form-builder @payloadcms/richtext-lexical`
   - Action: `npm install -D tsx` (for reliable seed script execution)
   - **UX & SEO**: In `payload.config.ts`, scaffold/override the built-in `media` collection to explicitly require an `alt` text field. This prevents editors from skipping accessibility standards and ensures valid Image structured data.

2. **Define `coaches` collection**
   - File: `website/payload.config.ts`
   - Fields:
     - `name` (text, required)
     - `role` (text, required) -- e.g., "Head Coach", "Legacy Coach"
     - `title` (text) -- e.g., "Master Elite", "Legacy Coach" (display rank)
     - `subtitle` (text) -- e.g., "Head Coach | Physical Prowess & Skill Development"
     - `shortBio` (textarea, required) -- card-level summary
     - `fullBio` (richText) -- expanded biography for modal
     - `certifications` (array of `{ label: text }`)
     - `image` (upload, relationTo: 'media')
     - `sortOrder` (number, defaultValue: 0)

3. **Define `events` collection**
   - File: `website/payload.config.ts`
   - Fields:
     - `title` (text, required)
     - `tag` (select: 'main-event', 'local-spar', 'workshop', 'exhibition')
     - `date` (date, required)
     - `location` (text)
     - `description` (textarea)
     - `image` (upload, relationTo: 'media')
     - `ctaText` (text, defaultValue: 'Details')
     - `isFeatured` (checkbox, defaultValue: false) -- drives the featured event banner

4. **Define `quotes` collection**
   - File: `website/payload.config.ts`
   - Fields:
     - `text` (textarea, required)
     - `attribution` (text, required) -- e.g., "Sam Gaines"
     - `sortOrder` (number, defaultValue: 0)

5. **Define `timeline-milestones` collection**
   - File: `website/payload.config.ts`
   - Fields:
     - `year` (text, required) -- e.g., "1974", "Today"
     - `title` (text, required)
     - `description` (textarea, required)
     - `icon` (text) -- Material Symbols icon name (e.g., 'home', 'workspace_premium')
     - `sortOrder` (number, defaultValue: 0)

6. **Define `philosophy-pillars` collection**
   - File: `website/payload.config.ts`
   - Fields:
     - `icon` (text, required) -- Material Symbols icon name
     - `title` (text, required)
     - `description` (textarea, required)
     - `sortOrder` (number, defaultValue: 0)

7. **Define `training-schedule` collection**
   - File: `website/payload.config.ts`
   - Fields:
     - `day` (text, required) -- e.g., "Mondays", "Thursdays"
     - `startTime` (text, required) -- e.g., "5PM"
     - `endTime` (text, required) -- e.g., "8PM"
     - `description` (text) -- optional label
     - `sortOrder` (number, defaultValue: 0)

8. **Define `pages` collection**
   - File: `website/payload.config.ts`
   - Fields:
     - `route` (text, required, unique) -- e.g., `/`, `/legacy`
     - `label` (text, required) -- human-readable page name, e.g., "Home", "Legacy". **UX**: Set `admin: { readOnly: true, description: 'Auto-synced from navigation config' }` to prevent editors from overwriting synced labels.
     - `seoTitle` (text) -- override for `<title>` tag
     - `seoDescription` (textarea) -- meta description
     - `ogImage` (upload, relationTo: 'media')
     - `heroHeading` (text) -- main hero H1 text
     - `heroSubheading` (text) -- hero paragraph text
     - `heroTagline` (text) -- small tagline above heading (e.g., "Est. 1994")
     - `heroCta` (array of `{ label: text, linkType: select('internal', 'external'), internalLink: relationTo('pages'), externalUrl: text, style: select('primary', 'secondary') }`). **UX**: Add `admin: { description: 'Primary = solid black button, Secondary = outlined transparent button' }` to the style field so editors know which to choose.

9. **Define `site-settings` global**
   - File: `website/payload.config.ts`
   - **UX**: Set `admin: { group: 'Settings' }` to logically separate it from content collections in the sidebar.
   - Fields:
     - `siteName` (text, defaultValue: 'Gaines Boxing Club')
     - `tagline` (textarea) -- footer tagline quote
     - `address` (text)
     - `phone` (text)
     - `email` (text)
     - `socialLinks` (array of `{ platform: text, url: text, iconName: text }`)
     - **Structured Data Fields (group: 'structuredData')**:
       - `organizationName` (text)
       - `organizationLogo` (upload, relationTo: 'media')
       - `foundingDate` (text) -- e.g., "1974"
       - `founderName` (text)
       - `streetAddress` (text)
       - `addressLocality` (text) -- city
       - `addressRegion` (text) -- state
       - `postalCode` (text)
       - `country` (text, defaultValue: 'US')
       - `latitude` (number) -- for GeoCoordinates
       - `longitude` (number) -- for GeoCoordinates
       - `businessHours` (array of `{ dayOfWeek: text, opens: text, closes: text }`) -- for OpeningHoursSpecification
       - `priceRange` (text) -- e.g., "$$"

10. **Configure CMS Branding (Agency Polish)**
    - File: `website/payload.config.ts`
    - Action: Override `admin.components.graphics.Logo` and `admin.components.graphics.Icon` with custom React components rendering the Gaines Boxing Club logo/branding. This eliminates the "vanilla Payload" look and delivers a premium agency experience to the client.

11. **Register `formBuilderPlugin`**
    - File: `website/payload.config.ts`
    - Action: Import `formBuilderPlugin` from `@payloadcms/plugin-form-builder` and add to plugins array.
    - Configuration: Enable text, textarea, select, email, checkbox, number, message fields.
    - **Security**: Override `formOverrides` to set `access: { read: () => true }`. Override `formSubmissionOverrides` to set `access: { create: () => true }`. Implement a honeypot field or explicitly require the reCAPTCHA plugin integration to prevent bot spam on the public `create` endpoint.
    - **Email**: Disable default email routing to prevent local dev crashes by leaving `formSubmissionOverrides` without email hooks or mocking the transport. **Production Note**: Leave a code comment indicating that a robust Email Transport (e.g., Resend via SMTP) must be enabled in the final production deployment for staff to receive form notifications.

12. **Update MCP plugin config**
    - File: `website/payload.config.ts`
    - Action: Update `mcpPlugin` collections/globals to reference all new collections and globals.

13. **Implement Cache Invalidation Hooks**
    - File: `website/payload.config.ts`
    - Action: Add a specific `afterChange` hook to every collection and global defined above.
    - Logic: The hook should call `revalidateTag(\`payload-${collectionSlug}\`)` from `next/cache` (e.g., `payload-coaches`, `payload-pages`). 
    - **Next.js 16 Mechanics**: Since Next 15+, fetch caching defaults have changed. When using Payload Local API (`getPayload`), explicitly wrap the local queries in React's `cache()` and explicit `unstable_cache` tags, or rely on explicit route segment cache configs (`export const revalidate = ...`) to ensure `revalidateTag` actually has cached data to purge. Document the observed caching behavior for Next 16 in the README.

#### Acceptance Criteria

- **Given** the dev server starts, **When** I navigate to `/admin`, **Then** I see all new collections (coaches, events, quotes, timeline-milestones, philosophy-pillars, training-schedule, pages, forms, form-submissions) and the site-settings global in the admin sidebar.
- **Given** I open any collection, **When** I create a new document, **Then** all fields defined above are present and functional.
- **Given** the form-builder plugin is registered, **When** I create a new form in the admin, **Then** I can add text, textarea, select, email, checkbox, number, and message fields.

---

### Story 2: Content Seeding via REST API

**Goal**: Seed all existing hardcoded content into Payload collections/globals and upload all images to the media collection.

#### Tasks

1. **Create seed script** (`website/scripts/seed-content.ts`)
   - Uses `fs.readFileSync` and native `FormData` (or `formdata-node`) to construct valid multipart boundaries for image uploads to `POST /api/media`.
   - **Media Idempotency**: Before uploading an image, query `GET /api/media?where[filename][equals]=<filename>`. If it exists, use the existing ID; if not, upload it. Do *not* blindly clear the `media` collection, as that destroys client-uploaded assets.
   - Clears existing target collections first (e.g., `DELETE /api/quotes`, `DELETE /api/philosophy-pillars`) to guarantee idempotency without relying on non-existent unique keys.
   - Seeds 2 coaches, 3 quotes, 4 timeline milestones, 4 philosophy pillars, 2 training schedules, 1 featured event, 3 fight card events, and 1 "Join the Club" form to their respective REST endpoints.
   - Updates `site-settings` global via `POST /api/globals/site-settings`.
   - **Note**: Does *not* manually seed entries for `pages`. Page entries are generated purely by invoking `syncPages()` (Story 4).

2. **Add seed script to package.json**
   - Action: Add `"seed": "npx tsx --env-file=.env scripts/seed-content.ts"` to scripts. **Note**: Standalone Node scripts via `tsx` do not auto-load Next.js env files; the `--env-file` flag is strictly required to connect to Postgres.

#### Acceptance Criteria

- **Given** I run `npm run seed`, **When** it completes, **Then** all collections contain the correct number of documents with accurate content matching the current hardcoded values.
- **Given** I run `npm run seed` a second time, **When** it completes, **Then** no duplicate documents are created.
- **Given** I check the media collection in `/admin`, **When** I browse it, **Then** all 8 images are uploaded with correct alt text.

---

### Story 3: SSR Refactor & Payload Data Fetching

**Goal**: Convert all pages to Server Components that fetch content from Payload, extracting interactive elements into client sub-components.

#### Tasks

1. **Create Payload data fetching utility** (`website/lib/payload.ts`)
   - Export typed helper functions using Payload's Local API (`getPayload()` + `payload.find()` / `payload.findGlobal()`):
     - `getPage(route: string)` -- fetch from `pages` collection by route
     - `getCoaches()` -- fetch all coaches, sorted by sortOrder
     - `getEvents()` -- fetch all events, with featured event identified
     - `getQuotes()` -- fetch all quotes
     - `getTimeline()` -- fetch timeline milestones, sorted by sortOrder
     - `getPhilosophyPillars()` -- fetch pillars, sorted by sortOrder
     - `getTrainingSchedule()` -- fetch schedule entries, sorted by sortOrder
     - `getSiteSettings()` -- fetch site-settings global via `payload.findGlobal({ slug: 'site-settings' })`
     - `getForm(slug: string)` -- fetch form definition by slug (used client-side via REST, not here)
   - **Typing**: Run `npx payload generate:types` after Story 1 to generate the `payload-types.ts` file. All helper functions must use these explicit interfaces (e.g., `payload.find({ collection: 'events' })` mapped to the `Event` type) to ensure end-to-end type safety.
   - All functions use Payload Local API (`getPayload({ config })` from `payload` + `@payload-config`) -- no HTTP, no API key, fully typed
   - Each function handles its own `depth` parameter for relationship fields (e.g., `depth: 1` to populate media references). **Optimization**: When fetching pages, explicitly use `select: { route: true }` (or similar projection) for `internalLink` relations to prevent an infinite-depth query trap that pulls the entire site graph into memory.

2. **Create client sub-components for modals**
   - `website/components/JoinModalTrigger.tsx` (`"use client"`) -- button that opens the join modal, accepts the pre-fetched form schema data as a prop (fetched by its parent Server Component) to eliminate client-side layout shift and loading spinners
   - `website/components/DynamicForm.tsx` (`"use client"`) -- renders form fields dynamically from Payload form-builder data, submits to `/api/form-submissions`
   - `website/components/CoachBioModal.tsx` (`"use client"`) -- opens a modal with coach bio data passed as serializable props. The `fullBio` (Lexical JSON) will be rendered using `@payloadcms/richtext-lexical/react` (specifically `RichText` component). **Styling:** The output must be wrapped in a container with a custom class (e.g., `className="prose prose-invert"`) or use a custom Lexical component map to ensure Next.js/Tailwind v4 base styles apply correctly to the raw HTML output.
   - Keep `ModalProvider.tsx` as-is (already `"use client"`)

3. **Refactor Home page** (`website/app/(frontend)/page.tsx`)
   - Remove `"use client"` directive
   - Make `HomePage` an async Server Component
   - Fetch: page SEO/hero, coaches (for preview), quotes (for legacy section), philosophy pillars (for teaser). Include strict 404 handling (`if (!page) notFound()`).
   - Pass data as props to client sub-components for modal triggers
   - Generate `Metadata` export from `pages` collection data. **Safety**: Ensure `generateMetadata` gracefully returns a default empty metadata object `{}` if `find` returns `undefined/null` (e.g. on 404 pages) to prevent Server Component crashes.

4. **Refactor Coaches page** (`website/app/(frontend)/coaches/page.tsx`)
   - Remove `"use client"` directive
   - Fetch coaches and page data server-side
   - Extract coach bio modal triggers into `CoachBioModal` client component
   - Remove hardcoded `BIOS` object

5. **Refactor Legacy page** (`website/app/(frontend)/legacy/page.tsx`)
   - Remove `"use client"` directive
   - Fetch page data, timeline milestones, and Sam Gaines founder data server-side
   - Extract modal triggers into client sub-components

6. **Refactor Philosophy page** (`website/app/(frontend)/philosophy/page.tsx`)
   - Already a Server Component (no `"use client"`)
   - Replace hardcoded pillars array with fetched data
   - Replace hardcoded `metadata` export with dynamic SEO from `pages` collection

7. **Refactor Schedule page** (`website/app/(frontend)/schedule/page.tsx`)
   - Already a Server Component
   - Fetch training schedule, events, and page data from Payload
   - Replace hardcoded schedule/events with fetched data
   - Replace hardcoded `metadata` export with dynamic SEO

8. **Refactor Footer** (`website/components/Footer.tsx`)
   - Fetch `site-settings` global for contact info, tagline, social links
   - Footer stays a Server Component (already is)
   - Replace hardcoded address, phone, email, tagline

9. **Refactor Header modal** (`website/components/Header.tsx`)
   - Header stays `"use client"` (uses `useState` for mobile menu)
   - Replace `JoinModalBody` with `DynamicForm` powered by form-builder
   - Pass pre-fetched form data from the layout down to the header, removing client-side fetch logic

10. **Refactor Image Assets sitewide**
    - File: all pages across `app/(frontend)`
    - Action: Replace all hardcoded `<Image src="/images/..." />` patterns.
    - Logic: Map the fetched Payload media objects (e.g., `doc.image.url` and `doc.image.alt`) into Next.js `<Image>` components to prevent 404s when the static `public/images` folder is deprecated.

10. **Update frontend layout SEO defaults & Fallbacks**
    - File: `website/app/(frontend)/layout.tsx` and `website/app/(frontend)/error.tsx`
    - Fetch `site-settings` global for default `Metadata` values (site name in title template)
    - **Resilience**: Implement a Next.js `error.tsx` boundary. If the PostgreSQL container stops responding, `getPayload()` SSR fetches will crash. This boundary prevents the entire application from going down without a fallback.

#### Acceptance Criteria

- **Given** all pages are refactored, **When** I view source on any page, **Then** all content text is present in the initial HTML response (SSR verified).
- **Given** I navigate to each page, **When** I compare visually to the current site, **Then** the layout, styling, and content are identical.
- **Given** I click "View Full Bio" on the coaches page, **When** the modal opens, **Then** it displays the coach's full biography and certifications from CMS data.
- **Given** I click "Join Club" anywhere on the site, **When** the modal opens, **Then** it renders form fields dynamically from the Payload `forms` collection.
- **Given** I update a coach's bio in `/admin`, **When** I refresh the coaches page, **Then** the updated bio appears.
- **Given** I update SEO metadata for `/philosophy` in the `pages` collection, **When** I view page source, **Then** the `<title>` and `<meta name="description">` reflect the updated values.

---

### Story 4: Pages Auto-Sync from Navigation

**Goal**: Automatically create/update `pages` collection entries from the hardcoded `navLinks` array so page options are always in sync.

#### Tasks

1. **Create `syncPages` utility** (`website/lib/sync-pages.ts`)
   - Reads `navLinks` from `lib/navigation.ts`
   - For each nav link, queries `GET /api/pages?where[route][equals]=<route>`
   - If no document exists, creates one with `route`, `label` (from nav label), and default `seoTitle` = `"{label} | Gaines Boxing Club"`
   - If document exists, only updates `label` if it has changed (never overwrites user-edited SEO fields)
   - Uses the route as the stable key (no GUID needed -- routes are filesystem-determined)

2. **Integrate into seed script**
   - Call `syncPages()` as the first step of the seed script
   - Also callable standalone: `npx tsx lib/sync-pages.ts`

3. **Add Pages Auto-Sync section to README** (`website/README.md`)
   - Document what the sync does (mirrors `navLinks` to `pages` collection)
   - Document how to run: `npm run seed` (includes sync) or `npx tsx lib/sync-pages.ts` (standalone)
   - Document behavior: creates new pages, updates labels, never overwrites user-edited SEO fields
   - Document when to run: after adding/renaming routes in `lib/navigation.ts`

#### Acceptance Criteria

- **Given** I add a new entry to `navLinks` and run the sync, **When** I check the `pages` collection, **Then** a new page document exists for the new route.
- **Given** a page document already has user-edited SEO fields, **When** I run sync again, **Then** the SEO fields are NOT overwritten.
- **Given** I rename a nav label, **When** I run sync, **Then** the `label` field updates but `seoTitle`/`seoDescription` are preserved.

---

### Story 5: Comprehensive JSON-LD Structured Data

**Goal**: Inject comprehensive JSON-LD structured data on every page using CMS data, targeting maximum organic SEO visibility.

#### Tasks

1. **Create structured data generators** (`website/lib/structured-data.ts`)
   - **Environment**: Read `process.env.NEXT_PUBLIC_SITE_URL` (defaulting to `http://localhost:3000` locally) to ensure all generated `url` and `sameAs` fields are strictly absolute URLs to satisfy JSON-LD parsers.
   - `generateOrganizationSchema(siteSettings)` -- returns Organization + LocalBusiness JSON-LD with:
     - `@type: ["Organization", "LocalBusiness", "SportsActivityLocation"]`
     - name, logo, description, foundingDate, founder (Person)
     - address (PostalAddress), geo (GeoCoordinates), telephone, email
     - url, sameAs (social links)
     - openingHoursSpecification (from businessHours)
     - priceRange
   - `generateWebSiteSchema(siteSettings)` -- returns WebSite JSON-LD with name, url, potentialAction (SearchAction)
   - `generateWebPageSchema(pageData, siteSettings)` -- returns WebPage JSON-LD with name, description, url, isPartOf (WebSite), breadcrumb
   - `generateBreadcrumbSchema(route, label)` -- returns BreadcrumbList JSON-LD
   - `generateEventSchema(event)` -- returns Event JSON-LD with name, description, startDate, location (Place), organizer, image
   - `generatePersonSchema(coach)` -- returns Person JSON-LD with name, jobTitle, description, image, worksFor

2. **Inject global structured data in layout** (`website/app/(frontend)/layout.tsx`)
   - Fetch `site-settings` global
   - Inject Organization + LocalBusiness + WebSite schemas as `<script type="application/ld+json">` in `<head>`

3. **Inject per-page structured data**
   - Each page injects its own WebPage + BreadcrumbList schema
   - Coaches page additionally injects Person schema for each coach
   - Schedule page additionally injects Event schema for each event
   - Home page aggregates key schemas (Organization + featured event + coaches)

4. **Validate structured data**
   - Test all pages with Google's Rich Results Test
   - Test with Schema.org validator
   - Verify no errors or warnings in structured data

#### Acceptance Criteria

- **Given** I view source on any page, **When** I search for `application/ld+json`, **Then** I find valid Organization, LocalBusiness, WebSite, WebPage, and BreadcrumbList schemas.
- **Given** I view the schedule page source, **When** I examine the structured data, **Then** I find Event schemas for each event with correct dates, locations, and descriptions.
- **Given** I view the coaches page source, **When** I examine the structured data, **Then** I find Person schemas for each coach with name, jobTitle, and image.
- **Given** I copy the raw HTML source of any local page into Google's Rich Results Test (code snippet mode), **When** it analyzes the markup, **Then** it reports no errors and identifies the structured data types.
- **Given** I update business hours or address in `site-settings`, **When** I refresh any page, **Then** the LocalBusiness structured data reflects the updated values.

---

### Story 6: Documentation & Registry Updates

**Goal**: Update the Payload CMS integration guide with all new collections, globals, and plugins.

#### Tasks

1. **Update Reusable Collections Registry** in `docs/payload-cms-integration-guide.md`
   - Move `pages`, `quotes`, `forms` (via plugin), `form-submissions` (via plugin) to reusable registry as implemented
   - Move `hero` candidate to implemented (embedded in `pages` as hero fields)
   - Add `site-settings` global as implemented reusable global

2. **Update Project-Specific Collections Registry**
   - Add `coaches`, `events`, `timeline-milestones`, `philosophy-pillars`, `training-schedule` as implemented project-specific

3. **Add Reusable Structured Data Schemas Registry** to `docs/payload-cms-integration-guide.md`
   - New section under "Reusable vs. Project-Specific Collections" documenting which JSON-LD schema types are reusable across projects vs project-specific
   - **Reusable schemas** (domain-agnostic, applicable to any marketing/content site):
     - `Organization` -- powered by `site-settings` global
     - `LocalBusiness` -- powered by `site-settings` (address, hours, geo, contact)
     - `WebSite` -- powered by `site-settings`
     - `WebPage` -- powered by `pages` collection (per-page SEO)
     - `BreadcrumbList` -- powered by `pages` route + label
     - `PostalAddress` -- embedded in `LocalBusiness`, from `site-settings`
     - `GeoCoordinates` -- embedded in `LocalBusiness`, from `site-settings`
     - `OpeningHoursSpecification` -- embedded in `LocalBusiness`, from `site-settings.businessHours`
   - **Project-specific schemas** (domain-dependent, unique to this project's content model):
     - `Event` -- powered by `events` collection (boxing matches, workshops)
     - `Person` -- powered by `coaches` collection (trainer profiles)
     - `SportsActivityLocation` -- combined with `LocalBusiness` for boxing gym context

4. **Add Change Log entry**
   - Date: 2026-03-22
   - Description: Migrated all static content to Payload CMS. Added collections: coaches, events, quotes, timeline-milestones, philosophy-pillars, training-schedule, pages. Added site-settings global with structured data fields. Integrated @payloadcms/plugin-form-builder. Implemented comprehensive JSON-LD structured data. Refactored all pages to SSR. Added Structured Data Schemas Registry.

5. **Add Testing section to README** (`website/README.md`)
   - Document manual verification procedures in a dedicated "Testing" section:
     - **Visual Regression**: compare each page before/after migration for identical content and layout; test modals for coaches and join flows; verify mobile hamburger menu
     - **SSR Source Verification**: `curl http://localhost:3000/` (and all 5 routes) and confirm content text appears in raw HTML
     - **CMS Round-Trip**: edit a coach bio in `/admin` and verify change on frontend; edit SEO title for a page and verify `<title>` updates; edit business hours and verify structured data updates; add a form field and verify it renders; submit the join form and verify submission appears
     - **Structured Data Validation**: copy the raw HTML source of local pages and paste it as a code snippet into the Schema.org Validator and Google Rich Results Test to bypass localhost network limitations; verify all schemas pass without errors

#### Acceptance Criteria

- **Given** I open the integration guide, **When** I review the registries, **Then** all new collections and globals are listed with accurate descriptions.

## Additional Context

### Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@payloadcms/plugin-form-builder` | ^3.80.0 | CMS-driven form definitions and submissions |
| `payload` | ^3.80.0 | Already installed |
| `@payloadcms/db-postgres` | ^3.80.0 | Already installed |

No other new dependencies required. JSON-LD generation is pure TypeScript -- no schema.org library needed.

### Testing Strategy

**Automated Verification (Seed Script):**
- Run `npm run seed` and confirm exit code 0
- Run `npm run seed` twice to verify idempotency

**Visual Regression (Manual):**
- Compare each page visually before and after migration -- content and layout must be identical
- Test modal functionality on coaches and join flows
- Test mobile hamburger menu still works (Header stays `"use client"`)

**SSR Verification:**
- `curl http://localhost:3000/` and verify content text appears in raw HTML
- Repeat for all 5 routes

**Structured Data Validation:**
- Paste each page URL into [Google Rich Results Test](https://search.google.com/test/rich-results)
- Paste into [Schema.org Validator](https://validator.schema.org/)
- Verify: Organization, LocalBusiness, WebSite, WebPage, BreadcrumbList, Event, Person all pass without errors

**CMS Round-Trip:**
- Edit a coach bio in `/admin` -> verify change appears on the coaches page. **Note**: Perform a hard refresh (Cmd+Shift+R) to bypass Next.js Client Router Cache, otherwise you may see stale data despite `revalidateTag` working server-side.
- Edit SEO title for `/philosophy` in `pages` collection -> verify `<title>` tag updates
- Edit business hours in `site-settings` -> verify LocalBusiness JSON-LD updates
- Create a new form field in the "Join the Club" form -> verify it renders in the join modal
- Submit the join form -> verify submission appears in `form-submissions` collection

### Notes

- The `navLinks` array in `lib/navigation.ts` remains the single source of truth for routing. The `pages` collection mirrors it for CMS-editable metadata but does not drive routing.
- All content seeding uses the REST API with the documented MCP API key from `gemini.md`.
- The form-builder plugin automatically creates `forms` and `form-submissions` collections with full admin UI -- no custom collection definitions needed for those.
- Structured data fields in `site-settings` are grouped under a `structuredData` field group for clean admin organization.
- Pages that are currently Server Components (`philosophy`, `schedule`) only need content replacement, not a full SSR refactor.
