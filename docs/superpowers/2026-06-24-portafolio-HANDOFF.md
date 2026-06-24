# HANDOFF — Rediseño del portafolio de Inmuebles Audiovisuales

> Documento exhaustivo para la sesión que va a **programar**. Asume cero contexto previo. Léelo completo antes de tocar código. La sesión de planeación ya cerró diseño, copy, estructura y plan; tu trabajo es **construir y verificar**, no rediseñar.

---

## 0. Resumen en 30 segundos

- Se rediseña `portafolio.html` del repo `websiteinmuebles`.
- El **diseño ya está aprobado** y existe como mockup de alta fidelidad: **`portafolio-mockup.html`**. Es la fuente de verdad visual.
- Tu trabajo: promover ese mockup a `portafolio.html`, **endurecerlo para producción** (Cloudflare Stream, robustez sin JS, accesibilidad, meta, rendimiento) y **verificarlo en navegador real**.
- Sigue el plan paso a paso: **`docs/superpowers/plans/2026-06-24-portafolio-implementacion.md`**.
- Spec/diseño detallado: **`docs/superpowers/specs/2026-06-12-portafolio-rediseno-design.md`**.
- Se despliega con **placeholders** hasta que lleguen los assets reales (videos, 360, fotos). Eso está bien y está previsto.

---

## 1. Qué es y para quién

Inmuebles Audiovisuales (IAV) es un estudio de producción audiovisual inmobiliaria en **Monterrey**. El portafolio es una **herramienta de cierre**: la mayoría de quien lo ve **ya contactó por WhatsApp** y está decidiendo si contratar. **El norte es VENDER.** Todo apunta a que escriban por WhatsApp.

El "wow" no viene de trucos de diseño, sino de: (1) ver el trabajo y quererlo para su propiedad, y (2) entender que eso les ayuda a vender. Producto estrella: **el video** (mayormente vertical 9:16). El 360 y la fotografía son complemento.

---

## 2. Estado actual

**Hecho (no rehacer):**
- Investigación de portafolios destacados + crítica adversaria.
- Dirección, estructura, voz y copy **aprobados por Bruno**.
- Mockup de alta fidelidad funcionando: `portafolio-mockup.html`.
- Spec final: `docs/superpowers/specs/2026-06-12-portafolio-rediseno-design.md`.
- Plan de implementación: `docs/superpowers/plans/2026-06-24-portafolio-implementacion.md`.

**Pendiente (tu trabajo):**
- Construir `portafolio.html` de producción a partir del mockup, endurecido.
- Verificar en navegador real (desktop + celular).
- Desplegar (con placeholders).
- Cuando Bruno entregue assets reales: reemplazar placeholders.

---

## 3. Archivos clave

| Archivo | Para qué |
|---|---|
| `portafolio-mockup.html` | **Fuente de verdad visual.** El build debe verse/comportarse igual. |
| `docs/superpowers/specs/2026-06-12-portafolio-rediseno-design.md` | Diseño detallado, tokens, decisiones. |
| `docs/superpowers/plans/2026-06-24-portafolio-implementacion.md` | Plan paso a paso a ejecutar. |
| `portafolio-original.html` | El portafolio estructurado original (referencia histórica). |
| `index.html` | De aquí salen la **paleta** y la **voz** del copy. No inventar voz nueva. |
| `portafolio.html` | El objetivo a reemplazar. |

---

## 4. La dirección (no reabrir estas decisiones)

- **Enfoque: VENTA.** Cada sección empuja a WhatsApp.
- **Voz: la del propio `index.html`** — directa, de resultado, sin relleno. Ej.: "La diferencia entre vender rápido y quedarse esperando." Prohibido: "sin compromisos", frases cursis ("mira una como la tuya"), numeración 01/02/03, clichés.
- **Paleta clara del index:** crema `#F9F7F4`, blanco `#FFFFFF`, carbón `#1C1C1E`, oro `#C9A84C`, oro-texto `#7A5E1A` (solo texto oro sobre claro), crema-oro `#FBF6E9`, gris `#6B6A66`, borde `#E8E8EA`. **Montserrat.**
- **NO lleva:** fondo negro, grano/papel, trucos (la idea "palabra-video" fue descartada), números/estadísticas, testimonios, botón flotante de WhatsApp, categorías/pestañas de tipo de propiedad, sección de "entregables" en lista, co-branding por URL.

---

## 5. Estructura (resumen; detalle en el spec/mockup)

`Nav → Hero → Videos (todos juntos) → 360° → Fotografía → Cierre → Footer.`

1. **Nav** sticky: logo + regreso al index + WhatsApp en **pastilla oro** (no verde). Sin flotante.
2. **Hero:** mejor video vertical grande + titular "La diferencia entre vender rápido y quedarse esperando." + "Ver el trabajo ↓". Sin subtítulo de relleno.
3. **Videos — todos juntos, sin categorías:** tira horizontal de los 5 verticales, rótulo "Proyectos recientes · Monterrey". Cada uno: ubicación real + "Cotizar →" que abre WhatsApp **nombrando esa propiedad**. Solo 1-2 reproducen a la vez.
4. **360°:** "Que la vean completa antes de pedir una cita." + qué es + 3 beneficios (La ven completa · Filtra a los serios · Vende a distancia) + "Abrir recorrido" → CloudPano en **pestaña nueva, NUNCA iframe**.
5. **Fotografía:** "Atrae más miradas." + mosaico que **llena de orilla a orilla** (rejilla con áreas fijas, sin huecos).
6. **Cierre:** tarjeta crema-oro, "Tu propiedad merece esta producción." + "Escríbenos por WhatsApp y la producimos." + botón WhatsApp.

---

## 6. Assets que faltan (placeholders mientras tanto)

Lista de REEMPLAZAR (dejar marcada en el código):
- **5 videos verticales** en Cloudflare Stream (IDs) + el **CODE** de la cuenta de Stream + **póster** de cada uno. El mejor va en el hero.
  - Tipos/ubicaciones: Casa San Pedro, Casa Cumbres, Departamento Valle Oriente, Terreno complejo deportivo, Terreno colonia privada (delineado).
- **1 recorrido 360** residencial: link real de CloudPano + póster panorámico.
- **5-6 fotos** finales (Cloudflare Images, cuenta `4FlhPwMCquiTgnacg31UZQ`).
- **WhatsApp:** confirmar `528127174207` y los textos pre-llenados.

---

## 7. Técnico

- **Vanilla HTML/CSS/JS, SIN build.** Se pega y publica. GSAP por CDN solo si suma motion sutil; nada de WebGL/SplitText.
- **Video → Cloudflare Stream** (HLS adaptativo). `<video muted loop playsinline preload="none" poster>`; fuente HLS por JS (HLS nativo en Safari, hls.js por CDN en el resto). **Confirmar sintaxis vigente de Stream con context7 antes de codear.**
- **Fotos → Cloudflare Images.** **360 → enlace a CloudPano** (`target="_blank" rel="noopener"`).
- Carga ligera: lazy-load, `preload="none"`, reproducir solo lo visible (IntersectionObserver).

---

## 8. Errores conocidos a evitar (convertidos en gates verificables)

1. **Contenido invisible sin JS** (incidente real de la versión de Fable): el contenido NO puede depender de JS para mostrarse. La tira de videos va **en HTML estático** (no inyectada por JS); el JS solo realza. **Gate:** desactivar JS en el navegador → todo visible.
2. **Validar solo en código/jsdom:** no basta. **Gate:** verificar en navegador REAL (Safari + Chrome, desktop + celular). El preview headless no pinta bien debajo del pliegue.
3. **Contraste:** el oro `#C9A84C` no pasa AA como texto sobre crema. **Gate:** texto oro = `#7A5E1A`; revisar todo con checker (4.5:1 / 3:1).
4. **Desbordes horizontales.** **Gate:** `scrollWidth - clientWidth === 0` en 1280 y 390.
5. **Motion:** respetar `prefers-reduced-motion` (sin animaciones, sin autoplay).

---

## 9. Verificación (cómo cerrar cada fase)

- Servir local: `python3 -m http.server 8778` → `http://localhost:8778/portafolio.html`.
- Capturas a 1280px y 390px; comparar contra el mockup (deben verse iguales).
- Consola sin errores.
- Probar todos los CTA de WhatsApp (cada "Cotizar" nombra su propiedad) y el botón 360 (abre CloudPano en pestaña nueva).
- **Bruno verifica en su Safari (desktop y celular)** antes de cerrar. No se mergea sin su visto bueno.

---

## 10. Git y despliegue

- Rama: `portafolio-rediseno` desde `main`. Commits frecuentes por tarea.
- Merge a `main` con `--no-ff` solo tras el visto bueno de Bruno.
- **Claude despliega Cloudflare/GitHub; Bruno no lo hace a mano.** Tras merge: push y confirmar que el deploy del sitio tome el cambio; verificar la URL de producción.
- El `index.html` ya enlaza a `portafolio.html`.

---

## 11. Reglas de trabajo con Bruno

- Explicar en **español sencillo**, términos de negocio, sin jerga.
- **Nunca asumir; verificar** en código/datos antes de afirmar.
- Bruno **pega archivos completos**, no edita líneas sueltas: dejar el archivo listo.
- Avanzar fase por fase, decir siempre el siguiente paso.
- No reabrir decisiones de diseño ya cerradas (sección 4).
