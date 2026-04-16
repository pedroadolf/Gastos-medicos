const { createClient } = require('@supabase/supabase-client');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function checkSiniestros() {
    const { data, error } = await supabase.from('siniestros').select('id, numero_siniestro, nombre_siniestro').limit(5);
    if (error) {
        console.error('Error fetching siniestros:', error);
    } else {
        console.log('Siniestros:', JSON.stringify(data, null, 2));
    }
}

checkSiniestros();
