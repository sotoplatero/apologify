import { betterAuth } from "better-auth";
import { LibsqlDialect } from "@libsql/kysely-libsql";

// Read env from Vite (Astro runtime) or process.env (better-auth CLI / Node).
const E: Record<string, string | undefined> =
  (typeof import.meta !== "undefined" && (import.meta as any).env) || process.env;

export const auth = betterAuth({
  database: {
    dialect: new LibsqlDialect({
      url: E.TURSO_DATABASE_URL as string,
      authToken: E.TURSO_AUTH_TOKEN,
    }),
    type: "sqlite",
  },
  emailAndPassword: { enabled: true },
  secret: E.BETTER_AUTH_SECRET,
  baseURL: E.BETTER_AUTH_URL,
});
