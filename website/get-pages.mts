import payload from 'payload';
import configPromise from './payload.config.ts';

async function getPages() {
  const payloadInstance = await payload.getPayload({ config: configPromise });
  const pages = await payloadInstance.find({
    collection: 'pages',
    limit: 100,
  });
  console.log(JSON.stringify(pages.docs.map(p => ({ id: p.id, route: p.route, label: p.label })), null, 2));
  process.exit(0);
}

getPages().catch(console.error);
