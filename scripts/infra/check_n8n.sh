#!/bin/bash
# ==============================================================================
# n8n SRE Auto-Healing Engine (UX-Driven PRO Version)
# ==============================================================================

# Variables de Dokploy / Docker
CONTAINER_NAME="n8n-n8nwithpostgres-oxnhfj-n8n-1"
DB_CONTAINER="antigravity-supabase-g1nr95-supabase-db" 
LOG_FILE="/var/log/n8n-healing.log"
LOCK_FILE="/tmp/n8n_restart.lock"
SLO_THRESHOLD=0.95

TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

# 1) HARDENING (Loops y Cooldown)
if [ -f "$LOCK_FILE" ]; then
  if test "`find $LOCK_FILE -mmin +3`"; then
    rm -f "$LOCK_FILE"
  else
    echo "$TIMESTAMP | restart bloqueado (cooldown activo) ⏳" >> "$LOG_FILE"
    exit 0
  fi
fi

# 2) CHECK INFRAESTRUCTURA (Usando Node nativo del contenedor)
docker exec "$CONTAINER_NAME" node -e "require('http').get('http://localhost:5678/healthz', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));" > /dev/null 2>&1
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo "$TIMESTAMP | n8n caído o inalcanzable (Healthz falló) 🔴 → reiniciando..." >> "$LOG_FILE"
  touch "$LOCK_FILE"
  docker restart "$CONTAINER_NAME"
  sleep 30
  rm -f "$LOCK_FILE"
  exit 0
fi

STATUS="200" # Falso status para log si sobrevivió

# 3) CHECK EXPERIENCIA (UX SLO desde Supabase)
SLO_RAW=$(docker exec -i "$DB_CONTAINER" psql -U postgres -t -c "SELECT success_rate FROM v_ux_slo_success_rate LIMIT 1;" 2>/dev/null | xargs)
SLO=${SLO_RAW:-1}
IS_DEGRADED=$(echo "$SLO < $SLO_THRESHOLD" | bc -l)

if [ "$IS_DEGRADED" -eq 1 ]; then
  echo "$TIMESTAMP | UX degradada detectada (SLO=$SLO) ⚠️ → reiniciando motor..." >> "$LOG_FILE"
  touch "$LOCK_FILE"
  docker restart "$CONTAINER_NAME"
  sleep 30
  rm -f "$LOCK_FILE"
  exit 0
fi

# 4) Todo en orden
echo "$TIMESTAMP | OK (HTTP=$STATUS, SLO=$SLO) 🟢" >> "$LOG_FILE"
exit 0
