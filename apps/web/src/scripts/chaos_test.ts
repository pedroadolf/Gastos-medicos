import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://supabase.pash.uno";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzI3NTA5OTIsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlzcyI6InN1cGFiYXNlIn0.arBCFrktA-kgkyz8ASjPbrs-FduxAQOHrA4bqes7Jbo";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function triggerChaos() {
  console.log("🧪 Initiating Chaos Test SRE...");
  
  const executionId = `chaos-${Date.now()}`;
  
  // 1. Insert failed execution
  const { error: eError } = await supabase.from('workflow_executions').insert({
    execution_id: executionId,
    workflow_name: 'GMM-Main-Orchestrator-Modularizado',
    status: 'error',
    start_time: new Date().toISOString(),
    retries: 2
  });
  
  if (eError) throw eError;
  console.log("✔ Inserted failed execution:", executionId);
  
  // 2. Insert failed step
  const { error: sError } = await supabase.from('workflow_steps').insert({
    execution_id: executionId,
    step_name: 'validate_coverage',
    status: 'error',
    started_at: new Date().toISOString(),
    finished_at: new Date().toISOString(),
    error_message: 'Timeout external coverage API'
  });
  
  if (sError) throw sError;
  console.log("✔ Inserted failed step: validate_coverage");
  
  // 3. Insert system event (for Alert Center)
  const { error: eventError } = await supabase.from('system_events').insert({
    execution_id: executionId,
    event_type: 'workflow_error',
    severity: 'critical',
    message: 'Coverage validation failed for new claim',
    details: {
        impact: 'New claims blocked',
        action: 'Check 3rd party API endpoint'
    },
    timestamp: new Date().toISOString()
  });
  
  if (eventError) throw eventError;
  console.log("✔ Inserted system event into NOC Stack");
  
  console.log("\n📉 Chaos Test deployed. Observe Dashboard reaction now.");
}

triggerChaos().catch(console.error);
