# Carga automática del .env para TODOS los targets
ifneq (,$(wildcard .env))
  include .env
  export
endif

.PHONY: init dev build test clean status \
        migrate-pro patch-n8n-logs deploy-grafana-pro validate-observability

init:
	npm install && cd apps/agent && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt

dev:
	npm run dev

build:
	npm run build

test:
	npm test

status:
	git status && ls -R apps/ workflows/ supabase/

clean:
	npm run clean
	rm -rf apps/agent/venv
	rm -rf artifacts/

# ── Observabilidad PRO (Phase 9) ──────────────────────────────────────────────

## 1. MIGRACIÓN MANUAL REQUERIDA
# El puerto 5432 está bloqueado. Aplica el SQL manualmente en el Dashboard de Supabase.
migrate-pro:
	@echo "⚠️  Nota: Aplica el SQL de supabase/migrations/20260412_alerts_log_pro.sql manualmente en el Dashboard."
	@echo "✅ Continuando con el despliegue de n8n y Grafana..."

## 2. Parchea el workflow n8n con log nodes estructurados
patch-n8n-logs:
	@echo "🔧 Patching n8n workflow with PRO logging nodes..."
	python3 scripts/n8n/patch_resilience_logging.py

## 3. Deploya el dashboard PRO en Grafana + alertas
deploy-grafana-pro:
	@echo "📊 Deploying Grafana Resilience PRO Dashboard..."
	node scripts/grafana/deploy_resilience_dashboard.js

## 4. Valida que todo está live
validate-observability:
	@echo "🩺 Running post-deploy validation..."
	bash scripts/validate_pro_logging.sh

## 5. Full Phase 9 deploy (en orden correcto)
observability-pro: migrate-pro patch-n8n-logs deploy-grafana-pro validate-observability
	@echo "🏆 Phase 9 Observability PRO — COMPLETE"
