#!/usr/bin/env python3
"""
GMM Resilience — n8n PRO Logging Patch
=======================================
Patches workflow QsKj2y8blszMMlpb to add:
  1. Log node after each Retry path (continueOnFail=True)
  2. Log node after each Escalate path (continueOnFail=True)
  3. Creates a NEW standalone "GMM Error Catcher" workflow with
     Error Trigger → Supabase RPC (safe_log_alert)

Usage:
    N8N_API_KEY=<key> N8N_BASE_URL=https://n8n.pash.uno python3 patch_resilience_logging.py
"""

import os
import json
import urllib.request
import urllib.error
import sys
from datetime import datetime

# ─── Config ──────────────────────────────────────────────────────────────────
N8N_BASE_URL = os.environ.get("N8N_BASE_URL", "https://n8n.pash.uno")
N8N_API_KEY  = os.environ.get("N8N_API_KEY", "")
TARGET_WF_ID = "QsKj2y8blszMMlpb"   # The resilience workflow from session
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

if not N8N_API_KEY:
    print("❌ N8N_API_KEY env var required")
    sys.exit(1)

HEADERS = {
    "X-N8N-API-KEY": N8N_API_KEY,
    "Content-Type":  "application/json",
}

# ─── HTTP Helpers ─────────────────────────────────────────────────────────────
def api_get(path: str) -> dict:
    url = f"{N8N_BASE_URL}/api/v1{path}"
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

def api_put(path: str, body: dict) -> dict:
    url  = f"{N8N_BASE_URL}/api/v1{path}"
    data = json.dumps(body).encode()
    req  = urllib.request.Request(url, data=data, headers=HEADERS, method="PUT")
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

def api_post(path: str, body: dict) -> dict:
    url  = f"{N8N_BASE_URL}/api/v1{path}"
    data = json.dumps(body).encode()
    req  = urllib.request.Request(url, data=data, headers=HEADERS, method="POST")
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

# ─── Log Node Factory ─────────────────────────────────────────────────────────
def make_log_node(node_id: str, name: str, action: str, position: list) -> dict:
    """
    Creates a Supabase HTTP node that calls safe_log_alert RPC.
    Uses jsonBody (not bodyParametersUi) to avoid n8n expression bugs.
    continueOnFail = True → logging never breaks the flow.
    """
    return {
        "id":          node_id,
        "name":        name,
        "type":        "n8n-nodes-base.httpRequest",
        "typeVersion": 4.2,
        "position":    position,
        "continueOnFail": True,
        "parameters": {
            "method":  "POST",
            "url":     f"{SUPABASE_URL}/rest/v1/rpc/safe_log_alert",
            "authentication": "genericCredentialType",
            "genericAuthType": "httpHeaderAuth",
            "sendHeaders": True,
            "headerParameters": {
                "parameters": [
                    {"name": "apikey",        "value": SUPABASE_KEY},
                    {"name": "Authorization", "value": f"Bearer {SUPABASE_KEY}"},
                    {"name": "Content-Type",  "value": "application/json"},
                    {"name": "Prefer",        "value": "return=representation"},
                ]
            },
            "sendBody": True,
            "contentType": "json",
            "jsonBody": (
                f'{{'
                f'"p_tramite_id":    "={{{{ $json.tramite_id || \'unknown\' }}}}",'
                f'"p_step":          "={{{{ $json.step || \'resilience\' }}}}",'
                f'"p_action":        "{action}",'
                f'"p_retry_attempt": {{{{ $json.retry_attempt || 0 }}}},'
                f'"p_reason":        "={{{{ $json.reason || $json.message || \'unknown\' }}}}",'
                f'"p_error_type":    "={{{{ $json.error_type || \'unknown\' }}}}",'
                f'"p_execution_id":  "={{{{ $execution.id }}}}",'
                f'"p_metadata":      {{{{ JSON.stringify({{source: \'n8n\', workflow_id: \'{TARGET_WF_ID}\', ts: new Date().toISOString()}}) }}}}'
                f'}}'
            ),
            "options": {"response": {"response": {"responseFormat": "json"}}},
        }
    }

# ─── Error Catcher Workflow ───────────────────────────────────────────────────
def build_error_catcher_workflow() -> dict:
    """
    Standalone workflow: Error Trigger → safe_log_alert RPC
    Catches ALL unhandled n8n errors across the instance.
    """
    return {
        "name": "GMM — Error Catcher Global",
        "settings": {"executionOrder": "v1"},
        "nodes": [
            {
                "id":          "error-trigger-1",
                "name":        "Error Trigger",
                "type":        "n8n-nodes-base.errorTrigger",
                "typeVersion": 1,
                "position":    [0, 0],
                "parameters":  {}
            },
            {
                "id":          "log-error-1",
                "name":        "Log Unhandled Error",
                "type":        "n8n-nodes-base.httpRequest",
                "typeVersion": 4.2,
                "position":    [300, 0],
                "continueOnFail": True,
                "parameters": {
                    "method": "POST",
                    "url":    f"{SUPABASE_URL}/rest/v1/rpc/safe_log_alert",
                    "authentication": "genericCredentialType",
                    "genericAuthType": "httpHeaderAuth",
                    "sendHeaders": True,
                    "headerParameters": {
                        "parameters": [
                            {"name": "apikey",        "value": SUPABASE_KEY},
                            {"name": "Authorization", "value": f"Bearer {SUPABASE_KEY}"},
                            {"name": "Content-Type",  "value": "application/json"},
                        ]
                    },
                    "sendBody": True,
                    "contentType": "json",
                    "jsonBody": (
                        '{'
                        '"p_tramite_id":    "unknown",'
                        '"p_step":          "{{ $json.execution.workflowData.name || \'unknown_workflow\' }}",'
                        '"p_action":        "error",'
                        '"p_retry_attempt": 0,'
                        '"p_reason":        "n8n_unhandled_failure",'
                        '"p_error_type":    "{{ $json.error.name || \'unknown\' }}",'
                        '"p_execution_id":  "{{ $json.execution.id }}",'
                        '"p_metadata":      {{ JSON.stringify({'
                        '  error_message: $json.error.message,'
                        '  workflow_id:   $json.execution.workflowId,'
                        '  node:          $json.execution.lastNodeExecuted,'
                        '  ts:            new Date().toISOString()'
                        '}) }}'
                        '}'
                    ),
                    "options": {},
                }
            }
        ],
        "connections": {
            "Error Trigger": {
                "main": [[{"node": "Log Unhandled Error", "type": "main", "index": 0}]]
            }
        }
    }

# ─── Main Patch Logic ─────────────────────────────────────────────────────────
def patch_resilience_workflow():
    print(f"\n📥 Fetching workflow {TARGET_WF_ID}...")
    wf = api_get(f"/workflows/{TARGET_WF_ID}")

    nodes       = wf.get("nodes", [])
    connections = wf.get("connections", {})

    # Identify existing node positions to place log nodes cleanly
    existing_names = {n["name"]: n for n in nodes}
    print(f"   Found {len(nodes)} nodes: {[n['name'] for n in nodes]}")

    new_nodes = []

    # ── Add log node after "Retry" path (action = 'retry') ─────────────────
    retry_node_names = [n["name"] for n in nodes if
        ("retry" in n["name"].lower() or "reintent" in n["name"].lower())
        and not n["name"].startswith("📝")  # skip already-added log nodes
    ]
    print(f"   Retry-path nodes detected: {retry_node_names}")

    for rname in retry_node_names:
        base_node = existing_names[rname]
        log_id    = f"log-retry-{rname[:8].lower().replace(' ', '-')}"
        log_name  = f"📝 Log Retry [{rname[:20]}]"
        log_pos   = [base_node["position"][0] + 250, base_node["position"][1] + 100]

        if log_name not in existing_names:
            log_node = make_log_node(log_id, log_name, "retry", log_pos)
            new_nodes.append(log_node)

            # Safely append log node to output index 0 of the retry node
            conn = connections.setdefault(rname, {})
            main = conn.setdefault("main", [[]])
            # Ensure at least one output bucket exists
            if len(main) == 0:
                main.append([])
            if main[0] is None:
                main[0] = []
            main[0].append({"node": log_name, "type": "main", "index": 0})
            print(f"   ✅ Added log node after: {rname}")

    # ── Add log node after "Escalate/Telegram" path (action = 'escalate') ──
    escalate_node_names = [n["name"] for n in nodes if
        any(kw in n["name"].lower() for kw in ["telegram", "escalat", "alerta", "notif"])
        and not n["name"].startswith("📝")  # skip already-added log nodes
    ]
    print(f"   Escalate-path nodes detected: {escalate_node_names}")

    for ename in escalate_node_names:
        base_node = existing_names[ename]
        log_id    = f"log-esc-{ename[:8].lower().replace(' ', '-')}"
        log_name  = f"📝 Log Escalate [{ename[:20]}]"
        log_pos   = [base_node["position"][0] + 250, base_node["position"][1] + 100]

        if log_name not in existing_names:
            log_node = make_log_node(log_id, log_name, "escalate", log_pos)
            new_nodes.append(log_node)
            connections.setdefault(ename, {}).setdefault("main", [[]])
            connections[ename]["main"][0].append({"node": log_name, "type": "main", "index": 0})
            print(f"   ✅ Added log node after: {ename}")

    if not new_nodes:
        print("⚠️  No new log nodes added — check node names match expected patterns.")
        print("    Nodes in workflow:", [n['name'] for n in nodes])

    # Merge new nodes
    all_nodes = nodes + new_nodes

    # Sanitize settings — n8n API only accepts specific keys
    ALLOWED_SETTINGS = {
        "executionOrder", "saveDataErrorExecution", "saveDataSuccessExecution",
        "saveManualExecutions", "saveExecutionProgress", "timezone",
        "callerPolicy", "errorWorkflow"
    }
    raw_settings = wf.get("settings", {})
    clean_settings = {k: v for k, v in raw_settings.items() if k in ALLOWED_SETTINGS}
    if not clean_settings:
        clean_settings = {"executionOrder": "v1"}

    # Build updated workflow payload
    updated_wf = {
        "name":        wf["name"],
        "nodes":       all_nodes,
        "connections": connections,
        "settings":    clean_settings,
    }

    print(f"\n📤 Pushing updated workflow ({len(new_nodes)} new nodes added)...")
    result = api_put(f"/workflows/{TARGET_WF_ID}", updated_wf)
    print(f"   ✅ Workflow updated: {result.get('name', 'OK')}")
    return result

def create_error_catcher():
    print("\n🔧 Creating Global Error Catcher workflow...")
    payload = build_error_catcher_workflow()
    result  = api_post("/workflows", payload)
    wf_id   = result.get("id", "?")
    print(f"   ✅ Created: GMM — Error Catcher Global (id={wf_id})")

    # Activate it
    try:
        api_post(f"/workflows/{wf_id}/activate", {})
        print(f"   ✅ Activated error catcher workflow")
    except Exception as e:
        print(f"   ⚠️  Could not auto-activate (do it manually): {e}")

    return result

# ─── Entry Point ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 60)
    print("🚀 GMM Resilience — n8n PRO Logging Patch")
    print(f"   Target:    {N8N_BASE_URL}")
    print(f"   Workflow:  {TARGET_WF_ID}")
    print(f"   Supabase:  {SUPABASE_URL[:30]}..." if SUPABASE_URL else "   ⚠️  SUPABASE_URL not set")
    print("=" * 60)

    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ SUPABASE_URL and SUPABASE_SERVICE_KEY env vars required")
        print("   Export them and re-run.")
        sys.exit(1)

    try:
        patch_resilience_workflow()
        create_error_catcher()
        print("\n✅ All done. Check n8n UI to verify nodes.")
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"\n❌ HTTP {e.code}: {body}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        raise
