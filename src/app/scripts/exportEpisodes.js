require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function exportEpisodes() {
  await client.connect();
  const res = await client.query('SELECT * FROM "Episode"');
  fs.writeFileSync('episodes.json', JSON.stringify(res.rows, null, 2));
  await client.end();
  console.log('Exportado episodes.json');
}

exportEpisodes(); 