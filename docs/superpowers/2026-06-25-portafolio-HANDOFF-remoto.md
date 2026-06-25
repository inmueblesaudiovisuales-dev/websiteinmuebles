# HANDOFF — Portafolio IAV (para sesión REMOTA / nube)

> Escrito 2026-06-25. Para retomar el trabajo del portafolio desde una sesión en la nube
> (que solo tiene el repo clonado, **no** la Mac local de Bruno). Asume cero contexto.
> El portafolio **ya está en producción y funcionando**. Esto documenta cómo está hecho,
> qué se puede tocar desde la nube y qué NO está disponible remotamente.

---

## 0. Resumen en 30 segundos

- Página: **`portafolio.html`** (en la raíz del repo). HTML/CSS/JS puro, sin build.
- En vivo: **https://inmueblesaudiovisuales.com/portafolio** (el `.html` redirige 308 → `/portafolio`; Cloudflare Pages quita la extensión).
- La **home** (`index.html`) tiene una sección de portafolio que enlaza a esa página (botón "Ver el portafolio completo").
- Media real ya conectada: **6 videos** en Cloudflare Stream (clasificados Residencial/Terreno, clic-para-reproducir con sonido), **15 fotos** en Cloudflare Images, **1 recorrido 360** (enlace a CloudPano), **hero con foto de fachada** (sin video).
- Despliegue: **push a `main` → Cloudflare Pages despliega solo**.

---

## 1. Repo, rama y despliegue

- Repo: `github.com/inmueblesaudiovisuales-dev/websiteinmuebles`, rama de producción **`main`**.
- Cloudflare Pages, proyecto **`websiteinmuebles`**, production_branch `main`, conectado a GitHub.
  Dominios: `inmueblesaudiovisuales.com` y `websiteinmuebles.pages.dev`.
- **Para desplegar:** commit + `git push origin main`. Pages hace build automático (~1 min) y publica.
  No hay paso de build (sitio estático). No usar `wrangler pages deploy` (está conectado por Git).
- Verificar en vivo: `curl -sL https://inmueblesaudiovisuales.com/portafolio` (recuerda el `?cb=...` para saltar caché del navegador).
- **Higiene:** trabajar en rama y mergear a `main` con `--no-ff`, o commitear directo a `main` si es un cambio chico aprobado. Bruno delega el despliegue (él no lo hace a mano).

---

## 2. Qué NO está en el repo (solo en la Mac local) — IMPORTANTE para la nube

Estos archivos están **gitignored** y NO viajan a la nube:

| Cosa | Dónde (local) | Implicación remota |
|---|---|---|
| **Token de Cloudflare** | `stream-token.txt` (gitignored) | NO está en el repo. Para subir/editar media o consultar APIs de Cloudflare necesitas proveer el token (ver §4). |
| **Assets fuente** (videos/fotos originales) | `/Users/brunogutierrez/Documents/CLAUDE CODE/Inmuebles WEBSITE/12. Portafolio/Portafolio/` | NO están en el repo. No puedes re-transcodificar/re-subir originales desde la nube sin ellos. |
| **Masters optimizados** | `_stream-masters/`, `_img-opt/`, `_img/` (gitignored) | NO viajan. La media ya está subida a Cloudflare (ver §3), así que para EDITAR la página no los necesitas; solo para subir media NUEVA. |

**Conclusión:** desde la nube puedes editar el HTML/CSS/JS, cambiar qué assets (por ID) se muestran, reordenar, y desplegar. Para **agregar media nueva** necesitas (a) el archivo fuente y (b) el token.

---

## 3. Inventario de media YA SUBIDA (la fuente de verdad remota son estos IDs)

**Cuenta Cloudflare:** `0d0d6aaf107ae092f9fb5da06ddb338c`

### Videos — Cloudflare Stream
- **CODE de la cuenta (customer subdomain):** `cl73mgx0feu2w8io`
- HLS: `https://customer-cl73mgx0feu2w8io.cloudflarestream.com/<UID>/manifest/video.m3u8`
- Póster/thumbnail: `https://customer-cl73mgx0feu2w8io.cloudflarestream.com/<UID>/thumbnails/thumbnail.jpg?height=900`

| Sección | Orden | UID | Fuente original |
|---|---|---|---|
| Residencial | 1 (favorito) | `4b940872c1f5812f6f16503b3e3c9663` | 2509.03 IA version final 4k |
| Residencial | 2 | `ed43474d6c831a6fb7ef5e1bd9debd1c` | 2602.09 IA 9x16 |
| Residencial | 3 | `227043a6e087886ba9571ac5bcb39078` | 2603.10 IA 9x16 v2 |
| Terreno | 1 (favorito) | `20ebd72cddcf68d5f3bb39df6cea66b0` | IAV-2606.07-A_1 |
| Terreno | 2 | `c8dcdd1d76e162223bf1bd5e66c745d6` | 2603.04 IA 9x16 narrado |
| Terreno | 3 | `8136f630160faf2a1dacc87d534ad930` | 2603.24 IA 9x16 NARRADO |

### Fotos — Cloudflare Images
- **Delivery hash:** `4FlhPwMCquiTgnacg31UZQ`
- URL: `https://imagedelivery.net/4FlhPwMCquiTgnacg31UZQ/<ID>/public`

| Archivo | ID | Uso |
|---|---|---|
| Exterior-2.jpg | `64968852-3666-4007-7a70-4ceb44a37300` | **HERO (fachada)** + mosaico |
| _PPI5956-HDR.jpg (cocina) | `f1891001-e90e-45ca-0818-521b1a29b800` | mosaico (wide) |
| _PPI6028-HDR.jpg (sala) | `ee01ff60-6722-42da-3164-4b6cbcc67100` | mosaico (fue hero anterior) |
| Cantabria-22.jpg (cine) | `64b6b81d-ef65-425f-6a20-908f0fe4a800` | mosaico (wide) |
| Cocina-2.jpg | `3bf733fd-de1b-4d0d-5627-b7843e99bc00` | mosaico |
| 2603.18-1-23.jpg | `13b41797-ee1f-4815-f799-0e6085b11800` | mosaico |
| 2603.18-1-4.jpg | `4e9d68d9-565f-4bb2-6a7f-1999c03e8400` | mosaico |
| 2603.18-1-53.jpg | `829ddeac-411f-4077-1105-e966b9327d00` | mosaico |
| Inmuebles-Audiovisuales-22-2.jpg | `5dcb84b4-37d4-4878-ca2a-584cf58bde00` | mosaico |
| Inmuebles-Audiovisuales-4.jpg | `3c370aef-0fd4-439a-ba2c-b4f2dc8f5a00` | mosaico |
| Inmuebles-audiovisuales 2509.03-24.jpg | `94a5c86b-554d-47f5-7795-999dbb2be600` | mosaico |
| Inmuebles-audiovisuales 2509.03-7.jpg | `bc2ed869-2565-4ef4-3f85-0e6642756700` | mosaico |
| Inmuebles-audiovisuales-22.jpg | `0228faf3-d40e-46bc-884d-982b2824e800` | mosaico |
| Inmuebles-audiovisuales-2603.10-14.jpg | `d4d1c9d4-bf1f-4b23-83cf-5407cfa91a00` | mosaico (wide) |
| proposal-inc-2604.10-9.jpg | `dad31053-c640-4479-bbe6-0f001afb1000` | mosaico |
| VISTA AÉREA-2.jpeg (panorámica) | `2259a170-ab20-4969-fd95-f03145222f00` | **vista previa del 360** |

### 360
- Tour CloudPano: **https://app.cloudpano.com/tours/UuTw8BcDs** (abre en pestaña nueva, nunca iframe).
- Vista previa en la página = imagen panorámica `2259a170-...` con paneo suave.

### WhatsApp
- Número: **528127174207**. Mensajes pre-llenados URL-encoded por contexto (general, residencial, terreno, 360, fotos).

---

## 4. Cómo proveer el token de Cloudflare en la nube (solo si vas a tocar Stream/Images/Pages)

El token **no está en el repo** (es secreto). Hay un token llamado **`CF_MEDIA_TOKEN`** con permisos
**Account · Stream:Edit** + **Account · Cloudflare Images:Edit** (sirve para subir/editar videos y fotos).
Para consultar despliegues de Pages se usa otro token con permiso **Pages**.

En la sesión remota, expón el token como variable de entorno (NO lo escribas en el repo):
```bash
export CLOUDFLARE_API_TOKEN="<pegar aquí el valor del token>"
ACC=0d0d6aaf107ae092f9fb5da06ddb338c
# verificar:
curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" https://api.cloudflare.com/client/v4/user/tokens/verify
```
El valor del token está en la Mac local en `stream-token.txt` (gitignored) o se regenera en el panel:
Cloudflare Dashboard → My Profile → API Tokens. Si necesitas Pages también, agrega ese permiso o usa un token full.

**Subir un video nuevo a Stream** (archivo <200 MB; si es mayor, transcodificar a 1080×1920 primero):
```bash
curl -s -X POST -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -F file=@/ruta/al/video.mp4 \
  "https://api.cloudflare.com/client/v4/accounts/$ACC/stream"   # devuelve result.uid
```
**Subir una foto nueva a Images:**
```bash
curl -s -X POST -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -F file=@/ruta/a/foto.jpg \
  "https://api.cloudflare.com/client/v4/accounts/$ACC/images/v1"  # devuelve result.id
```
Luego pegar el UID/ID en `portafolio.html` (ver §5).

---

## 5. Cómo está construido `portafolio.html` (estructura y comportamiento)

Orden: **Nav → Hero → Residencial → Terreno → Recorrido 360 → Fotografía → Cierre → Footer.**

- **Nav** sticky: logo real `logo.svg` (en la raíz del repo, marca oscura+oro) + "← Sitio" (a index.html) + WhatsApp en pastilla oro.
- **Hero (sin video):** titular + subtítulo + WhatsApp + "Ver el trabajo ↓" a la izquierda; **foto de fachada** (`<img>` de Cloudflare Images) a la derecha (arriba en móvil).
- **Residencial** y **Terreno**: dos `<section>` separadas (`id="residencial"`, `id="terreno"`), cada una con `.vgrid` de 3 `.vcard`. Contenidas en `.wrap` (márgenes respetados). Desktop 3 en fila (max 1000px centrado); móvil scroll horizontal con snap.
- **Cada `.vcard`:** `<img.vcard__poster>` (thumbnail de Stream, visible sin JS) + `<video.vcard__video controls>` (oculto) + `<button.vcard__play>`. El `data-stream="<UID>"` en el video. **Clic en play → monta HLS, `muted=false`, reproduce con controles; pausa el que estuviera sonando (uno a la vez).** NO autoplay. La lógica está en el `<script>` al final (constante `STREAM_CODE`).
- **360:** copy + 3 beneficios + "Abrir recorrido" (a CloudPano, pestaña nueva) + nudge WhatsApp. La vista previa `.r360__media .pan` usa la imagen panorámica como `background` con paneo (`@keyframes pan`, respeta reduce-motion).
- **Fotografía:** `.pgrid` (mosaico responsive 2/3/4 columnas; algunas `.wide` ocupan 2 columnas) con las 15 fotos.
- **Cierre:** tarjeta crema-oro + WhatsApp. **Footer** fuera de `<main>`.
- Accesibilidad: skip link, `<main id="contenido">`, aria-labels en CTAs (cada "Cotizar este video" nombra el tipo), foco visible oro, `prefers-reduced-motion`.

**index.html:** la sección `#portafolio` (antes tenía pestañas con "Próximamente") ahora es un teaser (imagen) + botón "Ver el portafolio completo →" que va a `portafolio.html`. La función `switchPort()` quedó sin uso (inofensiva).

---

## 6. Decisiones de copy y diseño que NO se reabren

- Voz directa, de resultado (la del `index.html`). **Prohibido** "una así / uno así / algo así": **siempre nombrar el sustantivo** (un video, un recorrido, una producción). Sin numeración 01/02/03, sin testimonios/estadísticas en el portafolio, sin botón flotante de WhatsApp.
- Contracción correcta: "del" (no "de el").
- Paleta clara: crema `#F9F7F4`, carbón `#1C1C1E`, oro `#C9A84C`, **oro-texto `#7A5E1A`** (el oro brillante nunca como texto sobre claro — no pasa AA). Tipografía **Montserrat**. Nada de fondo oscuro ni serif (se probó una versión "cine" y se descartó).
- Videos **clasificados** Residencial/Terreno (NO juntos). **Sin autoplay, con sonido, clic para reproducir.** Márgenes respetados. Responsive móvil + desktop.
- 360 = enlace externo a CloudPano; ser honesto ("se abre en pestaña nueva"), no fingir 360 embebido.

---

## 7. Gotchas verificados (ahorran tiempo)

1. **`scrollWidth - clientWidth === 0`** debe cumplirse a 1280 y 390 (cero desborde horizontal).
2. **Sin JS, todo visible:** los pósters son `<img>` reales (no se inyectan por JS); el JS solo realza (play, año).
3. **zsh:** `UID` es variable reservada — usar otro nombre (`VID`) en scripts.
4. **No usar regex codicioso** para reemplazar bloques de tarjetas: `<div class="ph">.*?</div>` con DOTALL se come desde el hero. Usar **reemplazo de string exacto** por tarjeta.
5. **`/portafolio.html` → 308 → `/portafolio`** (Pages quita `.html`). Verificar en `/portafolio`.
6. Editar verificando: este HTML es estático; "la prueba" es navegador real + `curl` a producción tras desplegar. (En entornos headless el IntersectionObserver y el autoplay pueden no dispararse; no es bug.)
7. Subidas a Stream con POST directo aceptan <200 MB; arriba de eso, transcodificar primero (`ffmpeg -vf scale=1080:1920 -crf 18`).

---

## 8. Estado y posibles siguientes pasos

- **Estado: completo y en producción.** Todo verificado en vivo el 2026-06-25.
- Pendientes/ideas si se retoma:
  - Afinar tamaño del logo en la barra si Bruno lo pide.
  - Lightbox para ampliar fotos del mosaico (no implementado a propósito; mantenerlo simple).
  - Si llegan más videos/fotos: subir (token + §4) y agregar tarjetas/figuras siguiendo el patrón de §5.
  - Definir el "mejor video" para un eventual hero en video (hoy el hero es foto, por decisión de Bruno).

---

## 9. Docs relacionados (en el repo)
- `docs/superpowers/2026-06-24-portafolio-HANDOFF.md` — handoff original (placeholders).
- `docs/superpowers/plans/2026-06-24-portafolio-implementacion.md` — plan original.
- `docs/superpowers/specs/2026-06-12-portafolio-rediseno-design.md` — spec de diseño.
- Este documento refleja el estado **ya con media real y desplegado**, que es posterior a esos.
