import pg from 'pg';

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URI
});

function escapeIdentifier(identifier) {
  return '"' + identifier.replace(/"/g, '""') + '"';
}

async function run() {
  const forceFlag = process.argv.includes('--force');
  if (!forceFlag) {
    console.error(
      'WARNING: This script drops ALL tables in the gaines_boxing_club__cms schema.\n' +
      'Pass --force to confirm execution.\n' +
      'Usage: node check-db.mjs --force'
    );
    process.exit(1);
  }

  try {
    await client.connect();
    
    const schema = escapeIdentifier('gaines_boxing_club__cms');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'gaines_boxing_club__cms'
    `);
    
    for (const row of tables.rows) {
      const tableName = escapeIdentifier(row.table_name);
      await client.query(`DROP TABLE ${schema}.${tableName} CASCADE`);
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
