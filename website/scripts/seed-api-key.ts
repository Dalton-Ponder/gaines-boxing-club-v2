import { getPayload } from 'payload'
import config from '../payload.config'

async function seedApiKey() {
  const payload = await getPayload({ config })

  // Payload MCP plugin creates a collection internally called 'payload-mcp-api-keys'
  // Let's create the API key document with all permissions granted.
  const apiKey = 'd47109a7-d749-44af-8e88-8a71e6b1bac8'
  
  try {
    const adminUsers = await payload.find({ collection: 'users', limit: 1 })
    if (adminUsers.docs.length === 0) {
      console.error('No users exist yet! Please create an admin user in the UI first.')
      process.exit(1)
    }

    // Check if it already exists
    const existingIds = await payload.find({
      collection: 'payload-mcp-api-keys',
      where: { apiKey: { equals: apiKey } },
      limit: 1,
    })

    if (existingIds.docs.length > 0) {
      console.log('API Key already exists. Updating permissions to be sure...')
      await payload.update({
        collection: 'payload-mcp-api-keys',
        id: existingIds.docs[0].id,
        data: {
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
        }
      })
      console.log('API Key permissions updated.')
    } else {
      console.log('Creating new API Key...')
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
        }
      })
      console.log('API Key created successfully.')
    }
  } catch (err) {
    console.error('Failed to seed API key:', err)
  }
  process.exit(0)
}

seedApiKey()
