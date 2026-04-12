/**
 * One-off content update script for Gaines Boxing Club v2.
 * Run with: pnpm exec tsx --env-file=.env scripts/update-event-content.ts
 */

import { getPayload } from 'payload'
import config from '../payload.config'

async function main() {
  const payload = await getPayload({ config })

  // -------------------------------------------------------------------------
  // 1. Update the featured event
  // -------------------------------------------------------------------------
  console.log('Fetching featured event...')
  const eventsResult = await payload.find({
    collection: 'events',
    where: { isFeatured: { equals: true } },
    limit: 1,
    depth: 0,
  })

  if (eventsResult.docs.length === 0) {
    console.error('No featured event found. Skipping event update.')
  } else {
    const eventId = eventsResult.docs[0].id
    console.log(`Found event ID: ${eventId} — "${eventsResult.docs[0].title}"`)

    await payload.update({
      collection: 'events',
      id: eventId,
      data: {
        title: 'Clash at the Capital 3',
        description:
          "Gaines Boxing Club is bringing the heat back to downtown for the third installment of the city's premier fight night. After two massive events, the stakes are raised. Come witness the skill, the power, and the heart of the region's toughest fighters as they go toe-to-toe in the ring. This is not just a boxing match. It is the ultimate Saturday night out.",
        location: 'Capitol Plaza Hotel and Convention Center (Downtown Jefferson City)',
        doorsOpen: '6:00 PM',
        fightsStart: '7:00 PM',
        ctaText: 'Call Jesse Bryan for Tickets',
        ctaLink: 'tel:+15732917594',
        fightCard: '',
        amenities: [
          { amenity: 'High-Octane Fights: Non-stop action from the first bell to the main event' },
          { amenity: 'Fully stocked bar to keep the spirits high' },
          { amenity: 'Delicious food catering available on-site' },
        ],
        pricing: [
          { tier: 'Tier 1 (VIP)', location: 'Ringside', price: '$75' },
          { tier: 'Tier 2', location: 'Inner perimeter', price: '$60' },
          { tier: 'Tier 3', location: 'Outer perimeter', price: '$50' },
        ],
        sponsors: [
          { name: 'Accord Mortgage' },
          { name: 'The Bickel Group' },
          { name: 'Bodenhamer Eye Consultant' },
          { name: 'The Busby Insurance Group - Allstate Insurance' },
          { name: 'Freeman Mortuary' },
          { name: "Graham's E-Z Park" },
          { name: 'Jefferson City Flying Service' },
          { name: 'Johnathan Shinkle - Farm Bureau' },
          { name: 'Kee Construction Services' },
          { name: 'Koebels ATA' },
          { name: 'Nicole Parker Thompson - American Family Insurance' },
          { name: 'Sam Gaines Construction' },
          { name: 'Steffen Med Spa' },
          { name: 'We B Smokin' },
        ],
      },
    })
    console.log('Featured event updated successfully.')
  }

  // -------------------------------------------------------------------------
  // 2. Create "Book a Session" form if it does not exist
  // -------------------------------------------------------------------------
  console.log('Checking for Book a Session form...')
  const formResult = await payload.find({
    collection: 'forms',
    where: { title: { equals: 'Book a Session' } },
    limit: 1,
  })

  if (formResult.docs.length > 0) {
    console.log('Book a Session form already exists. Skipping creation.')
  } else {
    await payload.create({
      collection: 'forms',
      data: {
        title: 'Book a Session',
        fields: [
          { blockType: 'text', name: 'firstName', label: 'First Name', required: true, width: 50 },
          { blockType: 'text', name: 'lastName', label: 'Last Name', required: true, width: 50 },
          { blockType: 'email', name: 'email', label: 'Email Address', required: true, width: 100 },
          { blockType: 'text', name: 'phone', label: 'Phone Number', required: false, width: 100 },
          {
            blockType: 'select',
            name: 'sessionType',
            label: 'Session Type',
            required: true,
            width: 100,
            options: [
              { label: 'Private 1-on-1 Training', value: 'private' },
              { label: 'Group Class', value: 'group' },
              { label: 'Open Gym', value: 'open-gym' },
            ],
          },
          {
            blockType: 'textarea',
            name: 'notes',
            label: 'Anything else we should know?',
            required: false,
            width: 100,
          },
        ],
        confirmationType: 'message',
        confirmationMessage: {
          root: {
            type: 'root',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                type: 'paragraph',
                format: '',
                indent: 0,
                version: 1,
                children: [
                  {
                    type: 'text',
                    text: "Thanks for reaching out! We will be in touch shortly to confirm your session.",
                    version: 1,
                  },
                ],
              },
            ],
          },
        },
      } as Parameters<typeof payload.create>[0]['data'],
    })
    console.log('Book a Session form created successfully.')
  }

  // -------------------------------------------------------------------------
  // 3. Update alert banners - remove em dashes, friendlier tone
  // -------------------------------------------------------------------------
  console.log('Checking alert banners for em dashes...')
  const allBanners = [];
  let bannerPage = 1;
  let bannerHasMore = true;
  const bannerLimit = 50;

  while (bannerHasMore) {
    const banners = await payload.find({
      collection: 'alert-banners',
      limit: bannerLimit,
      page: bannerPage,
    });
    allBanners.push(...banners.docs);
    bannerHasMore = banners.hasNextPage;
    bannerPage++;
  }

  for (const banner of allBanners) {
    const original = banner.copy as string
    if (!original) continue
    // Replace em dash and its HTML entity variants
    const updated = original
      .replace(/\u2014/g, ' - ')
      .replace(/&mdash;/g, ' - ')
      .replace(/--/g, '-')
    if (updated !== original) {
      await payload.update({
        collection: 'alert-banners',
        id: banner.id,
        data: { copy: updated },
      })
      console.log(`Updated banner ${banner.id}: "${original}" -> "${updated}"`)
    }
  }

  // -------------------------------------------------------------------------
  // 4. Update pages - remove em dashes
  // -------------------------------------------------------------------------
  console.log('Checking pages for em dashes...')
  const allPages = [];
  let pagePage = 1;
  let pageHasMore = true;
  const pageLimit = 50;

  while (pageHasMore) {
    const pages = await payload.find({
      collection: 'pages',
      limit: pageLimit,
      page: pagePage,
    });
    allPages.push(...pages.docs);
    pageHasMore = pages.hasNextPage;
    pagePage++;
  }

  for (const page of allPages) {
    const fields = ['heroHeading', 'heroSubheading', 'heroTagline', 'seoTitle', 'seoDescription'] as const
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, string> = {}
    let hasChanges = false

    for (const field of fields) {
      const val = (page as Record<string, unknown>)[field] as string | undefined
      if (!val) continue
      const cleaned = val.replace(/\u2014/g, ' - ').replace(/&mdash;/g, ' - ')
      if (cleaned !== val) {
        updates[field] = cleaned
        hasChanges = true
        console.log(`Page ${page.route} | ${field}: "${val}" -> "${cleaned}"`)
      }
    }

    if (hasChanges) {
      await payload.update({ collection: 'pages', id: page.id, data: updates })
    }
  }

  console.log('\nAll content updates complete.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})