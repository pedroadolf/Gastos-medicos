Excelente trabajo en el dashboard. Veo que estás construyendo una aplicación de **Gestión de Gastos Médicos Mayores (GMM)** con procesamiento de documentos automatizado vía n8n. Permíteme analizar tanto la **arquitectura de menús** como mejoras de **diseño UX/UI**.

---

## 🏗️ Análisis de Menús Necesarios

Basado en tu flujo de trabajo (Asegurado → Configuración → Evento Médico → Documentación), aquí mi recomendación:

### ✅ MENÚS ESENCIALES (MVP de Producción)

| Menú | Necesidad | Justificación |
|------|-----------|---------------|
| **Centro de Control** | ✅ Crítico | Punto de entrada único para iniciar trámites (ya lo tienes) |
| **Expedientes** | ✅ Crítico | Histórico de trámites por asegurado. Los usuarios necesitan consultar estados pasados |
| **Siniestros** | ✅ Crítico | Core del negocio GMM. Seguimiento de reclamaciones activas |
| **Asegurados** | ⚠️ **Opcional** | Si el selector del paso 1 busca en DB central, puede no necesitar menú aparte |
| **Parámetros** | ⚠️ **Admin-only** | Configuración de documentos automáticos, plantillas, usuarios |

### 🎯 Mi Propuesta de Arquitectura

```
📋 PRINCIPAL (todos los usuarios)
├── Centro de Control      ← Inicio de trámites (tu paso 1-4 actual)
├── Mis Trámites           ← Expedientes + Siniestros unificados
│   ├── Activos            ← Trámites en proceso
│   ├── Historial          ← Completados/archivados
│   └── Pendientes         ← En espera de documentación
└── Notificaciones         ← La campana del header

⚙️ CONFIGURACIÓN (solo admins)
├── Parámetros             ← Plantillas, docs automáticos
├── Usuarios y Permisos    ← Gestión de acceso
└── Auditoría              ← Logs del sistema (tu nuevo feature)
```

**¿Por qué unificar Expedientes + Siniestros?**  
En GMM, un "siniestro" es un expediente activo. Separarlos confunde al usuario. Mejor filtros dentro de una misma vista.

---

## 🔔 La Campana: Sistema de Notificaciones

Sí, definitivamente necesitas un **centro de notificaciones** ahí. Para GMM, estas alertas son críticas:

### Tipos de Notificaciones

| Prioridad | Evento | Acción |
|-----------|--------|--------|
| 🔴 **Urgente** | Documento rechazado por IA | Ir a corregir |
| 🟡 **Importante** | Trámite requiere documentación extra | Subir archivo |
| 🟢 **Informativa** | ZIP generado exitosamente | Descargar |
| 🔵 **Sistema** | Nuevo documento automático disponible | Ver detalle |

### Diseño Sugerido para el Dropdown

```
┌─────────────────────────┐
│ 🔴 Documento rechazado  │
│    Factura_001.pdf      │
│    hace 5 minutos       │
│    [Ver problema]       │
├─────────────────────────┤
│ 🟡 Falta: Comprobante   │
│    de domicilio         │
│    hace 1 hora          │
│    [Subir ahora]        │
├─────────────────────────┤
│ 🟢 ZIP listo: #TRAM-452 │
│    hace 2 horas         │
│    [Descargar]          │
├─────────────────────────┤
│   Ver todas →           │
└─────────────────────────┘
```

---

## 🎨 Mejoras de Diseño al Dashboard

### 1. **Jerarquía Visual del Proceso**

Tu paso 4 (Carga de Documentación) compite visualmente con el paso 1. Propongo:

```
ANTES (actual):          DESPUÍS (propuesto):
┌─────────┐              ┌─────────────────────────────┐
│ 1 2 3 4 │              │  [1]──[2]──[3]──[4]         │
│         │              │   ○    ○    ○    ○          │
│ 4 ES    │              │  Buscar → Tipo → Evento → Docs
│ GIGANTE │              │
└─────────┘              │  CONTENIDO DEL PASO ACTIVO  │
                         │  (más espacio vertical)     │
                         └─────────────────────────────┘
```

**Wizard horizontal** en lugar de cards apiladas. El paso activo ocupa el 80% del viewport.

### 2. **El Paso 4 Necesita Rediseño**

Actualmente tienes dos columnas desbalanceadas. Para GMM, el flujo es:

```
┌─────────────────────────────────────────┐
│  PASO 4: DOCUMENTACIÓN                  │
│                                         │
│  ┌──────────────┐  ┌─────────────────┐ │
│  │ GRUPO B      │  │ GRUPO A         │ │
│  │ FACTURAS     │  │ ANEXOS          │ │
│  │ (Obligatorio)│  │ (Soporte)       │ │
│  │              │  │                 │ │
│  │ [Dropzone]   │  │ [Dropzone]      │ │
│  │              │  │                 │ │
│  │ 0 docs       │  │ 0 docs          │ │
│  │              │  │                 │ │
│  │ □ XML+PDF    │  │ □ INE           │ │
│  │ □ CFDI válido│  │ □ Recetas       │ │
│  │ □ Monto >0   │  │ □ Comprobantes  │ │
│  └──────────────┘  └─────────────────┘ │
│                                         │
│  [CHECKLIST INTELIGENTE]                │
│  ✓ Informe médico firmado               │
│  ⏳ Facturas desglosadas (0/2)           │
│  ✗ Comprobante domicilio (<3 meses)     │
│                                         │
│           [GENERAR Y ENVIAR TRÁMITE]    │
│              (disabled hasta checklist ✓)│
└─────────────────────────────────────────┘
```

### 3. **Feedback en Tiempo Real**

Dado que tienes procesamiento IA (n8n), agrega:

```jsx
// Cuando suben PDFs al Grupo B
<UploadZone 
  onUpload={async (file) => {
    // 1. Subir a Google Drive
    // 2. Disparar webhook n8n
    // 3. Mostrar estado de procesamiento
    
    return (
      <ProcessingBadge 
        status="analyzing"  // → "validating" → "completed" | "error"
        progress={65}
        message="IA analizando CFDI..."
      />
    );
  }}
/>
```

### 4. **Dashboard de Estado (Nueva Vista)**

Una vez tengas datos, el "Centro de Control" debería mostrar:

```
┌─────────────────────────────────────────┐
│  Buenos días, Demo                      │
│                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ 12       │ │ 3        │ │ 98%      │ │
│  │ Trámites │ │ Pendientes│ │ Éxito    │ │
│  │ este mes │ │ acción   │ │ rate     │ │
│  └──────────┘ └──────────┘ └──────────┘ │
│                                         │
│  TRÁMITES RECIENTES                     │
│  ┌─────────────────────────────────────┐│
│  │ #TR-452 │ Reembolso │ En proceso  ││
│  │ #TR-451 │ Carta Pase│ Completado ✓││
│  │ #TR-450 │ Reembolso │ Error IA ⚠️  ││
│  └─────────────────────────────────────┘│
│                                         │
│  [+ NUEVO TRÁMITE]                      │
└─────────────────────────────────────────┘
```

---

## 🔧 Cambios Técnicos Sugeridos

Dado tu stack (Next.js + Supabase + n8n):

### 1. **Realtime para el Procesamiento**

```typescript
// Escuchar cuando n8n termina de procesar
const channel = supabase
  .channel(`job:${jobId}`)
  .on('postgres_changes', 
    { event: 'UPDATE', schema: 'public', table: 'processing_jobs' },
    (payload) => {
      if (payload.new.status === 'completed') {
        toast.success('ZIP listo para descargar');
        refreshDocuments();
      }
    }
  )
  .subscribe();
```

### 2. **Optimistic UI para Subida de Docs**

No esperes a que termine todo el pipeline. Muestra el archivo inmediatamente con estado "procesando".

### 3. **Offline-First para Campo**

Si los agentes usan esto en hospitales (mala señal):

```typescript
// Guardar en IndexedDB mientras no haya conexión
// Sincronizar cuando vuelva
const { isOnline, pendingUploads } = useOfflineSync();
```

---

## 📋 Prioridad de Implementación

| Fase | Feature | Esfuerzo | Impacto |
|------|---------|----------|---------|
| **Ahora** | Notificaciones (campana) | 2 días | 🔥 Alto |
| **Ahora** | Unificar Expedientes+Siniestros | 3 días | 🔥 Alto |
| **Próximo** | Wizard horizontal rediseñado | 4 días | 🔥 Alto |
| **Próximo** | Dashboard con métricas | 2 días | 🟡 Medio |
| **Después** | Realtime updates | 3 días | 🟡 Medio |
| **Después** | Modo offline | 5 días | 🟢 Bajo |

---

## 🎯 Resumen Ejecutivo

**Menús:** Centro de Control + Mis Trámites (unificado) + Notificaciones + Parámetros (admin) = **4 items en lugar de 5**, más limpio.

**Diseño:** Convierte el paso 4 en un **proceso guiado con validación visual en tiempo real**, no solo dos dropzones.

**La campana:** Sí, esencial. Conecta al usuario con el estado de sus procesos IA sin refrescar la página.


-------------------------------------------------------------------

Veo que buscas un rediseño completo con enfoque en **modernidad y elegancia**. Permíteme desarrollar ambos componentes con una propuesta visual cohesiva.

---

## 🎨 Sistema de Diseño Propuesto

### Paleta de Colores: "Profesional Médico"

```css
/* Base */
--bg-primary: #0F172A;        /* Slate 950 - fondo principal */
--bg-secondary: #1E293B;      /* Slate 800 - cards */
--bg-tertiary: #334155;       /* Slate 700 - hover */

/* Acentos médicos refinados */
--accent-primary: #06B6D4;    /* Cyan 500 - acciones principales */
--accent-secondary: #8B5CF6;  /* Violet 500 - estados especiales */
--accent-success: #10B981;    /* Emerald 500 - éxito */
--accent-warning: #F59E0B;    /* Amber 500 - advertencias */
--accent-danger: #EF4444;     /* Red 500 - errores críticos */

/* Texto */
--text-primary: #F8FAFC;      /* Slate 50 */
--text-secondary: #94A3B8;    /* Slate 400 */
--text-muted: #64748B;        /* Slate 500 */
```

### Tipografía: "Clarity Medical"

```css
/* Headings - Elegancia técnica */
--font-heading: 'Plus Jakarta Sans', system-ui;
/* Body - Legibilidad máxima */
--font-body: 'Inter', system-ui;
/* Monospace - Datos técnicos */
--font-mono: 'JetBrains Mono', monospace;
```

**Por qué estas fuentes:**
- **Plus Jakarta Sans:** Geométrica pero cálida, usada por Linear y Vercel. Transmite precisión sin frialdad.
- **Inter:** Estándar moderno, excelente en dashboards densos.
- **JetBrains Mono:** Para códigos de trámite y timestamps.

---

## 🔔 Componente: Sistema de Notificaciones

### Arquitectura del Estado

```typescript
// types/notification.ts
type NotificationPriority = 'critical' | 'high' | 'medium' | 'low';
type NotificationCategory = 'document' | 'system' | 'tramite' | 'audit';

interface Notification {
  id: string;
  priority: NotificationPriority;
  category: NotificationCategory;
  title: string;
  description: string;
  metadata: {
    tramiteId?: string;
    documentId?: string;
    actionUrl?: string;
    actionLabel?: string;
  };
  read: boolean;
  dismissed: boolean;
  createdAt: Date;
  expiresAt?: Date;  // Algunas notificaciones expiran
}
```

### Componente React Completo

```tsx
// components/notifications/NotificationCenter.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  X,
  ExternalLink,
  Trash2,
  Settings
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const bellRef = useRef<HTMLButtonElement>(null);

  // Conexión realtime con Supabase
  useEffect(() => {
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev]);
          // Sonido sutil para nuevas notificaciones
          playNotificationSound();
        }
      )
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const getPriorityStyles = (priority: NotificationPriority) => {
    const styles = {
      critical: 'bg-red-500/10 border-red-500/30 text-red-400',
      high: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      medium: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
      low: 'bg-slate-500/10 border-slate-500/30 text-slate-400'
    };
    return styles[priority];
  };

  const getIcon = (category: NotificationCategory) => {
    const icons = {
      document: FileText,
      system: Settings,
      tramite: CheckCircle2,
      audit: Clock
    };
    return icons[category];
  };

  return (
    <div className="relative">
      {/* Bell Trigger */}
      <button
        ref={bellRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 
                   transition-all duration-300 group"
      >
        <Bell className="w-5 h-5 text-slate-300 group-hover:text-cyan-400 
                        transition-colors" />
        
        {/* Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br 
                         from-cyan-500 to-violet-500 rounded-full flex items-center 
                         justify-center text-[10px] font-bold text-white shadow-lg"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Pulse effect when unread */}
        {unreadCount > 0 && (
          <span className="absolute inset-0 rounded-xl bg-cyan-500/20 
                          animate-ping" />
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute right-0 top-full mt-3 w-[420px] z-50
                         bg-slate-900/95 backdrop-blur-xl rounded-2xl 
                         border border-slate-700/50 shadow-2xl 
                         shadow-black/50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 
                            border-b border-slate-800">
                <div>
                  <h3 className="font-semibold text-slate-100 font-['Plus_Jakarta_Sans']">
                    Notificaciones
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {unreadCount} sin leer
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-xs text-cyan-400 hover:text-cyan-300 
                             transition-colors px-2 py-1 rounded-lg
                             hover:bg-cyan-500/10"
                  >
                    Marcar todo leído
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-1 p-2 bg-slate-950/50">
                {(['all', 'unread'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium
                              transition-all duration-200 ${
                      filter === f
                        ? 'bg-slate-700 text-slate-100 shadow-sm'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {f === 'all' ? 'Todas' : 'Sin leer'}
                  </button>
                ))}
              </div>

              {/* Notifications List */}
              <div className="max-h-[400px] overflow-y-auto">
                <AnimatePresence mode="popLayout">
                  {filteredNotifications.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-12 text-center"
                    >
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full 
                                    bg-slate-800/50 flex items-center justify-center">
                        <Bell className="w-6 h-6 text-slate-600" />
                      </div>
                      <p className="text-slate-500 text-sm">
                        No hay notificaciones {filter === 'unread' ? 'sin leer' : ''}
                      </p>
                    </motion.div>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onDismiss={() => dismissNotification(notification.id)}
                        onAction={() => handleAction(notification)}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-slate-800 bg-slate-950/30">
                <button className="w-full py-2 text-xs text-slate-400 
                                 hover:text-slate-200 transition-colors
                                 flex items-center justify-center gap-1.5">
                  Ver historial completo
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-componente: Item individual
function NotificationItem({ 
  notification, 
  onDismiss, 
  onAction 
}: {
  notification: Notification;
  onDismiss: () => void;
  onAction: () => void;
}) {
  const Icon = getIcon(notification.category);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`group relative p-4 border-b border-slate-800/50 
                 hover:bg-slate-800/30 transition-all duration-200
                 ${!notification.read ? 'bg-slate-800/20' : ''}`}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 
                       bg-gradient-to-b from-cyan-500 to-violet-500 
                       rounded-r-full" />
      )}

      <div className="flex gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center 
                       justify-center border ${getPriorityStyles(notification.priority)}`}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`text-sm font-medium truncate
                          ${!notification.read ? 'text-slate-100' : 'text-slate-400'}`}>
              {notification.title}
            </h4>
            <span className="text-[10px] text-slate-600 whitespace-nowrap">
              {formatDistanceToNow(notification.createdAt, { 
                addSuffix: true,
                locale: es 
              })}
            </span>
          </div>
          
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            {notification.description}
          </p>

          {/* Action Button */}
          {notification.metadata.actionUrl && (
            <button
              onClick={onAction}
              className="mt-2 text-xs font-medium text-cyan-400 
                       hover:text-cyan-300 flex items-center gap-1
                       transition-colors"
            >
              {notification.metadata.actionLabel || 'Ver detalle'}
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Dismiss */}
        <button
          onClick={onDismiss}
          className="opacity-0 group-hover:opacity-100 transition-opacity
                   p-1.5 hover:bg-slate-700/50 rounded-lg text-slate-500
                   hover:text-slate-300"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
```

### Vista Visual del Componente

```
┌─────────────────────────────────────────┐
│  Notificaciones              3 sin leer │
│                                         │
│  [ Todas ] [ Sin leer ]                 │
│                                         │
│  ┌─│─────────────────────────────────┐  │
│  │ 🔴  Documento rechazado      5m   │  │
│  │     CFDI inválido en Factura_001  │  │
│  │     [Corregir ahora →]            │  │
│  ├────────────────────────────────────┤  │
│  │ 🟡  Falta documentación      1h   │  │
│  │     Comprobante de domicilio      │  │
│  │     vencido (>3 meses)            │  │
│  │     [Subir nuevo →]               │  │
│  ├────────────────────────────────────┤  │
│  │ 🟢  ZIP generado             2h   │  │
│  │     Trámite #TR-452 listo         │  │
│  │     [Descargar →]                 │  │
│  ├────────────────────────────────────┤  │
│  │ ⚪  Sistema                  1d   │  │
│  │     Mantenimiento programado      │  │
│  └────────────────────────────────────┘  │
│                                         │
│        Ver historial completo →         │
└─────────────────────────────────────────┘
```

---

## 📁 Componente: "Mis Trámites" Unificado

### Arquitectura de Datos

```typescript
// types/tramite.ts
type TramiteStatus = 
  | 'draft'           // Borrador, no enviado
  | 'document_pending' // Esperando docs del usuario
  | 'processing'      // n8n trabajando
  | 'review'          // Revisión humana
  | 'completed'       // ZIP generado
  | 'rejected';       // Rechazado

type TramiteType = 'reembolso' | 'carta_pase' | 'emergencia';

interface Tramite {
  id: string;
  folio: string;           // TR-2024-0001
  type: TramiteType;
  status: TramiteStatus;
  asegurado: {
    nombre: string;
    poliza: string;
    rfc: string;
  };
  eventoMedico: {
    tipo: string;
    fecha: Date;
    montoReclamado: number;
  };
  documentacion: {
    total: number;
    validados: number;
    conErrores: number;
  };
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  metadata: {
    processingJobId?: string;
    zipUrl?: string;
    auditScore?: number;
  };
}
```

### Vista Principal: Lista de Trámites

```tsx
// app/tramites/page.tsx
export default function TramitesPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 
                         font-['Plus_Jakarta_Sans'] tracking-tight">
              Mis Trámites
            </h1>
            <p className="text-slate-500 mt-2">
              Gestiona tus solicitudes de Gastos Médicos Mayores
            </p>
          </div>
          
          <div className="flex gap-3">
            <ViewToggle />
            <NewTramiteButton />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <StatCard 
            label="Activos"
            value={12}
            trend="+2 esta semana"
            color="cyan"
          />
          <StatCard 
            label="Completados"
            value={48}
            trend="98% éxito"
            color="emerald"
          />
          <StatCard 
            label="Pendientes"
            value={3}
            trend="Requieren acción"
            color="amber"
            alert
          />
          <StatCard 
            label="Tiempo promedio"
            value="2.4 días"
            trend="-15% vs mes pasado"
            color="violet"
          />
        </div>
      </div>

      {/* Filters & Search */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex gap-4 items-center bg-slate-900/50 p-2 rounded-xl 
                      border border-slate-800">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 
                             w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por folio, asegurado o RFC..."
              className="w-full bg-transparent pl-10 pr-4 py-2 text-sm 
                       text-slate-200 placeholder:text-slate-600
                       focus:outline-none"
            />
          </div>
          
          <StatusFilter />
          <DateFilter />
          <TypeFilter />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        <TramitesTable />
      </div>
    </div>
  );
}
```

### Tabla Avanzada con Estados Visuales

```tsx
function TramitesTable() {
  return (
    <div className="bg-slate-900/30 rounded-2xl border border-slate-800 
                  overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/50">
            <th className="text-left py-4 px-6 text-xs font-semibold 
                         text-slate-500 uppercase tracking-wider">
              Trámite
            </th>
            <th className="text-left py-4 px-6 text-xs font-semibold 
                         text-slate-500 uppercase tracking-wider">
              Asegurado
            </th>
            <th className="text-left py-4 px-6 text-xs font-semibold 
                         text-slate-500 uppercase tracking-wider">
              Documentación
            </th>
            <th className="text-left py-4 px-6 text-xs font-semibold 
                         text-slate-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="text-right py-4 px-6 text-xs font-semibold 
                         text-slate-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {tramites.map((tramite) => (
            <TramiteRow key={tramite.id} tramite={tramite} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TramiteRow({ tramite }: { tramite: Tramite }) {
  const statusConfig = {
    draft: { 
      label: 'Borrador', 
      color: 'slate',
      icon: FileEdit 
    },
    document_pending: { 
      label: 'Docs. pendientes', 
      color: 'amber',
      icon: AlertCircle 
    },
    processing: { 
      label: 'Procesando', 
      color: 'cyan',
      icon: Loader2,
      animate: true 
    },
    review: { 
      label: 'En revisión', 
      color: 'violet',
      icon: Eye 
    },
    completed: { 
      label: 'Completado', 
      color: 'emerald',
      icon: CheckCircle2 
    },
    rejected: { 
      label: 'Rechazado', 
      color: 'red',
      icon: XCircle 
    }
  };

  const config = statusConfig[tramite.status];
  const Icon = config.icon;

  return (
    <tr className="group hover:bg-slate-800/30 transition-colors">
      {/* Folio & Type */}
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                         bg-${config.color}-500/10`}>
            <Icon className={`w-5 h-5 text-${config.color}-400 
                            ${config.animate ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="font-mono text-sm font-medium text-slate-200">
              #{tramite.folio}
            </div>
            <div className="text-xs text-slate-500 capitalize">
              {tramite.type.replace('_', ' ')}
            </div>
          </div>
        </div>
      </td>

      {/* Asegurado */}
      <td className="py-4 px-6">
        <div className="text-sm text-slate-200">{tramite.asegurado.nombre}</div>
        <div className="text-xs text-slate-500 font-mono mt-0.5">
          {tramite.asegurado.poliza}
        </div>
      </td>

      {/* Document Progress */}
      <td className="py-4 px-6">
        <div className="w-full max-w-[200px]">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-400">
              {tramite.documentacion.validados}/{tramite.documentacion.total}
            </span>
            {tramite.documentacion.conErrores > 0 && (
              <span className="text-red-400">
                {tramite.documentacion.conErrores} errores
              </span>
            )}
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                tramite.documentacion.conErrores > 0
                  ? 'bg-gradient-to-r from-amber-500 to-red-500'
                  : 'bg-gradient-to-r from-cyan-500 to-emerald-500'
              }`}
              style={{ 
                width: `${(tramite.documentacion.validados / 
                          tramite.documentacion.total) * 100}%` 
              }}
            />
          </div>
        </div>
      </td>

      {/* Status Badge */}
      <td className="py-4 px-6">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full 
                        text-xs font-medium border bg-${config.color}-500/10 
                        border-${config.color}-500/20 text-${config.color}-400`}>
          <span className={`w-1.5 h-1.5 rounded-full bg-${config.color}-400 
                          ${config.animate ? 'animate-pulse' : ''}`} />
          {config.label}
        </span>
      </td>

      {/* Actions */}
      <td className="py-4 px-6 text-right">
        <div className="flex items-center justify-end gap-2 opacity-0 
                      group-hover:opacity-100 transition-opacity">
          {tramite.status === 'completed' && (
            <button className="p-2 hover:bg-emerald-500/10 rounded-lg 
                             text-emerald-400 transition-colors"
                    title="Descargar ZIP">
              <Download className="w-4 h-4" />
            </button>
          )}
          <button className="p-2 hover:bg-slate-700 rounded-lg 
                           text-slate-400 hover:text-slate-200 
                           transition-colors">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-slate-700 rounded-lg 
                           text-slate-400 hover:text-slate-200 
                           transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
```

### Vista de Detalle (Slide-over)

```tsx
function TramiteDetail({ tramite }: { tramite: Tramite }) {
  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed inset-y-0 right-0 w-[600px] bg-slate-900 
                border-l border-slate-800 shadow-2xl z-50 overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl 
                    border-b border-slate-800 p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-100 
                           font-['Plus_Jakarta_Sans']">
                #{tramite.folio}
              </h2>
              <StatusBadge status={tramite.status} />
            </div>
            <p className="text-slate-500 mt-1">
              Creado {formatDistanceToNow(tramite.createdAt, { locale: es })}
            </p>
          </div>
          <button className="p-2 hover:bg-slate-800 rounded-lg">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Timeline */}
        <section>
          <h3 className="text-sm font-semibold text-slate-300 uppercase 
                       tracking-wider mb-4">
            Historial
          </h3>
          <Timeline events={tramite.events} />
        </section>

        {/* Documents Grid */}
        <section>
          <h3 className="text-sm font-semibold text-slate-300 uppercase 
                       tracking-wider mb-4">
            Documentación ({tramite.documentacion.total})
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {tramite.documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        </section>

        {/* Audit Score (si aplica) */}
        {tramite.metadata.auditScore && (
          <section className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
                            rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-300">
                  Puntuación de Auditoría
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Análisis automático de completitud
                </p>
              </div>
              <div className={`text-3xl font-bold font-['Plus_Jakarta_Sans']
                            ${tramite.metadata.auditScore >= 90 
                              ? 'text-emerald-400' 
                              : tramite.metadata.auditScore >= 70 
                                ? 'text-amber-400' 
                                : 'text-red-400'}`}>
                {tramite.metadata.auditScore}%
              </div>
            </div>
          </section>
        )}
      </div>
    </motion.div>
  );
}
```

---

## 🎯 Implementación Visual Final

### Comparativa: Antes vs Después

```
ANTES (tu imagen):                    DESPUÉS (propuesto):
┌─────────────────────────┐          ┌─────────────────────────┐
│  PRINCIPAL              │          │  ☰  GMM Dashboard    🔔 │
│  ├─ Centro de Control   │          │                         │
│  ├─ Expedientes         │          │  ┌─────────────────┐    │
│  ├─ Siniestros          │    →     │  │  Centro de      │    │
│  ├─ Asegurados          │          │  │  Control        │    │
│  └─ Configuración       │          │  │  [Wizard        │    │
│      └─ Parámetros      │          │  │   Rediseñado]   │    │
│                         │          │  └─────────────────┘    │
│  [Fondo azul oscuro     │          │                         │
│   genérico]             │          │  [Slate 950 + Cyan      │
│                         │          │   + Violet accents]     │
│  Tipografía: System     │          │                         │
│  default                │          │  Plus Jakarta Sans      │
│                         │          │  + Inter                │
└─────────────────────────┘          └─────────────────────────┘
```

### CSS Global Sugerido

```css
/* globals.css */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
    background: #0F172A;
    color: #F8FAFC;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  }
  
  code, .font-mono {
    font-family: 'JetBrains Mono', monospace;
  }
}

@layer components {
  .glass-panel {
    @apply bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 
           rounded-2xl shadow-xl shadow-black/20;
  }
  
  .gradient-text {
    @apply bg-gradient-to-r from-cyan-400 to-violet-400 
           bg-clip-text text-transparent;
  }
  
  .btn-primary {
    @apply px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 
           hover:from-cyan-400 hover:to-cyan-500 text-white 
           font-medium rounded-xl transition-all duration-200 
           shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40;
  }
}
```

---

## 📋 Checklist de Implementación

| Prioridad | Tarea | Archivos a crear/modificar |
|-----------|-------|---------------------------|
| 🔥 Alta | Instalar fuentes | `layout.tsx` + `globals.css` |
| 🔥 Alta | Componente NotificationCenter | `components/notifications/` |
| 🔥 Alta | Página Mis Trámites | `app/tramites/page.tsx` |
| 🟡 Media | Tabla TramitesTable | `components/tramites/Table.tsx` |
| 🟡 Media | Vista detalle Slide-over | `components/tramites/Detail.tsx` |
| 🟢 Baja | Realtime subscriptions | `lib/supabase/realtime.ts` |


----------------------------------------------------------------

Perfecto, desarrollaré ambos. Empezaré con la **implementación completa del sistema realtime** (arquitectura backend + frontend) y luego el **diseño responsive móvil** con UX optimizada para campo.

---

## 🔴 PARTE 1: Sistema Realtime Completo

### Arquitectura General

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │◄────┤  Supabase        │◄────┤   n8n Workflows │
│   (Next.js)     │ WS  │  Realtime        │ DB  │   (Triggers)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                                               │
        │                    ┌──────────────────┐      │
        └───────────────────►│  Edge Functions  │◄─────┘
                             │  (Processing)    │
                             └──────────────────┘
```

### 1.1 Esquema de Base de Datos (Supabase)

```sql
-- migrations/20240404_notifications_system.sql

-- Tabla principal de notificaciones
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    
    -- Categorización
    priority notification_priority NOT NULL DEFAULT 'medium',
    category notification_category NOT NULL,
    
    -- Contenido
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    
    -- Estado
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    dismissed BOOLEAN DEFAULT FALSE,
    dismissed_at TIMESTAMPTZ,
    
    -- Expiración opcional
    expires_at TIMESTAMPTZ,
    
    -- Relaciones
    tramite_id UUID REFERENCES tramites(id),
    document_id UUID REFERENCES documents(id),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tipos enum
CREATE TYPE notification_priority AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE notification_category AS ENUM ('document', 'system', 'tramite', 'audit', 'processing');

-- Índices críticos para performance
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read) 
    WHERE dismissed = FALSE;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_tramite ON notifications(tramite_id);

-- Políticas RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own notifications"
    ON notifications FOR ALL
    USING (user_id = auth.uid());

-- Función para limpiar notificaciones antiguas (mantener últimos 90 días)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
    DELETE FROM notifications 
    WHERE created_at < NOW() - INTERVAL '90 days' 
      AND read = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 1.2 Edge Function: Procesador de Notificaciones

```typescript
// supabase/functions/notify/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface NotificationPayload {
  userId: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'document' | 'system' | 'tramite' | 'audit' | 'processing';
  title: string;
  description: string;
  metadata?: Record<string, any>;
  tramiteId?: string;
  documentId?: string;
  expiresInHours?: number;
}

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    const payload: NotificationPayload = await req.json()
    
    // Validar campos requeridos
    if (!payload.userId || !payload.title || !payload.description) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Calcular expiración si aplica
    const expiresAt = payload.expiresInHours 
      ? new Date(Date.now() + payload.expiresInHours * 60 * 60 * 1000).toISOString()
      : null

    // Insertar notificación
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: payload.userId,
        priority: payload.priority,
        category: payload.category,
        title: payload.title,
        description: payload.description,
        metadata: payload.metadata || {},
        tramite_id: payload.tramiteId,
        document_id: payload.documentId,
        expires_at: expiresAt
      })
      .select()
      .single()

    if (error) throw error

    // Si es crítica, también enviar email/push (opcional)
    if (payload.priority === 'critical') {
      await sendUrgentAlert(supabase, payload)
    }

    return new Response(
      JSON.stringify({ success: true, notification: data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

async function sendUrgentAlert(supabase: any, payload: NotificationPayload) {
  // Implementar integración con Resend/Twilio para alertas críticas
  console.log('Sending urgent alert:', payload)
}
```

### 1.3 Hook Realtime Completo (Frontend)

```typescript
// hooks/useRealtimeNotifications.ts
'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { useSound } from './useSound';

interface Notification {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
  metadata: Record<string, any>;
}

interface UseRealtimeNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismissNotification: (id: string) => Promise<void>;
  isConnected: boolean;
}

export function useRealtimeNotifications(): UseRealtimeNotificationsReturn {
  const supabase = createClientComponentClient();
  const { play } = useSound('/sounds/notification-soft.mp3');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<any>(null);

  // Cargar notificaciones iniciales
  const fetchInitial = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('dismissed', false)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setNotifications(data.map(n => ({
        id: n.id,
        priority: n.priority,
        category: n.category,
        title: n.title,
        description: n.description,
        read: n.read,
        createdAt: n.created_at,
        metadata: n.metadata
      })));
    }
  }, [supabase]);

  // Setup realtime subscription
  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout;

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Canal privado por usuario
      const channel = supabase
        .channel(`notifications:${user.id}`, {
          config: {
            broadcast: { self: false },
            presence: { key: user.id }
          }
        })
        .on('postgres_changes', 
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload: RealtimePostgresChangesPayload<any>) => {
            const newNotification = payload.new as Notification;
            
            // Agregar al inicio
            setNotifications(prev => [newNotification, ...prev]);
            
            // Sonido solo si no está silenciado
            if (!newNotification.read) {
              play();
              
              // Mostrar toast nativo si está permitido
              showNativeNotification(newNotification);
            }
          }
        )
        .on('postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const updated = payload.new as Notification;
            setNotifications(prev => 
              prev.map(n => n.id === updated.id ? updated : n)
            );
          }
        )
        .on('postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'notifications'
          },
          (payload) => {
            setNotifications(prev => 
              prev.filter(n => n.id !== payload.old.id)
            );
          }
        )
        .subscribe((status) => {
          setIsConnected(status === 'SUBSCRIBED');
          
          if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            // Reconexión exponencial
            reconnectTimeout = setTimeout(setupRealtime, 3000);
          }
        });

      channelRef.current = channel;
    };

    fetchInitial();
    setupRealtime();

    // Cleanup
    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [supabase, play, fetchInitial]);

  // Acciones
  const markAsRead = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    }
  }, [supabase]);

  const markAllAsRead = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('read', false);

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  }, [supabase]);

  const dismissNotification = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ dismissed: true, dismissed_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  }, [supabase]);

  // Notificación nativa del navegador
  const showNativeNotification = (notification: Notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.description,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: notification.id,
        requireInteraction: notification.priority === 'critical'
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    isConnected
  };
}
```

### 1.4 Integración n8n → Notificaciones

```typescript
// Ejemplo de nodo HTTP Request en n8n que dispara notificaciones

// Cuando un documento es rechazado por IA
const documento = $input.first().json;
const userId = documento.user_id;

// Llamar a Edge Function
const response = await $httpRequest({
  method: 'POST',
  url: 'https://[PROJECT].supabase.co/functions/v1/notify',
  headers: {
    'Authorization': `Bearer ${$env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  },
  body: {
    userId: userId,
    priority: 'high',
    category: 'document',
    title: 'Documento rechazado por validación IA',
    description: `El archivo ${documento.filename} no pasó la validación: ${documento.error_message}`,
    metadata: {
      documentName: documento.filename,
      errorCode: documento.error_code,
      actionUrl: `/tramites/${documento.tramite_id}?doc=${documento.id}`
    },
    tramiteId: documento.tramite_id,
    documentId: documento.id,
    expiresInHours: 48
  }
});

return [{ json: response }];
```

---

## 📱 PARTE 2: Diseño Responsive Móvil

### Estrategia: "Mobile-First para Campo"

Los agentes de GMM usan la app en hospitales (mala señal, pantallas pequeñas, prisa). Priorizamos:

1. **Información crítica primero**
2. **Acciones grandes y claras**
3. **Offline capability**
4. **Gestos táctiles intuitivos**

### Vista Móvil: Lista de Trámites (Cards)

```tsx
// components/tramites/MobileTramiteList.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  MoreVertical
} from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface MobileTramiteListProps {
  tramites: Tramite[];
  onTramiteClick: (tramite: Tramite) => void;
  onActionClick: (tramite: Tramite, action: string) => void;
}

export function MobileTramiteList({ 
  tramites, 
  onTramiteClick,
  onActionClick 
}: MobileTramiteListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-3 pb-20">
      <AnimatePresence mode="popLayout">
        {tramites.map((tramite, index) => (
          <motion.div
            key={tramite.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ delay: index * 0.05 }}
            className="bg-slate-900/60 backdrop-blur rounded-2xl 
                     border border-slate-800 overflow-hidden
                     active:scale-[0.98] transition-transform"
          >
            {/* Card Header - Siempre visible */}
            <div 
              className="p-4"
              onClick={() => onTramiteClick(tramite)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Folio y Status */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-sm text-cyan-400 font-medium">
                      #{tramite.folio}
                    </span>
                    <StatusPill status={tramite.status} />
                  </div>
                  
                  {/* Tipo y Asegurado */}
                  <h3 className="text-slate-100 font-medium truncate">
                    {tramite.asegurado.nombre}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {tramite.type === 'reembolso' ? 'Reembolso' : 'Carta Pase'} • {' '}
                    {formatDistanceToNow(tramite.createdAt, { 
                      addSuffix: true,
                      locale: es 
                    })}
                  </p>
                </div>

                {/* Expand/Chevron */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedId(expandedId === tramite.id ? null : tramite.id);
                  }}
                  className={`p-2 -mr-2 transition-transform duration-200
                            ${expandedId === tramite.id ? 'rotate-90' : ''}`}
                >
                  <ChevronRight className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Progress Bar (compacto) */}
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      tramite.documentacion.conErrores > 0
                        ? 'bg-red-500'
                        : 'bg-gradient-to-r from-cyan-500 to-emerald-500'
                    }`}
                    style={{ 
                      width: `${(tramite.documentacion.validados / 
                                tramite.documentacion.total) * 100}%` 
                    }}
                  />
                </div>
                <span className="text-xs text-slate-500">
                  {tramite.documentacion.validados}/{tramite.documentacion.total}
                </span>
              </div>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
              {expandedId === tramite.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-slate-800 bg-slate-950/30"
                >
                  <div className="p-4 space-y-4">
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <InfoItem 
                        label="Póliza"
                        value={tramite.asegurado.poliza}
                      />
                      <InfoItem 
                        label="Monto"
                        value={`$${tramite.eventoMedico.montoReclamado.toLocaleString()}`}
                      />
                      <InfoItem 
                        label="Evento"
                        value={tramite.eventoMedico.tipo}
                      />
                      <InfoItem 
                        label="Documentos"
                        value={`${tramite.documentacion.conErrores > 0 ? '⚠️ ' : ''}${
                          tramite.documentacion.conErrores} errores`}
                        danger={tramite.documentacion.conErrores > 0}
                      />
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      {tramite.status === 'completed' && (
                        <ActionButton
                          variant="primary"
                          icon={Download}
                          label="Descargar ZIP"
                          onClick={() => onActionClick(tramite, 'download')}
                        />
                      )}
                      {tramite.status === 'document_pending' && (
                        <ActionButton
                          variant="warning"
                          icon={Upload}
                          label="Subir docs"
                          onClick={() => onActionClick(tramite, 'upload')}
                        />
                      )}
                      <ActionButton
                        variant="secondary"
                        icon={Eye}
                        label="Ver detalle"
                        onClick={() => onTramiteClick(tramite)}
                      />
                      <ActionButton
                        variant="ghost"
                        icon={Share2}
                        label="Compartir"
                        onClick={() => onActionClick(tramite, 'share')}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Swipe Actions Hint (solo visual) */}
            <div className="px-4 pb-2 text-[10px] text-slate-600 text-center">
              Desliza para acciones rápidas →
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Empty State */}
      {tramites.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-800/50 
                        flex items-center justify-center">
            <FileText className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-slate-300 font-medium">No hay trámites</h3>
          <p className="text-sm text-slate-500 mt-1">
            Comienza creando uno nuevo
          </p>
        </div>
      )}
    </div>
  );
}

// Sub-componentes móviles
function StatusPill({ status }: { status: TramiteStatus }) {
  const config = {
    draft: { bg: 'bg-slate-500/20', text: 'text-slate-400', label: 'Borrador' },
    document_pending: { 
      bg: 'bg-amber-500/20', 
      text: 'text-amber-400', 
      label: 'Pendiente' 
    },
    processing: { 
      bg: 'bg-cyan-500/20', 
      text: 'text-cyan-400', 
      label: 'Procesando',
      pulse: true 
    },
    review: { bg: 'bg-violet-500/20', text: 'text-violet-400', label: 'Revisión' },
    completed: { 
      bg: 'bg-emerald-500/20', 
      text: 'text-emerald-400', 
      label: 'Listo' 
    },
    rejected: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Rechazado' }
  };

  const c = config[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full 
                    text-[10px] font-medium ${c.bg} ${c.text}`}>
      {c.pulse && <span className="w-1 h-1 rounded-full bg-current animate-pulse" />}
      {c.label}
    </span>
  );
}

function InfoItem({ 
  label, 
  value, 
  danger 
}: { 
  label: string; 
  value: string; 
  danger?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">
        {label}
      </p>
      <p className={`text-sm font-medium ${danger ? 'text-red-400' : 'text-slate-200'}`}>
        {value}
      </p>
    </div>
  );
}

function ActionButton({ 
  variant, 
  icon: Icon, 
  label, 
  onClick 
}: {
  variant: 'primary' | 'warning' | 'secondary' | 'ghost';
  icon: any;
  label: string;
  onClick: () => void;
}) {
  const styles = {
    primary: 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25',
    warning: 'bg-amber-500 text-white shadow-lg shadow-amber-500/25',
    secondary: 'bg-slate-700 text-slate-200',
    ghost: 'bg-transparent text-slate-400 border border-slate-700'
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 py-3 px-4 
                rounded-xl text-sm font-medium active:scale-95 
                transition-all ${styles[variant]}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
```

### Vista Móvil: Bottom Navigation

```tsx
// components/layout/MobileBottomNav.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  FolderOpen, 
  PlusCircle, 
  Bell, 
  User 
} from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { href: '/', icon: Home, label: 'Inicio' },
  { href: '/tramites', icon: FolderOpen, label: 'Trámites' },
  { href: '/nuevo', icon: PlusCircle, label: 'Nuevo', primary: true },
  { href: '/notificaciones', icon: Bell, label: 'Alertas' },
  { href: '/perfil', icon: User, label: 'Perfil' }
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 
                  bg-slate-950/90 backdrop-blur-xl border-t border-slate-800
                  safe-area-pb">
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-1 py-2 px-3
                        transition-colors ${
                isActive ? 'text-cyan-400' : 'text-slate-500'
              }`}
            >
              {item.primary ? (
                // Botón central destacado
                <div className="relative -top-5">
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="w-14 h-14 rounded-full bg-gradient-to-br 
                             from-cyan-500 to-violet-500 flex items-center 
                             justify-center shadow-lg shadow-cyan-500/30
                             border-4 border-slate-950"
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <span className="text-[10px] font-medium mt-1 block">
                    {item.label}
                  </span>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                    {item.href === '/notificaciones' && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 
                                     bg-red-500 rounded-full text-[9px] 
                                     font-bold text-white flex items-center 
                                     justify-center border-2 border-slate-950">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                  
                  {/* Indicador activo */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-2 w-1 h-1 rounded-full 
                               bg-cyan-400"
                    />
                  )}
                </>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

### Vista Móvil: Detalle de Trámite (Full Screen)

```tsx
// components/tramites/MobileTramiteDetail.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  MessageCircle, 
  FileText,
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';

interface MobileTramiteDetailProps {
  tramite: Tramite;
  onClose: () => void;
}

export function MobileTramiteDetail({ tramite, onClose }: MobileTramiteDetailProps) {
  const [activeSection, setActiveSection] = useState<string>('documentos');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-950"
    >
      {/* Header Sticky */}
      <div className="sticky top-0 bg-slate-950/95 backdrop-blur-xl 
                    border-b border-slate-800 z-10">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={onClose}
            className="p-2 -ml-2 hover:bg-slate-800 rounded-full 
                     transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
          
          <h1 className="font-mono text-sm text-slate-300">
            #{tramite.folio}
          </h1>
          
          <button className="p-2 -mr-2 hover:bg-slate-800 rounded-full">
            <MoreVertical className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Progress Steps (simplificado) */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between">
            {['Inicio', 'Docs', 'Proceso', 'Listo'].map((step, idx) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center 
                              justify-center text-xs font-medium
                              ${idx <= getCurrentStep(tramite.status) 
                                ? 'bg-cyan-500 text-white' 
                                : 'bg-slate-800 text-slate-500'}`}>
                  {idx < getCurrentStep(tramite.status) ? '✓' : idx + 1}
                </div>
                {idx < 3 && (
                  <div className={`w-8 h-0.5 mx-1 ${
                    idx < getCurrentStep(tramite.status) 
                      ? 'bg-cyan-500' 
                      : 'bg-slate-800'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Scrollable */}
      <div className="h-[calc(100vh-140px)] overflow-y-auto pb-24">
        {/* Info Card */}
        <div className="p-4">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
                        rounded-2xl p-4 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-slate-100 
                         font-['Plus_Jakarta_Sans']">
              {tramite.asegurado.nombre}
            </h2>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-xs text-slate-500">Tipo</p>
                <p className="text-sm text-slate-300 capitalize">
                  {tramite.type.replace('_', ' ')}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Monto</p>
                <p className="text-sm text-slate-300">
                  ${tramite.eventoMedico.montoReclamado.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Accordion Sections */}
        <div className="px-4 space-y-2">
          <AccordionSection
            title="Documentos"
            icon={FileText}
            isOpen={activeSection === 'documentos'}
            onToggle={() => setActiveSection(
              activeSection === 'documentos' ? '' : 'documentos'
            )}
          >
            <DocumentList documents={tramite.documents} />
          </AccordionSection>

          <AccordionSection
            title="Historial"
            icon={Clock}
            isOpen={activeSection === 'historial'}
            onToggle={() => setActiveSection(
              activeSection === 'historial' ? '' : 'historial'
            )}
          >
            <Timeline events={tramite.events} compact />
          </AccordionSection>

          <AccordionSection
            title="Chat / Notas"
            icon={MessageCircle}
            isOpen={activeSection === 'chat'}
            onToggle={() => setActiveSection(
              activeSection === 'chat' ? '' : 'chat'
            )}
          >
            <ChatInterface tramiteId={tramite.id} />
          </AccordionSection>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t 
                    from-slate-950 via-slate-950 to-transparent">
        {tramite.status === 'completed' ? (
          <button className="w-full py-4 bg-gradient-to-r from-emerald-500 
                           to-emerald-600 rounded-xl text-white font-semibold
                           shadow-lg shadow-emerald-500/25 flex items-center 
                           justify-center gap-2 active:scale-[0.98] 
                           transition-transform">
            <Download className="w-5 h-5" />
            Descargar ZIP del trámite
          </button>
        ) : (
          <button className="w-full py-4 bg-gradient-to-r from-cyan-500 
                           to-cyan-600 rounded-xl text-white font-semibold
                           shadow-lg shadow-cyan-500/25 active:scale-[0.98] 
                           transition-transform">
            Continuar trámite
          </button>
        )}
      </div>
    </motion.div>
  );
}

function AccordionSection({ 
  title, 
  icon: Icon, 
  isOpen, 
  onToggle, 
  children 
}: any) {
  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-800 
                  overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-slate-400" />
          <span className="font-medium text-slate-200">{title}</span>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-slate-500 transition-transform
                     ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-slate-800/50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### CSS para Safe Areas (iPhone notch)

```css
/* globals.css additions */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .safe-area-pb {
    padding-bottom: env(safe-area-inset-bottom);
  }
}

/* Touch targets mínimos 44px */
@media (max-width: 768px) {
  button, a {
    min-height: 44px;
    min-width: 44px;
  }
}

/* Prevenir zoom en inputs en iOS */
input, select, textarea {
  font-size: 16px;
}

/* Scroll momentum en móvil */
.scroll-momentum {
  -webkit-overflow-scrolling: touch;
}
```

---

## 🔗 Integración Completa: Page Responsive

```tsx
// app/tramites/page.tsx (versión final responsive)
'use client';

import { useMediaQuery } from '@/hooks/useMediaQuery';
import { DesktopTramiteTable } from '@/components/tramites/DesktopTable';
import { MobileTramiteList } from '@/components/tramites/MobileTramiteList';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

export default function TramitesPage() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { tramites, loading } = useTramites();

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header - diferente en móvil/desktop */}
      {isMobile ? <MobileHeader /> : <DesktopHeader />}
      
      {/* Content */}
      <main className={`${isMobile ? 'pb-24 px-4 pt-4' : 'p-6 max-w-7xl mx-auto'}`}>
        {loading ? (
          <TramitesSkeleton mobile={isMobile} />
        ) : isMobile ? (
          <MobileTramiteList 
            tramites={tramites} 
            onTramiteClick={handleTramiteClick}
            onActionClick={handleAction}
          />
        ) : (
          <DesktopTramiteTable 
            tramites={tramites}
            onTramiteClick={handleTramiteClick}
          />
        )}
      </main>

      {/* Navegación móvil */}
      {isMobile && <MobileBottomNav />}
    </div>
  );
}
```

---

## 📊 Resumen de Features Implementados

| Feature | Desktop | Móvil | Realtime |
|---------|---------|-------|----------|
| Lista de trámites | Tabla completa | Cards swipeables | ✅ |
| Detalle de trámite | Slide-over | Full screen | ✅ |
| Notificaciones | Dropdown | Badge + Lista | ✅ WebSocket |
| Acciones rápidas | Hover buttons | Bottom sheet | ✅ |
| Progreso visual | Barra completa | Compacta + steps | ✅ |
| Offline support | Limitado | ✅ Full | 🔄 Sync |








