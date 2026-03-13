import json
import urllib.request

API_URL = "https://n8n.pash.uno/api/v1/workflows/tITudE515uCM3Y09"
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMmNlM2E4Yy0xNDM2LTRiMmEtYTQwZC1hZjBhNDY2MTIyMzEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiYWU3ZGUyYTktZDMyMS00NDE2LTg5ZjgtNTUyOTk2YmI4MTJlIiwiaWF0IjoxNzczMTA3MTkxfQ.v7jk8Mhkp7DaIwNRotETA-3Um0zE4DzGxdlGqMNP2Yk"

req = urllib.request.Request(API_URL, method='GET')
req.add_header('X-N8N-API-KEY', API_KEY)
with urllib.request.urlopen(req) as response:
    wf_data = json.loads(response.read())

for n in wf_data.get('nodes', []):
    if n['name'] == 'Google Drive (Subir Expediente)':
        n['parameters']['operation'] = 'upload'
        n['parameters']['resource'] = 'file'
        if 'driveId' not in n['parameters']:
             n['parameters']['driveId'] = {"mode": "list", "value": "My Drive"}
             
    if n['name'] == 'Send a message':
        n['parameters']['operation'] = 'send'
        n['parameters']['resource'] = 'message'

    if n['name'].startswith('IF'):
        n['parameters']['conditions']['options'] = {}
        
    if n['name'].startswith('Merge'):
        n['parameters']['mode'] = 'combine'

if 'id' in wf_data: del wf_data['id']
if 'settings' in wf_data and 'availableInMCP' in wf_data['settings']:
    del wf_data['settings']['availableInMCP']

req = urllib.request.Request(API_URL, data=json.dumps(wf_data).encode('utf-8'), method='PUT')
req.add_header('X-N8N-API-KEY', API_KEY)
req.add_header('Content-Type', 'application/json')
with urllib.request.urlopen(req) as response:
    print("Done")
