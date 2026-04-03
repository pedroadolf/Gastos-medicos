# 🎨 Guía de Estilo - Personal Finance Dashboard

*Claridad financiera, confianza y minimalismo moderno 2026*  
**Proyecto:** Dashboard de Finanzas Personales

---

## **📋 Índice**

1. [Filosofía de Diseño](#1-filosofía-de-diseño)
2. [Paleta de Colores](#2-paleta-de-colores)
3. [Design Tokens (CSS)](#3-design-tokens-css)
4. [Tipografía](#4-tipografía)
5. [Breakpoints](#5-breakpoints)
6. [Componentes y Patrones](#6-componentes-y-patrones)
7. [Micro-interacciones](#7-micro-interacciones)
8. [Layout y Estructura](#8-layout-y-estructura)
9. [Accesibilidad](#9-accesibilidad)
10. [Inspiración y Referencias](#10-inspiración-y-referencias)
11. [Anti-patrones](#11-anti-patrones)

---

## **1. Filosofía de Diseño**

| Principio | Descripción |
|-----------|-------------|
| **📊 Claridad de Datos** | La legibilidad de los números es la prioridad #1. El usuario debe entender su saldo en < 1 segundo. |
| **🛡️ Confianza & Seguridad** | Diseño profesional, colores sólidos (Deep Teal, Slate) que transmitan estabilidad financiera. |
| **📐 Jerarquía Visual** | El flujo de dinero (Ingresos vs Gastos) debe ser lo más destacado visualmente. |
| **🕊️ Simplicidad** | Reducir la fricción para registrar transacciones. Menos pasos = mejor seguimiento. |

---

## **2. Paleta de Colores**

### **🎨 "Claridad Profesional" (2026)**

Paleta diseñada para dashboard financiero: combina tonos profesionales de azul/slate con acentos vibrantes pero controlados para flujos de dinero.

#### **Colores Base**

| Color | HEX | Uso principal | Token CSS | Token Tailwind |
|-------|-----|---------------|-----------|----------------|
| **Primary** | `#0F172A` | Sidebar, títulos, headers | `--color-primary` | `primary` |
| **Income** | `#10B981` | Ingresos, balances positivos | `--color-income` | `income` |
| **Expense** | `#F43F5E` | Gastos, salidas de dinero | `--color-expense` | `expense` |
| **Saving** | `#8B5CF6` | Metas de ahorro, inversiones | `--color-saving` | `saving` |
| **Amber** | `#F59E0B` | Presupuestos limitados | `--color-amber` | `amber` |
| **Danger** | `#E11D48` | Presupuesto excedido | `--color-danger` | `danger` |

#### **Fondos y Superficies**

| Elemento | Light | Dark | Token CSS |
|----------|-------|------|-----------|
| **Fondo principal** | `#F8FAFC` | `#020617` | `--color-bg` |
| **Fondo secundario** | `#F1F5F9` | `#0F172A` | `--color-bg-muted` |
| **Superficie** | `#FFFFFF` | `#111827` | `--color-surface` |

#### **Texto**

| Elemento | Light | Dark | Token CSS |
|----------|-------|------|-----------|
| **Principal** | `#0F172A` | `#F8FAFC` | `--color-text` |
| **Secundario** | `#64748B` | `#94A3B8` | `--color-text-muted` |
| **Placeholder** | `#94A3B8` | `#475569` | `--color-text-placeholder` |

---

### **🏷️ Sistema de Colores Semánticos por Flujo**

**⚠️ CRÍTICO:** Usa estos colores de forma **consistente**. No uses verde para nada que no sea positivo/ingreso.

| Estado | Significado | HEX | Token Tailwind | Clases Recomendadas |
|--------|-------------|-----|----------------|---------------------|
| **Ingreso** | Flujo positivo | `#10B981` | `income` | `text-emerald-600 dark:text-emerald-400 font-semibold` |
| **Gasto** | Flujo negativo | `#F43F5E` | `expense` | `text-rose-600 dark:text-rose-400` |
| **Presupuesto al límite** | Precaución | `#F59E0B` | `amber` | `bg-amber-100 text-amber-700 dark:bg-amber-900/30` |
| **Excedido** | Crítico | `#E11D48` | `danger` | `bg-rose-100 text-rose-700 dark:bg-rose-900/30` |
| **Ahorro/Meta** | Inversión/Meta | `#8B5CF6` | `saving` | `text-violet-600 dark:text-violet-400` |

---

## **3. Design Tokens (CSS)**

### **🔧 Variables CSS (`:root`)**

```css
:root {
  /* Colores */
  --color-primary:        #0F172A;
  --color-income:         #10B981;
  --color-expense:        #F43F5E;
  --color-saving:         #8B5CF6;
  --color-amber:          #F59E0B;
  --color-danger:         #E11D48;

  --color-bg:             #F8FAFC;
  --color-bg-muted:       #F1F5F9;
  --color-surface:        #FFFFFF;

  --color-text:           #0F172A;
  --color-text-muted:     #64748B;
  --color-text-placeholder: #94A3B8;

  --color-border:         #E2E8F0;

  /* Geometría */
  --radius-sm:   0.375rem;
  --radius-md:   0.5rem;
  --radius-lg:   0.75rem;
  --radius-xl:   1rem;
}
```

---

## **4. Tipografía**

| Tipo | Fuente | Uso |
|------|--------|-----|
| **Principal** | **Inter** | UI, labels, texto general |
| **Datos / Montos**| **JetBrains Mono** | Montos numéricos, tablas, reportes |

---

## **6. Componentes y Patrones**

### **📊 Finance Summary Cards**

```tsx
// Card de Saldo
className="rounded-xl border border-border p-6 bg-surface shadow-sm
           flex flex-col gap-2 hover:border-income/50 transition-colors"
```

### **🧾 Transaction List Item**

```tsx
// Item de transacción
className="flex items-center justify-between p-4 border-b border-border/50
           hover:bg-bg-muted transition-colors cursor-pointer"
```

---

## **9. Accesibilidad**

### **♿ No dependas solo del color para montos**

```tsx
// ❌ Mal
<div className="text-income">1,250.00</div>

// ✅ Bien
<div className="text-income flex items-center gap-1 font-mono">
  <ArrowUpIcon className="w-4 h-4" />
  +$1,250.00
</div>
```

---

## **11. Anti-patrones**

**❌ NO HACER:**
- Usar fuentes decorativas para montos numéricos.
- Ocultar el signo "+" o "-" en balances.
- Usar más de 2 cifras decimales si no se requieren.
- Dashboard saturado de gráficos redundantes.

---

*Versión 1.0 (Personal Finance) - 2026*