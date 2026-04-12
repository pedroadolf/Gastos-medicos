import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://supabase.pash.uno";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzI3NTA5OTIsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlzcyI6InN1cGFiYXNlIn0.arBCFrktA-kgkyz8ASjPbrs-FduxAQOHrA4bqes7Jbo";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRecentActivity() {
    console.log("🔍 Investigando rastro digital del trámite...");
    
    // 1. Ver últimos trámites
    const { data: tramites, error: tError } = await supabase
        .from('tramites')
        .select('id, status, created_at')
        .order('created_at', { ascending: false })
        .limit(1);

    if (tError) {
        console.error("Error consultando trámites:", tError);
        return;
    }

    if (!tramites || tramites.length === 0) {
        console.log("No se encontraron trámites recientes.");
        return;
    }

    const latestTramite = tramites[0];
    console.log(`✅ Trámite encontrado: ${latestTramite.id} [Status: ${latestTramite.status}]`);

    // 2. Ver logs de este trámite
    const { data: logs, error: lError } = await supabase
        .from('workflow_logs')
        .select('step, status, message, created_at')
        .eq('tramite_id', latestTramite.id)
        .order('created_at', { ascending: true });

    if (lError) {
        console.error("Error consultando logs:", lError);
        return;
    }

    console.log("\n📜 Línea de tiempo del Workflow:");
    logs?.forEach(log => {
        const icon = log.status === 'success' ? '🟢' : log.status === 'error' ? '🔴' : '🔵';
        console.log(`${icon} [${log.step}] - ${log.message}`);
    });
}

checkRecentActivity();
