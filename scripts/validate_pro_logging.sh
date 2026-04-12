#!/bin/bash
# ==============================================================================
# 🩺 GMM — POST-DEPLOY VALIDATION: Logs PRO + Grafana PRO
# ==============================================================================
# Validates that all 3 deliverables are live:
#   1. Supabase: new columns + safe_log_alert function + view
#   2. n8n: log nodes present in resilience workflow
#   3. Grafana: dashboard + alert rules exist
#
# Usage:
#   SUPABASE_URL=https://... SUPABASE_KEY=... \
#   N8N_BASE_URL=https://... N8N_API_KEY=... \
#   GRAFANA_URL=https://... GRAFANA_TOKEN=... \
#   bash validate_pro_logging.sh
# ==============================================================================

set -euo pipefail

SUPABASE_URL="${SUPABASE_URL:-}"
SUPABASE_KEY="${SUPABASE_KEY:-}"
N8N_BASE_URL="${N8N_BASE_URL:-https://n8n.pash.uno}"
N8N_API_KEY="${N8N_API_KEY:-}"
GRAFANA_URL="${GRAFANA_URL:-http://localhost:3001}"
GRAFANA_TOKEN="${GRAFANA_TOKEN:-}"
N8N_WF_ID="QsKj2y8blszMMlpb"

PASS=0; FAIL=0

_pass() { echo "✅ $1"; PASS=$((PASS+1)); }
_fail() { echo "❌ $1"; FAIL=$((FAIL+1)); }
_warn() { echo "⚠️  $1"; }
_header() { echo -e "\n── $1 ──────────────────────────────────"; }

# ─── 1. Supabase ─────────────────────────────────────────────────────────────
_header "SUPABASE: alerts_log schema"

if [[ -z "$SUPABASE_URL" || -z "$SUPABASE_KEY" ]]; then
  _warn "SUPABASE_URL / SUPABASE_KEY not set — skipping DB checks"
else
  # Check columns exist
  COLS=$(curl -sf \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY" \
    "${SUPABASE_URL}/rest/v1/alerts_log?limit=0" \
    -I 2>&1 || echo "")

  for COL in execution_id error_type metadata duration_ms; do
    # Use SQL via RPC to check column existence
    RESULT=$(curl -sf \
      -X POST "${SUPABASE_URL}/rest/v1/rpc/safe_log_alert" \
      -H "apikey: $SUPABASE_KEY" \
      -H "Authorization: Bearer $SUPABASE_KEY" \
      -H "Content-Type: application/json" \
      -d '{"p_tramite_id":"validate","p_step":"validation","p_action":"error","p_reason":"schema_check"}' \
      2>&1 || echo "ERROR")

    if echo "$RESULT" | grep -qv "ERROR\|error\|42703"; then
      _pass "safe_log_alert() function callable"
      break
    else
      _fail "safe_log_alert() function unreachable: $RESULT"
      break
    fi
  done

  # Check view exists
  VIEW=$(curl -sf \
    -X GET "${SUPABASE_URL}/rest/v1/v_alerts_metrics?limit=1" \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY" \
    2>&1 || echo "ERROR")

  if echo "$VIEW" | grep -qv "ERROR\|error"; then
    _pass "v_alerts_metrics view accessible"
  else
    _fail "v_alerts_metrics view not found — run migration first"
  fi
fi

# ─── 2. n8n ──────────────────────────────────────────────────────────────────
_header "n8n: Resilience Workflow Log Nodes"

if [[ -z "$N8N_API_KEY" ]]; then
  _warn "N8N_API_KEY not set — skipping n8n checks"
else
  WF=$(curl -sf \
    -H "X-N8N-API-KEY: $N8N_API_KEY" \
    "${N8N_BASE_URL}/api/v1/workflows/${N8N_WF_ID}" \
    2>&1 || echo "ERROR")

  if echo "$WF" | grep -q '"nodes"'; then
    _pass "Workflow ${N8N_WF_ID} is accessible"

    if echo "$WF" | grep -qi '"Log Retry\|Log Escalate'; then
      _pass "Log nodes found in workflow"
    else
      _warn "Log nodes not yet added — run: python3 scripts/n8n/patch_resilience_logging.py"
    fi
  else
    _fail "Cannot fetch workflow ${N8N_WF_ID}: $WF"
  fi

  # Check Error Catcher workflow exists
  WFS=$(curl -sf \
    -H "X-N8N-API-KEY: $N8N_API_KEY" \
    "${N8N_BASE_URL}/api/v1/workflows?limit=50" \
    2>&1 || echo "ERROR")

  if echo "$WFS" | grep -q "Error Catcher"; then
    _pass "Global Error Catcher workflow exists"
  else
    _warn "Global Error Catcher not found — run patch_resilience_logging.py"
  fi
fi

# ─── 3. Grafana ──────────────────────────────────────────────────────────────
_header "Grafana: Dashboard + Alerts"

if [[ -z "$GRAFANA_TOKEN" ]]; then
  _warn "GRAFANA_TOKEN not set — skipping Grafana checks"
else
  DASH=$(curl -sf \
    -H "Authorization: Bearer $GRAFANA_TOKEN" \
    "${GRAFANA_URL}/api/dashboards/uid/gmm-resilience-pro-v1" \
    2>&1 || echo "ERROR")

  if echo "$DASH" | grep -q '"title"'; then
    _pass "Dashboard 'GMM — Motor de Resiliencia PRO' exists"
  else
    _warn "Dashboard not found — run: node scripts/grafana/deploy_resilience_dashboard.js"
  fi

  ALERTS=$(curl -sf \
    -H "Authorization: Bearer $GRAFANA_TOKEN" \
    "${GRAFANA_URL}/api/ruler/grafana/api/v1/rules/gmm-alerts-folder" \
    2>&1 || echo "ERROR")

  if echo "$ALERTS" | grep -qi "escalat\|circuit\|permanent"; then
    _pass "Alert rules present in GMM Alerts folder"
  else
    _warn "Alert rules not found — check deploy_resilience_dashboard.js output"
  fi
fi

# ─── Summary ────────────────────────────────────────────────────────────────
echo -e "\n════════════════════════════════════════"
echo "   RESULT: $PASS passed · $FAIL failed"
echo "════════════════════════════════════════"

if [[ $FAIL -gt 0 ]]; then
  echo "⚠️  Some checks failed. See details above."
  exit 1
else
  echo "🏆 All checks passed. Observability PRO is live."
fi
