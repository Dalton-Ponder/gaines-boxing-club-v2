import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
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
    schemaName: 'gaines_boxing_club__cms',
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
  plugins: [
    mcpPlugin({
      collections: {
        posts: {
          enabled: true,
        },
      },
      globals: {
        'site-settings': { enabled: { find: true, update: true } },
      },
    }),
  ],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
