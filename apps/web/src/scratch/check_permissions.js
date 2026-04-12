const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://supabase.pash.uno";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzI3NTA5OTIsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlzcyI6InN1cGFiYXNlIn0.arBCFrktA-kgkyz8ASjPbrs-FduxAQOHrA4bqes7Jbo";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function diagnosePermissions() {
    try {
        console.log("🕵️ Investigando desajuste de permisos en Siniestros...");
        
        // 1. Ver usuarios en auth (solo si es service role, lo cual somos)
        const { data: { users }, error: uError } = await supabase.auth.admin.listUsers();
        if (uError) {
            console.error("❌ No se pudo listar usuarios:", uError.message);
        } else {
            console.log(`✅ Usuarios encontrados en Auth: ${users.length}`);
            users.forEach(u => console.log(`   - ${u.email} [ID: ${u.id}]`));
        }

        // 2. Ver siniestros y sus dueños
        const { data: siniestros, error: sError } = await supabase
            .from('siniestros')
            .select('id, numero_siniestro, nombre_siniestro, user_id');
        
        if (sError) throw sError;

        console.log(`\n📦 Siniestros en el sistema: ${siniestros.length}`);
        siniestros.forEach(s => {
            console.log(`   - [${s.numero_siniestro}] ${s.nombre_siniestro} -> Dueño ID: ${s.user_id || 'SIN DUEÑO (NULL)'}`);
        });

        if (siniestros.length > 0) {
            console.log("\n💡 Diagnóstico: Si el Dueño ID es NULL o no coincide con el ID de tu usuario en el dashboard, el API arrojará 403.");
        }

    } catch (e) {
        console.error("❌ Error en diagnóstico:", e.message);
    }
}

diagnosePermissions();
