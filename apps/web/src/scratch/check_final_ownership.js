const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://supabase.pash.uno";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzI3NTA5OTIsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlzcyI6InN1cGFiYXNlIn0.arBCFrktA-kgkyz8ASjPbrs-FduxAQOHrA4bqes7Jbo";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkFinalStatus() {
    try {
        console.log("🔍 Diagnosis Final de Propiedad...");
        
        const { data: sData, error: sError } = await supabase
            .from('siniestros')
            .select('id, numero_siniestro, user_id')
            .eq('numero_siniestro', 'SINI-TEST-E2E-001')
            .single();

        if (sError) {
            console.error("❌ Siniestro no encontrado:", sError.message);
        } else {
            console.log(`✅ Siniestro: ${sData.numero_siniestro} | Dueño actual (user_id): ${sData.user_id}`);
        }

        // Tentar ver si hay alguien en auth.users (usando service role)
        const { data: { users }, error: uError } = await supabase.auth.admin.listUsers();
        if (uError) {
            console.error("❌ Error listando usuarios:", uError.message);
        } else {
            console.log(`✅ Total usuarios en Auth: ${users.length}`);
            users.forEach(u => console.log(`   - ${u.email} [${u.id}]`));
        }

    } catch (e) {
        console.error("❌ Error genérico:", e.message);
    }
}

checkFinalStatus();
