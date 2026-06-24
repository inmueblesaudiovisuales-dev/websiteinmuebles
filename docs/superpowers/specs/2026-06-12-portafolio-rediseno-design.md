# Rediseño del portafolio — Inmuebles Audiovisuales

**Fecha de diseño:** 2026-06-12 · **Revisión final:** 2026-06-24
**Estado:** Diseño aprobado. Mockup de alta fidelidad listo. Listo para programar.
**Archivo objetivo:** `portafolio.html` (reemplaza el actual).
**Referencia visual / fuente de verdad del diseño:** `portafolio-mockup.html` (mismo repo) — el build debe verse y comportarse como ese mockup.
**Copia del portafolio original (antes de Fable):** `portafolio-original.html`.

---

## 1. Objetivo

Herramienta de **cierre**, no de captación en frío: la mayoría de quien lo ve **ya contactó a IAV**. Su trabajo es demostrar nivel y rematar para que escriban por WhatsApp.

**El norte es VENDER.** El "wow, necesito contratarlos" nace de dos cosas juntas: (1) ven el trabajo y lo quieren para su propiedad, y (2) entienden que eso les ayuda a vender. NO de trucos de diseño. Cada sección empuja hacia WhatsApp.

Audiencia: agentes inmobiliarios y dueños. Español de México.

---

## 2. Voz y copy (regla dura)

El copy usa **la voz real del `index.html` de IAV** — directa, de resultado, sin relleno. Frases de referencia tomadas del propio index:
- "La diferencia entre vender rápido y quedarse esperando."
- "El video convierte interés en acción antes de la primera visita."
- "Reduce el tiempo de venta con material profesional."

**Prohibido:** relleno tipo "sin compromisos", frases cursis tipo "mira una como la tuya", numeración 01/02/03, clichés de agencia. Si una línea no vende o no informa, se borra.

---

## 3. Sistema visual (consistente con `index.html`)

| Token | Valor | Uso |
|---|---|---|
| Crema | `#F9F7F4` | Fondo principal |
| Blanco | `#FFFFFF` | Secciones alternas |
| Carbón | `#1C1C1E` | Texto principal |
| Oro | `#C9A84C` | Acento, botones, pill activa, bordes |
| Oro claro | `#E2C289` | Hover del oro |
| Oro texto | `#7A5E1A` | **Solo** texto en tono oro sobre fondo claro (pasa AA). Nunca el oro brillante como texto. |
| Crema-oro | `#FBF6E9` | Fondo de la tarjeta de cierre |
| Gris texto | `#6B6A66` | Texto secundario (más oscuro que el `#9B9B9F` del index para pasar AA en cuerpo) |
| Borde | `#E8E8EA` | Líneas |
| Tipografía | **Montserrat** | Todo |

**Nada de:** fondo negro, grano/papel, efectos llamativos. El lujo es la claridad y la calidad del trabajo. Botones/pills redondeados como el index.

---

## 4. Estructura final

`Nav → Hero → Videos (todos juntos) → 360° → Fotografía → Cierre → Footer.`

### 4.1 Nav (sticky)
Logo "Inmuebles **AV**" (la "AV" en oro-texto) + regreso al index + **WhatsApp en pastilla oro** (no el verde de WhatsApp). Sin botón flotante.

### 4.2 Hero — el video manda
- Tu **mejor video vertical**, grande, reproduciéndose solo (placeholder por ahora).
- Titular = tu propia línea: **"La diferencia entre vender rápido y quedarse esperando."** ("vender rápido" en oro-texto).
- Sin subtítulo de relleno. Solo un ancla "Ver el trabajo ↓".
- Eyebrow: "Producción audiovisual inmobiliaria · Monterrey".
- Desktop: titular a la izquierda, video grande a la derecha. Celular: video arriba, titular abajo.

### 4.3 Videos — todos juntos, sin categorías
- **Tira horizontal** de TODOS los videos (sin pestañas Casa/Depa/Terreno). Se desliza/arrastra.
- Rótulo: **"Proyectos recientes · Monterrey"** + pista "Desliza →".
- Cada video: su **ubicación real** (San Pedro, Cumbres, Valle Oriente, Complejo deportivo, Colonia privada…) + un **"Cotizar →"** que abre WhatsApp con mensaje que **nombra esa propiedad** ("Hola, vi el video de la casa en San Pedro y me gustaría algo así para mi propiedad.").
- Desktop: se ven varios verticales a la vez (llenan el ancho); celular: swipe con scroll-snap.
- Solo 1-2 videos reproducen a la vez (IntersectionObserver), el resto pausado.

### 4.4 360° — herramienta de venta
- Rótulo "Recorrido virtual 360°". Titular: **"Que la vean completa antes de pedir una cita."**
- Intro (qué es, llano): "Una visita virtual: el comprador recorre toda la propiedad desde su teléfono, a cualquier hora, sin que nadie tenga que acompañarlo."
- Tres beneficios: **La ven completa · Filtra a los serios · Vende a distancia.**
- Vista previa que panea + **"Abrir recorrido"** → CloudPano en **pestaña nueva, NUNCA embebido**.

### 4.5 Fotografía
- Rótulo "Fotografía". Línea corta: **"Atrae más miradas."**
- **Mosaico que llena de orilla a orilla** (rejilla con áreas fijas, sin huecos), 5-6 fotos reales.

### 4.6 Cierre
- Tarjeta clara (crema-oro `#FBF6E9`, borde oro). Eyebrow "Cotiza tu proyecto".
- Titular: **"Tu propiedad merece esta producción."**
- Subtítulo: **"Escríbenos por WhatsApp y la producimos."** Botón WhatsApp con mensaje pre-llenado. Footer.

---

## 5. WhatsApp
- `wa.me/528127174207` con `text` pre-llenado URL-encoded.
- Aparece en: nav + cada video ("Cotizar") + cierre. **Sin botón flotante.**

---

## 6. Inventario de contenido / assets necesarios

**Videos (todos verticales 9:16, en Cloudflare Stream):** 5 piezas — el mejor para el hero + los 5 en la tira. Tipos: 2 casa (San Pedro, Cumbres), 1 depa (Valle Oriente), 2 terreno (complejo deportivo, colonia privada delineado). **Cada uno con su póster (primer frame).** Ubicaciones reales para las etiquetas.

**360°:** 1 recorrido residencial — link real de CloudPano + 1 póster panorámico.

**Fotografía:** 5-6 fotos reales (Cloudflare Images).

**Otros:** logo SVG, número de WhatsApp confirmado, textos pre-llenados aprobados.

Mientras no estén, van **placeholders marcados `[MUESTRA]` / `REEMPLAZAR`** (como el mockup).

---

## 7. Técnico

- **Vanilla HTML/CSS/JS, sin build.** GSAP por CDN solo si suma (motion sutil); nada de WebGL/SplitText.
- **Video → Cloudflare Stream** (streaming adaptativo: arranca rápido, sin buffering, ajusta calidad). Atributos `muted loop playsinline autoplay` + `poster`. Stream maneja resoluciones (no manejo manual cel/desktop).
- **Fotos → Cloudflare Images** (`imagedelivery.net/4FlhPwMCquiTgnacg31UZQ/...`).
- **360 → enlace a CloudPano** (`target="_blank" rel="noopener"`), nunca iframe.
- Placeholders claramente marcados y fáciles de reemplazar.

---

## 8. Errores conocidos a evitar (de incidentes previos)

- **Contenido siempre visible aunque el JS no corra.** Nunca `opacity:0` como estado base que dependa de JS para aparecer (fragilidad real de la versión de Fable: el titular quedaba invisible). Animaciones solo realzan; reposo = visible.
- **Verificación en navegador REAL** (Safari/Chrome/celular), no solo leer código ni jsdom. El preview headless no pinta bien debajo del pliegue.
- **Contraste AA:** oro `#C9A84C` NO como texto sobre claro; usar `#7A5E1A`. Gris de cuerpo suficientemente oscuro. Blanco solo sobre superficies oscuras.
- **Cero desbordes horizontales** (revisar `scrollWidth` vs `clientWidth` en cel y desktop).
- Respetar `prefers-reduced-motion`.

---

## 9. Responsive
- Mobile-first; espectacular en desktop.
- Hero: video grande; en cel arriba, en desktop a un lado.
- Videos: tira horizontal; desktop muestra varios, celular swipe con scroll-snap.
- 360 y Fotos se apilan en celular; el mosaico cierra de orilla a orilla.
- Cierre a todo el ancho.

---

## 10. Lo que NO lleva (decisiones tomadas)
- Sin números/estadísticas, sin testimonios, sin "sin compromisos".
- Sin categorías/pestañas de tipo de propiedad (los videos van todos juntos).
- Sin fondo negro, sin grano, sin trucos (palabra-video descartada).
- Sin botón flotante de WhatsApp.
- Sin sección de "entregables" en lista, sin co-branding por URL.

---

## 11. Pendientes / huecos preparados
- [ ] Los 5 videos finales en Stream + sus pósters.
- [ ] Link real del recorrido 360 de CloudPano + póster.
- [ ] 5-6 fotos finales.
- [ ] Confirmar Cloudflare Stream activo en la cuenta.
- [ ] Textos pre-llenados de WhatsApp aprobados.
