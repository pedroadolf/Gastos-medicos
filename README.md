# 🏥 Gastos Médicos Móvil (GMM) — Monorepo

Sistema de gestión de gastos médicos para SGMM. Arquitectura basada en monorepo con Next.js + Python + n8n.

## 📁 Estructura

```
├── apps/
│   ├── web/          # Dashboard Next.js (UI del cliente)
│   └── agent/        # Agente Python (lógica de procesamiento)
├── workflows/        # Workflows n8n (versionados)
│   ├── auditoria/
│   ├── procesamiento-pdf/
│   └── registro-datos/
├── supabase/
│   └── migrations/   # Migraciones SQL versionadas
├── scripts/          # Scripts de utilidades
│   ├── n8n/
│   ├── metlife/
│   └── supabase/
└── docs/             # Documentación centralizada
    ├── proposals/
    ├── auditorias/
    └── knowledge/
```

## 🚀 Ejecución rápida

```bash
npm install          # Instala dependencias del monorepo
npm run dev          # Inicia el dashboard (apps/web)
npm run build        # Build de producción
```

## 🔧 Variables de Entorno

Copia `.env.local` en `apps/web/` con las variables necesarias.

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase |
| `N8N_WEBHOOK_URL` | URL del webhook principal de n8n |
| `GMM_CALLBACK_SECRET` | Secreto para callbacks de n8n |

## 📖 Documentación

- [Arquitectura](docs/arquitectura.md)
- [Guía de Auditoría](docs/proposals/GUIA_EJECUCION_AUDITORIA_GMM.md)
- [Workflows n8n](workflows/README.md)
- [Migraciones SQL](supabase/migrations/README.md)
