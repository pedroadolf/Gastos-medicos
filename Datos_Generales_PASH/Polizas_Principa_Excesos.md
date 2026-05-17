Buena base, pero tal como está tienes un problema: los valores están “quemados” (hardcoded), así que cada año tendrás que editar todo manualmente. Lo ideal es **centralizar la UMA y derivar todo automáticamente**, además de dejar claro que debe actualizarse con el DOF.

Aquí te dejo una versión mejorada en Markdown, más estructurada y fácil de mantener:

---

## 📊 Parámetros generales (actualizar cada año según DOF)

> ⚠️ Actualizar el valor de la UMA cuando se publique en el DOF (enero de cada año)

```yaml
anio: 2026
uma_diaria: 117.31
dias_mes_promedio: 30.4
dias_anio: 364.8
```

---

## 🧮 Cálculo automático de UMA

* **UMA diaria:** $117.31

* **UMA mensual:** `uma_diaria * dias_mes_promedio`
  → $117.31 × 30.4 = **$3,566.26**

* **UMA anual:** `uma_diaria * dias_anio`
  → $117.31 × 364.8 = **$42,794.68**

---

## 🏥 Póliza principal

* **Vigencia:** 01-10-2025 → 01-10-2026
* **Número de póliza:** 2012 M0075008
* **Plan:** MEDICALIFE EJECUTIVO
* **Certificado:** 0000013200645

### 💰 Coberturas

* **Suma asegurada:** 30,298 UMA
  → `30298 * uma_diaria` = **$3,554,258.38**

* **Deducible:** 2.5 UMA
  → `2.5 * uma_diaria` = **$293.27**

* **Coaseguro:** 10%

---

## 📈 Póliza de excesos (por siniestro)

* **Número:** M172 1011
* **Vigencia:** 01-10-2025 → 01-10-2026

### 💰 Condiciones

* **Suma asegurada:** Sin límite
* **Deducible:** $2,000,000
* **Coaseguro:** 10%

---

## 🔄 Mejora clave (automatización futura)

Si quieres evitar actualizar esto manualmente cada año, tienes 3 opciones:

### Opción 1 — Markdown + hábito

Solo cambias esto una vez al año:

```yaml
uma_diaria: NUEVO_VALOR
```

y recalculas.

---

### Opción 2 — Markdown + Excel / Notion (recomendado)

Llevar esto a una tabla con fórmulas:

* `UMA mensual = UMA diaria * 30.4`
* `Suma asegurada = UMA * uma_diaria`

---

### Opción 3 — Markdown dinámico (pro)

Si usas algo como scripts o Notion API:

* Leer UMA automáticamente del DOF
* Recalcular todo

---

## 🧠 Sugerencias adicionales

* Corrige typos: **CERTIFICAOD → CERTIFICADO**
* Estandariza formato de fechas (ISO recomendado: `2025-10-01`)
* Usa separadores de miles consistentes (ej: 3,554,258.38)
* Agrega moneda explícita: **MXN**

---

