import pg from 'pg';

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URI
});

async function run() {
  try {
    await client.connect();
    
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'gaines_boxing_club__cms'
    `);
    
    for (const row of tables.rows) {
      await client.query(`DROP TABLE gaines_boxing_club__cms."${row.table_name}" CASCADE`);
      console.log('Dropped table:', row.table_name);
    }
    console.log('Clean slate ready.');

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await client.end();
  }
}

run();
