const { Client } = require('pg');

async function updateSEO() {
  const connectionString = process.env.DATABASE_URI;
  if (!connectionString) {
    console.error('Missing required environment variable: DATABASE_URI');
    process.exit(1);
  }

  const client = new Client({
    connectionString: connectionString
  });

  await client.connect();

  try {
    await client.query('BEGIN');

    const updates = [
      {
        route: '/',
        seoTitle: 'Home | Gaines Boxing Club',
        seoDesc: 'Join Gaines Boxing Club, where your boxing journey truly begins. We build legacy through technical precision, grit, and the relentless pursuit of excellence.'
      },
      {
        route: '/legacy',
        seoTitle: 'Legacy | Gaines Boxing Club',
        seoDesc: 'Discover the 50-year legacy of Gaines Boxing Club. Founded by Sam Gaines in 1974, we have evolved from a basement gym into a premier training facility.'
      },
      {
        route: '/coaches',
        seoTitle: 'Coaches | Gaines Boxing Club',
        seoDesc: 'Meet the elite coaches at Gaines Boxing Club. Professional Coaches Steve Thompson and Jesse Bryan continue the legacy of Sam Gaines with "no excuses" training.'
      },
      {
        route: '/philosophy',
        seoTitle: 'Philosophy | Gaines Boxing Club',
        seoDesc: 'Explore the Gaines Boxing Club philosophy. We go beyond fitness, forging character through technical mastery, unwavering discipline, and an elite community.'
      },
      {
        route: '/schedule',
        seoTitle: 'Schedule | Gaines Boxing Club',
        seoDesc: 'View the training schedule and upcoming events at Gaines Boxing Club. Join our elite coaching sessions on Mondays and Thursdays. Start your legacy today.'
      }
    ];

    for (const update of updates) {
      console.log(`Updating ${update.route}...`);
      // Payload usually stores single quotes / text as is.
      await client.query(
        'UPDATE gaines_boxing_club__cms.pages SET seo_title = $1, seo_description = $2 WHERE route = $3',
        [update.seoTitle, update.seoDesc, update.route]
      );
    }

    await client.query('COMMIT');

    // verify
    const res = await client.query('SELECT route, seo_title, seo_description FROM gaines_boxing_club__cms.pages');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

updateSEO().catch(console.error);