import json

with open("current_workflow.json", "r") as f:
    wf = json.load(f)

for k in ["id", "createdAt", "updatedAt", "pinData", "versionId"]:
    if k in wf:
        del wf[k]

if "settings" in wf:
    for k in ["binaryMode", "availableInMCP", "callerPolicy"]:
        if k in wf["settings"]:
            del wf["settings"][k]

nodes = wf["nodes"]
connections = wf["connections"]

def get_node(name):
    for n in nodes:
        if n["name"] == name:
            return n
    return None

search_asegurado = get_node("Search Asegurado Folder")
q_asegurado = search_asegurado["parameters"].get("options", {}).get("q", "")
if not q_asegurado and "queryString" in search_asegurado["parameters"]:
    q_asegurado = search_asegurado["parameters"]["queryString"]
search_asegurado["parameters"]["searchMethod"] = "query"
search_asegurado["parameters"]["queryString"] = "=name = '{{ $('Webhook NextJS').item.json.body.metadata.nombreCarpetaAsegurado }}' and '{{ $('Webhook NextJS').item.json.body.metadata.googleDriveFolderId }}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
search_asegurado["parameters"]["options"] = {}

search_evento = get_node("Search Evento Folder")
search_evento["parameters"]["searchMethod"] = "query"
search_evento["parameters"]["queryString"] = "=name = '{{ $('Webhook NextJS').item.json.body.metadata.nombreCarpetaEvento }}' and '{{ $('Set Asegurado ID').item.json.aseguradoFolderId }}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
search_evento["parameters"]["options"] = {}

nodes = [n for n in nodes if n["name"] not in ["Merge Asegurado ID", "Merge Evento ID"]]

if len(connections["IF Asegurado Exists"]["main"]) > 1:
    connections["IF Asegurado Exists"]["main"][1] = [{"node":"Set Asegurado ID","type":"main","index":0}]
connections["Create Asegurado Folder"]["main"][0] = [{"node":"Set Asegurado ID","type":"main","index":0}]

if len(connections["IF Evento Exists"]["main"]) > 1:
    connections["IF Evento Exists"]["main"][1] = [{"node":"Set Evento ID","type":"main","index":0}]
connections["Create Evento Folder"]["main"][0] = [{"node":"Set Evento ID","type":"main","index":0}]

if "Merge Asegurado ID" in connections:
    del connections["Merge Asegurado ID"]
if "Merge Evento ID" in connections:
    del connections["Merge Evento ID"]

set_asegurado = get_node("Set Asegurado ID")
set_asegurado["parameters"]["assignments"] = {
    "assignments": [
        {"id": "aseguradoFolderId", "name": "aseguradoFolderId", "value": "={{ $json.id }}", "type": "string"}
    ]
}
if "values" in set_asegurado["parameters"]:
    del set_asegurado["parameters"]["values"]
set_asegurado["parameters"]["options"] = {}
set_asegurado["typeVersion"] = 3.4

set_evento = get_node("Set Evento ID")
set_evento["parameters"]["assignments"] = {
    "assignments": [
        {"id": "eventoFolderId", "name": "eventoFolderId", "value": "={{ $json.id }}", "type": "string"}
    ]
}
if "values" in set_evento["parameters"]:
    del set_evento["parameters"]["values"]
set_evento["parameters"]["options"] = {}
set_evento["typeVersion"] = 3.4

upload_node = get_node("Google Drive (Subir Expediente)")
upload_node["parameters"]["operation"] = "upload"
upload_node["parameters"]["resource"] = "file"
upload_node["parameters"]["driveId"] = {"mode": "list", "value": "My Drive"}
upload_node["parameters"]["folderId"] = {"mode": "id", "value": "={{ $('Set Evento ID').item.json.eventoFolderId }}"}
if "parents" in upload_node["parameters"]:
    del upload_node["parameters"]["parents"]

msg_node = get_node("Send a message")
msg_node["parameters"]["operation"] = "send"
msg_node["parameters"]["resource"] = "message"

wf["nodes"] = nodes
wf["connections"] = connections

with open("updated_workflow_3.json", "w") as f:
    json.dump(wf, f, indent=2)

