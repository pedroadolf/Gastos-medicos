import json

log_path = '/Users/pash/.gemini/antigravity/brain/997791e5-fde3-49c9-aa49-4a7af29e452a/.system_generated/steps/2832/output.txt'

try:
    with open(log_path, 'r') as f:
        data = json.load(f)
    
    if data.get('success'):
        nodes = data.get('data', {}).get('nodes', {})
        print("Executed nodes:")
        for node_name in nodes.keys():
            node_data = nodes[node_name]
            status = node_data.get('status')
            exec_time = node_data.get('executionTime')
            print(f"- {node_name} (Status: {status}, Exec Time: {exec_time}ms)")
    else:
        print("Failed to load data or success is false.")
except Exception as e:
    print(f"Error parsing JSON: {e}")
    # Backup: try regex if JSON is too large/malformed for memory
    import re
    print("\nAttempting regex extraction...")
    with open(log_path, 'r') as f:
        content = f.read()
        # Look for keys inside the "nodes": { ... } structure
        # This is a bit risky but might work for just keys
        # "NodeName": {
        matches = re.findall(r'"([^"]+)":\s*{\s*"executionTime"', content)
        for match in matches:
            print(f"- {match}")
