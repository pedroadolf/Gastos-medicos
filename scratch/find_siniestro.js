const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function findSiniestro() {
  await client.connect();
  try {
    const res = await client.query('SELECT id, numero_siniestro FROM public.siniestros LIMIT 1');
    console.log(JSON.stringify(res.rows[0]));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

findSiniestro();
