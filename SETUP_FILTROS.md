# Sistema de Directorio con Filtros - Setup

## ✅ Lo que ya funciona SIN Turso

El sistema de filtros en `/examples` ya funciona completamente con las 113 cartas estáticas existentes:

- ✅ Filtros por Recipient
- ✅ Filtros por Tone
- ✅ Búsqueda por texto
- ✅ Directorio visual con cards
- ✅ Cliente-side filtering (instantáneo)

**Puedes probar ahora mismo:**

```bash
pnpm dev
```

Visita: http://localhost:4321/examples

## 🔧 Para habilitar cartas generadas por usuarios

Si quieres que las cartas que los usuarios generen en `/generator` se guarden y aparezcan en el directorio:

### 1. Instalar Turso CLI

**Windows (PowerShell):**
```powershell
irm get.tur.so/install.ps1 | iex
```

**macOS/Linux:**
```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

### 2. Crear base de datos

```bash
# Login (si es primera vez)
turso auth signup

# Crear database
turso db create apologify-db

# Obtener URL
turso db show apologify-db --url

# Crear token
turso db tokens create apologify-db
```

### 3. Configurar .env

Copia el output de los comandos anteriores a tu archivo `.env`:

```env
OPENAI_API_KEY=tu_key_existente

# Añade estas líneas
TURSO_DATABASE_URL=libsql://apologify-db-xxx.turso.io
TURSO_AUTH_TOKEN=eyJhbGc...
```

### 4. Inicializar tablas

```bash
pnpm db:init
```

### 5. Probar

```bash
pnpm dev
```

Ve a http://localhost:4321/generator y genera una carta. Se guardará en Turso y aparecerá en `/examples` con badge "✨ Generated".

## 📊 Estado actual

**Sin Turso configurado:**
- ✅ Filtros funcionan con 113 cartas estáticas
- ⚠️ Cartas generadas NO se guardan (pero el generador funciona)
- ℹ️ Verás warning en consola: "Turso database not configured"

**Con Turso configurado:**
- ✅ Todo lo anterior
- ✅ Cartas generadas se guardan en DB
- ✅ Aparecen automáticamente en el directorio
- ✅ Crecimiento orgánico de contenido

## 🎯 Beneficios SEO (ya activos)

Incluso sin Turso, el nuevo sistema de filtros ya mejora el SEO:

1. **Mejor UX**: Los usuarios encuentran exactamente lo que buscan
2. **Engagement**: Más tiempo en el sitio explorando
3. **Internal linking**: Todas las cartas interconectadas
4. **Preparado para escalar**: Cuando añadas Turso, todo seguirá funcionando

## ❓ Preguntas frecuentes

**¿Necesito Turso obligatoriamente?**
No. El sitio funciona perfectamente sin Turso. Solo necesitas Turso si quieres que las cartas generadas por usuarios se guarden.

**¿Puedo probar el sistema ahora?**
Sí, `pnpm dev` y ve a `/examples`. Los filtros ya funcionan con tus cartas estáticas.

**¿Cuánto cuesta Turso?**
Turso tiene plan gratuito generoso (500 DBs, 9GB storage, 1B row reads/mes).

**¿Puedo configurar Turso después?**
Sí, totalmente. El código está preparado para funcionar con o sin Turso.
