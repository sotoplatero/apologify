# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Apologify.com is an Astro-based web application that helps users generate personalized apology letters. The site combines:
- A static content library of pre-written apology letter examples
- An interactive AI-powered generator that creates custom apology letters
- Educational articles about writing effective apologies

## Tech Stack

- **Framework**: Astro 5 with hybrid rendering (static + server)
- **UI Components**:
  - Astro components for static pages
  - Svelte for interactive components (wizard, letter display, copy functionality)
  - Preact for specific interactive elements
  - React support available
- **Styling**: Tailwind CSS + DaisyUI
- **Content**: Astro Content Collections (articles and letters)
- **AI Integration**: OpenAI GPT-4o-mini for letter generation
- **Authentication**: Auth.js with GitHub provider (configured but not actively used in current flow)
- **Deployment**: Vercel with ISR (Incremental Static Regeneration)
- **Package Manager**: pnpm

## Development Commands

```bash
# Install dependencies
pnpm install

# Run dev server (localhost:4321)
pnpm dev

# Build for production (includes type checking)
pnpm build

# Build with remote database
pnpm build:remote

# Preview production build locally
pnpm preview

# Type checking only
pnpm astro check

# Generate new content (articles)
pnpm injest
```

## Architecture

### Hybrid Content System

The site uses a hybrid approach combining static content and dynamic database storage:

1. **Articles** (`src/content/articles/`): Educational blog posts about apology writing
   - Stored as markdown files with frontmatter
   - Include Unsplash images with photographer attribution
   - Organized by slug in individual directories

2. **Static Letters** (`src/content/letters/`): Pre-written example apology letters
   - Stored as JSON files organized by recipient type (boss, friend, family, etc.)
   - Each file contains tone, recipient, context, and multiple letter variations
   - Used for curated examples (113 letters)

3. **Generated Letters** (Turso Database): User-generated apology letters
   - Stored in `user_letters` table in Turso DB
   - Created when users use the AI generator at `/generator`
   - Automatically appear in the `/examples` directory
   - Fields: id, recipient, context, tone, letter, slug, created_at

### Unified Letter System

The `src/lib/letters.ts` module provides a unified interface that:
- Merges static letters from content collections with generated letters from DB
- Provides consistent filtering and search across both sources
- Uses `UnifiedLetter` interface for both static and generated content
- Functions like `getAllLetters()`, `getLettersByRecipient()`, `getLetterBySlug()` work transparently across both sources

### Key Pages & Routes

- `/` - Homepage with hero and call-to-action
- `/generator` - Interactive AI letter generator (server-rendered, saves to DB)
- `/examples` - Directory with filters showing ALL letters (static + generated)
- `/examples/[recipient]` - Browse letters by recipient type (static only currently)
- `/examples/[recipient]/[slug]` - Individual letter pages (supports both static and generated)
- `/articles/[slug]` - Individual article pages
- `/articles/[...page]` - Paginated article listing

**Important**: `/examples` and `/generator` are excluded from ISR and always server-rendered to show fresh generated content.

### Letter Generation Flow

1. User interacts with `ApologyWizard.svelte` component on `/generator`
2. Wizard collects: relationship, context, and tone
3. Form submits to Astro action `createLetter` in `src/actions/index.ts`
4. Action calls OpenAI API via `src/lib/server/openai.js`
5. Action generates unique slug and saves letter to Turso DB via `src/lib/db.ts`
6. Generated letter displays in `Letter.svelte` with copy functionality
7. User sees success message with link to view letter in examples directory
8. Letter immediately appears in `/examples` with "AI Generated" badge
9. Letter is accessible at `/examples/[recipient]/[slug]`

### Content Generation System

The `injest.js` script automates article creation:
- Uses OpenAI to generate articles based on patterns in `src/lib/patterns.js`
- Prompts defined in `src/lib/prompts.js`
- Fetches hero images from Unsplash API
- Creates slug-based directories with markdown files
- Prevents duplicate content by checking existing slugs

### Database Layer

**Static Content (`src/lib/database.ts`)**:
- Helper functions to query letter collections from Astro content
- Functions: `getAllApologyLetters()`, `getApologyLettersByRecipient()`, `searchLettersWithFilters()`
- Uses Astro's `getCollection()` API for type-safe content queries

**Dynamic Content (`src/lib/db.ts`)**:
- Turso database operations for user-generated letters
- Functions: `saveGeneratedLetter()`, `getAllGeneratedLetters()`, `getGeneratedLetterBySlug()`, etc.
- Initialize with `pnpm db:init` (creates tables and indexes)

**Unified Interface (`src/lib/letters.ts`)**:
- Combines static and generated letters seamlessly
- Provides filtering across both sources
- Returns `UnifiedLetter` objects with `source` field ('static' or 'generated')

### Build Configuration

- Output mode: `static` (generates static HTML)
- Vercel adapter with ISR enabled
- ISR excludes `/generator` route (always server-rendered)
- Custom sitemap copier integration (`sitemap-copier.ts`)

## Important Files

**Letter Generation & Storage**:
- `src/actions/index.ts` - Server actions for letter generation (generates + saves to DB)
- `src/lib/server/openai.js` - OpenAI API integration
- `src/lib/db.ts` - Turso database operations for generated letters
- `src/lib/letters.ts` - Unified interface merging static + generated letters
- `src/lib/database.ts` - Content collection query helpers (static letters only)

**Components**:
- `src/components/ApologyWizard.svelte` - Main interactive wizard
- `src/components/Letter.svelte` - Letter display with copy functionality
- `src/components/LetterDirectory.svelte` - Directory with client-side filtering
- `src/components/LetterFilters.svelte` - Filter UI component

**Content Generation**:
- `injest.js` - Article content generation script
- `src/lib/patterns.js` - Content generation patterns
- `src/lib/prompts.js` - OpenAI prompts for content generation

**Database**:
- `scripts/init-db.js` - Database initialization script
- `src/lib/turso.ts` - Turso client configuration

## Environment Variables

Required environment variables (see `.env.example`):
- `OPENAI_API_KEY` - Required for letter generation
- `TURSO_DATABASE_URL` - Turso database URL (libsql://...)
- `TURSO_AUTH_TOKEN` - Turso authentication token
- `UNSPLASH_ACCESS_KEY` - Required for content generation script
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET` - For auth (currently unused)

## Setup & Initialization

### First Time Setup

1. Install dependencies: `pnpm install`
2. Set up environment variables in `.env`
3. Initialize Turso database: `pnpm db:init`
4. Run dev server: `pnpm dev`

### Turso Database Setup

If you haven't set up Turso yet:

```bash
# Install Turso CLI (if not installed)
# See TURSO_SETUP.md for installation instructions

# Create database
turso db create apologify-db

# Get database URL
turso db show apologify-db --url

# Create auth token
turso db tokens create apologify-db

# Add to .env file
TURSO_DATABASE_URL=<url>
TURSO_AUTH_TOKEN=<token>

# Initialize tables
pnpm db:init
```

## Testing & Validation

- Run `astro check` before builds to catch TypeScript errors
- No formal test suite currently implemented
- Manual testing recommended for generator functionality
- Preview builds locally with `pnpm preview` before deploying

## Common Patterns

### Working with Generated Letters

**View all generated letters**:
```typescript
import { getAllGeneratedLetters } from '@/lib/db';
const letters = await getAllGeneratedLetters();
```

**Search across static + generated**:
```typescript
import { getAllLetters } from '@/lib/letters';
const results = await getAllLetters({
  recipient: 'boss',
  tone: 'formal',
  searchTerm: 'deadline'
});
```

**Delete a generated letter** (for moderation):
```typescript
import { deleteGeneratedLetter } from '@/lib/db';
await deleteGeneratedLetter(letterId);
```

### Adding Static Letter Examples

1. Create JSON file in `src/content/letters/[recipient]/[slug].json`
2. Follow schema: `{ tone, recipient, context, letters: [] }`
3. Letters array should contain multiple variations (typically 3-5)

### Adding New Articles

1. Use `pnpm injest` to auto-generate from patterns
2. Or manually create `src/content/articles/[slug]/index.md`
3. Include required frontmatter: title, description, date, image, photographer, photographerUrl
4. Articles support optional tags array

### Modifying the Generator

1. Update form validation in `src/actions/index.ts` (Zod schema)
2. Modify prompts in `generateLetter()` function
3. Adjust UI in `ApologyWizard.svelte` for multi-step flow
4. Letter display handled in `Letter.svelte` (includes copy/download features)

### SEO Optimization

**User-generated content benefits**:
- Each generated letter = new indexed page
- Unique URL structure: `/examples/[recipient]/[slug-timestamp]`
- Automatic badges distinguish AI-generated content
- Filters allow users to find exactly what they need
- Directory grows organically with user engagement
