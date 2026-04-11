import path from 'path'
import os from 'os'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { s3Storage } from '@payloadcms/storage-s3'
import sharp from 'sharp'
import { revalidateTag } from 'next/cache'
import type { GenerationType } from './lib/image-provenance'
import { processImageMetadata, readAndClean } from './lib/image-provenance'

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

// ---------------------------------------------------------------------------
// Cache Invalidation Hooks
// ---------------------------------------------------------------------------
// After any collection document changes, purge the Next.js data cache tag
// so Server Components re-fetch fresh data on the next request.
const buildCollectionRevalidateHook = (slug: string) => {
  const hook: import('payload').CollectionAfterChangeHook = async ({ doc }) => {
    try {
      revalidateTag(`payload-${slug}`, 'default')
    } catch {
      // revalidateTag may throw outside of a request context (e.g. during seed scripts).
      // Silently ignore -- seed scripts don't need cache invalidation.
    }
    return doc
  }
  return hook
}

const buildGlobalRevalidateHook = (slug: string) => {
  const hook: import('payload').GlobalAfterChangeHook = async ({ doc }) => {
    try {
      revalidateTag(`payload-${slug}`, 'default')
    } catch {
      // Same as above -- safe to ignore outside request context.
    }
    return doc
  }
  return hook
}

// ---------------------------------------------------------------------------
// Payload Configuration
// ---------------------------------------------------------------------------
export default buildConfig({
  secret: PAYLOAD_SECRET,

  db: postgresAdapter({
    pool: {
      connectionString: DATABASE_URI,
    },
    schemaName: 'gaines_boxing_club__cms',
  }),

  editor: lexicalEditor(),

  sharp,

  // -------------------------------------------------------------------------
  // Collections
  // -------------------------------------------------------------------------
  collections: [
    // -- Users (built-in auth) --
    {
      slug: 'users',
      auth: true,
      admin: {
        useAsTitle: 'email',
      },
      fields: [],
    },

    // -- Media (override built-in to require alt text + AI provenance) --
    {
      slug: 'media',
      upload: {
        formatOptions: {
          format: 'webp',
          options: {
            quality: 85,
          },
        },
        imageSizes: [
          {
            name: 'thumbnail',
            width: 400,
            height: 300,
            position: 'centre',
            formatOptions: {
              format: 'webp',
              options: {
                quality: 75,
              },
            },
          },
        ],
        adminThumbnail: 'thumbnail',
      },
      hooks: {
        afterChange: [buildCollectionRevalidateHook('media')],
        beforeChange: [
          // ---------------------------------------------------------------
          // Image Provenance Hook
          // Runs BEFORE the file is persisted to S3 (or local disk).
          // Handles:
          //   organic   -> scrub GPS + serial EXIF tags (privacy)
          //   enhanced  -> inject IPTC DigitalSourceType (compositeWithTrainedAlgorithmicMedia)
          //   generated -> inject IPTC DigitalSourceType (trainedAlgorithmicMedia)
          // ---------------------------------------------------------------
          async ({ data, req }) => {
            const generationType = (data.generationType ?? 'organic') as GenerationType

            // Only process when an actual file is being uploaded.
            // req.file is the multer file object (set by Payload's upload middleware).
            type MulFileShape = { path?: string; buffer?: Buffer; size?: number; originalname?: string }
            const file = (req as unknown as { file?: MulFileShape }).file
            if (!file?.path && !file?.buffer) return data

            let sourcePath: string | null = null
            let createdTmp = false

            try {
              if (file.path) {
                // Standard case: multer wrote the file to disk
                sourcePath = file.path
              } else if (file.buffer) {
                // Memory-buffered upload: write to a temp file first
                const tmpDir = os.tmpdir()
                sourcePath = path.join(tmpDir, `payload-upload-${Date.now()}-${file.originalname ?? 'img'}`)
                fs.writeFileSync(sourcePath, file.buffer)
                createdTmp = true
              }

              if (!sourcePath) return data

              const processedPath = await processImageMetadata(sourcePath, generationType)
              const processedBuffer = await readAndClean(processedPath)

              // Patch the multer file object so Payload/S3 plugin receives the
              // metadata-scrubbed buffer in place of the original.
              type MulFileShape = { path?: string; buffer?: Buffer; size?: number; originalname?: string }
              ;(req as unknown as { file: MulFileShape }).file = {
                ...file,
                buffer: processedBuffer,
                size: processedBuffer.length,
                // Clear path: tell Payload to use the buffer, not re-read from disk
                path: undefined,
              }
            } catch (err) {
              // Non-fatal: log the error but do not block the upload.
              // An upload with unmodified metadata is vastly preferable to a
              // dropped upload from a processing failure.
              console.error('[image-provenance] beforeChange hook failed, uploading without metadata changes:', err)
            } finally {
              if (createdTmp && sourcePath) {
                try { fs.unlinkSync(sourcePath) } catch { /* best-effort cleanup */ }
              }
            }

            return data
          },
        ],
      },
      fields: [
        {
          name: 'alt',
          type: 'text',
          required: true,
          admin: {
            description: 'Describe the image for accessibility (screen readers) and SEO.',
          },
        },
        {
          name: 'generationType',
          type: 'select',
          defaultValue: 'organic',
          required: true,
          options: [
            {
              label: 'Organic (Original Photography)',
              value: 'organic',
            },
            {
              label: 'AI Enhanced (Hybrid)',
              value: 'enhanced',
            },
            {
              label: 'AI Generated (Synthetic)',
              value: 'generated',
            },
          ],
          admin: {
            description:
              'Declare the provenance of this image. Sets IPTC DigitalSourceType metadata and drives Schema.org ImageObject properties (2026 AI Transparency Standard).',
          },
        },
      ],
    },

    // -- Coaches --
    {
      slug: 'coaches',
      admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'role', 'sortOrder'],
      },
      hooks: {
        afterChange: [buildCollectionRevalidateHook('coaches')],
      },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'role', type: 'text', required: true },
        {
          name: 'title',
          type: 'text',
          admin: { description: 'Display rank, e.g. "Master Elite", "Legacy Coach"' },
        },
        {
          name: 'subtitle',
          type: 'text',
          admin: { description: 'e.g. "Head Coach | Physical Prowess & Skill Development"' },
        },
        { name: 'shortBio', type: 'textarea', required: true },
        { name: 'fullBio', type: 'richText' },
        {
          name: 'certifications',
          type: 'array',
          fields: [{ name: 'label', type: 'text', required: true }],
        },
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'sortOrder', type: 'number', defaultValue: 0 },
      ],
    },

    // -- Events --
    {
      slug: 'events',
      admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'tag', 'date', 'isFeatured'],
      },
      hooks: {
        afterChange: [buildCollectionRevalidateHook('events')],
      },
      fields: [
        { name: 'title', type: 'text', required: true },
        {
          name: 'tag',
          type: 'select',
          options: [
            { label: 'Main Event', value: 'main-event' },
            { label: 'Local Spar', value: 'local-spar' },
            { label: 'Workshop', value: 'workshop' },
            { label: 'Exhibition', value: 'exhibition' },
          ],
        },
        { name: 'date', type: 'date', required: true },
        { name: 'location', type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'ctaText', type: 'text', defaultValue: 'Details' },
        {
          name: 'ctaLink',
          type: 'text',
          admin: { description: 'URL or tel: link for the CTA button. Leave empty if no link is needed.' },
        },
        { name: 'isFeatured', type: 'checkbox', defaultValue: false },
        {
          name: 'doorsOpen',
          type: 'text',
          admin: { description: 'e.g. "6:00 PM"' },
        },
        {
          name: 'fightsStart',
          type: 'text',
          admin: { description: 'e.g. "7:00 PM"' },
        },
        {
          name: 'fightCard',
          type: 'textarea',
          admin: { description: 'List each bout, one per line. e.g. "Fighter A vs Fighter B"' },
        },
        {
          name: 'amenities',
          type: 'array',
          admin: { description: 'Things available at the event (bar, food, etc.)' },
          fields: [{ name: 'amenity', type: 'text', required: true }],
        },
        {
          name: 'pricing',
          type: 'array',
          admin: { description: 'Ticket tiers for the event' },
          fields: [
            { name: 'tier', type: 'text', required: true, admin: { description: 'e.g. "Tier 1 (VIP)"' } },
            { name: 'location', type: 'text', required: true, admin: { description: 'e.g. "Ringside"' } },
            { name: 'price', type: 'text', required: true, admin: { description: 'e.g. "$75"' } },
          ],
        },
        {
          name: 'sponsors',
          type: 'array',
          admin: { description: 'Event sponsors' },
          fields: [{ name: 'name', type: 'text', required: true }],
        },
      ],
    },

    // -- Quotes --
    {
      slug: 'quotes',
      admin: {
        useAsTitle: 'attribution',
        defaultColumns: ['text', 'attribution', 'sortOrder'],
      },
      hooks: {
        afterChange: [buildCollectionRevalidateHook('quotes')],
      },
      fields: [
        { name: 'text', type: 'textarea', required: true },
        { name: 'attribution', type: 'text', required: true },
        { name: 'sortOrder', type: 'number', defaultValue: 0 },
      ],
    },

    // -- Timeline Milestones --
    {
      slug: 'timeline-milestones',
      admin: {
        useAsTitle: 'title',
        defaultColumns: ['year', 'title', 'sortOrder'],
      },
      hooks: {
        afterChange: [buildCollectionRevalidateHook('timeline-milestones')],
      },
      fields: [
        { name: 'year', type: 'text', required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
        {
          name: 'icon',
          type: 'text',
          admin: { description: 'Iconify icon ID, e.g. "material-symbols:home-outline" or "material-symbols:workspace-premium". Browse icons at https://icon-sets.iconify.design/material-symbols/' },
        },
        { name: 'sortOrder', type: 'number', defaultValue: 0 },
      ],
    },

    // -- Philosophy Pillars --
    {
      slug: 'philosophy-pillars',
      admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'sortOrder'],
      },
      hooks: {
        afterChange: [buildCollectionRevalidateHook('philosophy-pillars')],
      },
      fields: [
        {
          name: 'icon',
          type: 'text',
          required: true,
          admin: { description: 'Iconify icon ID, e.g. "material-symbols:target" or "material-symbols:bolt". Browse icons at https://icon-sets.iconify.design/material-symbols/' },
        },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
        { name: 'sortOrder', type: 'number', defaultValue: 0 },
      ],
    },

    // -- Training Schedule --
    {
      slug: 'training-schedule',
      admin: {
        useAsTitle: 'day',
        defaultColumns: ['day', 'startTime', 'endTime', 'sortOrder'],
      },
      hooks: {
        afterChange: [buildCollectionRevalidateHook('training-schedule')],
      },
      fields: [
        { name: 'day', type: 'text', required: true },
        { name: 'startTime', type: 'text', required: true },
        { name: 'endTime', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'sortOrder', type: 'number', defaultValue: 0 },
      ],
    },

    // -- Pages --
    {
      slug: 'pages',
      admin: {
        useAsTitle: 'label',
        defaultColumns: ['route', 'label', 'seoTitle'],
      },
      hooks: {
        afterChange: [buildCollectionRevalidateHook('pages')],
      },
      fields: [
        { name: 'route', type: 'text', required: true, unique: true },
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: {
            readOnly: true,
            description: 'Auto-synced from navigation config. Do not edit manually.',
          },
        },
        { name: 'seoTitle', type: 'text' },
        { name: 'seoDescription', type: 'textarea' },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
        { name: 'heroHeading', type: 'text' },
        { name: 'heroSubheading', type: 'text' },
        { name: 'heroTagline', type: 'text' },
        {
          name: 'heroCta',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', required: true },
            {
              name: 'linkType',
              type: 'select',
              options: [
                { label: 'Internal', value: 'internal' },
                { label: 'External', value: 'external' },
              ],
              defaultValue: 'internal',
            },
            {
              name: 'internalLink',
              type: 'relationship',
              relationTo: 'pages',
              admin: {
                condition: (_, siblingData) => siblingData?.linkType === 'internal',
              },
            },
            {
              name: 'externalUrl',
              type: 'text',
              admin: {
                condition: (_, siblingData) => siblingData?.linkType === 'external',
              },
            },
            {
              name: 'style',
              type: 'select',
              options: [
                { label: 'Primary', value: 'primary' },
                { label: 'Secondary', value: 'secondary' },
              ],
              defaultValue: 'primary',
              admin: {
                description: 'Primary = solid black button, Secondary = outlined transparent button',
              },
            },
          ],
        },
      ],
    },

    // -- Alert Banners --
    {
      slug: 'alert-banners',
      admin: {
        useAsTitle: 'copy',
        defaultColumns: ['copy', 'icon', 'isActive'],
        description: 'Short announcement banners displayed at the top of every page. Banners alternate background colors, starting with Kiln Orange.',
      },
      hooks: {
        afterChange: [buildCollectionRevalidateHook('alert-banners')],
      },
      fields: [
        {
          name: 'icon',
          type: 'text',
          admin: {
            description: 'Iconify icon ID, e.g. "material-symbols:notifications" or "material-symbols:campaign". Browse icons at https://icon-sets.iconify.design/material-symbols/',
          },
        },
        {
          name: 'copy',
          type: 'textarea',
          required: true,
          admin: {
            description: 'The banner message text displayed to site visitors.',
          },
        },
        {
          name: 'isActive',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'When unchecked, this banner will not be shown on the website.',
          },
        },
        { name: 'sortOrder', type: 'number', defaultValue: 0 },
      ],
    },
  ],

  // -------------------------------------------------------------------------
  // Globals
  // -------------------------------------------------------------------------
  globals: [
    {
      slug: 'site-settings',
      admin: {
        group: 'Settings',
      },
      hooks: {
        afterChange: [buildGlobalRevalidateHook('site-settings')],
      },
      fields: [
        { name: 'siteName', type: 'text', defaultValue: 'Gaines Boxing Club' },
        { name: 'tagline', type: 'textarea' },
        { name: 'address', type: 'text' },
        { name: 'phone', type: 'text' },
        { name: 'email', type: 'text' },
        { name: 'logo', type: 'upload', relationTo: 'media' },
        {
          name: 'socialLinks',
          type: 'array',
          fields: [
            { name: 'platform', type: 'text', required: true },
            { name: 'url', type: 'text', required: true },
            {
              name: 'iconName',
              type: 'text',
              required: true,
              admin: { description: 'Iconify icon ID, e.g. "material-symbols:share" or "mdi:facebook". Browse all icon sets at https://icon-sets.iconify.design/' },
            },
          ],
        },
        {
          name: 'structuredData',
          type: 'group',
          label: 'Structured Data (SEO)',
          admin: {
            description: 'Fields used to generate JSON-LD structured data for search engines.',
          },
          fields: [
            { name: 'organizationName', type: 'text' },
            { name: 'organizationLogo', type: 'upload', relationTo: 'media' },
            { name: 'foundingDate', type: 'text', admin: { description: 'e.g. "1974"' } },
            { name: 'founderName', type: 'text' },
            { name: 'streetAddress', type: 'text' },
            { name: 'addressLocality', type: 'text', admin: { description: 'City' } },
            { name: 'addressRegion', type: 'text', admin: { description: 'State abbreviation' } },
            { name: 'postalCode', type: 'text' },
            { name: 'country', type: 'text', defaultValue: 'US' },
            { name: 'latitude', type: 'number' },
            { name: 'longitude', type: 'number' },
            {
              name: 'businessHours',
              type: 'array',
              fields: [
                { name: 'dayOfWeek', type: 'text', required: true },
                { name: 'opens', type: 'text', required: true },
                { name: 'closes', type: 'text', required: true },
              ],
            },
            {
              name: 'priceRange',
              type: 'text',
              admin: { description: 'e.g. "$$"' },
            },
          ],
        },
      ],
    },
  ],

  // -------------------------------------------------------------------------
  // Plugins
  // -------------------------------------------------------------------------
  plugins: [
    formBuilderPlugin({
      fields: {
        text: true,
        textarea: true,
        select: true,
        email: true,
        checkbox: true,
        number: true,
        message: true,
      },
      formOverrides: {
        access: {
          read: () => true,
        },
      },
      formSubmissionOverrides: {
        access: {
          create: () => true,
        },
        // NOTE: Email transport is intentionally disabled for local dev.
        // For production, enable a robust Email Transport (e.g., Resend via SMTP)
        // so staff receive form submission notifications.
      },
    }),
    mcpPlugin({
      collections: {
        coaches: { enabled: true },
        events: { enabled: true },
        quotes: { enabled: true },
        'timeline-milestones': { enabled: true },
        'philosophy-pillars': { enabled: true },
        'training-schedule': { enabled: true },
        pages: { enabled: true },
        media: { enabled: true },
        'alert-banners': { enabled: true },
      },
      globals: {
        'site-settings': { enabled: { find: true, update: true } },
      },
    }),
    s3Storage({
      collections: {
        media: {
          prefix: 'gaines-boxing-club-v2/public/images',
          generateFileURL: ({ filename, prefix }) => {
            const publicUrl = process.env.S3_PUBLIC_URL ?? ''
            return publicUrl ? `${publicUrl}/${prefix}/${filename}` : `/images/${filename}`
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
        // forcePathStyle is required for Cloudflare R2 and MinIO
        forcePathStyle: true,
      },
    }),
  ],

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  onInit: async (payload) => {
    // Only seed the MCP API key when explicitly enabled via env var
    if (process.env.SEED_MCP_KEY !== 'true') return

    const apiKey = process.env.PAYLOAD_MCP_API_KEY
    if (!apiKey) {
      payload.logger.warn('SEED_MCP_KEY is true but PAYLOAD_MCP_API_KEY is not set. Skipping API key seed.')
      return
    }
    try {
      const existing = await payload.find({
        collection: 'payload-mcp-api-keys',
        where: { apiKey: { equals: apiKey } },
        limit: 1,
      })
      if (existing.docs.length === 0) {
        // Find an existing user to attach the API key to
        const adminUsers = await payload.find({ collection: 'users', limit: 1 })
        if (adminUsers.docs.length === 0) {
          payload.logger.warn('No users exist yet. Skipping MCP API key seed. Please register the first admin user then restart the server.')
          return
        }
        
        await payload.create({
          collection: 'payload-mcp-api-keys',
          data: {
            name: 'Gemini Local Seed Key',
            apiKey: apiKey,
            user: adminUsers.docs[0].id,
            hasFullAccess: false,
            coaches_find: true, coaches_create: true, coaches_update: true, coaches_delete: true,
            events_find: true, events_create: true, events_update: true, events_delete: true,
            quotes_find: true, quotes_create: true, quotes_update: true, quotes_delete: true,
            'timeline-milestones_find': true, 'timeline-milestones_create': true, 'timeline-milestones_update': true, 'timeline-milestones_delete': true,
            'philosophy-pillars_find': true, 'philosophy-pillars_create': true, 'philosophy-pillars_update': true, 'philosophy-pillars_delete': true,
            'training-schedule_find': true, 'training-schedule_create': true, 'training-schedule_update': true, 'training-schedule_delete': true,
            pages_find: true, pages_create: true, pages_update: true, pages_delete: true,
            media_find: true, media_create: true, media_update: true, media_delete: true,
            forms_find: true, forms_create: true, forms_update: true, forms_delete: true,
            'form-submissions_find': true, 'form-submissions_create': true, 'form-submissions_update': true, 'form-submissions_delete': true,
            'site-settings_find': true, 'site-settings_update': true,
            'alert-banners_find': true, 'alert-banners_create': true, 'alert-banners_update': true, 'alert-banners_delete': true,
          }
        })
        payload.logger.info('Successfully seeded Gemini Local Seed Key')
      }
    } catch (err) {
      payload.logger.error('Failed to seed API key in onInit:')
      console.error(err)
    }
  },
})
