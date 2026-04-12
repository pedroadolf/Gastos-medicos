const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://supabase.pash.uno";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzI3NTA5OTIsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlzcyI6InN1cGFiYXNlIn0.arBCFrktA-kgkyz8ASjPbrs-FduxAQOHrA4bqes7Jbo";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRecentActivity() {
    try {
        console.log("🔍 Buscando actividad de HOY (2026-04-12)...");
        
        const today = new Date('2026-04-12').toISOString().split('T')[0];

        const { data: tramites, error: tError } = await supabase
            .from('tramites')
            .select('id, status, created_at')
            .gte('created_at', today)
            .order('created_at', { ascending: false });

        if (tError) throw tError;

        if (!tramites || tramites.length === 0) {
            console.log("❌ No hay trámites registrados hoy.");
        } else {
            console.log(`✅ Se encontraron ${tramites.length} trámites hoy.`);
            for (const tramite of tramites) {
                console.log(`\n--- Trámite: ${tramite.id} [${tramite.status}] ---`);
            }
        }
    } catch (e) {
        console.error("❌ Error:", e.message);
    }
}

checkRecentActivity();
