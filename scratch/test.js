const https = require('https');

const fetchJSON = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
};

async function main() {
  try {
    const carts = await fetchJSON('https://noon-to-moon-default-rtdb.firebaseio.com/users/public/table_carts.json');
    console.log('--- TABLE CARTS IN DB ---');
    console.log(JSON.stringify(carts, null, 2));

    const tables = await fetchJSON('https://noon-to-moon-default-rtdb.firebaseio.com/users/public/tables.json');
    console.log('\n--- TABLES IN DB ---');
    console.log(JSON.stringify(tables, null, 2));
  } catch (err) {
    console.error('Error fetching DB state:', err);
  }
}

main();
