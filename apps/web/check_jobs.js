const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

function loadEnv(path) {
    const content = fs.readFileSync(path, 'utf8');
    const lines = content.split('\n');
    lines.forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.substring(1, value.length - 1);
            }
            process.env[key] = value;
        }
    });
}

loadEnv('.env.local');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Using URL:', supabaseUrl);
// console.log('Using Key:', supabaseKey ? 'PRESENT' : 'MISSING');

if (!supabaseUrl || !supabaseKey) {
    console.error('Credentials missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkJobs() {
    try {
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) {
            console.error('Error fetching jobs:', error.message);
        } else {
            console.log('Recent jobs:', data);
        }
    } catch (e) {
        console.error('Unexpected error:', e.message);
    }
}

checkJobs();
