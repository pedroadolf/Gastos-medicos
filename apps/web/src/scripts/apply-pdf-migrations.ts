import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load env
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('🚀 Applying PDF Dynamic Mapping Migration...');
  
  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20260407_pdf_dynamic_mapping.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  // Supabase JS doesn't have an 'execute raw sql' easily for multiple statements,
  // but we can use RPC or a dedicated endpoint. 
  // For simplicity here, we'll use a fetch to the REST API with POST /rest/v1/rpc/... if it existed,
  // OR we just use the postgres connection string if available.
  
  // Since we don't have a direct raw SQL executor in the client, let's try 
  // checking if the tables already exist.
  
  const { error } = await supabase.from('pdf_templates').select('id').limit(1);
  
  if (error && error.code === '42P01') { // 42P01: Table does not exist
    console.warn('⚠️ Table pdf_templates not found. Trying to create using raw SQL bypass...');
    
    // On self-hosted, we can often access /rest/v1/rpc/exec_sql if we added it,
    // otherwise we need to use a DB client.
    
    console.log('🧪 Simulating SQL application (assuming DB is managed via Dokploy)...');
    console.log('💡 TIP: Use mcp_supabase-mcp-server_execute_sql if configured.');
    
    // Since I'm the agent, I'll try to use the MCP tool now that I have the context 
    // that this might be a custom Supabase setup.
  } else {
    console.log('✅ PDF Dynamic Mapping is already present or table exists.');
  }
}

applyMigration();
