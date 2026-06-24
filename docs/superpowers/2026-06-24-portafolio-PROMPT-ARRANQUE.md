# PROMPT DE ARRANQUE — sesión que programa el portafolio

> Pegar esto como primer mensaje en la nueva sesión (en `/Users/brunogutierrez/websiteinmuebles`).

---

Vamos a programar el rediseño del portafolio de Inmuebles Audiovisuales. El diseño, copy y estructura YA están aprobados; tu trabajo es **construir y verificar**, no rediseñar. No reabras decisiones de diseño.

**Antes de tocar código, lee en este orden:**
1. `docs/superpowers/2026-06-24-portafolio-HANDOFF.md` — contexto completo (léelo entero).
2. `docs/superpowers/plans/2026-06-24-portafolio-implementacion.md` — el plan a ejecutar paso a paso.
3. `docs/superpowers/specs/2026-06-12-portafolio-rediseno-design.md` — el diseño detallado.
4. `portafolio-mockup.html` — la **fuente de verdad visual**: el resultado debe verse y comportarse igual.

**Qué hacer:** ejecuta el plan de implementación tarea por tarea (Fases 0–5). Parte de `portafolio-mockup.html`, promuévelo a `portafolio.html` y endurécelo para producción (Cloudflare Stream, robustez sin JS, accesibilidad, meta, rendimiento). Se despliega con placeholders hasta que lleguen los assets reales; eso está previsto.

**Higiene de git (obligatoria):**
- Trabaja en la rama `portafolio-rediseno` (créala desde `main`).
- Commit por tarea, mensajes claros en español.
- Merge a `main` con `--no-ff` SOLO tras el visto bueno de Bruno.
- Tú despliegas Cloudflare/GitHub; Bruno no lo hace a mano.

**Verificación concreta (no cierres una fase sin esto):**
- Sirve local (`python3 -m http.server 8778`) y verifica en **navegador real** (Safari y Chrome), desktop (1280) y celular (390). Nada de validar solo leyendo código o en jsdom.
- Captura cada vista y compárala contra `portafolio-mockup.html`: deben verse iguales.
- Consola sin errores. Todos los CTA de WhatsApp funcionan (cada "Cotizar" nombra su propiedad); el 360 abre CloudPano en pestaña nueva.

**Gates de errores conocidos (cada uno es un paso verificable, no opcional):**
1. **Sin JS, todo visible.** La tira de videos va en HTML estático, no inyectada por JS. Gate: desactiva JavaScript en el navegador → hero, 5 videos (pósters), 360, fotos y cierre siguen visibles y los WhatsApp funcionan.
2. **Sin desbordes horizontales.** Gate: `document.documentElement.scrollWidth - document.documentElement.clientWidth === 0` en 1280 y 390.
3. **Contraste AA.** El oro `#C9A84C` no se usa como texto sobre crema; texto oro = `#7A5E1A`. Gate: checker de contraste 4.5:1 / 3:1.
4. **prefers-reduced-motion** respetado: sin animaciones ni autoplay cuando está activo.
5. **Cloudflare Stream:** confirma la sintaxis vigente del manifest HLS con context7 antes de codear; fallback robusto al póster si no hay asset o el navegador no soporta HLS (nunca un cuadro vacío).

**Cierre de cada fase y del proyecto:** Bruno verifica en su Safari (desktop y celular). No se mergea ni despliega sin su visto bueno.

Usa las skills de superpowers para ejecutar el plan (executing-plans o subagent-driven-development) y verification-before-completion antes de declarar algo terminado. Empieza leyendo el HANDOFF y dime el plan de las primeras fases antes de arrancar.
