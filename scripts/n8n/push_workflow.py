import json
import urllib.request
import urllib.error
import ssl

API_URL = "https://n8n.pash.uno/api/v1/workflows/tITudE515uCM3Y09"
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMmNlM2E4Yy0xNDM2LTRiMmEtYTQwZC1hZjBhNDY2MTIyMzEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiYWU3ZGUyYTktZDMyMS00NDE2LTg5ZjgtNTUyOTk2YmI4MTJlIiwiaWF0IjoxNzczMTA3MTkxfQ.v7jk8Mhkp7DaIwNRotETA-3Um0zE4DzGxdlGqMNP2Yk"

with open('updated_workflow_3.json', 'r') as f:
    data = json.load(f)

new_data = {
    "name": data.get("name"),
    "nodes": data.get("nodes", []),
    "connections": data.get("connections", {}),
    "settings": {}
}

if 'settings' in data:
    for k, v in data['settings'].items():
        if k not in ['availableInMCP', 'binaryMode', 'callerPolicy']:
            new_data["settings"][k] = v

req = urllib.request.Request(API_URL, data=json.dumps(new_data).encode('utf-8'), method='PUT')
req.add_header('X-N8N-API-KEY', API_KEY)
req.add_header('Content-Type', 'application/json')
req.add_header('Accept', 'application/json')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

try:
    with urllib.request.urlopen(req, context=ctx) as response:
        result = response.read()
        print("Workflow updated successfully via REST API.")
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code} - {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Error: {str(e)}")
