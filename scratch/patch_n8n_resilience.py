import json

path = '/Users/pash/Documents/350_APP_PASH/Gastos-Medicos/scratch/current_v8.json'
with open(path, 'r') as f:
    full_data = json.load(f)

# 1. Actualizar Lógica para forzar Booleanos reales
for node in full_data['nodes']:
    if node['name'] == 'Smart Logic V7':
        # Forzar que should_retry sea estrictamente booleano en la salida
        node['parameters']['jsCode'] = node['parameters']['jsCode'].replace(
            "should_retry: result.out_should_retry,",
            "should_retry: Boolean(result.out_should_retry),"
        )
    
    # 2. Blindar el nodo de Decisión
    if node['name'] == 'Decision':
        node['parameters']['conditions'] = {
            "boolean": [
                {
                    "value1": "={{ Boolean($json[\"should_retry\"]) }}",
                    "value2": True
                }
            ]
        }

# 3. Empaquetar y limpiar
allowed_keys = ['name', 'nodes', 'connections', 'settings']
clean_data = {k: full_data[k] for k in allowed_keys if k in full_data}
clean_data['settings'] = {"executionOrder": "v1"}

with open(path, 'w') as f:
    json.dump(clean_data, f)
