const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://gaines_boxing_club_cms_user:Admin123@127.0.0.1:6432/master_agency_db'
  });
  await client.connect();
  const res = await client.query('SELECT id, route, label, seo_title, seo_description FROM gaines_boxing_club__cms.pages');
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}
run();
