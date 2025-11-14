import { createClient } from "@libsql/client/web";

// Check if Turso is configured
const tursoUrl = import.meta.env.TURSO_DATABASE_URL;
const tursoToken = import.meta.env.TURSO_AUTH_TOKEN;

if (!tursoUrl) {
  console.warn('⚠️  Turso database not configured. Generated letters will not be saved.');
  console.warn('   Add TURSO_DATABASE_URL and TURSO_AUTH_TOKEN to .env file');
}

export const turso = tursoUrl ? createClient({
  url: tursoUrl,
  authToken: tursoToken,
}) : null; 