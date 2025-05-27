# Configuración de Turso para Astro

Este proyecto ahora incluye soporte para base de datos Turso usando Astro DB. Sigue estos pasos para configurar tu base de datos.

## Prerrequisitos

1. Instalar el CLI de Turso:
   ```bash
   # macOS/Linux
   curl -sSfL https://get.tur.so/install.sh | bash
   
   # Windows (PowerShell)
   irm get.tur.so/install.ps1 | iex
   ```

2. Iniciar sesión en Turso:
   ```bash
   turso auth signup  # o turso auth login si ya tienes cuenta
   ```

## Configuración de la Base de Datos

### 1. Crear una base de datos en Turso

```bash
turso db create apologify-db
```

### 2. Obtener la URL de la base de datos

```bash
turso db show apologify-db --url
```

### 3. Crear un token de autenticación

```bash
turso db tokens create apologify-db
```

### 4. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con:

```env
# Turso Database Configuration
TURSO_DATABASE_URL=libsql://apologify-db-[tu-org].turso.io
TURSO_AUTH_TOKEN=tu-token-aqui

# Otras configuraciones (opcional)
OPENAI_API_KEY=tu-api-key-aqui
AUTH_SECRET=tu-secret-aqui
```

**⚠️ Importante:** No uses el prefijo `PUBLIC_` para estas variables ya que son privadas.

## Configuración para Producción

### Para usar Turso en producción:

1. Actualiza tu comando de build en `package.json`:
   ```json
   {
     "scripts": {
       "build": "astro build --remote"
     }
   }
   ```

2. O usa el flag directamente:
   ```bash
   # Build con conexión remota
   astro build --remote
   
   # Desarrollo con conexión remota
   astro dev --remote
   ```

### Configurar el esquema en Turso

1. Empujar el esquema a la base de datos remota:
   ```bash
   astro db push --remote
   ```

## Desarrollo Local

Para desarrollo local, Astro DB creará automáticamente una base de datos local en `.astro/content.db` y usará los datos de seed definidos en `db/seed.ts`.

## Estructura de la Base de Datos

El proyecto incluye las siguientes tablas:

- **ApologyLetters**: Cartas de disculpa con título, contenido, destinatario, tono y situación
- **Users**: Usuarios del sistema
- **UserLetters**: Relación entre usuarios y cartas guardadas

## Uso en el Código

### En componentes Astro:

```astro
---
import { getAllApologyLetters } from '../lib/database';

const letters = await getAllApologyLetters();
---

<div>
  {letters.map(letter => (
    <div>{letter.title}</div>
  ))}
</div>
```

### En endpoints API:

```typescript
import type { APIRoute } from 'astro';
import { getAllApologyLetters } from '../../lib/database';

export const GET: APIRoute = async () => {
  const letters = await getAllApologyLetters();
  return new Response(JSON.stringify(letters));
};
```

### Usando el cliente Turso directamente:

```typescript
import { turso } from '../lib/turso';

const { rows } = await turso.execute('SELECT * FROM ApologyLetters');
```

## Funciones Disponibles

El archivo `src/lib/database.ts` incluye funciones helper para:

- **Usuarios**: `createUser`, `getUserByEmail`, `getUserById`
- **Cartas**: `getAllApologyLetters`, `getApologyLettersByRecipient`, `createApologyLetter`
- **Búsqueda**: `searchLettersWithFilters`, `searchApologyLetters`
- **Relaciones**: `saveUserLetter`, `getUserLetters`

## Comandos Útiles

```bash
# Desarrollo local
npm run dev

# Build para producción
npm run build

# Empujar esquema a Turso
astro db push --remote

# Ver información de la base de datos
turso db show apologify-db

# Abrir shell de la base de datos
turso db shell apologify-db
```

## Recursos

- [Documentación de Turso](https://docs.turso.tech/)
- [Astro DB con Turso](https://docs.astro.build/en/guides/astro-db/)
- [Guía de Turso para Astro](https://docs.astro.build/en/guides/backend/turso/) 