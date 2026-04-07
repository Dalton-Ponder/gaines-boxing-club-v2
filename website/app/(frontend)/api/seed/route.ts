import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import type { BasePayload } from 'payload'
import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import { syncPages } from '@/lib/sync-pages'

const API_KEY = process.env.PAYLOAD_SECRET || process.env.PAYLOAD_MCP_API_KEY

export async function POST(request: Request) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'Server misconfiguration: PAYLOAD_SECRET is not set' }, { status: 401 })
  }

  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (token !== API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // --- Helpers ---
  async function clearCollection(payload: BasePayload, slug: string): Promise<void> {
    try {
      await payload.delete({ collection: slug as 'media', where: { id: { exists: true } } })
    } catch (err) {
      console.error(`[seed] Failed to clear collection "${slug}":`, err)
      throw err
    }
  }

  async function uploadImage(payload: BasePayload, filename: string, altText: string, imagesDir: string): Promise<Record<string, unknown>> {
    const existing = await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
    })

    if (existing.docs.length > 0) return existing.docs[0]

    const filePath = path.join(imagesDir, filename)
    if (!fs.existsSync(filePath)) {
      console.log(`  [skip-missing] ${filename} not found locally in public/images`)
      return {}
    }

    const fileData = fs.readFileSync(filePath)
    
    // Note: since we added the storage-s3 plugin to payload.config,
    // this local buffer upload will be automatically intercepted by the plugin
    // and pushed to Cloudflare R2 / S3 without bloat.
    const doc = await payload.create({
      collection: 'media',
      data: { alt: altText },
      file: {
        data: fileData,
        mimetype: 'image/png',
        name: filename,
        size: fileData.length,
      },
    })
    return doc
  }

  try {
    // Step 0: Sync pages from navLinks before seeding content
    await syncPages()

    const payload = await getPayload({ config })
    const IMAGES_DIR = path.resolve(process.cwd(), 'public', 'images')

    const images: Record<string, Record<string, unknown>> = {}
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
      images[filename] = await uploadImage(payload, filename, alt, IMAGES_DIR)
    }

    const steveBioLexical = {
      root: {
        type: 'root', format: '', indent: 0, version: 1,
        children: [
          {
            type: 'paragraph', format: '', indent: 0, version: 1,
            children: [{ type: 'text', text: 'Steve Thompson’s journey with the Gaines Boxing Club began at the age of 11, training under the watchful eye of Sam Gaines in the founder’s original basement gym. A product of New Bloomfield, Missouri, Steve spent his formative years absorbing the grit and technical pressure of the East St. Louis style. After concluding his own competitive fighting career at age 25, Steve stepped away from the ring for a decade before a call from his mentor changed his trajectory.', version: 1 }]
          },
          {
            type: 'paragraph', format: '', indent: 0, version: 1,
            children: [{ type: 'text', text: 'In 2015, Mr. Gaines asked Steve to return to the gym to help guide Jesse Bryan’s professional comeback. This marked Steve\'s official transition from fighter to coach. Under Sam’s direct mentorship in the barn gym on the Gaines property until 2019, Steve mastered the "no excuses" coaching style—learning to help athletes channel their internal battles into ring-ready productivity.', version: 1 }]
          },
          {
            type: 'paragraph', format: '', indent: 0, version: 1,
            children: [{ type: 'text', text: 'In the winter of 2019, Steve and Jesse took over the operations of Gaines Boxing Club, moving the legacy forward while maintaining a close advisory relationship with Mr. Gaines. For Steve, the ultimate reward is witnessing the week-by-week personal development of his students and the hard-won victories of new fighters entering the ring for the first time.', version: 1 }]
          }
        ]
      }
    };

    const jesseBioLexical = {
      root: {
        type: 'root', format: '', indent: 0, version: 1,
        children: [
          {
            type: 'paragraph', format: '', indent: 0, version: 1,
            children: [{ type: 'text', text: 'Jesse Bryan’s life is a testament to the transformative power of boxing. Raised in Holts Summit, Missouri, Jesse faced a challenging upbringing marked by a broken home and personal struggles with anger. He found his calling when a friend suggested he try boxing, a move that provided the structure and discipline he needed to redirect his life.', version: 1 }]
          },
          {
            type: 'paragraph', format: '', indent: 0, version: 1,
            children: [{ type: 'text', text: 'Jesse turned professional in 2003, quickly amassing a record of 9-3-2 before taking a hiatus in 2005 to focus on his family. In 2017, he returned to professional competition with Steve Thompson by his side as his lead corner. This partnership eventually led Jesse to the pinnacle of the sport, including a world championship title fight and several televised bouts before his retirement from active competition in 2024.', version: 1 }]
          },
          {
            type: 'paragraph', format: '', indent: 0, version: 1,
            children: [{ type: 'text', text: 'Today, Jesse co-owns and operates Gaines Boxing Club alongside Steve, carrying on the traditions established by Sam Gaines. A man of deep faith, Jesse credits his Lord and Savior, Jesus Christ, for his redemption and success. He is dedicated to passing on the lessons of the ring to his students, supported by his wife of nearly 20 years, their two daughters, and his grandson.', version: 1 }]
          }
        ]
      }
    };

    // Coaches
    await clearCollection(payload, 'coaches')
    await payload.create({ collection: 'coaches', data: { name: 'Steve Thompson', role: 'Professional Coach & Co-Owner', title: 'Master Elite', subtitle: 'Professional Coach & Co-Owner', shortBio: 'Steve Thompson’s journey with the Gaines Boxing Club began at the age of 11, training under the watchful eye of Sam Gaines. Today, he maintains the "no excuses" coaching style as co-owner.', fullBio: steveBioLexical as any, certifications: [{ label: 'USA Boxing Level 3 Coach' }], image: (images['coach_steve.png'] as Record<string, unknown>)?.id as string, sortOrder: 1 } })
    await payload.create({ collection: 'coaches', data: { name: 'Jesse Bryan', role: 'Professional Coach & Co-Owner', title: 'Legacy Coach', subtitle: 'Professional Coach & Co-Owner', shortBio: 'Jesse turned professional in 2003, later returning to peak competition with Steve Thompson in his corner. Today, he co-owns the club and passes on lessons of the ring.', fullBio: jesseBioLexical as any, certifications: [{ label: 'USA Boxing Level 2 Coach' }], image: (images['coach_jesse.png'] as Record<string, unknown>)?.id as string, sortOrder: 2 } })

    // Events
    await clearCollection(payload, 'events')
    await payload.create({ collection: 'events', data: { title: 'Golden Gloves Qualifier', tag: 'main-event', date: '2026-10-24T00:00:00.000Z', location: 'Underground Arena', description: 'The premier boxing qualifier event at the Underground Arena, featuring top-tier talent competing for a shot at the Golden Gloves title.', image: (images['event_main.png'] as Record<string, unknown>)?.id as string, ctaText: 'Register to Attend', isFeatured: true } })
    await payload.create({ collection: 'events', data: { title: 'Heavyweight Rumble', tag: 'local-spar', date: '2026-09-12T00:00:00.000Z', location: 'Gaines Boxing Club', description: 'Monthly heavyweight showcase featuring top tier local talent and upcoming club members.', image: (images['event_fight.png'] as Record<string, unknown>)?.id as string, ctaText: 'Details', isFeatured: false } })
    await payload.create({ collection: 'events', data: { title: 'Master Footwork', tag: 'workshop', date: '2026-09-18T00:00:00.000Z', location: 'Gaines Boxing Club', description: 'A technical workshop focused on defensive agility and ring control techniques.', image: (images['event_workshop.png'] as Record<string, unknown>)?.id as string, ctaText: 'Join Waitlist', isFeatured: false } })
    await payload.create({ collection: 'events', data: { title: 'Young Bloods VII', tag: 'exhibition', date: '2026-10-05T00:00:00.000Z', location: 'Gaines Boxing Club', description: 'Under-21 exhibition matches showcasing the future champions of Gaines Boxing Club.', image: (images['event_exhibition.png'] as Record<string, unknown>)?.id as string, ctaText: 'Get Tickets', isFeatured: false } })

    // Philosophy Pillars
    await clearCollection(payload, 'philosophy-pillars')
    await payload.create({ collection: 'philosophy-pillars', data: { icon: 'target', title: 'Technical Precision', description: 'Master the nuances of footwork, leverage, and defense with our proprietary pedagogical approach to the sweet science.', sortOrder: 1 } })
    await payload.create({ collection: 'philosophy-pillars', data: { icon: 'bolt', title: 'Physical Conditioning', description: 'Build an elite engine. Our curated high-intensity drills are designed to develop explosive power and metabolic longevity.', sortOrder: 2 } })
    await payload.create({ collection: 'philosophy-pillars', data: { icon: 'psychology', title: 'Mental Fortitude', description: 'Develop the psychological edge. Training at Gaines builds the focus and resilience required to overcome any adversity.', sortOrder: 3 } })
    await payload.create({ collection: 'philosophy-pillars', data: { icon: 'groups', title: 'Elite Community', description: 'Iron sharpens iron. Join a high-performance network of dedicated athletes, entrepreneurs, and professional strikers.', sortOrder: 4 } })

    // Quotes
    await clearCollection(payload, 'quotes')
    await payload.create({ collection: 'quotes', data: { text: "The sweet science isn't about the fight you see. It's about the discipline you don't.", attribution: 'Sam Gaines', sortOrder: 1 } })
    await payload.create({ collection: 'quotes', data: { text: 'True champions are built in the shadows.', attribution: 'Sam Gaines', sortOrder: 2 } })
    await payload.create({ collection: 'quotes', data: { text: "In the ring, there is no place to hide. The science of boxing reveals the true strength of a human being's spirit.", attribution: 'Sam Gaines', sortOrder: 3 } })

    // Timeline
    await clearCollection(payload, 'timeline-milestones')
    await payload.create({ collection: 'timeline-milestones', data: { year: '1974', title: 'The Basement Era', description: 'Opened in a 400sq ft basement in the Southside. No heaters, just heart.', icon: 'home', sortOrder: 1 } })
    await payload.create({ collection: 'timeline-milestones', data: { year: '1988', title: 'Regional Domination', description: 'Produced first National Golden Gloves champion. The gym moves to a warehouse facility.', icon: 'workspace_premium', sortOrder: 2 } })
    await payload.create({ collection: 'timeline-milestones', data: { year: '2005', title: 'The Pro Transition', description: 'Gaines Boxing becomes the official training ground for three world-title contenders.', icon: 'sports_kabaddi', sortOrder: 3 } })
    await payload.create({ collection: 'timeline-milestones', data: { year: 'Today', title: 'The Modern Institution', description: 'A state-of-the-art facility maintaining the same gritty philosophy of 1974.', icon: 'location_city', sortOrder: 4 } })

    // Training Schedule
    await clearCollection(payload, 'training-schedule')
    await payload.create({ collection: 'training-schedule', data: { day: 'Mondays', startTime: '5PM', endTime: '8PM', sortOrder: 1 } })
    await payload.create({ collection: 'training-schedule', data: { day: 'Thursdays', startTime: '6PM', endTime: '8PM', sortOrder: 2 } })

    // Site Settings (Globals)
    await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        siteName: 'Gaines Boxing Club',
        tagline: 'Building legacy through discipline, grit, and the relentless pursuit of excellence in the underground boxing circuit.',
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
        },
      },
    })

    // Join Form (upsert: create if missing, update if exists to converge on reruns)
    const formData = {
      title: 'Join the Club',
      confirmationType: 'message' as const,
      confirmationMessage: {
        root: { type: 'root', children: [{ type: 'paragraph', children: [{ type: 'text', text: 'Thank you for your interest in Gaines Boxing Club! We will be in touch shortly.' }] }], direction: 'ltr', format: '', indent: 0, version: 1 },
      },
      fields: [
        { name: 'firstName', label: 'First Name', blockType: 'text', required: true, width: 50 },
        { name: 'lastName', label: 'Last Name', blockType: 'text', required: true, width: 50 },
        { name: 'email', label: 'Email', blockType: 'email', required: true, width: 100 },
        { name: 'phone', label: 'Phone Number', blockType: 'text', required: false, width: 100 },
        {
          name: 'experience',
          label: 'Experience Level',
          blockType: 'select',
          required: false,
          width: 100,
          options: [
            { label: 'Beginner', value: 'beginner' }, { label: 'Intermediate', value: 'intermediate' }, { label: 'Advanced', value: 'advanced' }, { label: 'Professional', value: 'professional' },
          ],
        },
        { name: 'message', label: 'Tell us about your goals', blockType: 'textarea', required: false, width: 100 },
      ],
    }

    const existingForm = await payload.find({
      collection: 'forms',
      where: { title: { equals: 'Join the Club' } },
      limit: 1,
    })
    
    if (existingForm.docs.length > 0) {
      await payload.update({
        collection: 'forms',
        id: existingForm.docs[0].id,
        data: formData,
      })
    } else {
      await payload.create({
        collection: 'forms',
        data: formData,
      })
    }

    return NextResponse.json({ success: true, message: 'Seeding complete' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Seeding error:', error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
