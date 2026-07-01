import { betterAuth } from "better-auth";
import { LibsqlDialect } from "@libsql/kysely-libsql";

// Read env from Vite (Astro runtime) or process.env (better-auth CLI / Node).
const E: Record<string, string | undefined> =
  (typeof import.meta !== "undefined" && (import.meta as any).env) || process.env;

const secret = E.BETTER_AUTH_SECRET;
// Fail fast in production: a missing secret means unsigned/forgeable sessions.
if (!secret && (typeof import.meta !== "undefined" && (import.meta as any).env?.PROD)) {
  throw new Error("BETTER_AUTH_SECRET is required in production");
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
  emailAndPassword: { enabled: true },
  socialProviders,
  secret,
  baseURL: E.BETTER_AUTH_URL,
});
