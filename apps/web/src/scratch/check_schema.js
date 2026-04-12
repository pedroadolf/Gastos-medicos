const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://supabase.pash.uno";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzI3NTA5OTIsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlzcyI6InN1cGFiYXNlIn0.arBCFrktA-kgkyz8ASjPbrs-FduxAQOHrA4bqes7Jbo";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTableSchema() {
    try {
        console.log("🔍 Verificando existencia de tablas y RLS...");
        
        // Check alerts_log
        const { data: alerts, error: aError } = await supabase.from('alerts_log').select('*').limit(1);
        if (aError) {
            console.error("❌ Error en alerts_log:", aError.message);
        } else {
            console.log("✅ alerts_log: Accesible.");
        }

        // Check columns of alerts_log using a trick (select a non-existent column to see error or just query)
        const { data: cols, error: cError } = await supabase.rpc('get_table_columns', { table_name: 'alerts_log' });
        // Since get_table_columns might not exist, let's just try to select created_at
        const { data: ca, error: caError } = await supabase.from('alerts_log').select('created_at').limit(1);
        if (caError) {
            console.error("❌ Columna created_at en alerts_log NO encontrada:", caError.message);
        } else {
            console.log("✅ Columna created_at en alerts_log: Existe.");
        }

        // Check if there are ANY users at all in a way that works
        const { count, error: uCountError } = await supabase.from('tramites').select('*', { count: 'exact', head: true });
        console.log(`✅ Trámites totales: ${count}`);

    } catch (e) {
        console.error("❌ Error:", e.message);
    }
}

checkTableSchema();
