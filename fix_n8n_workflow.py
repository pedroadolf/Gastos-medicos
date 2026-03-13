import json
import uuid

# Read existing workflow
with open('/Users/pash/.gemini/antigravity/brain/9a83f2c0-6304-473c-9bdc-f9075f61d7ca/.system_generated/steps/1218/output.txt', 'r') as f:
    res = json.load(f)
    wf_data = res.get('data', {})

nodes = wf_data.get('nodes', [])
connections = wf_data.get('connections', {})

# Fix Convert to File node (add encoding base64 if not present)
for n in nodes:
    if n['name'] == 'Convert to File':
        if 'options' not in n['parameters']:
            n['parameters']['options'] = {}
        n['parameters']['options']['encoding'] = 'base64'
        n['parameters']['options']['dataIsBase64'] = True

# Prepare new nodes
new_nodes = [
    {
        "parameters": {
            "operation": "search",
            "resource": "fileFolder",
            "options": {
                "q": "name = '{{ $('Webhook NextJS').item.json.body.metadata.nombreCarpetaAsegurado }}' and '{{ $('Webhook NextJS').item.json.body.metadata.googleDriveFolderId }}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
            }
        },
        "id": str(uuid.uuid4()),
        "name": "Search Asegurado Folder",
        "type": "n8n-nodes-base.googleDrive",
        "typeVersion": 3,
        "position": [400, 300],
        "credentials": {
            "googleDriveOAuth2Api": {
                "id": "J1xI71DccSStfPee",
                "name": "Google Drive account"
            }
        }
    },
    {
        "parameters": {
            "conditions": {
                "number": [
                    {
                        "value1": "={{ $json.length || Object.keys($json).length }}",
                        "operation": "equal",
                        "value2": 0
                    }
                ],
                "boolean": []
            }
        },
        "id": str(uuid.uuid4()),
        "name": "IF Asegurado Exists",
        "type": "n8n-nodes-base.if",
        "typeVersion": 1,
        "position": [600, 300]
    },
    {
        "parameters": {
            "operation": "create",
            "resource": "folder",
            "name": "={{ $('Webhook NextJS').item.json.body.metadata.nombreCarpetaAsegurado }}",
            "driveId": {
                "mode": "list",
                "value": "My Drive"
            },
            "folderId": {
                "mode": "id",
                "value": "={{ $('Webhook NextJS').item.json.body.metadata.googleDriveFolderId }}"
            },
            "options": {}
        },
        "id": str(uuid.uuid4()),
        "name": "Create Asegurado Folder",
        "type": "n8n-nodes-base.googleDrive",
        "typeVersion": 3,
        "position": [800, 200],
        "credentials": {
            "googleDriveOAuth2Api": {
                "id": "J1xI71DccSStfPee",
                "name": "Google Drive account"
            }
        }
    },
    {
        "parameters": {
            "mode": "passThrough",
            "aggregate": "aggregateAllItemData"
        },
        "id": str(uuid.uuid4()),
        "name": "Merge Asegurado ID",
        "type": "n8n-nodes-base.merge",
        "typeVersion": 2,
        "position": [1000, 300]
    },
    {
        "parameters": {
            "keepOnlySet": True,
            "values": {
                "string": [
                    {
                        "name": "aseguradoFolderId",
                        "value": "={{ $json.id ? $json.id : $('IF Asegurado Exists').item.json[0].id }}"
                    }
                ]
            },
            "options": {}
        },
        "id": str(uuid.uuid4()),
        "name": "Set Asegurado ID",
        "type": "n8n-nodes-base.set",
        "typeVersion": 2,
        "position": [1200, 300]
    }
]

# Add more nodes for Event
new_nodes.extend([
    {
        "parameters": {
            "operation": "search",
            "resource": "fileFolder",
            "options": {
                "q": "name = '{{ $('Webhook NextJS').item.json.body.metadata.nombreCarpetaEvento }}' and '{{ $json.aseguradoFolderId }}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
            }
        },
        "id": str(uuid.uuid4()),
        "name": "Search Evento Folder",
        "type": "n8n-nodes-base.googleDrive",
        "typeVersion": 3,
        "position": [1400, 300],
        "credentials": {
            "googleDriveOAuth2Api": {
                "id": "J1xI71DccSStfPee",
                "name": "Google Drive account"
            }
        }
    },
    {
        "parameters": {
            "conditions": {
                "number": [
                    {
                        "value1": "={{ $json.length || Object.keys($json).length }}",
                        "operation": "equal",
                        "value2": 0
                    }
                ]
            }
        },
        "id": str(uuid.uuid4()),
        "name": "IF Evento Exists",
        "type": "n8n-nodes-base.if",
        "typeVersion": 1,
        "position": [1600, 300]
    },
    {
        "parameters": {
            "operation": "create",
            "resource": "folder",
            "name": "={{ $('Webhook NextJS').item.json.body.metadata.nombreCarpetaEvento }}",
            "driveId": {
                "mode": "list",
                "value": "My Drive"
            },
            "folderId": {
                "mode": "id",
                "value": "={{ $('Set Asegurado ID').item.json.aseguradoFolderId }}"
            },
            "options": {}
        },
        "id": str(uuid.uuid4()),
        "name": "Create Evento Folder",
        "type": "n8n-nodes-base.googleDrive",
        "typeVersion": 3,
        "position": [1800, 200],
        "credentials": {
            "googleDriveOAuth2Api": {
                "id": "J1xI71DccSStfPee",
                "name": "Google Drive account"
            }
        }
    },
    {
        "parameters": {
            "mode": "passThrough"
        },
        "id": str(uuid.uuid4()),
        "name": "Merge Evento ID",
        "type": "n8n-nodes-base.merge",
        "typeVersion": 2,
        "position": [2000, 300]
    },
    {
        "parameters": {
            "keepOnlySet": True,
            "values": {
                "string": [
                    {
                        "name": "eventoFolderId",
                        "value": "={{ $json.id ? $json.id : $('IF Evento Exists').item.json[0].id }}"
                    }
                ]
            },
            "options": {}
        },
        "id": str(uuid.uuid4()),
        "name": "Set Evento ID",
        "type": "n8n-nodes-base.set",
        "typeVersion": 2,
        "position": [2200, 300]
    }
])

# For upload node, update parent ID
for n in nodes:
    if n['name'] == 'Google Drive (Subir Expediente)':
        n['parameters']['parents'] = [
            "={{ $('Set Evento ID').item.json.eventoFolderId }}"
        ]
        n['position'] = [2400, 300]

nodes.extend(new_nodes)

# Build connections
# From Convert to File -> Search Asegurado
# IF Asegurado: true -> Create Asegurado Folder -> Merge
# IF Asegurado: false -> Merge
# Merge -> Set Asegurado ID -> Search Evento
# Search Evento -> IF Evento
# IF Evento: true -> Create Evento -> Merge Evento
# IF Evento: false -> Merge Evento
# Merge Evento -> Set Evento ID -> Google Drive (Subir Expediente)

# Clear some connections first
connections['Convert to File'] = {
    "main": [
        [
            {
                "node": "Search Asegurado Folder",
                "type": "main",
                "index": 0
            }
        ]
    ]
}

connections['Search Asegurado Folder'] = {
    "main": [
        [
            {
                "node": "IF Asegurado Exists",
                "type": "main",
                "index": 0
            }
        ]
    ]
}

connections['IF Asegurado Exists'] = {
    "main": [
        [
            {
                "node": "Create Asegurado Folder",
                "type": "main",
                "index": 0
            }
        ],
        [
            {
                "node": "Merge Asegurado ID",
                "type": "main",
                "index": 1
            }
        ]
    ]
}

connections['Create Asegurado Folder'] = {
    "main": [
        [
            {
                "node": "Merge Asegurado ID",
                "type": "main",
                "index": 0
            }
        ]
    ]
}

connections['Merge Asegurado ID'] = {
    "main": [
        [
            {
                "node": "Set Asegurado ID",
                "type": "main",
                "index": 0
            }
        ]
    ]
}

connections['Set Asegurado ID'] = {
    "main": [
        [
            {
                "node": "Search Evento Folder",
                "type": "main",
                "index": 0
            }
        ]
    ]
}

connections['Search Evento Folder'] = {
    "main": [
        [
            {
                "node": "IF Evento Exists",
                "type": "main",
                "index": 0
            }
        ]
    ]
}

connections['IF Evento Exists'] = {
    "main": [
        [
            {
                "node": "Create Evento Folder",
                "type": "main",
                "index": 0
            }
        ],
        [
            {
                "node": "Merge Evento ID",
                "type": "main",
                "index": 1
            }
        ]
    ]
}

connections['Create Evento Folder'] = {
    "main": [
        [
            {
                "node": "Merge Evento ID",
                "type": "main",
                "index": 0
            }
        ]
    ]
}

connections['Merge Evento ID'] = {
    "main": [
        [
            {
                "node": "Set Evento ID",
                "type": "main",
                "index": 0
            }
        ]
    ]
}

connections['Set Evento ID'] = {
    "main": [
        [
            {
                "node": "Google Drive (Subir Expediente)",
                "type": "main",
                "index": 0
            }
        ]
    ]
}

with open('updated_workflow.json', 'w') as f:
    json.dump({
        "id": wf_data['id'],
        "name": wf_data['name'],
        "nodes": nodes,
        "connections": connections,
        "settings": wf_data.get('settings', {})
    }, f, indent=2)

print("Workflow updated locally to updated_workflow.json")
