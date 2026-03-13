import json
import os

input_path = '/Users/pash/.gemini/antigravity/brain/997791e5-fde3-49c9-aa49-4a7af29e452a/.system_generated/steps/1963/output.txt'

with open(input_path, 'r') as f:
    wf = json.load(f)['data']

nodes = wf['nodes']

def find_node(name):
    for n in nodes:
        if n['name'] == name:
            return n
    return None

# 1. Fix GoogleSheetsAfectados - Range must be top-level in parameters
n2 = find_node('GoogleSheetsAfectados')
if n2:
    n2['parameters'] = {
        "documentId": {
            "__rl": True,
            "mode": "id",
            "value": "1aHust80ArTzLxr_n1s9XSFdTvNopCYRmvoU75MJmsHA"
        },
        "sheetName": {
            "__rl": True,
            "mode": "name",
            "value": "Asegurados"
        },
        "operation": "read",
        "resource": "sheet",
        "range": "A:Z",
        "options": {}
    }

# 2. Fix Gmail Nodes with proper '=' prefix
gmail_configs = {
    'GmailErrorAfectado': {
        "sendTo": "pash.mx@gmail.com",
        "subject": "❌ ERROR SGMM: Validación Afectado",
        "message": "=<h3>❌ ERROR: Validación Afectado</h3><br><b>Nombre:</b> {{$json.nombre || 'N/A'}}<br><b>Email:</b> {{$json.email || 'N/A'}}<br><b>Error:</b> {{$json.error || 'Afectado no encontrado en la base de datos'}}<br><b>Timestamp:</b> {{$json.timestamp}}",
        "operation": "send",
        "resource": "message"
    },
    'GmailErrorOcr': {
        "sendTo": "pash.mx@gmail.com",
        "subject": "❌ ERROR SGMM: Validación OCR",
        "message": "=<h3>❌ ERROR: Validación OCR</h3><br><b>Afectado:</b> {{ $json.afectado ? $json.afectado.nombre : 'N/A' }}<br><b>Archivo:</b> {{$json.fileName || 'N/A'}}<br><b>Error:</b> {{$json.error || 'OCR no detectó información válida'}}<br><b>Timestamp:</b> {{$json.timestamp}}",
        "operation": "send",
        "resource": "message"
    },
    'GmailErrorChecklist': {
        "sendTo": "pash.mx@gmail.com",
        "subject": "❌ ERROR SGMM: Checklist Final",
        "message": "=<h3>❌ ERROR: Checklist Final</h3><br><b>Afectado:</b> {{ $json.afectado ? $json.afectado.nombre : 'N/A' }}<br><b>Evento:</b> {{$json.evento || 'N/A'}}<br><b>Error:</b> {{$json.error || 'Checklist incompleto (sin archivos)'}}<br><b>Timestamp:</b> {{$json.timestamp}}",
        "operation": "send",
        "resource": "message"
    },
    'GmailErrorDrive': {
        "sendTo": "pash.mx@gmail.com",
        "subject": "❌ ERROR SGMM: Drive Upload",
        "message": "=<h3>❌ ERROR: Drive Upload</h3><br><b>Afectado:</b> {{ $json.afectado ? $json.afectado.nombre : 'N/A' }}<br><b>Archivo:</b> {{$json.zipName || 'N/A'}}<br><b>Error:</b> {{$json.error || 'No se pudo subir a Drive'}}<br><b>Timestamp:</b> {{$json.timestamp}}",
        "operation": "send",
        "resource": "message"
    },
    'GmailSuccessNotification': {
        "sendTo": "pash.mx@gmail.com",
        "subject": "=✅ SGMM {{($json.evento ? $json.evento.toUpperCase() : 'EVENTO')}} - COMPLETADO",
        "message": "=<h3>✅ SGMM {{($json.evento ? $json.evento.toUpperCase() : 'EVENTO')}} - COMPLETADO</h3><br><b>Afectado:</b> {{ $json.afectado ? $json.afectado.nombre : 'N/A' }}<br><b>Email:</b> {{ $json.afectado ? $json.afectado.email : 'N/A' }}<br><b>Proveedor:</b> {{ $json.ocr_data ? $json.ocr_data.proveedor : 'N/A' }}<br><b>Monto:</b> ${{ $json.ocr_data ? $json.ocr_data.montoNumerico.toLocaleString('es-MX') : 0 }} MXN<br><br><a href=\"{{$json.drive ? $json.drive.webViewLink : '#'}}\">📂 Ver en Drive</a><br><br><b>Timestamp:</b> {{$json.timestamp}}",
        "operation": "send",
        "resource": "message"
    }
}

for name, params in gmail_configs.items():
    n = find_node(name)
    if n:
        n['parameters'] = params

# 3. GoogleDriveUploadZip
n16 = find_node('GoogleDriveUploadZip')
if n16:
    n16['parameters'] = {
        "driveId": {
            "__rl": True,
            "mode": "list",
            "value": "My Drive"
        },
        "folderId": {
            "__rl": True,
            "mode": "id",
            "value": "={{$node[\"GoogleSheetsAfectados\"].json.carpeta_drive_id}}"
        },
        "operation": "upload",
        "resource": "file",
        "options": {}
    }

# 4. SheetsLogHistorial
n21 = find_node('SheetsLogHistorial')
if n21:
    n21['parameters']['columns']['value'] = {
        "Afectado": "={{ $json.afectado.nombre || $json.Variables }}",
        "Confidence": "={{ $json.validaciones.confidence }}",
        "Drive_Link": "={{ $json.drive.webViewLink }}",
        "Email": "={{ $json.afectado.email }}",
        "Evento": "={{ $json.evento }}",
        "Monto": "={{ $json.ocr_data.montoNumerico }}",
        "Poliza": "={{ $json.afectado.poliza }}",
        "Proveedor": "={{ $json.ocr_data.proveedor }}",
        "Status": "COMPLETADO",
        "Timestamp": "={{ $json.timestamp }}"
    }
    n21['parameters']['sheetName'] = {
        "__rl": True,
        "mode": "name",
        "value": "Historial"
    }

# Save fixed workflow
output_path = '/Users/pash/Documents/350_APP_PASH/Gastos-Medicos/fixed_workflow.json'
with open(output_path, 'w') as f:
    json.dump(wf, f, indent=2)

print(f"Workflow fixed and saved to {output_path}")
