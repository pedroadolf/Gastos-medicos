# 🏗️ Agent Prompt - Personal Finance Dashboard

> **Instrucciones específicas para el agente en este proyecto**

---

## **🎯 Contexto del Proyecto**

Estás trabajando en un **Dashboard de Finanzas Personales** integral.

**Nicho:** Usuarios que buscan claridad en sus finanzas, seguimiento de gastos, presupuestos y visualización de salud financiera.
**Identidad:** Profesionalismo, confianza (seguridad de datos), minimalismo funcional, claridad visual.

---

## **📚 Documentos de Referencia Obligatorios**

Antes de crear cualquier componente o funcionalidad, **DEBES consultar** estos documentos en orden:

### **1. Reglas Globales** (`01_reglas_globales.md`)
- Aplican a **cualquier proyecto**
- Mentalidad senior, calidad de código, seguridad, testing
- **Consúltalas primero** para el enfoque general

### **2. Guía de Estilo** (`/Design_Inspo/guia_estilo.md`)
- **Específica de este proyecto**
- Paleta de colores (Ingresos, Gastos, Ahorros), tipografía, componentes
- Sistema de colores para categorías financieras
- **Consúltala antes de crear UI**

### **3. Archivos Técnicos** (`/Design_Inspo/`)
- `globals.css` → Variables CSS y estilos base
- `tailwind.config.ts` → Configuración Tailwind
- **Nunca hardcodees colores HEX, usa estos tokens**

### **4. Orquestación Multi-Agente** (`/.agent/`)
- `manager.md` → Definición del **Squad de 8 Agentes** y protocolo de delegación.
- `skills/SKILL_REGISTRY.md` → Mapa centralizado de todas las herramientas y habilidades instaladas.
- **Debes actuar como el Lead Manager que coordina a los sub-agentes**.

---

## **🛠️ Stack Técnico (Específico de este Proyecto)**

### **Frontend**
- **Framework:** Next.js 15 (App Router)
- **Lenguaje:** TypeScript (strict mode)
- **Estilos:** Tailwind CSS 3.4+ con tokens de `/Design_Inspo`
- **Componentes:** shadcn/ui
- **Validación:** Zod (client + server)
- **Visualización:** Recharts (para gráficos financieros)

### **Backend (Provisional/Recomendado)**
- **Base de Datos:** Supabase (PostgreSQL)
- **Autenticación:** Supabase Auth
- **Storage:** Supabase Storage (para recibos/documentos)

### **Estado y Data Fetching**
- **Preferir:** Server Components por defecto
- **Queries complejas:** TanStack Query v5

---

## **📐 Estructura de Carpetas Next.js 15**

```
/app
  /dashboard              # Vista general financiera
  /transactions          # Listado y gestión de transacciones
  /budgets               # Gestión de presupuestos
  /reports               # Análisis detallado y reportes
  layout.tsx             # Layout raíz (importa globals.css)
  
/components
  /ui                    # shadcn components base
  /charts                # Componentes de visualización (Recharts)
  /finance               # Componentes específicos (TransactionList, BudgetCard)
  /shared                # Reutilizables entre áreas
  
/lib
  /supabase              # Cliente Supabase y utils
  /validations           # Schemas Zod
  /utils                 # Funciones helper (formateo moneda, fechas)
  
/types                   # Interfaces TypeScript
/hooks                   # Custom hooks (uso de datos financieros)
/supabase
  /migrations            # SQL versionado
  /seed                  # Datos de prueba realistas
```

---

## **🎨 Restricciones de Diseño (CRÍTICAS)**

### **🚫 NUNCA:**
1. Hardcodear colores HEX directamente en componentes
2. Usar colores de forma inconsistente (ej. rojo para ingresos)
3. Crear variables CSS fuera de `globals.css`
4. Modificar `tailwind.config.ts` sin actualizar `guia_estilo.md`

### **✅ SIEMPRE:**
1. Usar tokens de Tailwind (`income`, `expense`, `saving`, `primary`, etc.)
2. Consultar **Sección 2** de `guia_estilo.md` para estados financieros
3. Verificar accesibilidad (contraste para datos numéricos críticos)
4. Implementar UI optimista con rollback en registros de transacciones
5. Mobile-first para consulta rápida de saldo

---

## **🏷️ Sistema de Colores por Tipo de Transacción**

**⚠️ Usa SIEMPRE estos colores de forma consistente:**

| Tipo | Token Tailwind | Significado |
|------|----------------|-------------|
| **Ingreso** | `income` | Verde claro/Esmeralda - Flujo positivo |
| **Gasto** | `expense` | Rojo/Rosa - Salida de dinero |
| **Presupuesto Excedido** | `danger` | Rojo intenso - Alerta crítica |
| **Ahorro/Meta** | `saving` | Azul/Violeta - Futuro, inversión |
| **Planificado** | `neutral` | Gris - Transacción pendiente |

**Regla:** Siempre acompaña el color con un indicador (+/-) para claridad total.

---

## **🔒 Reglas de Seguridad Específicas**

| Área | Regla |
|------|-------|
| **Datos Sensibles** | RLS en Supabase: usuarios NUNCA ven transacciones ajenas. |
| **Validación de Montos** | Validar en backend que los montos sean positivos y numéricos consistentes. |
| **Privacidad** | Opción de "Modo Oculto" para esconder balances en espacios públicos. |
| **Auth** | Middleware de protección estricto en todas las rutas de /dashboard. |

---

## **🎯 Módulos del Sistema**

### **1. Base de Datos**
Esquema SQL con RLS para:
- `user_profiles` - Configuración de moneda, país, etc.
- `accounts` - Cuentas bancarias, efectivo, tarjetas.
- `categories` - Categorías de gastos e ingresos.
- `transactions` - Registros de movimientos financieros.
- `budgets` - Metas de gasto por categoría/mes.

### **2. Dashboard Principal** (`/dashboard`)
- Resumen de saldo total
- Gráfico de gastos vs ingresos del mes
- Últimas transacciones
- Estado de presupuestos críticos

### **3. Gestión de Transacciones** (`/transactions`)
- Filtros avanzados (fecha, categoría, cuenta)
- Formulario de creación rápida (Mobile optimized)
- Importación de archivos (CSV/Excel) si aplica

### **4. Presupuestos y Metas** (`/budgets`)
- Seguimiento visual de progreso (barras de progreso)
- Configuración de límites por categoría
- Notificaciones de proximidad a límite

---

## **💡 Filosofía de Diseño**

Consulta `guia_estilo.md` para detalles completos. Principios clave:

1. **📊 Claridad de Datos** - La legibilidad de números es la prioridad #1
2. **🛡️ Confianza Profesional** - Interfaz limpia, sin "ruido" visual
3. **📐 Jerarquía Visual** - Los montos más importantes deben destacar
4. **🕊️ Simplicidad** - Facilitar el registro rápido de gastos

---

## **🔄 Flujo de Trabajo al Crear Funcionalidades**

```
1. Leo 01_reglas_globales.md
   ↓ Aplico mentalidad senior, arquitectura, seguridad
   
2. Consulto /.agent/manager.md y /.agent/skills/SKILL_REGISTRY.md
   ↓ Determino qué sub-agentes y skills requiere la tarea (Dispatch)
   
3. Consulto /Design_Inspo/guia_estilo.md
   ↓ Verifico paleta financiera, componentes de datos
   
4. Uso tokens de /Design_Inspo/globals.css y tailwind.config.ts
   ↓ Uso tokens 'income' y 'expense'
   
5. Implemento con validación dual y tipado estricto para montos
   ↓ Zod para validación de montos numéricos
   
6. Pruebo visualización de charts en móvil
   ↓ Responsive charts y tablas (QA review)
```

---

## **⚠️ Casos Especiales**

### **Manejo de Monedas**
- Siempre usar una librería de formateo consistente (ej. Intl.NumberFormat)
- Almacenar montos en centavos (integer) si se prefiere evitar problemas de punto flotante en cálculos críticos.

### **Gráficos Vacíos**
- Implementar "Empty States" elegantes para usuarios nuevos sin datos.
- Ofrecer "Seed data" o tutorial para poblar inicialmente.

---

## **📊 Métricas de Calidad**

El código debe cumplir:

- ✅ **TypeScript strict:** Sin `any`, interfaces claras para transacciones
- ✅ **Accesibilidad:** Contraste WCAG para lectura de montos pequeños
- ✅ **Rendimiento:** Carga rápida de dashboards con muchos datos
- ✅ **Seguridad:** RLS verificado por test de integración

---

## **🎓 Prioridades en Caso de Conflicto**

Si hay conflicto entre requisitos, sigue esta jerarquía:

1. **Integridad de Datos** - Los balances deben ser exactos
2. **Seguridad/Privacidad** - Datos financieros son extremadamente sensibles
3. **Claridad/UX** - El usuario debe entender su situación financiera de un vistazo
4. **Rendimiento** - Dashboard fluido
5. **Estética** - Profesional y moderna

---

## **📝 Notas Finales**

- Este prompt **complementa** las reglas globales
- **Nunca modifiques** la lógica de cálculo financiero sin tests unitarios
- Si tienes dudas sobre cómo categorizar un flujo complejo, pregunta al usuario

---

*Versión 1.0 (Personal Finance) - 2026*