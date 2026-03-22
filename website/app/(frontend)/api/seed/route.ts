import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import { syncPages } from '@/lib/sync-pages'

const API_KEY = process.env.PAYLOAD_MCP_API_KEY || 'd47109a7-d749-44af-8e88-8a71e6b1bac8'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (key !== API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Step 0: Sync pages from navLinks before seeding content
  await syncPages()

  const payload = await getPayload({ config })
  const IMAGES_DIR = path.resolve(process.cwd(), 'public', 'images')

  // --- Helpers ---
  async function clearCollection(slug: any): Promise<void> {
    try {
      await payload.delete({ collection: slug, where: { id: { exists: true } } })
    } catch {}
  }

  async function uploadImage(filename: string, altText: string): Promise<any> {
    const existing = await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
    })

    if (existing.docs.length > 0) return existing.docs[0]

    const filePath = path.join(IMAGES_DIR, filename)
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`)
    }

    const fileData = fs.readFileSync(filePath)
    
    // We must pass a file object in the options for Media
    const doc = await payload.create({
      collection: 'media',
      data: { alt: altText },
      file: {
        data: fileData,
        mimetype: 'image/png', // or derive from ext
        name: filename,
        size: fileData.length,
      },
    })
    return doc
  }

  try {
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
      images[filename] = await uploadImage(filename, alt)
    }

    // Coaches
    await clearCollection('coaches')
    await payload.create({ collection: 'coaches', data: { name: 'Steve Thompson', role: 'Head Coach', title: 'Master Elite', subtitle: 'Head Coach | Physical Prowess & Skill Development', shortBio: 'With over 20 years in the heavy-weight circuit, Steve brings a scientific approach to raw power. His training regimens are legendary for building both the body and the unbreakable spirit required for the championship rounds.', certifications: [{ label: 'USA Boxing Level 3 Coach' }, { label: '2x Regional Golden Gloves Finalist' }, { label: 'NSCA Certified Strength Coach' }], image: images['coach_steve.png']?.id, sortOrder: 1 } })
    await payload.create({ collection: 'coaches', data: { name: 'Jesse Bryan', role: 'Technical Lead', title: 'Legacy Coach', subtitle: 'Technical Lead | The Sweet Science', shortBio: 'A direct protege of Sam Gaines, Jesse is the guardian of the "Gaines Style." His focus is on the intricate dance of footwork and the precision of the counter-punch, keeping the club\'s technical DNA alive for the next generation.', certifications: [{ label: 'USA Boxing Level 2 Coach' }, { label: '41-6 Amateur Record' }, { label: 'Sam Gaines Personal Protege' }], image: images['coach_jesse.png']?.id, sortOrder: 2 } })

    // Events
    await clearCollection('events')
    await payload.create({ collection: 'events', data: { title: 'Golden Gloves Qualifier', tag: 'main-event', date: '2026-10-24T00:00:00.000Z', location: 'Underground Arena', description: 'The premier boxing qualifier event at the Underground Arena, featuring top-tier talent competing for a shot at the Golden Gloves title.', image: images['event_main.png']?.id, ctaText: 'Register to Attend', isFeatured: true } })
    await payload.create({ collection: 'events', data: { title: 'Heavyweight Rumble', tag: 'local-spar', date: '2026-09-12T00:00:00.000Z', location: 'Gaines Boxing Club', description: 'Monthly heavyweight showcase featuring top tier local talent and upcoming club members.', image: images['event_fight.png']?.id, ctaText: 'Details', isFeatured: false } })
    await payload.create({ collection: 'events', data: { title: 'Master Footwork', tag: 'workshop', date: '2026-09-18T00:00:00.000Z', location: 'Gaines Boxing Club', description: 'A technical workshop focused on defensive agility and ring control techniques.', image: images['event_workshop.png']?.id, ctaText: 'Join Waitlist', isFeatured: false } })
    await payload.create({ collection: 'events', data: { title: 'Young Bloods VII', tag: 'exhibition', date: '2026-10-05T00:00:00.000Z', location: 'Gaines Boxing Club', description: 'Under-21 exhibition matches showcasing the future champions of Gaines Boxing Club.', image: images['event_exhibition.png']?.id, ctaText: 'Get Tickets', isFeatured: false } })

    // Philosophy Pillars
    await clearCollection('philosophy-pillars')
    await payload.create({ collection: 'philosophy-pillars', data: { icon: 'target', title: 'Technical Precision', description: 'Master the nuances of footwork, leverage, and defense with our proprietary pedagogical approach to the sweet science.', sortOrder: 1 } })
    await payload.create({ collection: 'philosophy-pillars', data: { icon: 'bolt', title: 'Physical Conditioning', description: 'Build an elite engine. Our curated high-intensity drills are designed to develop explosive power and metabolic longevity.', sortOrder: 2 } })
    await payload.create({ collection: 'philosophy-pillars', data: { icon: 'psychology', title: 'Mental Fortitude', description: 'Develop the psychological edge. Training at Gaines builds the focus and resilience required to overcome any adversity.', sortOrder: 3 } })
    await payload.create({ collection: 'philosophy-pillars', data: { icon: 'groups', title: 'Elite Community', description: 'Iron sharpens iron. Join a high-performance network of dedicated athletes, entrepreneurs, and professional strikers.', sortOrder: 4 } })

    // Quotes
    await clearCollection('quotes')
    await payload.create({ collection: 'quotes', data: { text: "The sweet science isn't about the fight you see. It's about the discipline you don't.", attribution: 'Sam Gaines', sortOrder: 1 } })
    await payload.create({ collection: 'quotes', data: { text: 'True champions are built in the shadows.', attribution: 'Sam Gaines', sortOrder: 2 } })
    await payload.create({ collection: 'quotes', data: { text: "In the ring, there is no place to hide. The science of boxing reveals the true strength of a human being's spirit.", attribution: 'Sam Gaines', sortOrder: 3 } })

    // Timeline
    await clearCollection('timeline-milestones')
    await payload.create({ collection: 'timeline-milestones', data: { year: '1974', title: 'The Basement Era', description: 'Opened in a 400sq ft basement in the Southside. No heaters, just heart.', icon: 'home', sortOrder: 1 } })
    await payload.create({ collection: 'timeline-milestones', data: { year: '1988', title: 'Regional Domination', description: 'Produced first National Golden Gloves champion. The gym moves to a warehouse facility.', icon: 'workspace_premium', sortOrder: 2 } })
    await payload.create({ collection: 'timeline-milestones', data: { year: '2005', title: 'The Pro Transition', description: 'Gaines Boxing becomes the official training ground for three world-title contenders.', icon: 'sports_kabaddi', sortOrder: 3 } })
    await payload.create({ collection: 'timeline-milestones', data: { year: 'Today', title: 'The Modern Institution', description: 'A state-of-the-art facility maintaining the same gritty philosophy of 1974.', icon: 'location_city', sortOrder: 4 } })

    // Training Schedule
    await clearCollection('training-schedule')
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

    // Join Form
    const existingForm = await payload.find({
      collection: 'forms',
      where: { title: { equals: 'Join the Club' } },
      limit: 1,
    })
    
    if (existingForm.docs.length === 0) {
      await payload.create({
        collection: 'forms',
        data: {
          title: 'Join the Club',
          confirmationType: 'message',
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
        },
      })
    }

    return NextResponse.json({ success: true, message: 'Seeding complete' })
  } catch (error: any) {
    console.error('Seeding error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
