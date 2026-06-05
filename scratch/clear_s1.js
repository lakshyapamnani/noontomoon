const https = require('https');

const url = 'https://noon-to-moon-default-rtdb.firebaseio.com/users/public/table_carts/d5xoceaqh.json';

const req = https.request(url, { method: 'DELETE' }, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('DELETE response:', res.statusCode, data);
  });
});
req.on('error', (e) => console.error('Error:', e));
req.end();
