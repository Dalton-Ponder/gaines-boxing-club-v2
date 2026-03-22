// ---------------------------------------------------------------------------
// JSON-LD Structured Data Generators
// ---------------------------------------------------------------------------
// Pure TypeScript -- no external schema.org library needed.
// All URLs are absolute, using NEXT_PUBLIC_SITE_URL.
// ---------------------------------------------------------------------------

// F1 fix: Read env at call time, not module scope. Strip trailing slash.
function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return url.replace(/\/+$/, '')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SiteSettings = Record<string, any>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PageData = Record<string, any>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventData = Record<string, any>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CoachData = Record<string, any>

// ---------------------------------------------------------------------------
// Organization + LocalBusiness + SportsActivityLocation
// ---------------------------------------------------------------------------
export function generateOrganizationSchema(settings: SiteSettings) {
  const siteUrl = getSiteUrl()
  const sd = settings.structuredData || {}
  const logoUrl = sd.organizationLogo?.url
    ? `${siteUrl}${sd.organizationLogo.url}`
    : undefined

  const socialLinks = (settings.socialLinks || [])
    .map((l: { url?: string }) => l.url)
    .filter(Boolean)

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'LocalBusiness', 'SportsActivityLocation'],
    name: sd.organizationName || settings.siteName || 'Gaines Boxing Club',
    url: siteUrl,
    description: settings.tagline || '',
    // F6 fix: use conditional spread for foundingDate
    ...(sd.foundingDate && { foundingDate: sd.foundingDate }),
    ...(logoUrl && { logo: logoUrl }),
    ...(socialLinks.length > 0 && { sameAs: socialLinks }),
    ...(settings.phone && { telephone: settings.phone }),
    ...(settings.email && { email: settings.email }),
    ...(sd.priceRange && { priceRange: sd.priceRange }),
  }

  // Founder
  if (sd.founderName) {
    schema.founder = {
      '@type': 'Person',
      name: sd.founderName,
    }
  }

  // Address
  if (sd.streetAddress) {
    schema.address = {
      '@type': 'PostalAddress',
      streetAddress: sd.streetAddress,
      addressLocality: sd.addressLocality || '',
      addressRegion: sd.addressRegion || '',
      postalCode: sd.postalCode || '',
      addressCountry: sd.country || 'US',
    }
  }

  // Geo -- use explicit null checks to preserve valid zero coordinates
  if (sd.latitude != null && sd.longitude != null) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: sd.latitude,
      longitude: sd.longitude,
    }
  }

  // Opening Hours
  if (sd.businessHours && sd.businessHours.length > 0) {
    schema.openingHoursSpecification = sd.businessHours.map(
      (h: { dayOfWeek: string; opens: string; closes: string }) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: h.dayOfWeek,
        opens: h.opens,
        closes: h.closes,
      })
    )
  }

  return schema
}

// ---------------------------------------------------------------------------
// WebSite
// ---------------------------------------------------------------------------
export function generateWebSiteSchema(settings: SiteSettings) {
  const siteUrl = getSiteUrl()
  // F2 fix: removed SearchAction -- no /search route exists
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: settings.siteName || 'Gaines Boxing Club',
    url: siteUrl,
  }
}

// ---------------------------------------------------------------------------
// WebPage
// ---------------------------------------------------------------------------
export function generateWebPageSchema(
  pageData: PageData | null,
  settings: SiteSettings,
  route: string,
  label: string
) {
  const siteUrl = getSiteUrl()
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: pageData?.seoTitle || `${label} | ${settings.siteName || 'Gaines Boxing Club'}`,
    description: pageData?.seoDescription || settings.tagline || '',
    url: `${siteUrl}${route === '/' ? '' : route}`,
    isPartOf: {
      '@type': 'WebSite',
      name: settings.siteName || 'Gaines Boxing Club',
      url: siteUrl,
    },
    breadcrumb: generateBreadcrumbSchema(route, label),
  }
}

// ---------------------------------------------------------------------------
// BreadcrumbList
// ---------------------------------------------------------------------------
export function generateBreadcrumbSchema(route: string, label: string) {
  const siteUrl = getSiteUrl()
  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: siteUrl,
    },
  ]

  if (route !== '/') {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: label,
      item: `${siteUrl}${route}`,
    })
  }

  return {
    '@type': 'BreadcrumbList',
    itemListElement: items,
  }
}

// ---------------------------------------------------------------------------
// Event
// ---------------------------------------------------------------------------
// F7 fix: accept organizationName param instead of hardcoding
export function generateEventSchema(event: EventData, organizationName = 'Gaines Boxing Club') {
  const siteUrl = getSiteUrl()
  const imageUrl =
    event.image && typeof event.image === 'object' && event.image.url
      ? `${siteUrl}${event.image.url}`
      : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description || '',
    startDate: event.date,
    ...(imageUrl && { image: imageUrl }),
    location: event.location
      ? {
          '@type': 'Place',
          name: event.location,
        }
      : undefined,
    organizer: {
      '@type': 'Organization',
      name: organizationName,
      url: siteUrl,
    },
  }
}

// ---------------------------------------------------------------------------
// Person (Coach)
// ---------------------------------------------------------------------------
// F7 fix: accept organizationName param instead of hardcoding
export function generatePersonSchema(coach: CoachData, organizationName = 'Gaines Boxing Club') {
  const siteUrl = getSiteUrl()
  const imageUrl =
    coach.image && typeof coach.image === 'object' && coach.image.url
      ? `${siteUrl}${coach.image.url}`
      : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: coach.name,
    jobTitle: coach.role || coach.title || '',
    description: coach.shortBio || '',
    ...(imageUrl && { image: imageUrl }),
    worksFor: {
      '@type': 'Organization',
      name: organizationName,
      url: siteUrl,
    },
  }
}

// ---------------------------------------------------------------------------
// Helper: Render schemas to a sanitized JSON-LD string
// ---------------------------------------------------------------------------
export function jsonLdScript(schemas: Record<string, unknown>[]) {
  if (schemas.length === 0) return null
  const merged = schemas.length === 1 ? schemas[0] : schemas
  let json = JSON.stringify(merged)

  // Sanitize: prevent script-breakout XSS and Unicode line-separator issues
  json = json
    .replace(/<\/script/gi, '<\\/script')
    .replace(/<!--/g, '<\\!--')
    .replace(/-->/g, '--\\>')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')

  return json
}
