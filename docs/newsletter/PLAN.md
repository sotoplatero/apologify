# Newsletter de Apologify — plan de implementación

**Fecha:** 2026-10-25 · **Estado:** plan aprobado para construir · Sustituye a la idea aparcada en `docs/PENDING.md` (beehiiv/Substack → ahora en el propio sitio).

## 1. Qué es

Resumen **semanal** de disculpas públicas (marcas, celebridades, deportistas, políticos, gobiernos) publicado en **`apologify.com/news`** y enviado por email. Cada caso lleva una **nota A–F** con una rúbrica fija y un **veredicto de una línea**. La nota + veredicto es el diferencial; un resumen a secas es commodity.

- **Audiencia:** lector curioso + gente de PR / comunicación de crisis (uso profesional).
- **Objetivos:** marca, audiencia propia (email), tráfico orgánico a `/news`, empujar al `/generator`.
- **No-objetivos:** cubrir todas las disculpas; noticias de última hora; opinar sobre la culpabilidad de nadie.
- **Anti-objetivos (fracaso aunque funcione):** copiar párrafos de medios; burlarse de víctimas; publicar algo que no revisó un humano; un número que parezca escrito por una IA genérica.

## 2. Arquitectura

```
n8n (self-hosted)                          Repo / Vercel                     Lector
──────────────────                         ─────────────                     ──────
[Lun 07:00] Descubrir ─► Agrupar/dedup ─►  
Puntuar (GPT) ─► Borradores (GPT) ─►
Email "número listo" ─► n8n Form (tú eliges
y reescribes veredictos) ─► genera .md ─►  PR a main ─► Vercel preview
                                           (tú revisas) merge ─► deploy ──► /news/2026-w44
Webhook deploy OK ─► Resend Broadcast ─────────────────────────────────────► email
```

Decisiones:
- **n8n descubre, cura, redacta y abre el PR. No escribe en la BD ni en el sitio directamente.** Publicar = merge del PR. Así el contenido queda versionado, las páginas son **estáticas** (prerender, como los artículos) y no hay que pelearse con la caché ISR (un `/news` on-demand quedaría cacheado para siempre por deploy).
- **Dos puertas humanas:** el Form de n8n (selección + veredictos) y el preview de Vercel del PR (cómo se ve). Nada se publica sin merge.
- **Email con Resend** (ya verificado `apologify.com`): Contacts/Segments + Broadcasts API.
- **LLM: OpenAI** vía Chat Completions (`response_format: json_object`, `max_completion_tokens`, sin `temperature`; credencial "OpenAi account" de n8n): `gpt-6-luna` con `reasoning_effort: none` para clasificar titulares y `gpt-6.1-sol` con `reasoning_effort: low` para puntuar y proponer el número. El modelo lo decide el dueño; no cambiarlo sin su visto bueno.
- **Lo que vive fuera del repo se versiona igual:** el workflow de n8n exportado a `n8n/apology-news.workflow.json` y los prompts/rúbrica en `docs/newsletter/` (n8n los lee del repo por URL raw o se copian al exportar).

## 3. Criterios de curación

### Entra si cumple todo
1. **Disculpa real ya emitida** — comunicado, post, vídeo, carta, rueda de prensa — con **texto primario enlazable o citado por un medio fiable**.
2. **Emisor público**: marca, figura pública, deportista, político, institución, gobierno.
3. **Fecha**: emitida en la semana cubierta (lun–dom anterior).
4. **Cobertura**: ≥ 2 medios distintos, o viral comprobable.
5. **Enseña algo** aplicable a cómo se pide perdón.

### Sección aparte: "No-disculpa de la semana"
Negativas explícitas a disculparse, "sorry if anyone was offended", disculpas retiradas. Mismos criterios 2–5.

### No entra
- Particulares o menores, aunque sean virales.
- Casos con víctimas recientes (muertes, abusos) donde una nota quedaría de mal gusto — como mucho se menciona sin nota.
- Rumores, "fuentes dicen que se disculpará", sin texto verificable.
- Disculpas rutinarias sin interés (aerolínea por retraso estándar), salvo que sean ejemplares.

### Mezcla del número
- 1 disculpa de la semana + 1 no-disculpa + 4–5 casos breves (6–7 en total).
- Máx. 2 por categoría (`brand | celebrity | sports | politics | government | other`).
- Variedad geográfica; si todo es EE. UU., buscar al menos un caso de fuera.

### Reglas editoriales
- **Se juzga la disculpa, no a la persona** ni si es culpable de lo que se le acusa.
- Resúmenes con **palabras propias**; como mucho **una cita corta** (≤ 25 palabras) del texto de la disculpa; siempre enlace a la fuente primaria y a un medio.
- Sin imágenes de medios ni fotos de las personas. Imagen = tarjeta generada (sección 5.4).
- Si hay una corrección posterior, se edita el número y se añade nota "Actualizado".

## 4. Rúbrica de la nota (A–F)

Versionada en `docs/newsletter/rubric.md` (el prompt de puntuación la usa tal cual). Seis componentes, puntuados 0–2:

| Componente | Peso |
|---|---|
| Asume la responsabilidad (dice "yo/nosotros hicimos X") | ×3 |
| Ofrece reparación concreta | ×2 |
| Nombra el hecho concreto | ×2 |
| Expresa arrepentimiento | ×1 |
| Compromiso de no repetir (con algo verificable) | ×1 |
| Pide perdón | ×1 |

Penalizaciones (−2 cada una): voz pasiva ("mistakes were made"), condicional ("if anyone was offended"), culpar a otros o al contexto, tardanza evidente, solo tras presión legal/comercial evidente, tono abogado.

Escala sobre 20: A ≥ 17 · B ≥ 13 · C ≥ 9 · D ≥ 5 · F < 5. **El LLM propone, tú decides**; la nota final es editorial.

El veredicto: una frase, ≤ 15 palabras, concreta, sin adjetivos vacíos. Ej.: *"Nombra el error, paga a los afectados y no se esconde detrás de 'algunos'."* / *"Tres párrafos de abogado y ni una vez dice qué hizo."*

## 5. Sitio (Astro)

### 5.1 Contenido
`src/data/news/<YYYY>-w<NN>/issue.json` (semana ISO, ej. `2026-w45`), opcionalmente con un `body.md` al lado para el análisis largo de la disculpa de la semana. **JSON y no frontmatter YAML**: lo escribe n8n, lo lee el workflow de envío con `JSON.parse` y lo valida Zod en el build. El número de edición no se guarda; se deriva del orden.

```json
{
  "week": "2026-w45",
  "slug": "acme-gets-it-right-bigco-does-not",
  "image": { "src": "/news/acme-gets-it-right-bigco-does-not.webp", "alt": "…" },
  "title": "Acme gets it right, Bigco does not",
  "description": "The public apologies of the week, graded A to F.",
  "date": "2026-11-02",
  "intro": "Optional, max 2 sentences.",
  "items": [
    {
      "id": "acme-airlines",
      "slot": "best",
      "who": "Acme Airlines",
      "category": "brand",
      "country": "US",
      "headline": "Acme refunds 4,000 stranded passengers",
      "summary": "2-3 sentences in our own words.",
      "quote": "We failed you, and we're refunding every ticket.",
      "grade": "A",
      "verdict": "Names the failure, refunds everyone, no small print.",
      "statementUrl": "https://…",
      "sourceUrl": "https://…",
      "sourceName": "Reuters",
      "statementDate": "2026-10-29"
    }
  ]
}
```

La URL es `/news/<slug>`; la portada (`image`) la genera n8n con `gpt-image-2.5-flare` y la sube a `public/news/<slug>.webp` en el mismo PR (a mano: `node scripts/news-cover.mjs <semana>`). `id` es el ancla (`/news/<slug>#acme-airlines`); `slot` ∈ `best | worst | brief`; `category` ∈ `brand | celebrity | sports | politics | government | other`. `quote`, `statementUrl`, `statementDate`, `country` e `intro` son opcionales.

### 5.2 Código
- `src/lib/news.ts` — loader con `import.meta.glob('../data/news/*/issue.json', { eager: true })` (+ `body.md` opcional), mismo patrón que `articles.ts`; tipos `NewsIssue` / `NewsItem`; validación Zod del JSON (que **falle el build** si un número viene mal: es la red de seguridad contra un PR roto de n8n).
- `src/pages/news/index.astro` — último número arriba + archivo. `prerender = true`.
- `src/pages/news/[week].astro` — un número; casos con ancla, chip de nota con color, enlaces a fuentes, CTA al `/generator`, bloque de suscripción. `prerender = true`, JSON-LD `NewsArticle`.
- `src/pages/news/rss.xml.ts` — feed RSS (estático).
- `src/components/news/GradeBadge.astro`, `NewsItem.astro`, `SubscribeForm.svelte`.
- Estilo: tema `apology` existente (papel/tinta, Fraunces). La nota es el elemento visual dominante.
- Enlaces: `/news` en header/footer, bloque de suscripción en home, artículos y `/research/why-people-apologize`.
- Sitemap: entra solo por `@astrojs/sitemap` (son estáticas).

### 5.3 Suscripción
- `src/pages/api/news/subscribe.ts` (POST; `/api/*` ya excluido de ISR): valida email, crea contacto en Resend (dentro del segmento del newsletter) como `unsubscribed: true` y envía email de confirmación con enlace firmado (HMAC con `NEWS_SIGNING_SECRET`).
- `src/pages/api/news/confirm.ts` (GET): verifica la firma → pone el contacto `unsubscribed: false` → redirige a `/news?subscribed=1`. **Doble opt-in.**
- Rate limit simple por IP + honeypot.
- La baja la gestiona Resend (`{{{RESEND_UNSUBSCRIBE_URL}}}` en el broadcast).

### 5.4 Imagen OG del número
`src/pages/news-og/[week].png.ts` con satori (reutiliza `googleFont` de `shareImage.ts`): título del número + las notas de los casos como chips. On-demand y cacheada por deploy (el número no cambia entre deploys, así que la caché ISR es correcta aquí). Sin texto de terceros.

## 6. n8n (creado el 2026-10-25 en n8n.volttus.dev)

Fuente versionada (SDK de n8n) en `n8n/apology-news-draft.sdk.ts` y `n8n/apology-news-send.sdk.ts`. Si se edita en el lienzo de n8n, actualizar también estos archivos.

### Workflow "Apology News: Draft" — `yt31QFzUfJJL2F9W` (lunes 07:00, Europe/Madrid)

Un solo workflow: la revisión humana va dentro, en un email *send-and-wait* con formulario, así que no hace falta un workflow B aparte.

1. **Descubrir**: Google News RSS (8 consultas, `when:7d`) + GDELT DOC API (`timespan=7d`), en paralelo → merge.
2. **Normalizar**: `{title, url, source, publishedAt, snippet}`, últimos 8 días, sin títulos repetidos, máx. 240, en lotes de 40.
3. **Clasificar** (`gpt-6-luna`, prompt CLASSIFY): `apology | non_apology | not_relevant`, `who`, `category`, `country`, `event`.
4. **Agrupar** por emisor (slug de `who`); cobertura = medios distintos. Fuera los emisores publicados en las últimas 3 semanas (tabla `apology_news_seen`). Quedan los 12 con más cobertura (≥ 2 medios primero).
5. **Fuente primaria**: Tavily (news, 10 días, 5 resultados) por caso.
6. **Puntuar + redactar** (`gpt-6.1-sol`, prompt SCORE = rúbrica de `rubric.md`): componentes, penalizaciones, nota, veredicto, titular, resumen, cita, `statement_url`, `source_url`, `sensitive`. Descarta los casos donde no hay disculpa real (`keep: false`).
7. **Proponer el número** (prompt LINEUP): best/worst/brief, título, intro.
8. **Revisión (tú)**: email con botón a un formulario precargado (título, intro y, por caso: slot, nota, veredicto, titular, resumen; cada caso con su resumen, enlaces y aviso si es `sensitive`). Espera hasta 3 días.
9. **Construir `issue.json`** con lo elegido. Validación suave: 1 best, 1 worst, 4–7 casos, máx. 2 por categoría, veredicto ≤ 15 palabras, sin URL primaria. Los avisos van al cuerpo del PR, no bloquean.
10. **GitHub** (API REST): rama `news/<week>-<execution>`, commit del archivo, PR con tabla de casos, avisos y descartados. Te llega el enlace por email.
11. Guarda los emisores publicados en `apology_news_seen`.

Merge del PR = publicar (Vercel preview antes, deploy al hacer merge).

### Workflow "Apology News: Send" — `m6nSjOdxYId11DC7` (martes 08:00, America/New_York)

Programado, no webhook: evita carreras con el deploy y la protección anti-bots de Vercel.

1. Semana ISO actual; si ya está en `apology_news_sent`, para (idempotente).
2. Lee `src/data/news/<week>/issue.json` de `main` por la API de GitHub. Si no está → te avisa ("no está mergeado").
3. Estado del último commit de `main` (`/commits/main/status`, que publica Vercel). Si no es `success` → te avisa.
4. Construye el HTML del email desde el JSON (paleta papel/tinta, chip de nota por caso, UTM `utm_source=newsletter&utm_campaign=<week>`, `{{{RESEND_UNSUBSCRIBE_URL}}}`).
5. **Resend Broadcast** al segmento del newsletter con `send: true`, guarda el id en `apology_news_sent` y te confirma.

Si te avisa, mergea o arregla y ejecútalo a mano: no reenvía semanas ya enviadas.

### Pendiente en n8n antes de activar
- Credencial **GitHub** "GitHub apologify" (token fine-grained en `sotoplatero/apologify`: Contents + Pull requests, lectura/escritura) en los 6 nodos de GitHub.
- Credencial **Resend API** (templated: `Authorization: Bearer <RESEND_API_KEY>`).
- `PASTE_RESEND_SEGMENT_ID` en el nodo Config de Send.
- Emails ya configurados: de `Apology News <news@apologify.com>` a `soto.platero@gmail.com` (el SMTP "SMTP account" es Resend; solo acepta remitentes de dominios verificados allí, `volttus.com` no lo está).
- Ya asignadas: OpenAi account, Tavily account, SMTP account.

## 7. Configuración

| Dónde | Variable / recurso |
|---|---|
| Vercel | `RESEND_SEGMENT_ID`, `NEWS_SIGNING_SECRET` (+ `RESEND_API_KEY`, `EMAIL_FROM` existentes) |
| n8n credenciales | OpenAI (existe), Tavily (existe), SMTP (existe), GitHub (nueva), Resend (nueva) |
| n8n Data Tables | `apology_news_seen` (`1wiueO8HTZCwyxuZ`), `apology_news_sent` (`TyfhEAKkXG2KFiiL`) |
| Resend | Segmento del newsletter; remitente `Apology News <news@apologify.com>` |
| `.env.example` | documentar las nuevas variables |

## 8. Fases

1. **Rúbrica y prompts** — `docs/newsletter/rubric.md`, `docs/newsletter/prompts.md` (clasificar, puntuar/redactar). Probarlos a mano con 5 disculpas reales de esta semana.
2. **Sitio** — `news.ts` + Zod, `/news`, `/news/[week]`, RSS, OG, componentes. Número 0 escrito a mano con casos reales para validar diseño (no se publica hasta tener el flujo).
3. **Suscripción** — endpoints subscribe/confirm, formulario, segmento en Resend. Probar alta → confirmación → baja.
4. **n8n A + B** — descubrimiento, borrador, Form, PR. Correrlo en seco 2 semanas (PR sin merge) comparando lo que encuentra con lo que tú habrías elegido.
5. **n8n C + email** — render del email, broadcast, idempotencia. Enviar a un segmento de prueba primero.
6. **Lanzamiento** — enlaces en el sitio, anunciar en redes (Social Studio) y a los contactos de `docs/outreach/`.
7. **Exportar** el workflow a `n8n/apology-news.workflow.json` (sin credenciales) y actualizar `CLAUDE.md` + `docs/PENDING.md`.

Gate antes de cada push: `npx astro check` + `npx astro build`.

## 9. Medición y prueba

- **8 números semanales.** Seguir si apertura > 40 % y suscriptores crecen semana a semana.
- Además: clics a `/generator` desde `/news` y el email (UTM), visitas orgánicas a `/news/*` (Vercel Analytics / Search Console).
- Tiempo humano objetivo: ≤ 45 min/semana (Form + revisar preview). Si pasa de 1,5 h, recortar formato.

## 10. Riesgos

| Riesgo | Mitigación |
|---|---|
| El LLM confunde "piden que se disculpe" con disculpa | Clasificación explícita + exigir texto primario + revisión humana |
| Difamación / tono | Juzgar solo el texto de la disculpa; nada de culpabilidad; excluir víctimas recientes |
| Copyright | Palabras propias, cita ≤ 25 palabras, enlace siempre, sin imágenes de terceros |
| Google News RSS cambia o limita | GDELT + Exa como respaldo |
| PR mal formado rompe el build | Zod en el build; el preview falla antes del merge |
| Envío duplicado | tabla `apology_news_sent` + comprobar deploy |
| Semana floja | Mínimo 4 casos; si no, número corto o se salta (se avisa) |

## 11. Abierto (decide el dueño)

- **Nombre** del newsletter (propuestas: *The Apology Report*, *Sorry Report*, *Apology Grades*).
- **Día de envío** (propuesta: martes 08:00 ET, borrador el lunes).
- **Idioma**: inglés (el sitio y la audiencia son en inglés) — supuesto de este plan.
