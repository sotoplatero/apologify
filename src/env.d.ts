/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly TURSO_DATABASE_URL: string;
  readonly TURSO_AUTH_TOKEN: string;
  readonly OPENAI_API_KEY?: string;
  readonly AUTH_SECRET?: string;
  readonly BETTER_AUTH_SECRET?: string;
  readonly BETTER_AUTH_URL?: string;
  readonly PUBLIC_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

import type { auth } from "./lib/auth";
type BetterAuthSession = typeof auth.$Infer.Session;
declare global {
  namespace App {
    interface Locals {
      user: BetterAuthSession["user"] | null;
      session: BetterAuthSession["session"] | null;
    }
  }
}