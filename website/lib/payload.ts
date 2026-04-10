import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cache } from 'react'

// ---------------------------------------------------------------------------
// Centralized Payload Data Fetching Helpers
// ---------------------------------------------------------------------------
// All Server Components should use these helpers instead of inline getPayload()
// calls. This ensures consistent depth, sorting, and error handling.
// ---------------------------------------------------------------------------

async function getPayloadClient() {
  return getPayload({ config: configPromise })
}

// ---------------------------------------------------------------------------
// Image URL Helper
// ---------------------------------------------------------------------------
// Payload's upload/relationship fields can be a string ID (unpopulated) or
// an object with url/alt (populated). This helper safely extracts the URL
// and alt text, returning a consistent shape for all page components.
// ---------------------------------------------------------------------------
export function getImageUrl(
  image: unknown,
  fallback: string
): { url: string; alt?: string } {
  if (image && typeof image === 'object' && 'url' in image) {
    const img = image as { url?: string; alt?: string }
    return { url: img.url || fallback, alt: img.alt }
  }
  return { url: fallback }
}

export function getSafeImageUrl(
  image: unknown,
  fallback: string
): string {
  if (image && typeof image === 'object' && 'url' in image) {
    const img = image as { url?: string };
    const rawUrl = img.url;
    if (rawUrl) {
      try {
        const parsed = new URL(rawUrl, 'http://localhost');
        if (['http:', 'https:'].includes(parsed.protocol) || rawUrl.startsWith('/')) {
          return rawUrl;
        }
      } catch {
        // Fallthrough to fallback
      }
    }
  }
  return fallback;
}

// -- Site Settings --
// F4 fix: React cache() deduplicates calls within the same request lifecycle,
// so generateMetadata() and the page component share a single DB query.
export const getSiteSettings = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'site-settings' })
})

// -- Pages --
// React cache() deduplicates calls within the same request lifecycle so
// generateMetadata() and the page component share a single DB query.
export const getPage = cache(async (route: string) => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'pages',
    where: { route: { equals: route } },
    limit: 1,
    depth: 1,
  })
  return result.docs[0] ?? null
})

// -- Coaches --
export async function getCoaches(limit = 10) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'coaches',
    limit,
    sort: 'sortOrder',
    depth: 1,
  })
  return result.docs
}

// -- Events --
export async function getEvents() {
  const payload = await getPayloadClient()
  const all = await payload.find({
    collection: 'events',
    limit: 20,
    sort: 'date',
    depth: 1,
  })
  const featured = all.docs.find((e) => e.isFeatured) ?? null
  const regular = all.docs.filter((e) => !e.isFeatured)
  return { featured, regular, all: all.docs }
}

// -- Quotes --
export async function getQuotes(limit = 10) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'quotes',
    limit,
    sort: 'sortOrder',
  })
  return result.docs
}

// -- Timeline Milestones --
export async function getTimeline() {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'timeline-milestones',
    limit: 20,
    sort: 'sortOrder',
  })
  return result.docs
}

// -- Philosophy Pillars --
export async function getPhilosophyPillars(limit = 10) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'philosophy-pillars',
    limit,
    sort: 'sortOrder',
  })
  return result.docs
}

// -- Training Schedule --
export async function getTrainingSchedule() {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'training-schedule',
    limit: 10,
    sort: 'sortOrder',
  })
  return result.docs
}

// -- Forms --
export async function getForm(title: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'forms',
    where: { title: { equals: title } },
    limit: 1,
  })
  return result.docs[0] ?? null
}

// -- Alert Banners --
export async function getAlertBanners() {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'alert-banners',
    where: { isActive: { equals: true } },
    limit: 10,
    sort: 'sortOrder',
  })
  return result.docs
}

// -- Media --
export async function getMedia(filename: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
  })
  return result.docs[0] ?? null
}
