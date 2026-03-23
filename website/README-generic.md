# <PROJECT_NAME>

This is a [Next.js](https://nextjs.org) and React project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). It serves as the standard minimum infrastructure package for our centralized projects, coming pre-integrated with [Payload CMS](https://payloadcms.com/) for content management and powered by a shared PostgreSQL database.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## CMS Admin

Access the Payload CMS admin panel at [http://localhost:3000/admin](http://localhost:3000/admin).

## Pages Auto-Sync

Navigation links defined in `lib/navigation.ts` are automatically synchronized with the `pages` collection in Payload CMS. This ensures that every route has a corresponding CMS page entry for SEO metadata management.

**How it works:**

1. `lib/sync-pages.ts` reads `navLinks` from `lib/navigation.ts`.
2. For each link, it checks if a `pages` document exists for that route.
3. If missing, it creates a page with default SEO title (`Page Name | <PROJECT_NAME>`).
4. If the label changed, only the label is updated -- SEO fields edited in the admin panel are never overwritten.

**Triggering a sync:**

- The sync runs automatically when you call the seed endpoint: `POST /api/seed` with your `Bearer <API_KEY>` token.
- To add a new page: add the route to `navLinks` in `lib/navigation.ts`, then run the seed endpoint or call `syncPages()` programmatically.

## JSON-LD Structured Data

Every page outputs Schema.org JSON-LD structured data for search engine optimization:

- **Global (in `layout.tsx`):** Organization, LocalBusiness, WebSite
- **Per-page:** WebPage, BreadcrumbList
- **<PROJECT_SPECIFIC_PAGE>:** <ENTITY_SCHEMA> per <ENTITY> (e.g., Person schema per team member, Event schema per scheduled event)

Data is sourced from the `site-settings` global (`structuredData` field group) in Payload CMS. Update the Organization name, address, geo coordinates, business hours, and logo in the admin panel to customize the structured data output.

## Testing & Verification

### Seeding Content

```bash
# Seed all CMS data (including pages sync)
curl -X POST http://localhost:3000/api/seed \
  -H "Authorization: Bearer <YOUR_API_KEY>"
```

### Verifying Structured Data

1. Start the dev server: `npm run dev`
2. Open any page and view source (Ctrl+U)
3. Search for `application/ld+json` to find the JSON-LD script tags
4. Copy the page URL and paste it into [Schema.org Validator](https://validator.schema.org/) or [Google Rich Results Test](https://search.google.com/test/rich-results)

### TypeScript Check

```bash
npx tsc --noEmit
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Payload CMS Documentation](https://payloadcms.com/docs) - learn about Payload CMS.
- [Schema.org](https://schema.org/) - reference for structured data types.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
