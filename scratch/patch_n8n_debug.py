import json

path = '/Users/pash/Documents/350_APP_PASH/Gastos-Medicos/scratch/current_v8.json'
with open(path, 'r') as f:
    full_data = json.load(f)

debug_js_code = """
const labels = $json.labels || {};
const tramite_id = labels.tramite_id;
const BOT_URL = 'https://api.telegram.org/bot8705940775:AAHerniPvRYDPvT5no8gOforle2DcaJzF4w/sendMessage';
const CHAT_ID = '7670748437';

if (!tramite_id) {
    await axios.post(BOT_URL, { chat_id: CHAT_ID, text: '⚠️ DEBUG: No tramite_id in payload' });
    return { should_retry: false, message: 'No tramite_id' };
}

try {
    const response = await axios.post('https://supabase.pash.uno/rest/v1/rpc/handle_tramite_retry_pro', {
        p_tramite_id: tramite_id,
        p_max_retries: 3
    }, {
        headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzI3NTA5OTIsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlzcyI6InN1cGFiYXNlIn0.arBCFrktA-kgkyz8ASjPbrs-FduxAQOHrA4bqes7Jbo',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzI3NTA5OTIsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlzcyI6InN1cGFiYXNlIn0.arBCFrktA-kgkyz8ASjPbrs-FduxAQOHrA4bqes7Jbo',
            'Content-Type': 'application/json'
        },
        timeout: 5000
    });
    
    const result = response.data[0];
    
    // MODO DEBUG: Forzamos envío a Telegram siempre
    return {
        should_retry: false, 
        message: 'DEBUG FORZADO: ' + result.out_message,
        current_retry_count: result.out_current_retry_count,
        tramite_id: tramite_id
    };

} catch (error) {
    const errorDetail = error.response ? JSON.stringify(error.response.data) : error.message;
    await axios.post(BOT_URL, { 
        chat_id: CHAT_ID, 
        text: '❌ DEBUG SENSOR: Error al llamar a Supabase\\n' + errorDetail 
    });
    return { should_retry: false, message: 'Error en RPC', tramite_id: tramite_id };
}
"""

for node in full_data['nodes']:
    if node['name'] == 'Smart Logic V7':
        node['parameters']['jsCode'] = debug_js_code

# Payload mínimo para asegurar despliegue
allowed_keys = ['name', 'nodes', 'connections', 'settings']
clean_data = {k: full_data[k] for k in allowed_keys if k in full_data}
clean_data['settings'] = {"executionOrder": "v1", "saveExecutionProgress": True}

with open(path, 'w') as f:
    json.dump(clean_data, f)
