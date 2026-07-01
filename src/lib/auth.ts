import { betterAuth } from "better-auth";
import { LibsqlDialect } from "@libsql/kysely-libsql";

// Read env from Vite (Astro runtime) or process.env (better-auth CLI / Node).
const E: Record<string, string | undefined> =
  (typeof import.meta !== "undefined" && (import.meta as any).env) || process.env;

// Enforce only on the real Vercel production deploy — a local `astro build` also
// sets import.meta.env.PROD but legitimately uses a localhost BETTER_AUTH_URL.
const onVercelProd = typeof process !== "undefined" && process.env?.VERCEL_ENV === "production";

const secret = E.BETTER_AUTH_SECRET;
// A missing secret means unsigned/forgeable sessions.
if (!secret && onVercelProd) {
  throw new Error("BETTER_AUTH_SECRET is required in production");
}

// A wrong/missing base URL silently breaks 100% of social sign-in (bad OAuth
// callback + cookie domain → "state_not_found").
const baseURL = E.BETTER_AUTH_URL;
if (onVercelProd) {
  if (!baseURL) throw new Error("BETTER_AUTH_URL is required in production (e.g. https://apologify.com)");
  if (baseURL.includes("localhost")) throw new Error("BETTER_AUTH_URL must be the production origin, not localhost");
}

// Social providers are enabled only when their credentials are configured, so
// the app runs fine with email/password alone in environments without OAuth.
const socialProviders: Record<string, { clientId: string; clientSecret: string }> = {};
if (E.GOOGLE_CLIENT_ID && E.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = { clientId: E.GOOGLE_CLIENT_ID, clientSecret: E.GOOGLE_CLIENT_SECRET };
}
if (E.GITHUB_CLIENT_ID && E.GITHUB_CLIENT_SECRET) {
  socialProviders.github = { clientId: E.GITHUB_CLIENT_ID, clientSecret: E.GITHUB_CLIENT_SECRET };
}

/** Names of the social providers that have credentials configured. */
export const enabledSocialProviders = Object.keys(socialProviders);

export const auth = betterAuth({
  database: {
    dialect: new LibsqlDialect({
      url: E.TURSO_DATABASE_URL as string,
      authToken: E.TURSO_AUTH_TOKEN,
    }),
    type: "sqlite",
  },
  // Email/password is off: no SMTP configured (no verification/reset possible),
  // and the product uses a focused social-only sign-in.
  emailAndPassword: { enabled: false },
  socialProviders,
  secret,
  baseURL,
});
