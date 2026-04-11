async function run() {
  const url = 'http://localhost:3000/api/pages';
  const headers = { 
    'Authorization': 'payload-mcp-api-keys d78a32cdc8ac805fdfd5621edc9eb654a7e4eb582e50a77054addfa0c93c0cca7'
  };
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
        console.error('Failed to GET Pages', res.status, res.statusText);
        // Let's try to query another way, what if it's just Bearer auth
        const res2 = await fetch(url, { headers: { 'Authorization': 'Bearer d78a32cdc8ac805fdfd5621edc9eb654a7e4eb582e50a77054addfa0c93c0cca7' }});
        if (!res2.ok) {
           console.error('Failed Bearer too', res2.status, res2.statusText);
           // try with no auth
           const res3 = await fetch(url);
           console.log('No auth status:', res3.status);
           if (res3.ok) {
               const data3 = await res3.json();
               console.log(JSON.stringify(data3.docs.map(x=> ({ id: x.id, route: x.route })), null, 2));
               return;
           }
        }
    }
    if (res.ok) {
        const data = await res.json();
        console.log(JSON.stringify(data.docs.map(x=> ({ id: x.id, route: x.route })), null, 2));
    }
  } catch (e) {
      console.error(e);
  }
}
run();
