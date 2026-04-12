const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: 'apps/web/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing credentials in apps/web/.env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function trigger() {
  console.log('🔥 Triggering ERROR SPIKE alert...');

  const errors = [];
  for (let i = 0; i < 7; i++) {
    errors.push({
      agent: 'TestAgent',
      node: 'TriggerNode',
      workflow: 'AlertTest',
      status: 'error',
      severity: 'critical',
      message: `Simulated Error ${i+1} for SPIKE alert`,
      created_at: new Date().toISOString()
    });
  }

  const { error } = await supabase.from('system_logs').insert(errors);

  if (error) {
    console.error('❌ Error inserting logs:', error.message);
    process.exit(1);
  }

  console.log('✅ 7 Errors inserted! Grafana should fire the alert in ~1 minute.');
  console.log('📡 Monitor n8n at: https://n8n.pash.uno/');
}

trigger();
