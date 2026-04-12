import json

path = '/Users/pash/Documents/350_APP_PASH/Gastos-Medicos/scratch/current_v8.json'
with open(path, 'r') as f:
    full_data = json.load(f)

new_js = """
const labels = $json.labels || {};
const tramite_id = labels.tramite_id;

if (!tramite_id) {
    return { should_retry: false, message: 'No tramite_id found in labels' };
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
        }
    });
    
    // Result is an array
    const result = response.data[0];
    
    return {
        should_retry: result.out_should_retry,
        message: result.out_message,
        current_retry_count: result.out_current_retry_count,
        next_retry_at: result.out_next_retry_at,
        circuit_state: result.out_circuit_state,
        tramite_id: tramite_id,
        step: labels.step || 'unknown',
        raw_payload: $json
    };
} catch (error) {
    return {
        should_retry: false,
        message: 'RPC Error: ' + (error.response?.data?.message || error.message),
        tramite_id: tramite_id,
        raw_payload: $json
    };
}
"""

def patch_nodes(nodes):
    for node in nodes:
        if node['name'] == 'Smart Logic V7':
            node['parameters']['jsCode'] = new_js

patch_nodes(full_data['nodes'])

# Construction of the most compatible payload for n8n API
clean_data = {
    "name": full_data.get("name", "GMM-Alert-Orchestrator-Retro-PRO"),
    "nodes": full_data["nodes"],
    "connections": full_data["connections"],
    "settings": {
        "executionOrder": "v1",
        "saveExecutionProgress": True,
        "saveManualExecutions": True
    }
}

with open(path, 'w') as f:
    json.dump(clean_data, f)
