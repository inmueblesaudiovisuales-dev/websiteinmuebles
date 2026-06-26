# Editor de Portafolio — configuración y uso

Editor visual para el portafolio (`editor-portafolio.html`). Permite reordenar
(arrastrando), mostrar/ocultar, editar textos y mensajes de WhatsApp, y agregar
media por ID — con **vista previa en vivo** y un botón **Publicar** que sube los
cambios a producción.

- **Archivo del editor:** `editor-portafolio.html` (raíz del repo).
- **Fuente de verdad del contenido:** `portafolio.config.json` (raíz del repo).
- **Página pública que se genera:** `portafolio.html`.

---

## Cómo funciona (resumen)

1. El editor carga el contenido desde `portafolio.config.json`.
2. Editas visualmente. Cada cambio se autoguarda como **borrador** en tu navegador
   (no está en vivo todavía).
3. Al pulsar **Publicar**, el editor sube dos archivos a GitHub (rama `main`):
   - `portafolio.html` (la página que ven los visitantes)
   - `portafolio.config.json` (para que el editor recuerde el estado)
4. **Cloudflare Pages** detecta el commit y despliega solo en ~1 minuto.
   Verifica en https://inmueblesaudiovisuales.com/portafolio

No hay paso de build. El editor genera el mismo HTML estático que ya tenías
(mismos videos de Cloudflare Stream, fotos de Cloudflare Images y recorrido 360).

---

## Configuración por única vez

### 1) Desplegar el editor al sitio
`editor-portafolio.html` y `portafolio.config.json` deben estar en `main` para
que Cloudflare los sirva. Una vez en producción, el editor vive en:

> https://inmueblesaudiovisuales.com/editor-portafolio

### 2) Proteger el editor (importante)
El editor no debe quedar abierto al público. Protégelo con **Cloudflare Access**
(gratis para pocos usuarios):

1. En el panel de Cloudflare → **Zero Trust → Access → Applications → Add an application → Self-hosted**.
2. Dominio/ruta: `inmueblesaudiovisuales.com/editor-portafolio*`
   (y opcionalmente `/portafolio.config.json` si no quieres exponer el JSON).
3. Política: **Allow** solo a tu correo (`inmueblesaudiovisuales@gmail.com`),
   método de acceso por código de un solo uso (One-time PIN) o Google.

Así, solo tú entras al editor. (La página ya manda `noindex` para no aparecer en Google.)

### 3) Crear un token de GitHub (para que Publicar funcione)
El botón Publicar escribe en el repo usando un token tuyo. Crea uno de **alcance mínimo**:

1. GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. **Resource owner:** `inmueblesaudiovisuales-dev`.
3. **Repository access:** *Only select repositories* → `websiteinmuebles`.
4. **Permissions → Repository permissions → Contents: Read and write**. (Nada más.)
5. **Expiration:** 90 días (recomendado; lo renuevas cuando caduque).
6. Genera y **copia** el token (empieza con `github_pat_…`).

La primera vez que pulses Publicar, el editor te pedirá pegar ese token. Se guarda
**solo en esa pestaña del navegador** (`sessionStorage`): al cerrar la pestaña se
borra y lo vuelves a pegar la próxima vez. Nunca se sube al repo ni queda en la página.

---

## Uso diario

1. Abre el editor (entras por Cloudflare Access).
2. Edita: arrastra para reordenar, usa el ojo 👁 para ocultar, escribe en los campos,
   o pega un **UID de Stream** / **ID de Images** para agregar media ya subida.
3. Revisa la **vista previa** (Escritorio/Móvil).
4. **Publicar** → pega el token la primera vez → espera el ✓ → revisa el sitio en ~1 min.

¿Te equivocaste? Mientras no publiques, nada cambia en vivo. **Restablecer** descarta
tu borrador y vuelve a lo publicado. Si ya publicaste algo, puedes volver a una versión
anterior desde el historial de GitHub.

---

## Lo que todavía NO hace (y cómo se completaría)

- **Subir media nueva desde el editor** (un video/foto que aún no está en Cloudflare).
  Eso requiere el **token de Cloudflare**, que por seguridad no puede ir en el navegador.
  La forma correcta es un pequeño proxy en tu backend de Google Apps Script
  (`ScriptContratos3`) que reciba el archivo y lo suba a Cloudflare Stream/Images con
  el token guardado del lado del servidor. Es el siguiente incremento natural.
  Mientras tanto: sube la media como hoy (desde tu Mac) y **agrégala por ID** en el editor.

## Endurecimiento opcional (más seguro)

Mover también la publicación a GitHub al backend de Apps Script: el editor llamaría a
una acción `publicarPortafolio` y el **token de GitHub viviría en el servidor**
(Script Properties), no en el navegador. Recomendado si el editor llegara a usarse
desde varios dispositivos o por más de una persona.
