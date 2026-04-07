# Payload CMS Integration Guide

> Integrating Payload CMS v3 into existing Next.js projects with schema-isolated, shared PostgreSQL databases.

This guide documents the process of adding Payload CMS (v3.80+) to an existing Next.js site and configuring it to use a **dedicated PostgreSQL schema** within a shared database. The schema isolation pattern enables multiple projects to coexist in a single database instance (e.g., a Coolify-managed `master_agency_db`) without table collisions.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Schema and Role Naming Conventions](#schema-and-role-naming-conventions)
- [Prerequisites](#prerequisites)
- [Step 1: Install Payload Dependencies](#step-1-install-payload-dependencies)
- [Step 2: Configure payload.config.ts](#step-2-configure-payloadconfigts)
- [Step 3: Wire Next.js (withPayload)](#step-3-wire-nextjs-withpayload)
- [Step 4: Create Payload Route Handlers](#step-4-create-payload-route-handlers)
- [Step 5: Environment Variables](#step-5-environment-variables)
- [Step 6: Create the PostgreSQL Schema](#step-6-create-the-postgresql-schema)
- [Step 7: Docker Compose Configuration](#step-7-docker-compose-configuration)
- [Step 8: First Run and Verification](#step-8-first-run-and-verification)
- [Step 9: Cloud Storage (S3 / Cloudflare R2)](#step-9-cloud-storage-s3--cloudflare-r2)
- [Reusable vs. Project-Specific Collections](#reusable-vs-project-specific-collections)
- [Troubleshooting](#troubleshooting)
- [Change Log](#change-log)

---

## Architecture Overview

```
                     +----------------------------+
                     |     Shared PostgreSQL       |
                     |     (master_agency_db)      |
                     |                             |
                     |  +------------------------+ |
                     |  | gaines-boxing-club__cms | |  <-- This project
                     |  +------------------------+ |
                     |  | dr-whisper__cms         | |  <-- Other project
                     |  +------------------------+ |
                     |  | ate1six__cms            | |  <-- Other project
                     |  +------------------------+ |
                     +----------------------------+
                               |
                          PgBouncer :6432
                               |
              +----------------+----------------+
              |                |                |
     +--------+------+  +-----+-------+  +-----+-------+
     | gaines-boxing  |  | dr-whisper  |  |  ate1six    |
     | Next.js + CMS  |  | Next.js     |  |  Next.js    |
     +----------------+  +-------------+  +-------------+
```

Each project connects to the same PostgreSQL database but writes its Payload tables into a project-specific schema. This avoids table name collisions (e.g., multiple `users`, `media`, `payload_migrations` tables) and simplifies backup/restore operations per tenant.

---

## Schema and Role Naming Conventions

This section describes the full naming system used for PostgreSQL schemas, roles, and database users across all projects sharing `master_agency_db`. The conventions below apply exclusively to multi-tenant isolation within this shared database.

### Payload CMS Schemas

Each Payload CMS project gets a dedicated PostgreSQL schema using the pattern `[tenantId]__cms`. The double underscore (`__`) separates the tenant identifier from the service suffix.

> Note: Tenant ID slugs use underscores (`_`) throughout -- in both schema names and database users. Hyphens are avoided because they require quoting in SQL identifiers and are not valid in PostgreSQL usernames.

| Project             | Schema Name                  |
|---------------------|------------------------------|
| Gaines Boxing Club  | `gaines_boxing_club__cms`    |
| Dr. Whisper         | `dr_whisper__cms`            |
| Ate1Six             | `ate1six__cms`               |

### Payload CMS Database Users

Each CMS schema has a dedicated PostgreSQL user scoped to that schema. This is the user specified in the `DATABASE_URI` for that project.

**Format:** `[tenantId]_cms_user`

| Project             | Schema Name                  | Database User                    |
|---------------------|------------------------------|----------------------------------|
| Gaines Boxing Club  | `gaines_boxing_club__cms`    | `gaines_boxing_club_cms_user`    |
| Dr. Whisper         | `dr_whisper__cms`            | `dr_whisper_cms_user`            |
| Ate1Six             | `ate1six__cms`               | `ate1six_cms_user`               |

### Broader Role-Based Access Convention

The schema and user naming patterns are not limited to Payload CMS. Any tool or service that needs isolated access to the shared database follows the same structure:

| Item          | Pattern                     | Example                             |
|---------------|-----------------------------|-------------------------------------|
| Schema (role) | `[tenantId]__[role]`        | `gaines_boxing_club__vectors`       |
| Database user | `[tenantId]_[role]_user`    | `gaines_boxing_club_vectors_user`   |

This enables each project to have multiple schemas for different services (e.g., `__cms` for Payload, `__vectors` for pgvector, `__analytics` for a metrics service) while keeping each service scoped to a purpose-built user with minimal privilege.

---

## Prerequisites

- Node.js 20+
- An existing Next.js project (v15+ recommended, v16 supported)
- PostgreSQL 15+ accessible via connection string (direct or PgBouncer)
- A database user with `CREATE` privileges on the target database (to create schemas)
- Docker and Docker Compose (for containerized deployments)

---

## Step 1: Install Payload Dependencies

From your Next.js project root:

```bash
pnpm add payload @payloadcms/next @payloadcms/db-postgres @payloadcms/richtext-lexical sharp graphql
```

Optional but recommended:

```bash
pnpm add @payloadcms/plugin-mcp   # MCP plugin for AI agent access to CMS data
```

### Versions Used (Reference)

| Package                       | Version  |
|-------------------------------|----------|
| `payload`                     | ^3.80.0  |
| `@payloadcms/next`            | ^3.80.0  |
| `@payloadcms/db-postgres`     | ^3.80.0  |
| `@payloadcms/richtext-lexical` | ^3.80.0 |
| `@payloadcms/plugin-mcp`      | ^3.80.0  |
| `next`                        | 16.1.6   |
| `react` / `react-dom`         | 19.2.3   |
| `sharp`                       | ^0.34.5  |

---

## Step 2: Configure payload.config.ts

Create `payload.config.ts` in your project root (next to `package.json`):

```typescript
import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET
if (!PAYLOAD_SECRET) {
  throw new Error('Missing required environment variable: PAYLOAD_SECRET')
}

const DATABASE_URI = process.env.DATABASE_URI
if (!DATABASE_URI) {
  throw new Error('Missing required environment variable: DATABASE_URI')
}

export default buildConfig({
  secret: PAYLOAD_SECRET,

  db: postgresAdapter({
    pool: {
      connectionString: DATABASE_URI,
    },
    // --- CRITICAL: Schema Isolation ---
    // Isolates all Payload tables into a dedicated PostgreSQL schema.
    // Convention: [tenantId]__cms
    // Replace with your project's tenant identifier.
    schemaName: 'your-project__cms',
  }),

  editor: lexicalEditor(),
  sharp,

  collections: [
    {
      slug: 'users',
      auth: true,
      admin: {
        useAsTitle: 'email',
      },
      fields: [],
    },
    {
      slug: 'media',
      upload: true,
      fields: [
        {
          name: 'alt',
          type: 'text',
        },
      ],
    },
  ],

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
```

### Key Configuration Notes

| Option       | Value                   | Purpose                                                              |
|--------------|-------------------------|----------------------------------------------------------------------|
| `schemaName` | `'your-project__cms'`   | Isolates tables into a dedicated PostgreSQL schema                   |
| `push`       | `true` (default in dev) | Auto-syncs schema changes in development; set `false` in production  |
| `pool`       | `{ connectionString }`  | Passed directly to `node-postgres`                                   |

> **Warning**: Do not mix `push: true` and migrations on the same database. Use `push` for local dev and migrations for production. See [Payload Migrations Docs](https://payloadcms.com/docs/database/migrations).

---

## Step 3: Wire Next.js (withPayload)

Update `next.config.ts` to wrap your config with `withPayload`:

```typescript
import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  output: "standalone",  // Required for Docker deployments
};

export default withPayload(nextConfig);
```

---

## Step 4: Create Payload Route Handlers

Payload requires specific Next.js route handlers. Create the following directory structure under `app/`:

```
app/
  (payload)/
    admin/
      [[...segments]]/
        page.tsx          # Auto-generated by Payload
      importMap.js        # Auto-generated by Payload
    api/
      [...slug]/
        route.ts          # REST API catch-all
      graphql/
        route.ts          # GraphQL endpoint (if using graphql)
    custom.scss           # Optional admin panel customization
    layout.tsx            # Payload admin layout
```

### `app/(payload)/layout.tsx`

```typescript
/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import type { ServerFunctionClient } from 'payload'
import configPromise from '@payload-config'
import '@payloadcms/next/css'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import React from 'react'
import { importMap } from './admin/importMap'
import './custom.scss'

type Args = {
  children: React.ReactNode
}

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    configPromise,
    importMap,
  })
}

const Layout = ({ children }: Args) => (
  <RootLayout config={configPromise} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
)

export default Layout
```

> Note: Most of the files in `app/(payload)/` are auto-generated by Payload on first build. You typically scaffold this by running `pnpm create payload-app` and copying the generated route structure, or by following the [Payload installation docs](https://payloadcms.com/docs/getting-started/installation).

---

## Step 5: Environment Variables

### `.env.compose.example` (Docker Compose)

```bash
# Payload CMS
# Generate a strong secret (min 32 bytes / 64 hex chars):
#   openssl rand -hex 32
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
PAYLOAD_SECRET=your_payload_secret_here
DATABASE_URI=postgresql://user:password@pgbouncer:6432/master_agency_db
```

### `.env` (Local development without Docker)

```bash
PAYLOAD_SECRET=your_payload_secret_here
DATABASE_URI=postgresql://user:password@localhost:5432/master_agency_db
```

> **Important**: The `DATABASE_URI` points to the **shared database**, not a project-specific one. Schema isolation is handled by `schemaName` in `payload.config.ts`, not by creating separate databases.

---

## Step 6: Create the PostgreSQL Schema

Before Payload can write tables, the target schema must exist in the database. Payload's `push` mode will create tables but **not** the schema itself.

### Option A: Manual Creation

Connect to your PostgreSQL instance and run:

```sql
-- Replace with your project's schema name
CREATE SCHEMA IF NOT EXISTS gaines_boxing_club__cms;

-- Grant usage to the application's database user
GRANT ALL ON SCHEMA gaines_boxing_club__cms TO your_db_user;
```

### Option B: Via Docker

```bash
docker exec -it <postgres-container> psql -U postgres -d master_agency_db \
  -c 'CREATE SCHEMA IF NOT EXISTS gaines_boxing_club__cms;' \
  -c 'GRANT ALL ON SCHEMA gaines_boxing_club__cms TO gaines_boxing_club_cms_user;'
```

### Option C: Init Script

If using Coolify or a custom PostgreSQL setup, add an init script that runs on database creation:

```sql
-- /docker-entrypoint-initdb.d/01-create-schemas.sql
CREATE SCHEMA IF NOT EXISTS gaines_boxing_club__cms;
-- Add more schemas as projects are onboarded
```

---

## Step 7: Docker Compose Configuration

### `docker-compose.yml` (Production)

```yaml
services:
  website:
    image: ghcr.io/your-org/your-project:${IMAGE_TAG:-latest}
    container_name: your-project-website
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    networks:
      - coolify

networks:
  coolify:
    external: true
```

### `docker-compose.override.yml` (Local Development)

```yaml
services:
  website:
    image: !reset null
    build:
      context: ./website
      dockerfile: Dockerfile
      target: deps
    container_name: your-project-website-local
    env_file:
      - .env.compose
    environment:
      - NODE_ENV=development
      - WATCHPACK_POLLING=true    # Required for Docker volume mounts from Windows
    volumes:
      - ./website:/app
      - /app/node_modules          # Anonymous volume preserves container node_modules
    command: ["npx", "next", "dev", "--webpack"]
    networks:
      - shared

networks:
  shared:
    external: true
```

> Note: The `target: deps` build stage stops at dependency installation, skipping `next build`. The dev server command (`npx next dev --webpack`) handles compilation on the fly. The `--webpack` flag is used because Turbopack can panic with Docker volume mounts on Windows.

> **Important**: The Dockerfile uses `npm ci` even though the project uses pnpm locally. See [pnpm and Alpine Docker Incompatibility](#pnpm-and-alpine-docker-incompatibility) in Troubleshooting.

---

## Step 8: First Run and Verification

1. **Ensure the schema exists** in the database (see [Step 6](#step-6-create-the-postgresql-schema)).

2. **Start the container:**
   ```bash
   docker compose up -d --build
   ```

3. **Check logs for successful initialization:**
   ```bash
   docker compose logs -f website
   ```
   You should see Payload initialize without errors and the Next.js dev server start.

4. **Access the admin panel:**
   Navigate to `http://localhost:3000/admin`. On first access, Payload will prompt you to create the first admin user.

5. **Verify schema isolation:**
   Connect to the database and confirm tables were created in the correct schema:
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'gaines-boxing-club__cms'
   ORDER BY table_name;
   ```
   Expected tables: `media`, `payload_locked_documents`, `payload_locked_documents_rels`, `payload_migrations`, `payload_preferences`, `payload_preferences_rels`, `users`, `users_sessions`.

---

## Step 9: Cloud Storage (S3 / Cloudflare R2)

To prevent the Git repository from becoming bloated with large media files (images, videos), this project uses `@payloadcms/storage-s3` to offload `media` collection uploads to a cloud object storage provider, completely bypassing the local filesystem and repository.

### Plugin Configuration

The plugin is injected into the `plugins` array in `payload.config.ts`:

```typescript
import { s3Storage } from '@payloadcms/storage-s3'

export default buildConfig({
  // ...
  plugins: [
    s3Storage({
      collections: {
        media: {
          prefix: 'your-tenant-slug/public/images', // Critical: Isolates files per project in a shared bucket
          generateFileURL: ({ filename, prefix }) => {
            const publicUrl = process.env.S3_PUBLIC_URL
            return publicUrl ? `${publicUrl}/${prefix}/${filename}` : null
          },
        },
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION || 'auto',
        endpoint: process.env.S3_ENDPOINT || '',
        forcePathStyle: true, // Required for Cloudflare R2, MinIO, and DigitalOcean Spaces
      },
    }),
  ]
})
```

### Environment Variables

Add the following to your `.env` (and `.env.compose` / Coolify production env):

```bash
# Cloudflare R2 / AWS S3 Configuration
S3_BUCKET=your-bucket-name
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_REGION=auto # "auto" for Cloudflare R2, or e.g. "us-east-1" for AWS
S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com # omit for standard AWS S3
S3_PUBLIC_URL=https://pub-abcdef123.r2.dev # Public CDN domain (r2.dev or Custom Domain)
```

### Next.js Image Domain Whitelisting

By default, the Next.js `<Image>` component blocks external URLs. You must add your chosen Cloudflare R2 domains to the `remotePatterns` configuration in `next.config.ts`:

```typescript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "*.cloudflarestorage.com",
    },
    {
      protocol: "https",
      hostname: "*.r2.dev",
    },
  ],
},
```

### Image Optimization (WebP Compression)

To conserve object storage bucket space, Payload can be configured to automatically compress incoming image uploads into lightweight `.webp` files utilizing `sharp`.

Modify the `media` collection's `upload` property to include `formatOptions`. **Note:** You must explicitly define `formatOptions` inside individual `imageSizes` as well, otherwise thumbnails may retain their heavy original format (e.g. sticking to `.png`), paradoxically making them larger than the fully compressed original image.

```typescript
export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    formatOptions: {
      format: 'webp',
      options: { quality: 80 },
    },
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
        formatOptions: { 
          format: 'webp', 
          options: { quality: 75 } 
        },
      },
    ],
    adminThumbnail: 'thumbnail', // Makes the CMS UI load fast
  },
}
```

### Gitignore Rules

The local `/media` directory and the `/public/images` (legacy seed directory) must be explicitly added to `website/.gitignore` so they are not tracked in version control:

```gitignore
/media
/public/images
```

> **Note on Seeding**: The `seed-content.ts` script gracefully handles the absence of files in `/public/images`. If you wipe the database locally, the seed script will simply skip media ingestion, allowing you to manually seed imagery pointing to the cloud bucket through the admin UI.

---

## Reusable vs. Project-Specific Collections

As Payload CMS is integrated into multiple projects, some collections, globals, and plugins will emerge as generic and reusable across all projects. These should be documented here as they are created so that they can be introduced into new projects as an out-of-the-box base set, to be extended or modified per-project as needed.

### Classification Rules

- A collection or global is **reusable** if its data shape and purpose are domain-agnostic and could apply to any marketing or content site.
- A collection or global is **project-specific** if it models a concept unique to one business domain (e.g., a boxing gym, a medical practice) and would require significant rethinking to apply elsewhere.
- Plugins are generally reusable by nature and should always be tracked in the reusable registry.

### Reusable Collections Registry

These are collections and globals that have been implemented in at least one project and are candidates for inclusion in future Payload CMS projects as a generic base set.

| Name               | Type       | Description                                                     | First Used In         | Status      |
|--------------------|------------|-----------------------------------------------------------------|-----------------------|-------------|
| `users`            | Collection | Authentication-enabled user accounts (Payload built-in)         | gaines_boxing_club_v2 | Implemented |
| `media`            | Collection | File and image upload management (Payload built-in)             | gaines_boxing_club_v2 | Implemented |
| `pages`            | Collection | Route metadata + SEO fields (`seoTitle`, `seoDescription`, `ogImage`) | gaines_boxing_club_v2 | Implemented |
| `quotes`           | Collection | Motivational or testimonial quotes with attribution             | gaines_boxing_club_v2 | Implemented |
| `site-settings`    | Global     | Site name, tagline, contact info, social links, structured data | gaines_boxing_club_v2 | Implemented |
| `forms`            | Collection | Dynamic form definitions (via `@payloadcms/plugin-form-builder`) | gaines_boxing_club_v2 | Implemented |
| `form-submissions` | Collection | Form submission records (via `@payloadcms/plugin-form-builder`)  | gaines_boxing_club_v2 | Implemented |

**Candidates for future implementation** (identified as highly reusable, not yet built):

| Name            | Type                   | Description                                                                 |
|-----------------|------------------------|-----------------------------------------------------------------------------|
| `hero`          | Global / Block         | Full-width hero section with heading, subheading, CTA, and background image |
| `cards`         | Collection / Block     | Generic card layout for features, services, or highlights                   |
| `blog`          | Collection             | Blog posts with author, publish date, rich text body, and tags              |
| `news`          | Collection             | News/press items, similar to blog but with source attribution               |
| `seo`           | Field Group            | Meta title, description, OG image -- embeddable in other collections        |
| `navigation`    | Global                 | Site-wide nav links, structured for header and footer rendering             |

### Reusable Plugins Registry

| Plugin                              | Description                                     | First Used In         |
|-------------------------------------|------------------------------------------------|-----------------------|
| `@payloadcms/plugin-form-builder`   | Dynamic form creation and submission handling  | gaines_boxing_club_v2 |
| `@payloadcms/plugin-mcp`           | MCP plugin for AI agent access to CMS data      | gaines_boxing_club_v2 |

### Project-Specific Collections Registry

These collections are unique to the project they were built in and should not be treated as generic base collections for new projects.

| Name                 | Type       | Project               | Description                                              |
|----------------------|------------|------------------------|----------------------------------------------------------|
| `coaches`            | Collection | gaines_boxing_club_v2  | Coach profiles with bio, certifications, images          |
| `events`             | Collection | gaines_boxing_club_v2  | Boxing events with date, featured flag, images           |
| `timeline-milestones`| Collection | gaines_boxing_club_v2  | Historical milestones for the club's legacy timeline     |
| `philosophy-pillars` | Collection | gaines_boxing_club_v2  | Core training philosophy principles                      |
| `training-schedule`  | Collection | gaines_boxing_club_v2  | Weekly training windows with day, time, description      |

### Reusable Structured Data Schemas

JSON-LD schema generators in `lib/structured-data.ts` that can be reused across projects:

| Schema              | Schema.org Type                                             | Scope     | Description                                              |
|---------------------|-------------------------------------------------------------|-----------|----------------------------------------------------------|
| Organization        | `Organization`, `LocalBusiness`, `SportsActivityLocation`   | Global    | Business info, address, geo, hours, social links         |
| WebSite             | `WebSite`                                                   | Global    | Site name, URL, search action                            |
| WebPage             | `WebPage`                                                   | Per-page  | Page title, description, URL, breadcrumb                 |
| BreadcrumbList      | `BreadcrumbList`                                            | Per-page  | Navigation path from Home to current page                |
| Event               | `Event`                                                      | Per-item  | Event name, date, location, organizer                    |
| Person              | `Person`                                                     | Per-item  | Coach/staff name, role, bio, worksFor                    |

### Updating This Registry

When implementing a new collection or global:
1. Classify it as reusable or project-specific using the rules above.
2. Add a row to the appropriate table above.
3. If it is reusable, note whether it is fully implemented or still a candidate.


---

## Troubleshooting


### `relation "users_sessions" already exists`

**Cause**: Payload's `push` mode issues `CREATE TABLE` without `IF NOT EXISTS`. If tables already exist in the target schema (from a prior init or another project using the `public` schema), the statement fails.

**Fix**:
1. If tables are in the `public` schema from a prior run (before `schemaName` was configured), drop them:
   ```sql
   DROP TABLE IF EXISTS
     "users_sessions", "users", "media",
     "payload_locked_documents", "payload_locked_documents_rels",
     "payload_preferences", "payload_preferences_rels",
     "payload_migrations"
   CASCADE;
   ```
2. Ensure `schemaName` is set in `payload.config.ts` to prevent future collisions.

### `schema "xxx" does not exist`

**Cause**: The PostgreSQL schema specified in `schemaName` has not been created yet.

**Fix**: Create the schema manually. See [Step 6](#step-6-create-the-postgresql-schema).

### `self-signed certificate in certificate chain` during Local S3 Uploads

**Cause**: The local network (Corporate firewall/VPN, Zscaler, Cloudflare WARP, or Antivirus Web Shields) is actively intercepting and decrypting SSL traffic. The strict AWS SDK underlying `@payloadcms/storage-s3` rejects the unrecognized proxy certificate and aborts the connection.

**Fix**: Add the following to your `.env` to instruct Node.js to intentionally bypass strict TLS validation during local development:
```bash
NODE_TLS_REJECT_UNAUTHORIZED=0
```

### `push` vs. Migrations Conflict

**Cause**: Mixing `push: true` with migration files on the same database.

**Fix**: Pick one strategy:
- **Development**: Use `push: true` (default). Treat your local DB as a sandbox.
- **Production**: Set `push: false` and use `pnpm payload migrate:create` to generate migration files, then `pnpm payload migrate` to apply them.

### Turbopack Panics with Docker Volumes (Windows)

**Cause**: Turbopack's file watcher does not handle Docker volume mounts from Windows reliably.

**Fix**: Use the `--webpack` flag: `pnpm exec next dev --webpack`. Also set `WATCHPACK_POLLING=true` for reliable file change detection.

### pnpm and Alpine Docker Incompatibility

**Cause**: pnpm uses a content-addressable store with hard links and symlinks to populate `node_modules`. Alpine-based Docker images (used by Coolify) run on OverlayFS, which does not support cross-device hard links. This causes pnpm installs to fail silently or produce broken `node_modules` at build time.

**Fix**: Use `npm ci` inside the Dockerfile instead of pnpm. The project maintains **two lockfiles**:
- `pnpm-lock.yaml` — used locally (`pnpm install`, `pnpm run dev`, etc.)
- `package-lock.json` — used exclusively inside Docker (`npm ci --legacy-peer-deps`)

Both files are committed to the repository. When adding or upgrading a dependency, run both:
```bash
pnpm add <package>          # updates pnpm-lock.yaml
npm install --legacy-peer-deps  # regenerates package-lock.json
```

The Dockerfile `COPY` explicitly names `package-lock.json` (not a glob) so the intent is unambiguous.

### `ServerFunctionsProvider requires a serverFunction prop`

**Cause**: The `app/(payload)/layout.tsx` was a stub that did not wire up `handleServerFunctions`. Payload v3 requires the admin layout to provide a `serverFunction` prop to `RootLayout`.

**Fix**: Replace the layout with the canonical Payload v3 pattern:

```tsx
/* app/(payload)/layout.tsx */
import config from '@payload-config'
import '@payloadcms/next/css'
import type { ServerFunctionClient } from 'payload'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import React from 'react'
import { importMap } from './admin/importMap.js'
import './custom.scss'

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({ ...args, config, importMap })
}

const Layout = ({ children }: { children: React.ReactNode }) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
)
export default Layout
```

> Important: Import `config` directly (not `configPromise`) and pass it as `config` to both `handleServerFunctions` and `RootLayout`.

### Hydration Error: `<html> cannot be a child of <main>`

**Cause**: Payload's `RootLayout` renders its own full `<html>/<head>/<body>` structure. If a root `app/layout.tsx` also renders `<html>/<body>` with site chrome (header, main, footer), Next.js nests the two, producing invalid HTML and a hydration failure.

**Fix**: Follow the Payload-recommended "Multiple Root Layouts" architecture:

1. Move all frontend routes and pages into `app/(frontend)/`.
2. Move the site layout (with `html/body/header/footer`) to `app/(frontend)/layout.tsx`.
3. Keep `app/(payload)/layout.tsx` as-is -- it provides its own full `html/body` via `RootLayout`.
4. Delete `app/layout.tsx` (the root layout). When all routes are covered by route groups, Next.js allows each group to serve as its own root.

Directory structure after the fix:
```
app/
  (frontend)/
    layout.tsx      # site chrome: html, body, header, footer
    globals.css
    page.tsx
    coaches/
    philosophy/
    schedule/
  (payload)/
    layout.tsx      # Payload admin full html/body
    admin/
    api/
```

### `useUploadHandlers must be used within UploadHandlersProvider`

**Cause**: Mismatched versions across `@payloadcms/*` packages. For example, if `@payloadcms/storage-s3` is at `3.81.0` but `@payloadcms/next` or `@payloadcms/ui` are at `3.80.0`, the newer plugin attempts to consume a React Context (`UploadHandlersProvider`) that doesn't exist yet in the older core packages.

**Fix**: Ensure all Payload CMS packages are perfectly aligned on the same minor/patch version.
1. Check versions: `npm ls | grep payloadcms`
2. Update all packages to match: `pnpm i @payloadcms/storage-s3@3.80.0` (or update all others to match the newer one).
3. Restart the Next.js development server.

---

## Change Log

| Date       | Change                                                                 |
|------------|------------------------------------------------------------------------|
| 2026-03-22 | Initial guide created. Documented schema isolation pattern, applied `schemaName: 'gaines_boxing_club__cms'` to `payload.config.ts`, documented the `relation already exists` fix. |
| 2026-03-22 | Expanded naming conventions section to cover the full multi-tenant system: Payload CMS schemas (`[tenantId]__cms`), their dedicated database users (`[tenantId]_cms_user`), and the broader role-based pattern (`[tenantId]__[role]` / `[tenantId]_[role]_user`) for other services. |
| 2026-03-22 | Added Reusable vs. Project-Specific Collections section with classification rules, reusable registry (including candidates for future implementation), and project-specific registry for Gaines Boxing Club (`trainers`, `classes`, `programs`). |
| 2026-03-22 | Standardized all tenant ID slugs to use underscores instead of hyphens throughout the guide and `payload.config.ts`. Updated schemas (`gaines_boxing_club__cms`), SQL examples, and collection registries. |
| 2026-03-22 | Resolved `/admin` 500 errors. Fixed `app/(payload)/layout.tsx` with proper `serverFunction`/`handleServerFunctions` wiring. Restructured app router into `(frontend)` + `(payload)` route groups (multiple root layouts) to resolve hydration conflict caused by nested `html/body` elements. |
| 2026-03-22 | Stories 4-6: Added `lib/sync-pages.ts` for nav-to-pages auto-sync. Added `lib/structured-data.ts` with 6 JSON-LD schema generators (Organization, WebSite, WebPage, BreadcrumbList, Event, Person). Injected global schemas in `layout.tsx`, per-page schemas in all 5 pages. Updated registries: promoted `pages`, `quotes`, `site-settings`, `forms`, `form-submissions` to Reusable; added actual project-specific collections (`coaches`, `events`, `timeline-milestones`, `philosophy-pillars`, `training-schedule`); added Plugins and Structured Data Schemas registries. |
| 2026-03-22 | Code review remediation: Removed hardcoded API key from `GEMINI.md`, `payload.config.ts`, `seed-api-key.ts`, and `route.ts`. Key now sourced from `PAYLOAD_MCP_API_KEY` env var. `onInit` seeding gated behind `SEED_MCP_KEY=true`. Seed route switched from GET to POST with Bearer auth header. Added `ctaLink` text field to events collection. Sanitized JSON-LD output in `structured-data.ts` to prevent XSS. Removed `dangerouslySetInnerHTML` from `heroHeading` in 5 pages. Fixed `layout.tsx` undefined `settings`. Fixed philosophy year fallback MCMXCIV->MCMLXXIV. Created `.env.example`. |
| 2026-03-27 | Updated guide to reflect the transition from `npm` to `pnpm` as the default package manager. |
| 2026-03-27 | Reverted Docker to npm: pnpm hard-link/symlink architecture is incompatible with Alpine-based Docker images on Coolify. Dockerfile now uses `npm ci`; pnpm-lock.yaml is kept for local development. Both lockfiles coexist in the repo. Added Troubleshooting entry for this issue. |
| 2026-04-05 | Integrated `@payloadcms/storage-s3` plugin to offload media persistence to external buckets (Cloudflare R2 / AWS S3). Documented .gitignore guidelines to prevent Git bloat from `public/images/`. Made `seed-content.ts` fail gracefully if local seed assets are omitted from git. |
| 2026-04-06 | Added `suppressHydrationWarning` to `RootLayout` in `app/(payload)/layout.tsx` to fix Next.js hydration mismatches on the `<html style...>` tag changes. Added `useUploadHandlers` mismatch troubleshooting guide when applying `@payloadcms/storage-s3`. |
| 2026-04-06 | Documented Cloudflare R2 public URL mapping using `generateFileURL` inside `payload.config.ts`, added `S3_PUBLIC_URL` variable, added `next.config.ts` remote patterns, and implemented automatic WebP conversion in `upload.formatOptions` for original images and thumbnails. Added SSL interception bypass documentation (`NODE_TLS_REJECT_UNAUTHORIZED=0`). |
