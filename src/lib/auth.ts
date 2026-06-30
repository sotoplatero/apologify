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

export const auth = betterAuth({
  database: {
    dialect: new LibsqlDialect({
      url: E.TURSO_DATABASE_URL as string,
      authToken: E.TURSO_AUTH_TOKEN,
    }),
    type: "sqlite",
  },
  emailAndPassword: { enabled: true },
  secret,
  baseURL: E.BETTER_AUTH_URL,
});
