# Sistemas de Diseño y Estéticas UI/UX

> **Categoría:** Frontend / UI-UX
> **Última Actualización:** 2026-03-03
> **Fuente Original:** Prompt 2 (UI/UX Visionary)

## 🎯 Objetivo General
Crear interfaces que rompan el molde de "generado por IA", enfocándose en estéticas modernas, vanguardistas y de alta gama, utilizando tecnologías como **Next.js** y **Tailwind CSS**.

---

## 🎨 Catálogo de Estéticas de Diseño

Cuando se solicite un diseño, elige o aplica la estética requerida basándote en los siguientes perfiles visuales:

### 1. Estilo Espacial / Neón (Default PASH)
- **Vibra:** Futurista, Inmersiva, Tecnológica.
- **Paleta de Colores:** Fondo espacial (Deep Space Black `#0A0A0A` / Night Sky), acentos en púrpura neón (`#8b5cf6`), violeta y azul profundo (`#3b82f6`).
- **Técnicas CSS:** Degradados lineales oscuros, bordes brillantes (`ring-offset`), textos con background-clip transparente y gradientes, sombras lumínicas extendidas (`drop-shadow-2xl`).
- **Componentes:** Logotipos tipográficos masivos, botones con efectos de brillo (glow), fondos con efectos de polvo de estrellas o arcos de luz direccional.

### 2. Estilo Apple / Clean Minimalist
- **Vibra:** Premium, Seria, Confiable, Aireada.
- **Paleta de Colores:** Fondo blanco puro (`#FFFFFF`) o gris muy tenue (`#F5F5F7`), contrastes en negro absoluto o gris titanio, acentos muy sutiles en azul corporativo.
- **Técnicas CSS:** Extremo uso de espacio en blanco (White Space), tipografías sans-serif impecables (Inter, SF Pro), blur effects en fondos de navegación (glassmorphism/backdrop-blur), bordes muy suaves (rounded-3xl).
- **Componentes:** Imágenes o mockups masivos de alta resolución protagonizando las secciones, texto centrado, botones sobrios sin borde o con un radio de esquina alto (`pill-shape`).

### 3. Estilo Industrial / Bauhaus
- **Vibra:** Funcional, Atrevida, Arquitectónica.
- **Paleta de Colores:** Blanco crudo, negro fuerte, gris acero, con acentos en colores primarios saturados (Rojo sangre, Amarillo mostaza, Azul rey).
- **Técnicas CSS:** Tipografías geométricas grotescas (Space Grotesk, Syne), líneas divisoras sólidas (`border-b-2 border-black`), cuadrículas visibles (CSS Grid evidente).
- **Componentes:** Distribución asimétrica controlada, tarjetas sin radio de esquina (`rounded-none`), contrastes muy bruscos entre bloques funcionales.

### 4. Estilo Neobrutalista
- **Vibra:** Joven, Disruptiva, Start-up moderna.
- **Paleta de Colores:** Colores pastel sólidos (Rosa chicle, menta, lila) combinados con sombras y bordes en negro absoluto.
- **Técnicas CSS:** `box-shadow` sólido offset (ej: `4px 4px 0px 0px rgba(0,0,0,1)`), bordes gruesos (`border-4 border-black`), formas redondeadas bruscas.
- **Componentes:** Botones e inputs que parecen "saltar" de la pantalla por sus sombras rígidas, tipografías display gruesas, ilustraciones estilo cómic o vectoriales simples.

### 5. Estilo Fintech Premium
- **Vibra:** Segura, Institucional pero moderna (B2B/SaaS Financiero).
- **Paleta de Colores:** Fondos Deep Navy (Azul marino casi negro), grises oscuros, líneas guía en verde esmeralda o azul cian (confianza/dinero).
- **Técnicas CSS:** Gradientes radiales oscuros, transparencias sobre fondos estriados, micro-interacciones suaves (`transition-all duration-300`), gráficos empotrados sutiles.
- **Componentes:** Dashboards simplificados, tablas con hovers luminosos, tarjetas tipo "tarjeta de crédito" con efecto glass y bordes de 1px semitransparentes.

---

## 📐 Estructura Base para Landing Pages (Arquitectura Visual)

Independientemente del estilo visual, la estructura arquitectónica de conversión debe contener:
1. **Hero Section:** Título masivo (H1), subtítulo aclaratorio, CTAs (Primary relleno, Secondary outline).
2. **Social Proof (Trust):** Fila de logos de clientes o socios con opacidad reducida.
3. **Sección de Valor:** Tarjetas o grids explicando los 3 beneficios principales.
4. **Validación / Interacción:** Formularios o demostraciones del producto empotradas.
5. **Footer Minimalista:** Enlaces legales y navegación secundaria.
