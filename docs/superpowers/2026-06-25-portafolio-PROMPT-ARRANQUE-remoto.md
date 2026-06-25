# Prompt de arranque — sesión remota (portafolio IAV)

Pega esto como primer mensaje al abrir la sesión en la nube:

---

Vamos a seguir trabajando el portafolio de Inmuebles Audiovisuales. Ya está en producción.

ANTES de tocar nada, lee completo: `docs/superpowers/2026-06-25-portafolio-HANDOFF-remoto.md` — tiene el estado actual, los IDs de toda la media en Cloudflare (Stream/Images), cómo desplegar y los gotchas. Es la fuente de verdad.

Contexto rápido:
- La página es `portafolio.html` (raíz del repo), HTML/CSS/JS puro, sin build. En vivo: https://inmueblesaudiovisuales.com/portafolio
- Despliegue: commit + `git push origin main` → Cloudflare Pages publica solo (no hay build). No despliegues con wrangler.
- El token de Cloudflare NO está en el repo. Si vas a subir/editar media en Stream o Images, pídeme el token y expórtalo como `CLOUDFLARE_API_TOKEN` (cuenta `0d0d6aaf107ae092f9fb5da06ddb338c`). Para solo editar la página no lo necesitas.
- Los assets fuente (videos/fotos originales) NO están en el repo; viven en mi Mac. Para agregar media nueva los subo yo o me los pides.

Reglas de trabajo:
- Explícame en español sencillo, en términos de negocio.
- Nunca asumas: verifica en el código/datos antes de afirmar.
- Copy: nunca "una así / algo así"; siempre nombra el sustantivo. Voz directa del index. No reabras decisiones de diseño (ver §6 del handoff).
- Verifica de verdad antes de decir que algo quedó: navegador real y/o `curl` a producción tras desplegar.
- Dime siempre el siguiente paso recomendado.

Dime qué quieres cambiar y arráncame proponiendo el plan corto antes de tocar archivos si es un cambio visual.

---
