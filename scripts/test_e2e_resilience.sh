#!/bin/bash

# ==============================================================================
# 🏥 GMM Resilience - E2E Integration Test Suite
# ==============================================================================
# This script validates the 4 core failure scenarios and concurrency control.
# Targets: n8n.pash.uno -> Supabase RPC -> Telegram
# ==============================================================================

WEBHOOK_URL="https://n8n.pash.uno/webhook/grafana-alert"

# Test Case Metadata (UUIDs assigned in the seeding step)
TID_RETRY="11111111-1111-1111-1111-111111111111"    # Scenario 1: First Retry
TID_LAST="22222222-2222-2222-2222-222222222222"     # Scenario 2: Last Attempt (2->3)
TID_EXHAUSTED="33333333-3333-3333-3333-333333333333" # Scenario 3: Already at 3
TID_PERMANENT="44444444-4444-4444-4444-444444444444" # Scenario 4: Error Permanent

echo "===================================================="
echo "🚀 GMM RESILIENCE E2E TEST SUITE"
echo "===================================================="

# ------------------------------------------------------------------------------
# 🟢 SCENARIO 1: First Retry (0 -> 1)
# ------------------------------------------------------------------------------
echo -e "\n🟢 Scenario 1: Initiating First Retry (Expected: success, no Telegram)"
curl -s -X POST "$WEBHOOK_URL" \
-H "Content-Type: application/json" \
-d '{
  "status": "firing",
  "labels": {
    "step": "OCR",
    "tramite_id": "'$TID_RETRY'",
    "error_type": "transient"
  }
}' | echo "Response sent."

# ------------------------------------------------------------------------------
# 🟡 SCENARIO 2: Last Attempt (2 -> 3)
# ------------------------------------------------------------------------------
echo -e "\n🟡 Scenario 2: Reaching Max Retries (Expected: success, no Telegram yet)"
curl -s -X POST "$WEBHOOK_URL" \
-H "Content-Type: application/json" \
-d '{
  "status": "firing",
  "labels": {
    "step": "OCR",
    "tramite_id": "'$TID_LAST'",
    "error_type": "transient"
  }
}' | echo "Response sent."

# ------------------------------------------------------------------------------
# 🔴 SCENARIO 3: Exhausted (Already 3)
# ------------------------------------------------------------------------------
echo -e "\n🔴 Scenario 3: Retries Exhausted (Expected: Alert Telegram)"
curl -s -X POST "$WEBHOOK_URL" \
-H "Content-Type: application/json" \
-d '{
  "status": "firing",
  "labels": {
    "step": "OCR",
    "tramite_id": "'$TID_EXHAUSTED'",
    "error_type": "transient"
  }
}' | echo "Response sent."

# ------------------------------------------------------------------------------
# 🔴 SCENARIO 4: Permanent Error
# ------------------------------------------------------------------------------
echo -e "\n🔴 Scenario 4: Permanent Error Found (Expected: Immediate Alert Telegram)"
curl -s -X POST "$WEBHOOK_URL" \
-H "Content-Type: application/json" \
-d '{
  "status": "firing",
  "labels": {
    "step": "OCR",
    "tramite_id": "'$TID_PERMANENT'",
    "error_type": "permanent"
  }
}' | echo "Response sent."

# ------------------------------------------------------------------------------
# ⚡ CONCURRENCY TEST: Scenario 1
# ------------------------------------------------------------------------------
echo -e "\n⚡ Scenario 5: Concurrency Spike (5 items parallel)"
for i in {1..5}; do
  curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "firing",
    "labels": {
      "step": "OCR",
      "tramite_id": "'$TID_RETRY'",
      "error_type": "transient"
    }
  }' &
done
wait
echo "Concurrency test completed."

echo -e "\n===================================================="
echo "✅ E2E TESTS COMPLETED"
echo "Check your Telegram and Supabase alerts_log table."
echo "===================================================="
