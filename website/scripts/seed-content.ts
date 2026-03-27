/**
 * Seed Script: Populates Payload CMS with all existing hardcoded content.
 *
 * Usage: pnpm exec tsx --env-file=.env scripts/seed-content.ts
 */

import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import type { BasePayload } from 'payload'
import config from '../payload.config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const IMAGES_DIR = path.resolve(__dirname, '..', 'public', 'images')

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function clearCollection(payload: BasePayload, slug: string): Promise<void> {
  try {
    await payload.delete({
      collection: slug,
      where: { id: { exists: true } },
    })
    console.log(`  [cleared] ${slug}`)
  } catch (err) {
    console.error(`  [clear-error] ${slug}:`, err)
    throw err
  }
}

async function uploadImage(
  payload: any,
  filename: string,
  altText: string,
): Promise<any> {
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    console.log(`  [exists] ${filename} -> id: ${existing.docs[0].id}`)
    return existing.docs[0]
  }

  const filePath = path.join(IMAGES_DIR, filename)

  const doc = await payload.create({
    collection: 'media',
    data: { alt: altText },
    filePath: filePath,
  })

  console.log(`  [uploaded] ${filename} -> id: ${doc.id}`)
  return doc
}

// ---------------------------------------------------------------------------
// Seed Data
// ---------------------------------------------------------------------------

async function seedMedia(payload: any): Promise<Record<string, any>> {
  console.log('\n--- Uploading Images ---')
  const images: Record<string, any> = {}

  const uploads: [string, string][] = [
    ['sam_gaines.png', 'Sam Gaines, founder of Gaines Boxing Club'],
    ['coach_steve.png', 'Head coach Steve Thompson'],
    ['coach_jesse.png', 'Legacy coach Jesse Bryan'],
    ['event_main.png', 'Golden Gloves Qualifier main event'],
    ['event_fight.png', 'Heavyweight Rumble local spar event'],
    ['event_workshop.png', 'Master Footwork workshop'],
    ['event_exhibition.png', 'Young Bloods VII exhibition match'],
    ['gbc_logo.png', 'Gaines Boxing Club logo'],
  ]

  for (const [filename, alt] of uploads) {
    images[filename] = await uploadImage(payload, filename, alt)
  }

  return images
}

async function seedGlobals(payload: any, images: Record<string, any>): Promise<void> {
  console.log('\n--- Seeding Site Settings ---')

  const settings = {
    siteName: 'Gaines Boxing Club',
    tagline:
      'Building legacy through discipline, grit, and the relentless pursuit of excellence in the underground boxing circuit.',
    address: '124 Industrial Way, North District',
    phone: '(555) 012-GBC-LIONS',
    email: 'frontdesk@gainesboxing.club',
    socialLinks: [
      { platform: 'Share', url: '#', iconName: 'share' },
      { platform: 'Community', url: '#', iconName: 'group' },
      { platform: 'Gallery', url: '#', iconName: 'photo_camera' },
    ],
    structuredData: {
      organizationName: 'Gaines Boxing Club',
      foundingDate: '1974',
      founderName: 'Sam Gaines',
      streetAddress: '124 Industrial Way',
      addressLocality: 'North District',
      addressRegion: 'IL',
      postalCode: '60600',
      country: 'US',
      latitude: 41.8781,
      longitude: -87.6298,
      businessHours: [
        { dayOfWeek: 'Monday', opens: '17:00', closes: '20:00' },
        { dayOfWeek: 'Thursday', opens: '18:00', closes: '20:00' },
      ],
      priceRange: '$$',
      organizationLogo: images['gbc_logo.png']?.id,
    },

  }

  await payload.updateGlobal({
    slug: 'site-settings',
    data: settings,
  })
  console.log('  [updated] site-settings global')
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main(): Promise<void> {
  console.log('=== Gaines Boxing Club Local Seed ===')
  
  const payload = await getPayload({ config })
  
  const images = await seedMedia(payload)

  console.log('\n--- Seeding Coaches ---')
  await clearCollection(payload, 'coaches')
  await payload.create({ collection: 'coaches', data: { name: 'Steve Thompson', role: 'Head Coach', title: 'Master Elite', subtitle: 'Head Coach | Physical Prowess & Skill Development', shortBio: 'With over 20 years in the heavy-weight circuit...', certifications: [{ label: 'USA Boxing Level 3 Coach' }], image: images['coach_steve.png']?.id, sortOrder: 1 } })
  await payload.create({ collection: 'coaches', data: { name: 'Jesse Bryan', role: 'Technical Lead', title: 'Legacy Coach', subtitle: 'Technical Lead | The Sweet Science', shortBio: 'A direct protege of Sam Gaines...', certifications: [{ label: 'USA Boxing Level 2 Coach' }], image: images['coach_jesse.png']?.id, sortOrder: 2 } })
  console.log('  [created] Coaches')

  console.log('\n--- Seeding Events ---')
  await clearCollection(payload, 'events')
  await payload.create({ collection: 'events', data: { title: 'Golden Gloves Qualifier', tag: 'main-event', date: '2026-10-24T00:00:00.000Z', location: 'Underground Arena', description: 'The premier boxing qualifier event...', image: images['event_main.png']?.id, ctaText: 'Register to Attend', isFeatured: true } })
  await payload.create({ collection: 'events', data: { title: 'Heavyweight Rumble', tag: 'local-spar', date: '2026-09-12T00:00:00.000Z', location: 'Gaines Boxing Club', description: 'Monthly heavyweight showcase...', image: images['event_fight.png']?.id, ctaText: 'Details', isFeatured: false } })
  await payload.create({ collection: 'events', data: { title: 'Master Footwork', tag: 'workshop', date: '2026-09-18T00:00:00.000Z', location: 'Gaines Boxing Club', description: 'A technical workshop...', image: images['event_workshop.png']?.id, ctaText: 'Join Waitlist', isFeatured: false } })
  console.log('  [created] Events')

  console.log('\n--- Seeding Philosophy Pillars ---')
  await clearCollection(payload, 'philosophy-pillars')
  await payload.create({ collection: 'philosophy-pillars', data: { icon: 'target', title: 'Technical Precision', description: 'Master the nuances of footwork...', sortOrder: 1 } })
  await payload.create({ collection: 'philosophy-pillars', data: { icon: 'bolt', title: 'Physical Conditioning', description: 'Build an elite engine...', sortOrder: 2 } })
  await payload.create({ collection: 'philosophy-pillars', data: { icon: 'psychology', title: 'Mental Fortitude', description: 'Develop the psychological edge...', sortOrder: 3 } })
  await payload.create({ collection: 'philosophy-pillars', data: { icon: 'groups', title: 'Elite Community', description: 'Iron sharpens iron...', sortOrder: 4 } })
  console.log('  [created] Philosophy Pillars')

  console.log('\n--- Seeding Quotes ---')
  await clearCollection(payload, 'quotes')
  await payload.create({ collection: 'quotes', data: { text: "The sweet science isn't about the fight you see. It's about the discipline you don't.", attribution: 'Sam Gaines', sortOrder: 1 } })
  await payload.create({ collection: 'quotes', data: { text: "True champions are built in the shadows.", attribution: 'Sam Gaines', sortOrder: 2 } })
  console.log('  [created] Quotes')

  console.log('\n--- Seeding Timeline ---')
  await clearCollection(payload, 'timeline-milestones')
  await payload.create({ collection: 'timeline-milestones', data: { year: '1974', title: 'The Basement Era', description: 'Opened in a 400sq ft basement in the Southside.', icon: 'home', sortOrder: 1 } })
  await payload.create({ collection: 'timeline-milestones', data: { year: '1988', title: 'Regional Domination', description: 'Produced first National Golden Gloves champion.', icon: 'workspace_premium', sortOrder: 2 } })
  console.log('  [created] Timeline')

  console.log('\n--- Seeding Training Schedule ---')
  await clearCollection(payload, 'training-schedule')
  await payload.create({ collection: 'training-schedule', data: { day: 'Mondays', startTime: '5PM', endTime: '8PM', sortOrder: 1 } })
  await payload.create({ collection: 'training-schedule', data: { day: 'Thursdays', startTime: '6PM', endTime: '8PM', sortOrder: 2 } })
  console.log('  [created] Training Schedule')

  await seedGlobals(payload, images)

  console.log('\n=== Seed Complete ===')
  process.exit(0)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
