require('dotenv').config();
const { MongoClient } = require('mongodb');
const episodes = require('./episodes.json');

const uri = process.env.MONGO_URL;
const client = new MongoClient(uri);

async function importEpisodes() {
  await client.connect();
  const db = client.db(); // usa o banco padrão da string
  const col = db.collection('episodes');
  // Ajuste pubDate para tipo Date
  const docs = episodes.map(ep => ({
    ...ep,
    pubDate: new Date(ep.pubDate)
  }));
  await col.insertMany(docs);
  await client.close();
  console.log('Importado para MongoDB!');
}

importEpisodes(); 