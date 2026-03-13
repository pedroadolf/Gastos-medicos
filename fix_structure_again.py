import json
import requests

with open("updated_workflow_2.json", "r") as f:
    wf = json.load(f)

for k in ["id", "createdAt", "updatedAt", "pinData", "versionId"]:
    if k in wf:
        del wf[k]
        
if "settings" in wf:
    for k in ["binaryMode", "availableInMCP", "callerPolicy"]:
        if k in wf["settings"]:
            del wf["settings"][k]

# Add it to the requests
url = "https://n8n.pash.uno/api/v1/workflows/tITudE515uCM3Y09"
headers = {
    "X-N8N-API-KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMmNlM2E4Yy0xNDM2LTRiMmEtYTQwZC1hZjBhNDY2MTIyMzEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiYWU3ZGUyYTktZDMyMS00NDE2LTg5ZjgtNTUyOTk2YmI4MTJlIiwiaWF0IjoxNzczMTA3MTkxfQ.v7jk8Mhkp7DaIwNRotETA-3Um0zE4DzGxdlGqMNP2Yk",
    "Content-Type": "application/json"
}

response = requests.put(url, headers=headers, json=wf)
print(response.status_code)
print(response.text)
