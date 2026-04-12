const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env from root
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Error: DATABASE_URL not found in .env');
  process.exit(1);
}

const migrationFile = path.join(__dirname, '../../supabase/migrations/20260412_alerts_log_pro.sql');

async function applyMigration() {
  console.log('🐘 Connecting to Supabase Postgres...');
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✅ Connected.');

    if (!fs.existsSync(migrationFile)) {
      throw new Error(`Migration file not found: ${migrationFile}`);
    }

    const sql = fs.readFileSync(migrationFile, 'utf8');
    console.log('🚀 Applying PRO Observability migration...');
    
    await client.query(sql);
    
    console.log('🏁 Migration applied successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration();
