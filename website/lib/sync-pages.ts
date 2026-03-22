import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { navLinks } from '@/lib/navigation'

// ---------------------------------------------------------------------------
// syncPages -- Synchronize navLinks to the pages collection
// ---------------------------------------------------------------------------
// Creates page documents for any nav routes that don't exist yet.
// Updates only the `label` field if it has changed.
// NEVER overwrites user-edited SEO fields (seoTitle, seoDescription, ogImage).
// ---------------------------------------------------------------------------

export async function syncPages() {
  const payload = await getPayload({ config: configPromise })

  for (const link of navLinks) {
    // F3 fix: try/catch per iteration so one failure doesn't kill the entire sync
    try {
      const existing = await payload.find({
        collection: 'pages',
        where: { route: { equals: link.href } },
        limit: 1,
      })

      if (existing.docs.length === 0) {
        // F8 fix: don't hardcode title suffix -- layout template handles it
        await payload.create({
          collection: 'pages',
          data: {
            route: link.href,
            label: link.label,
            seoTitle: link.label,
          },
        })
        payload.logger.info(`[syncPages] Created page: ${link.href} (${link.label})`)
      } else {
        const doc = existing.docs[0]
        // Only update label if it changed -- never touch SEO fields
        if (doc.label !== link.label) {
          await payload.update({
            collection: 'pages',
            id: doc.id,
            data: { label: link.label },
          })
          payload.logger.info(`[syncPages] Updated label for ${link.href}: "${doc.label}" -> "${link.label}"`)
        }
      }
    } catch (err) {
      payload.logger.error(`[syncPages] Failed to sync ${link.href}: ${err}`)
    }
  }

  payload.logger.info(`[syncPages] Sync complete. Processed ${navLinks.length} routes.`)
}
