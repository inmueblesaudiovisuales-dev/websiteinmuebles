# Portafolio IAV — Plan de Implementación

> **Para quien programa:** ejecutar tarea por tarea. Los pasos usan checkbox (`- [ ]`). Esto NO es un proyecto con pruebas unitarias: es **un solo archivo HTML estático, vanilla, sin build**. La "prueba" de cada tarea es **verificación en navegador real** (capturas, sin errores de consola, sin desbordes, contraste AA). Higiene de git: rama propia, commits frecuentes.

**Goal:** Reemplazar `portafolio.html` por el rediseño enfocado en venta, partiendo del diseño ya aprobado en `portafolio-mockup.html`, endurecido para producción (Cloudflare Stream, fallbacks robustos, accesibilidad, rendimiento) y verificado en navegador real.

**Architecture:** Un único archivo `portafolio.html`, HTML/CSS/JS puro sin paso de compilación. Video por Cloudflare Stream, fotos por Cloudflare Images, 360 enlazado a CloudPano. El diseño/estructura/copy son los de `portafolio-mockup.html` (fuente de verdad visual). Este plan agrega lo que un mockup no tiene: robustez sin JS, integración de Stream, accesibilidad, meta/OG, y verificación.

**Tech Stack:** HTML5, CSS3 (custom properties, grid, scroll-snap), JS vanilla (IntersectionObserver), Montserrat (Google Fonts), Cloudflare Stream (HLS + hls.js por CDN), Cloudflare Images, CloudPano (enlace).

**Spec de referencia:** `docs/superpowers/specs/2026-06-12-portafolio-rediseno-design.md`
**Diseño de referencia (no re-derivar):** `portafolio-mockup.html`

---

## Fase 0 — Setup y arranque

### Task 0: Rama y base
**Files:**
- Crear: `portafolio.html` (desde el mockup)
- Mantener: `portafolio-mockup.html` (referencia, no se borra)

- [ ] **Step 1: Rama de trabajo**

Run:
```bash
cd /Users/brunogutierrez/websiteinmuebles
git checkout main && git pull --ff-only 2>/dev/null; git checkout -b portafolio-rediseno
```
Expected: en rama `portafolio-rediseno`.

- [ ] **Step 2: Partir del mockup aprobado**

Run:
```bash
cp portafolio-mockup.html portafolio.html
```
Esto trae el diseño, estructura, copy y placeholders ya aprobados. Las tareas siguientes lo endurecen para producción.

- [ ] **Step 3: Levantar servidor local para verificar**

Run:
```bash
python3 -m http.server 8778 >/dev/null 2>&1 &
```
Verificar en navegador real: `http://localhost:8778/portafolio.html` carga igual que el mockup.

- [ ] **Step 4: Commit**

```bash
git add portafolio.html && git commit -m "portafolio: base desde mockup aprobado"
```

---

## Fase 1 — Robustez sin JS (error conocido #1)

> Incidente real previo (versión de Fable): el contenido dependía de JS y quedaba invisible. Regla: **todo el contenido es visible aunque el JS no corra**; el JS solo realza.

### Task 1: Contenido visible sin JS
**Files:** Modify: `portafolio.html`

- [ ] **Step 1: Auditar dependencias de JS para mostrar contenido**

En `portafolio.html`, los videos de la tira y el "strip" se inyectan por JS (`#strip` se llena en `<script>`). Riesgo: sin JS, la sección de videos queda vacía.

- [ ] **Step 2: Renderizar la tira de videos en HTML estático (no solo por JS)**

Escribir las 5 tarjetas de video directamente en el HTML dentro de `<div class="strip" id="strip">…</div>` (mismas que genera el script hoy), con sus pósters como `<img>` reales y el `<a class="scard__cta">` con su `href` de WhatsApp ya escrito. El JS deja de *crear* las tarjetas y pasa a *realzarlas* (cargar video, IntersectionObserver). Cada tarjeta:

```html
<figure class="scard">
  <div class="scard__media">
    <img class="scard__poster" src="REEMPLAZAR-poster-cloudflare-images" alt="Video de propiedad en San Pedro" loading="lazy">
    <!-- REEMPLAZAR: video de Cloudflare Stream (ver Task 3). Placeholder por ahora. -->
  </div>
  <figcaption class="scard__foot">
    <span class="scard__loc"><svg>…pin…</svg> San Pedro</span>
    <a class="scard__cta" target="_blank" rel="noopener"
       href="https://wa.me/528127174207?text=Hola%2C%20vi%20el%20video%20de%20la%20casa%20en%20San%20Pedro%20y%20me%20gustar%C3%ADa%20algo%20as%C3%AD%20para%20mi%20propiedad.">Cotizar →</a>
  </figcaption>
</figure>
```
Repetir para Cumbres, Valle Oriente, Complejo deportivo, Colonia privada.

- [ ] **Step 3: Año del footer sin depender de JS**

Poner `2026` literal en el HTML del footer; el JS solo lo actualiza si corre. Así sin JS no queda vacío.

- [ ] **Step 4: Verificar sin JS (navegador real)**

En el navegador, abrir DevTools → desactivar JavaScript → recargar `http://localhost:8778/portafolio.html`. Expected: hero, los 5 videos (pósters), 360, fotos y cierre **todos visibles**; los enlaces de WhatsApp funcionan. Reactivar JS.

- [ ] **Step 5: Commit**

```bash
git add portafolio.html && git commit -m "portafolio: contenido visible sin JS (tira de videos estatica)"
```

---

## Fase 2 — Integración de Cloudflare Stream

### Task 2: Estructura de video con Stream + fallback a póster
**Files:** Modify: `portafolio.html`

> Antes de codear: confirmar con context7/docs de Cloudflare Stream la sintaxis vigente del manifest HLS y el web component. No asumir.

- [ ] **Step 1: Cargar hls.js por CDN (en `<head>` o antes del `<script>` final)**

```html
<script src="https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js"></script>
```

- [ ] **Step 2: Estructura de cada video (hero y tira)**

Cada `<video>` se monta sobre su `<img>` póster (que ya está visible sin JS). Atributos: `muted loop playsinline preload="none"` + `poster`. La fuente HLS de Stream se asigna por JS:

```html
<video class="scard__video" data-stream="REEMPLAZAR-STREAM-VIDEO-ID"
       muted loop playsinline preload="none"
       poster="REEMPLAZAR-poster" aria-hidden="true"></video>
```

- [ ] **Step 3: JS para montar Stream (HLS nativo en Safari, hls.js en el resto)**

```javascript
function montarStream(v){
  if (v.src || v.dataset.mounted) return;
  const id = v.dataset.stream;
  if (!id || id.startsWith('REEMPLAZAR')) return; // sin asset: se queda el poster
  const url = "https://customer-CODE.cloudflarestream.com/"+id+"/manifest/video.m3u8"; // REEMPLAZAR CODE
  if (v.canPlayType('application/vnd.apple.mpegurl')) { v.src = url; }
  else if (window.Hls && Hls.isSupported()) { const h=new Hls(); h.loadSource(url); h.attachMedia(v); }
  v.dataset.mounted = "1";
}
```
**Fallback:** si no hay asset o el navegador no soporta HLS, se queda el póster (`<img>`). Nunca un cuadro vacío.

- [ ] **Step 4: Reproducir solo lo visible (rendimiento)**

```javascript
const io = new IntersectionObserver(es=>es.forEach(e=>{
  const v = e.target;
  if (e.isIntersecting){ montarStream(v); const p=v.play&&v.play(); if(p)p.catch(()=>{}); }
  else if (v.pause) v.pause();
}), { rootMargin: "200px 0px" });
document.querySelectorAll('[data-stream]').forEach(v=>io.observe(v));
```

- [ ] **Step 5: Verificar (con placeholders sigue mostrando pósters; sin errores)**

Navegador real: recargar; consola sin errores; los pósters se ven; al haber IDs reales luego, el video arranca al entrar en viewport. Verificar también con `prefers-reduced-motion` (no autoplay).

- [ ] **Step 6: Commit**

```bash
git add portafolio.html && git commit -m "portafolio: integracion Cloudflare Stream con fallback a poster + IntersectionObserver"
```

---

## Fase 3 — Accesibilidad, meta y contraste (errores conocidos)

### Task 3: Cabecera, accesibilidad y contraste AA
**Files:** Modify: `portafolio.html`

- [ ] **Step 1: Meta/OG/favicons/canonical**

Agregar en `<head>` (copiar el patrón del `portafolio.html` viejo / del index): `description`, `theme-color`, `canonical`, `og:*`, `twitter:card`, favicons (`favicons/favicon.ico`, `apple-touch-icon`), `preconnect` a fonts/imagedelivery/cloudflarestream.

- [ ] **Step 2: Accesibilidad**

- Skip link al contenido. `aria-label` en nav y en el enlace de WhatsApp ("Escríbenos por WhatsApp"). `alt` real en cada póster/foto. Botón 360 con `aria-label`. `:focus-visible` con outline oro. Iconos decorativos `aria-hidden`.

- [ ] **Step 3: Contraste AA (error conocido)**

Verificar que el oro brillante `#C9A84C` NO se use como texto sobre crema; el texto en tono oro usa `#7A5E1A`. Gris de cuerpo `#6B6A66` o más oscuro. Revisar cada `color:` sobre fondo claro con un checker de contraste (objetivo 4.5:1 normal, 3:1 grande).

- [ ] **Step 4: prefers-reduced-motion**

Bloque `@media(prefers-reduced-motion:reduce)`: sin animaciones (`bob`, `pan`), sin autoplay de video. Todo legible y estático.

- [ ] **Step 5: Verificar**

Navegador real: tab-navegación llega a todos los enlaces con foco visible; lector de pantalla anuncia los CTA; activar "reduce motion" del SO y confirmar que nada se mueve y todo se ve.

- [ ] **Step 6: Commit**

```bash
git add portafolio.html && git commit -m "portafolio: meta/OG/favicons, accesibilidad y contraste AA"
```

---

## Fase 4 — Verificación integral (errores conocidos #2, #3)

### Task 4: Verificación en navegador real (desktop + celular)
**Files:** (sin cambios; solo verificación. Corregir si algo falla.)

- [ ] **Step 1: Sin desbordes horizontales**

En el navegador, consola:
```javascript
document.documentElement.scrollWidth - document.documentElement.clientWidth
```
Expected: `0` en desktop (1280) y en celular (390). Si > 0, encontrar el elemento que desborda y corregir.

- [ ] **Step 2: Sin errores de consola**

Recargar; consola sin errores (el 404 de favicon se resuelve en Task 3).

- [ ] **Step 3: Capturas desktop y celular**

Capturar la página completa a 1280px y a 390px. Comparar contra `portafolio-mockup.html`: deben verse iguales. Guardar capturas para que Bruno las revise.

- [ ] **Step 4: Todos los CTA de WhatsApp**

Verificar que nav, cada "Cotizar" de la tira, y el cierre abren `wa.me/528127174207` con el `text` correcto (el de cada video nombra la propiedad). El botón 360 abre CloudPano en pestaña nueva.

- [ ] **Step 5: Verificación de Bruno en Safari**

Bruno abre `portafolio.html` en su Safari (desktop y celular) y confirma look, copy y comportamiento. **No se cierra la fase sin su visto bueno.**

- [ ] **Step 6: Commit (si hubo correcciones)**

```bash
git add portafolio.html && git commit -m "portafolio: correcciones de verificacion (desbordes/consola)"
```

---

## Fase 5 — Cierre

### Task 5: Merge y despliegue
> Memoria: Claude despliega Cloudflare/GitHub; Bruno no lo hace a mano. Production branch del sitio: confirmar (el index ya apunta a `portafolio.html`).

- [ ] **Step 1: Revisar el diff completo**

```bash
git diff main..portafolio-rediseno -- portafolio.html | head -200
```

- [ ] **Step 2: Merge a main (tras visto bueno de Bruno)**

```bash
git checkout main && git merge --no-ff portafolio-rediseno -m "portafolio: rediseno enfocado en venta (videos + 360 + fotos)"
```

- [ ] **Step 3: Push / despliegue**

Push a GitHub; confirmar que el deploy (Cloudflare Pages del sitio) tome el cambio. Verificar la URL de producción tras desplegar.

- [ ] **Step 4: Lista de REEMPLAZAR pendientes para cuando lleguen los assets**

Dejar anotado (en un comentario al inicio de `portafolio.html`, ya existe el bloque): los 5 IDs de Stream + pósters, el CODE de la cuenta de Stream, el link real de CloudPano + póster, las 5-6 fotos, y confirmar el número de WhatsApp.

---

## Self-review (cobertura del spec)

- Estructura Nav→Hero→Videos→360→Fotos→Cierre: Task 0 (mockup) + Fases 1-3. ✓
- Voz/copy del index, sin relleno: heredado del mockup aprobado. ✓
- Paleta clara + contraste AA: Task 3. ✓
- Videos todos juntos + Cotizar nombrando pieza: Task 1. ✓
- Cloudflare Stream + fallback: Task 2. ✓
- 360 enlace a CloudPano (no iframe): heredado del mockup; verificado en Task 4 Step 4. ✓
- Fotos mosaico que llena: heredado del mockup. ✓
- Sin numeros/testimonios/flotante/grano/negro: heredado del mockup (no se reintroducen). ✓
- Errores conocidos (sin-JS, navegador real, desbordes, AA, reduce-motion): Fases 1,3,4. ✓
- Higiene de git + verificación concreta: todas las fases. ✓

**Hueco aceptado:** el sitio se despliega con placeholders hasta que existan los assets reales (videos en Stream, 360, fotos). Documentado en Fase 5 Step 4.
