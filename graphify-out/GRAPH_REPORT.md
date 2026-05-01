# Graph Report - .  (2026-05-01)

## Corpus Check
- Large corpus: 264 files · ~255,347 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 371 nodes · 326 edges · 19 communities detected
- Extraction: 76% EXTRACTED · 24% INFERRED · 0% AMBIGUOUS · INFERRED: 79 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Supabase Service & Database Access|Supabase Service & Database Access]]
- [[_COMMUNITY_Master Orchestrator & API Routing|Master Orchestrator & API Routing]]
- [[_COMMUNITY_PDF Processing & OCR Engine|PDF Processing & OCR Engine]]
- [[_COMMUNITY_n8n Automation Workflows|n8n Automation Workflows]]
- [[_COMMUNITY_GMM Dashboard UI Components|GMM Dashboard UI Components]]
- [[_COMMUNITY_Authentication & Role Management|Authentication & Role Management]]
- [[_COMMUNITY_Observability & Resilience Infra|Observability & Resilience Infra]]
- [[_COMMUNITY_Claim Submission & Management|Claim Submission & Management]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]

## God Nodes (most connected - your core abstractions)
1. `getSupabaseService()` - 33 edges
2. `fetch()` - 21 edges
3. `GET()` - 11 edges
4. `MasterOrchestrator` - 7 edges
5. `PdfEngine` - 7 edges
6. `GET()` - 6 edges
7. `logEvent()` - 5 edges
8. `POST()` - 5 edges
9. `withLock()` - 5 edges
10. `patch_resilience_workflow()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --calls--> `fetch()`  [INFERRED]
  apps/web/src/app/api/agentes/route.ts → scripts/orchestrator/master-orchestrator.js
- `triggerFinalGeneration()` --calls--> `fetch()`  [INFERRED]
  apps/web/src/app/(auth)/siniestros/nuevo/page.tsx → scripts/orchestrator/master-orchestrator.js
- `async()` --calls--> `fetch()`  [INFERRED]
  apps/web/src/app/(auth)/auditoria/page.tsx → scripts/orchestrator/master-orchestrator.js
- `fetchTramites()` --calls--> `fetch()`  [INFERRED]
  apps/web/src/components/tramite/PowerDashboard.tsx → scripts/orchestrator/master-orchestrator.js
- `handleSend()` --calls--> `fetch()`  [INFERRED]
  apps/web/src/components/layout/Copilot.tsx → scripts/orchestrator/master-orchestrator.js

## Communities

### Community 0 - "Supabase Service & Database Access"
Cohesion: 0.06
Nodes (24): getCriticalAlerts(), getInsuredProfiles(), upsertInsuredProfile(), POST(), POST(), handlePhotoUpload(), loadData(), GET() (+16 more)

### Community 1 - "Master Orchestrator & API Routing"
Cohesion: 0.07
Nodes (23): POST(), async(), POST(), deployAlertRules(), deployDashboard(), main(), handleSend(), fetchData() (+15 more)

### Community 2 - "PDF Processing & OCR Engine"
Cohesion: 0.11
Nodes (14): GET(), GET(), analyzeIncident(), clusterAnomalies(), detectAnomalies(), generateCavemanInsight(), recordAnomalies(), checkGovernance() (+6 more)

### Community 3 - "n8n Automation Workflows"
Cohesion: 0.16
Nodes (15): artifacts_node(), build_orchestrator(), execution_node(), _load_knowledge(), load_rules(), main(), planning_node(), Nodo 3: Ejecuta agentes según rules (+7 more)

### Community 4 - "GMM Dashboard UI Components"
Cohesion: 0.24
Nodes (3): MasterOrchestrator, uuidv4(), logEvent()

### Community 5 - "Authentication & Role Management"
Cohesion: 0.2
Nodes (11): ProjectState, Estado compartido entre nodos, analyst_node(), AnalystState, generate_blueprint(), 🧠 MIGRANT ANALYST AGENT - Analiza proyectos legacy → blueprints, Escanea repo legacy y detecta stack tecnológico, Genera blueprint de migración (+3 more)

### Community 6 - "Observability & Resilience Infra"
Cohesion: 0.31
Nodes (9): api_get(), api_post(), api_put(), build_error_catcher_workflow(), create_error_catcher(), make_log_node(), patch_resilience_workflow(), Standalone workflow: Error Trigger → safe_log_alert RPC     Catches ALL unhandle (+1 more)

### Community 7 - "Claim Submission & Management"
Cohesion: 0.43
Nodes (1): PdfEngine

### Community 8 - "Community 8"
Cohesion: 0.29
Nodes (3): useTramite(), useWorkflowLogs(), AuditDetailPage()

### Community 9 - "Community 9"
Cohesion: 0.33
Nodes (6): GMM Architecture Docs, GMM Data Register Workflow, PDF Date Logic Workflow, Asegurados Schema (PostgreSQL), GMM AI Engine, Supabase Client Service

### Community 11 - "Community 11"
Cohesion: 0.5
Nodes (2): auditGate(), auditWorkflow()

### Community 12 - "Community 12"
Cohesion: 0.5
Nodes (2): llenarFormatoGMM(), POST()

### Community 13 - "Community 13"
Cohesion: 0.5
Nodes (2): initTracing(), register()

### Community 14 - "Community 14"
Cohesion: 0.5
Nodes (2): useUserRole(), Sidebar()

### Community 15 - "Community 15"
Cohesion: 0.5
Nodes (2): GET(), getGoogleSheetsClient()

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (2): ingestFile(), main()

### Community 19 - "Community 19"
Cohesion: 0.67
Nodes (1): checkRecentActivity()

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (2): ensureValidEnvironment(), validateEnvironment()

### Community 21 - "Community 21"
Cohesion: 0.67
Nodes (1): AiFixService

## Knowledge Gaps
- **17 isolated node(s):** `Creates a Supabase HTTP node that calls safe_log_alert RPC.     Uses jsonBody (n`, `Standalone workflow: Error Trigger → safe_log_alert RPC     Catches ALL unhandle`, `Estado compartido entre nodos`, `Carga knowledge/ automáticamente`, `Parsea .antigravity/rules.md → Secuencia ejecutable` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Claim Submission & Management`** (8 nodes): `pdfEngine.ts`, `PdfEngine`, `.applyTransform()`, `.fillDynamicTemplate()`, `.generateExpediente()`, `.resolveValue()`, `.safeCheck()`, `.safeSetText()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (4 nodes): `auditGate()`, `audit-gate.js`, `n8n-auditor.js`, `auditWorkflow()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (4 nodes): `route.ts`, `pdfGenerator.ts`, `llenarFormatoGMM()`, `POST()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (4 nodes): `instrumentation.ts`, `tracing.ts`, `initTracing()`, `register()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (4 nodes): `Sidebar.tsx`, `useUserRole.ts`, `useUserRole()`, `Sidebar()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (4 nodes): `GET()`, `route.ts`, `googleSheets.ts`, `getGoogleSheetsClient()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (3 nodes): `ingest_kb.js`, `ingestFile()`, `main()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (3 nodes): `check_e2e.js`, `check_e2e.ts`, `checkRecentActivity()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (3 nodes): `env.validation.ts`, `ensureValidEnvironment()`, `validateEnvironment()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (3 nodes): `aiFixService.ts`, `AiFixService`, `.analyzeAndFix()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getSupabaseService()` connect `Supabase Service & Database Access` to `Master Orchestrator & API Routing`, `PDF Processing & OCR Engine`, `Claim Submission & Management`, `Community 15`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Why does `fetch()` connect `Master Orchestrator & API Routing` to `GMM Dashboard UI Components`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Why does `POST()` connect `Master Orchestrator & API Routing` to `Supabase Service & Database Access`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Are the 31 inferred relationships involving `getSupabaseService()` (e.g. with `getInsuredProfiles()` and `upsertInsuredProfile()`) actually correct?**
  _`getSupabaseService()` has 31 INFERRED edges - model-reasoned connections that need verification._
- **Are the 19 inferred relationships involving `fetch()` (e.g. with `deploy()` and `run()`) actually correct?**
  _`fetch()` has 19 INFERRED edges - model-reasoned connections that need verification._
- **Are the 9 inferred relationships involving `GET()` (e.g. with `getSupabaseService()` and `analyzeIncident()`) actually correct?**
  _`GET()` has 9 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Creates a Supabase HTTP node that calls safe_log_alert RPC.     Uses jsonBody (n`, `Standalone workflow: Error Trigger → safe_log_alert RPC     Catches ALL unhandle`, `Estado compartido entre nodos` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._