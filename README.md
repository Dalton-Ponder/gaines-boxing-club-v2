# Gaines Boxing Club V2

Website for Gaines Boxing Club -- a Next.js 16 application powered by Payload CMS 3, backed by PostgreSQL, and deployed via Docker on Coolify.

---

## Tech Stack

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| Framework    | Next.js 16 (App Router, standalone) |
| CMS          | Payload CMS 3 (admin + REST API)    |
| Database     | PostgreSQL (schema-isolated)        |
| Styling      | TailwindCSS 4                       |
| Rich Text    | Lexical editor (via Payload)        |
| Runtime      | Node 20 (Alpine)                    |
| Deployment   | Docker / Coolify                    |
| CI/CD        | GitHub Actions (GHCR image publish) |

## Repository Structure

```
gaines-boxing-club-v2/
  website/               # Next.js + Payload CMS application
    app/
      (frontend)/        # Public-facing routes (home, coaches, philosophy, schedule)
      (payload)/         # Payload admin panel routes (auto-generated)
    components/          # Shared React components (Header, Footer, modals, forms)
    lib/                 # Server helpers and data-fetching utilities
    scripts/             # Seed scripts (seed-content.ts, seed-api-key.ts)
    payload.config.ts    # CMS collections, globals, plugins, and hooks
    Dockerfile           # Multi-stage production build
  demo/                  # Static HTML prototypes (original design reference)
  docs/                  # Guides (Payload CMS integration, Cloudflare webhook bypass)
  docker-compose.yml     # Production compose (pulls from GHCR)
  docker-compose.override.example.yml  # Local dev compose template
  .env.example           # Standalone env template
  .env.compose.example   # Docker Compose env template
```

## CMS Data Model

### Collections

| Slug                  | Purpose                                        |
| --------------------- | ---------------------------------------------- |
| `users`               | Admin authentication (built-in Payload auth)   |
| `media`               | Image uploads (alt text required)              |
| `coaches`             | Coach profiles, bios, certifications           |
| `events`              | Upcoming events with tags and featured flag     |
| `quotes`              | Inspirational quotes for display sections      |
| `timeline-milestones` | Club history timeline entries                  |
| `philosophy-pillars`  | Core philosophy values and descriptions        |
| `training-schedule`   | Weekly training day/time blocks                |
| `pages`               | Per-route SEO metadata and hero content        |

### Globals

| Slug            | Purpose                                          |
| --------------- | ------------------------------------------------ |
| `site-settings` | Site name, contact info, social links, JSON-LD SEO |

### Plugins

- **Form Builder** -- dynamic front-end forms with submission storage
- **MCP** -- exposes collections/globals via the Payload MCP protocol for AI tooling

## Getting Started

### Prerequisites

- Node.js 20+
- A running PostgreSQL instance
- pnpm

### 1. Clone and Install

```bash
git clone https://github.com/Dalton-Ponder/gaines-boxing-club-v2.git
cd gaines-boxing-club-v2/website
pnpm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set:

- `PAYLOAD_SECRET` -- a random 64-character hex string (`openssl rand -hex 32`)
- `DATABASE_URI` -- your PostgreSQL connection string

### 3. Run the Dev Server

```bash
pnpm run dev
```

The site is available at `http://localhost:3000`. The Payload admin panel is at `http://localhost:3000/admin`.

### 4. Seed Content (Optional)

```bash
pnpm run seed
```

This populates coaches, events, quotes, milestones, philosophy pillars, and schedule data from the seed script.

## Docker (Local Development)

For local containerized development with hot-reloading:

```bash
# One-time: create the shared Docker network
docker network create shared

# Copy the override template
cp docker-compose.override.example.yml docker-compose.override.yml
cp .env.compose.example .env.compose
# Edit .env.compose with your PAYLOAD_SECRET and DATABASE_URI

docker compose up -d --build
```

The override file builds from local source, mounts volumes for hot-reload, and uses the `--webpack` flag (Turbopack does not support Docker volume mounts on Windows).

## Docker (Production)

The base `docker-compose.yml` pulls the pre-built image from GHCR, published by GitHub Actions on push to `main`:

```bash
docker compose up -d
```

The production image uses a multi-stage Dockerfile (deps, builder, runner) with standalone output tracing for minimal image size.

## Database Schema Isolation

Payload uses `schemaName: 'gaines_boxing_club__cms'` in the Postgres adapter config. This allows multiple Payload projects to share a single PostgreSQL instance without table collisions. The naming convention is `[tenantId]__cms`.

## Key Scripts

| Command         | Description                             |
| --------------- | --------------------------------------- |
| `pnpm run dev`   | Start Next.js dev server                |
| `pnpm run build` | Production build                        |
| `pnpm run start` | Start production server                 |
| `pnpm run lint`  | Run ESLint                              |
| `pnpm run seed`  | Seed CMS content from script data       |

## Documentation

- [Payload CMS Integration Guide](docs/payload-cms-integration-guide.md) -- schema isolation, adapter config, troubleshooting, and reusable collection registry
- [Cloudflare Webhook Bypass](docs/cloudflare-one-github-webhook-bypass.md) -- routing GitHub webhooks through Cloudflare Access

## Cache Invalidation

Every collection and global has an `afterChange` hook that calls `revalidateTag()` to purge the Next.js data cache. This ensures Server Components fetch fresh CMS data immediately after edits in the admin panel.

## License

Private repository. All rights reserved.
