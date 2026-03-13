import json

with open('/Users/pash/.gemini/antigravity/brain/997791e5-fde3-49c9-aa49-4a7af29e452a/.system_generated/steps/1169/output.txt', 'r') as f:
    data = json.load(f)["data"]

nodes = data["nodes"]

gmail_creds = {
    "gmailOAuth2": {
        "id": "05U7BNMvQzmmp5eE",
        "name": "Gmail account"
    }
}

for node in nodes:
    if "parameters" not in node:
        node["parameters"] = {}
    if "typeVersion" not in node:
        node["typeVersion"] = 1
    if node["id"] == "node5":
        node["name"] = "GmailErrorAfectado"
        node["type"] = "n8n-nodes-base.gmail"
        node["typeVersion"] = 2.2
        node["credentials"] = gmail_creds
        node["parameters"] = {
            "sendTo": "pash.mx@gmail.com",
            "subject": "❌ ERROR SGMM: Validación Afectado",
            "emailType": "html",
            "message": "=<h3>❌ ERROR: Validación Afectado</h3><br><b>Nombre:</b> {{$json.nombre || 'N/A'}}<br><b>Email:</b> {{$json.email || 'N/A'}}<br><b>Error:</b> {{$json.error || 'Desconocido'}}<br><b>Timestamp:</b> {{$json.timestamp}}",
            "options": {}
        }
    elif node["id"] == "node10":
        node["name"] = "GmailErrorOcr"
        node["type"] = "n8n-nodes-base.gmail"
        node["typeVersion"] = 2.2
        node["credentials"] = gmail_creds
        node["parameters"] = {
            "sendTo": "pash.mx@gmail.com",
            "subject": "❌ ERROR SGMM: Validación OCR",
            "emailType": "html",
            "message": "=<h3>❌ ERROR: Validación OCR</h3><br><b>Afectado:</b> {{$json.afectado.nombre || 'N/A'}}<br><b>Archivo:</b> {{$json.fileName || 'N/A'}}<br><b>Error:</b> {{$json.error || 'OCR no detectó información válida'}}<br><b>Timestamp:</b> {{$json.timestamp}}",
            "options": {}
        }
    elif node["id"] == "node14":
        node["name"] = "GmailErrorChecklist"
        node["type"] = "n8n-nodes-base.gmail"
        node["typeVersion"] = 2.2
        node["credentials"] = gmail_creds
        node["parameters"] = {
            "sendTo": "pash.mx@gmail.com",
            "subject": "❌ ERROR SGMM: Checklist Final",
            "emailType": "html",
            "message": "=<h3>❌ ERROR: Checklist Final</h3><br><b>Afectado:</b> {{$json.afectado.nombre || 'N/A'}}<br><b>Evento:</b> {{$json.evento || 'N/A'}}<br><b>Error:</b> {{$json.error || 'Checklist incompleto'}}<br><b>Timestamp:</b> {{$json.timestamp}}",
            "options": {}
        }
    elif node["id"] == "node19":
        node["name"] = "GmailErrorDrive"
        node["type"] = "n8n-nodes-base.gmail"
        node["typeVersion"] = 2.2
        node["credentials"] = gmail_creds
        node["parameters"] = {
            "sendTo": "pash.mx@gmail.com",
            "subject": "❌ ERROR SGMM: Drive Upload",
            "emailType": "html",
            "message": "=<h3>❌ ERROR: Drive Upload</h3><br><b>Afectado:</b> {{$json.afectado.nombre || 'N/A'}}<br><b>Archivo:</b> {{$json.zipName || 'N/A'}}<br><b>Error:</b> {{$json.error || 'No se pudo subir a Drive'}}<br><b>Timestamp:</b> {{$json.timestamp}}",
            "options": {}
        }
    elif node["id"] == "node22":
        node["name"] = "GmailSuccessNotification"
        node["type"] = "n8n-nodes-base.gmail"
        node["typeVersion"] = 2.2
        node["credentials"] = gmail_creds
        node["parameters"] = {
            "sendTo": "pash.mx@gmail.com",
            "subject": "=✅ SGMM {{$json.evento.toUpperCase()}} - COMPLETADO",
            "emailType": "html",
            "message": "=<h3>✅ SGMM {{$json.evento.toUpperCase()}} - COMPLETADO</h3><br><b>Afectado:</b> {{$json.afectado.nombre}}<br><b>Email:</b> {{$json.afectado.email}}<br><b>Proveedor:</b> {{$json.ocr_data.proveedor}}<br><b>Monto:</b> ${{$json.ocr_data.montoNumerico.toLocaleString('es-MX')}} MXN<br><b>Confidence:</b> {{$json.validaciones.confidence}}<br><br><a href=\"{{$json.drive.webViewLink}}\">📂 Ver en Drive</a><br><a href=\"{{$json.drive.downloadLink}}\">📥 Descargar ZIP</a><br><br><b>Timestamp:</b> {{$json.timestamp}}",
            "options": {}
        }
    elif node["id"] == "node20":
        node["parameters"]["emailType"] = "html"
        node["parameters"]["message"] = "=<b>✅ SGMM {{$json.evento.toUpperCase()}} - Documentos Listos</b><br><br>Hola {{$json.afectado.nombre}},<br><br>Tu expediente de {{$json.evento}} ha sido procesado exitosamente por SGMM Automation.<br><br>A continuación los detalles extraídos de tu factura:<br>🏥 <b>Proveedor:</b> {{$json.ocr_data.proveedor}}<br>💰 <b>Monto Total:</b> ${{$json.ocr_data.montoNumerico.toLocaleString('es-MX')}} MXN<br><br>Todos los documentos y el formato oficial en PDF han sido consolidados en un archivo ZIP, el cual ya se encuentra alojado de forma segura en tu carpeta de Google Drive.<br><br>📂 <a href=\"{{$json.drive.webViewLink}}\">Ver el expediente completo en Google Drive</a><br><br>📥 <a href=\"{{$json.drive.downloadLink}}\">Descargar el expediente ZIP directamente</a><br><br>Si necesitas realizar alguna aclaración o cambio sobre esta reclamación, por favor responde a este correo o contacta a tu agente usando tu número de póliza: <b>{{$json.afectado.poliza}}</b><br><br>Atentamente,<br><i>El Equipo de Automatización SGMM</i>"

# Modify connections since node names changed (WebhookError -> GmailError)
conn = data["connections"]
def rename_conn(old, new):
    if old in conn:
        conn[new] = conn.pop(old)

rename_conn("WebhookErrorAfectado", "GmailErrorAfectado")
rename_conn("WebhookErrorOcr", "GmailErrorOcr")
rename_conn("WebhookErrorChecklist", "GmailErrorChecklist")
rename_conn("WebhookErrorDrive", "GmailErrorDrive")
rename_conn("WebhookSuccessNotification", "GmailSuccessNotification")

for src, connections in conn.items():
    for output_name, target_arrays in connections.items():
        for target_array in target_arrays:
            for target in target_array:
                if target["node"] == "WebhookErrorAfectado": target["node"] = "GmailErrorAfectado"
                elif target["node"] == "WebhookErrorOcr": target["node"] = "GmailErrorOcr"
                elif target["node"] == "WebhookErrorChecklist": target["node"] = "GmailErrorChecklist"
                elif target["node"] == "WebhookErrorDrive": target["node"] = "GmailErrorDrive"
                elif target["node"] == "WebhookSuccessNotification": target["node"] = "GmailSuccessNotification"

with open('./new_workflow.json', 'w') as f:
    json.dump({"id": "3Silaf5Sjtzt4NLk", "connections": conn, "nodes": data["nodes"]}, f)

