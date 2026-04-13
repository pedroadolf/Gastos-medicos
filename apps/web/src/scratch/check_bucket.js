const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = "https://supabase.pash.uno";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzI3NTA5OTIsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlzcyI6InN1cGFiYXNlIn0.arBCFrktA-kgkyz8ASjPbrs-FduxAQOHrA4bqes7Jbo";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    console.log("Buckets:", buckets);
}
check();
