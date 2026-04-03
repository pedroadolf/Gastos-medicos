REORGANIZAR EL PROYECTO GMM

# PERSONAJE
Actúa como una dupla experta compuesta por el **QA (Lead Auditor #6)** y el **Filesystem Agent (#9)**. Su enfoque es el "Clean Code" y la optimización de recursos en entornos Next.js/Supabase.

# PETICIÓN (REQUEST)
Realicen una auditoría exhaustiva de la estructura de archivos, dependencias y activos del proyecto **Gastos-Medicos**. El objetivo es identificar redundancias y código huérfano sin ejecutar acciones destructivas.

# CONTEXTO (CONTEXT)
<proyecto_info>
- Framework: Next.js (Dashboard GMM).
- Infraestructura: Monitoreo vía Dokploy y almacenamiento en Supabase.
- Herramientas: Tienen acceso al servidor MCP de Filesystem y búsqueda de símbolos/referencias.
</proyecto_info>

# AJUSTES (ADJUSTMENT)
Para evitar errores, sigan estas reglas:
1. **Falsos Positivos:** No marquen como "no utilizado" archivos de configuración (.json, .config.js, .env) o archivos dentro de `.agent/` o `.github/`.
2. **Profundidad:** Utilicen búsqueda de texto completo (grep/search) para verificar si un componente es importado en algún archivo `.tsx`, `.ts` o `.js`.
3. **Seguridad:** REGLA DE ORO: No eliminar, mover ni modificar ningún archivo. Solo lectura y reporte.

# TIPO DE SALIDA (TYPE)
Generen un **Informe de Auditoría de Estructura** en Markdown con las siguientes secciones:

## 1. Archivos y Carpetas Duplicados
- Listado de archivos con nombres idénticos o contenido redundante en diferentes rutas.

## 2. Archivos Huérfanos (Orphan Files)
- Archivos que no tienen ninguna referencia de `import` o `require` en el árbol de dependencias.

## 3. Componentes y Funciones "Muertas"
- Código exportado que no se utiliza en ninguna vista o API route.

## 4. Activos (Assets) Redundantes
- Imágenes, SVGs o fuentes en la carpeta `/public` o `/assets` que no se referencian en el código.

# EXTRAS
Al final del informe, incluyan una **Recomendación de Limpieza** priorizada por impacto en el peso del proyecto.


ESTRUCTURA N RECOMENDADA:

gastos-medicos/
│
├── apps/
│   ├── web/                          ← Next.js 16 (App Router)
│   │   ├── app/
│   │   │   ├── (auth)/               ← rutas de autenticación
│   │   │   ├── (dashboard)/          ← rutas protegidas
│   │   │   │   ├── gastos/
│   │   │   │   ├── expedientes/
│   │   │   │   └── reportes/
│   │   │   ├── api/                  ← API routes de Next.js
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── ui/                   ← componentes genéricos (botones, inputs)
│   │   │   ├── forms/                ← formularios específicos
│   │   │   └── shared/               ← header, sidebar, etc.
│   │   ├── hooks/                    ← custom hooks
│   │   ├── services/                 ← llamadas a Supabase y APIs externas
│   │   ├── utils/                    ← helpers (formateo, validaciones)
│   │   ├── types/                    ← interfaces TypeScript globales
│   │   ├── constants/                ← constantes, config
│   │   └── public/                   ← assets estáticos
│   │
│   └── agent/                        ← Agente Python (LangGraph + LangChain)
│       ├── graphs/                   ← definición de grafos LangGraph
│       ├── nodes/                    ← nodos individuales del grafo
│       ├── chains/                   ← chains de LangChain
│       ├── tools/                    ← herramientas del agente (OCR, PDF, etc.)
│       ├── prompts/                  ← templates de prompts para Gemini
│       ├── schemas/                  ← modelos Pydantic
│       ├── services/                 ← integraciones externas (Drive, Sheets)
│       └── main.py
│
├── workflows/                        ← n8n workflows exportados (JSON)
│   ├── auditoria/
│   ├── procesamiento-pdf/
│   └── registro-datos/
│
├── supabase/                         ← configuración local de Supabase
│   ├── migrations/                   ← migraciones SQL versionadas
│   ├── seed.sql
│   └── config.toml
│
├── docs/                             ← documentación del proyecto
│   ├── arquitectura.md
│   ├── workflows.md
│   └── agent.md
│
├── .env.example
├── docker-compose.yml                ← para levantar todo localmente
└── README.md


Reorganize the Gastos-Medicos project using the following monorepo structure:

- apps/web/ → Next.js 16 with App Router. Organize by:
  - app/ with route groups: (auth) and (dashboard)
  - components/ split into: ui/, forms/, shared/
  - services/ for Supabase and external API calls
  - hooks/, utils/, types/, constants/

- apps/agent/ → Python agent with LangGraph/LangChain. Organize by:
  - graphs/ for LangGraph graph definitions
  - nodes/ for individual graph nodes
  - chains/ for LangChain chains
  - tools/ for OCR, PDF processing, etc.
  - prompts/ for Gemini prompt templates
  - schemas/ for Pydantic models
  - services/ for Google Drive and Sheets integrations

- workflows/ → n8n exported JSON workflows, grouped by: 
  auditoria/, procesamiento-pdf/, registro-datos/

- supabase/ → migrations/, seed.sql, config.toml

- docs/ → arquitectura.md, workflows.md, agent.md

Rules:
1. Do NOT move or delete any file yet.
2. Show me the complete proposed file mapping first 
   (current path → new path) for every file.
3. Flag any file you are unsure about.
4. Wait for my explicit approval before executing.


Tips adicionales para tu stack específico
Para el agente Python, asegúrate de que quede con su propio requirements.txt y pyproject.toml dentro de apps/agent/, separado del package.json del frontend.
Para n8n, exporta los workflows como JSON versionados en workflows/ — así quedan bajo control de git y puedes revertir cambios en los flujos.
Para Supabase, las migraciones en supabase/migrations/ con nombres tipo 20240101_nombre.sql te dan trazabilidad completa de cambios en la BD.