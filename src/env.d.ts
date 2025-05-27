/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly TURSO_DATABASE_URL: string;
  readonly TURSO_AUTH_TOKEN: string;
  readonly OPENAI_API_KEY?: string;
  readonly AUTH_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}