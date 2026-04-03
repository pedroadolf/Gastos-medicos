cat > /root/dokploy-recover.sh << 'SCRIPT'
#!/bin/bash
# ==========================================================
# Script de recuperación de Dokploy (IPVS/VIP corruption)
# Uso: bash /root/dokploy-recover.sh
# ==========================================================

set -e
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'

echo -e "${YELLOW}🔧 Iniciando recuperación de Dokploy...${NC}"

# 1. Actualizar Dokploy con tasks.* (bypass IPVS)
echo -e "\n${YELLOW}[1/4] Actualizando DATABASE_URL y REDIS_URL con tasks.*...${NC}"
docker service update \
  --env-add "DATABASE_URL=postgresql://dokploy:NSPGyzNglvC15u927JtL3UzMPstEVHKu@tasks.dokploy-postgres:5432/dokploy" \
  --env-add "REDIS_URL=redis://tasks.dokploy-redis:6379" \
  --container-label-add "traefik.enable=true" \
  --container-label-add "traefik.http.routers.dokploy-web.rule=Host(\`dokploy.pash.uno\`)" \
  --container-label-add "traefik.http.routers.dokploy-web.entrypoints=web" \
  --container-label-add "traefik.http.routers.dokploy-web.middlewares=redirect-to-https@file" \
  --container-label-add "traefik.http.routers.dokploy-web.service=dokploy-web" \
  --container-label-add "traefik.http.routers.dokploy-websecure.rule=Host(\`dokploy.pash.uno\`)" \
  --container-label-add "traefik.http.routers.dokploy-websecure.entrypoints=websecure" \
  --container-label-add "traefik.http.routers.dokploy-websecure.tls.certresolver=letsencrypt" \
  --container-label-add "traefik.http.routers.dokploy-websecure.service=dokploy-websecure" \
  --container-label-add "traefik.http.services.dokploy-web.loadbalancer.server.port=3000" \
  --container-label-add "traefik.http.services.dokploy-websecure.loadbalancer.server.port=3000" \
  dokploy
echo -e "${GREEN}  ✅ Env vars y labels actualizados${NC}"

# 2. Actualizar Traefik config files con tasks.*
echo -e "\n${YELLOW}[2/4] Actualizando configuración de Traefik...${NC}"
cat > /etc/dokploy/traefik/dynamic/dokploy.yml << 'EOF'
http:
  routers:
    dokploy-http:
      rule: Host(`dokploy.pash.uno`)
      entryPoints: ["web"]
      middlewares:
        - redirect-to-https
      service: dokploy-service
    dokploy-https:
      rule: Host(`dokploy.pash.uno`)
      entryPoints: ["websecure"]
      tls:
        certResolver: letsencrypt
      service: dokploy-service
  services:
    dokploy-service:
      loadBalancer:
        servers:
          - url: http://tasks.dokploy:3000
EOF

cat > /etc/dokploy/traefik/dynamic/antigravity-gmm-yqol3g.yml << 'EOF'
http:
  routers:
    antigravity-gmm-yqol3g-router-6:
      rule: Host(`gmm.pash.uno`)
      service: antigravity-gmm-yqol3g-service-6
      middlewares:
        - redirect-to-https
      entryPoints:
        - web
    antigravity-gmm-yqol3g-router-websecure-6:
      rule: Host(`gmm.pash.uno`)
      service: antigravity-gmm-yqol3g-service-6
      entryPoints:
        - websecure
      tls:
        certResolver: letsencrypt
  services:
    antigravity-gmm-yqol3g-service-6:
      loadBalancer:
        servers:
          - url: http://tasks.antigravity-gmm-yqol3g:3000
        passHostHeader: true
EOF
echo -e "${GREEN}  ✅ Archivos de Traefik actualizados (auto-reload en ~2s)${NC}"

# 3. Esperar que Dokploy converja
echo -e "\n${YELLOW}[3/4] Esperando que Dokploy converja (60s)...${NC}"
sleep 60

# 4. Verificar estado
echo -e "\n${YELLOW}[4/4] Verificando estado de los servicios...${NC}"
DOKPLOY_STATE=$(docker service ps dokploy --format "{{.CurrentState}}" | head -1)
echo -e "  Dokploy: ${GREEN}$DOKPLOY_STATE${NC}"

HTTP_CODE=$(curl -sk -o /dev/null -w "%{http_code}" https://dokploy.pash.uno/ 2>/dev/null)
GMM_CODE=$(curl -sk -o /dev/null -w "%{http_code}" https://gmm.pash.uno/ 2>/dev/null)

echo -e "  dokploy.pash.uno HTTPS: $([ "$HTTP_CODE" == "200" ] && echo -e "${GREEN}✅ $HTTP_CODE${NC}" || echo -e "${RED}❌ $HTTP_CODE${NC}")"
echo -e "  gmm.pash.uno HTTPS:     $([ "$GMM_CODE" == "200" ] && echo -e "${GREEN}✅ $GMM_CODE${NC}" || echo -e "${RED}❌ $GMM_CODE${NC}")"

echo -e "\n${GREEN}🎉 Recuperación completada.${NC}"
echo -e "${YELLOW}Si persiste el 502, revisa: docker service logs dokploy --tail 20${NC}"
SCRIPT

chmod +x /root/dokploy-recover.sh
echo "✅ Script guardado en /root/dokploy-recover.sh"
echo "📋 Uso: bash /root/dokploy-recover.sh"



Cuando vuelva a ocurrir el 502, solo ejecuta:

bash /root/dokploy-recover.sh
