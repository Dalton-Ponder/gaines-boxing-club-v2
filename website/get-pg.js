const { Client } = require('pg');

async function run() {
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
    const res = await client.query('SELECT id, route, label, seo_title, seo_description FROM gaines_boxing_club__cms.pages');
    console.log(JSON.stringify(res.rows, null, 2));
  } finally {
    await client.end();
  }
}
run().catch((err) => {
  console.error('Error running script:', err);
  process.exit(1);
});