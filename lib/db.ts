import { createClient, type Client } from "@libsql/client";

// Satu klien per proses; disimpan di globalThis agar tidak dibuat ulang saat hot reload.
const globalForDb = globalThis as unknown as { __careeriumDb?: Client };

export function getDb(): Client {
  if (!globalForDb.__careeriumDb) {
    const url = process.env.TURSO_DATABASE_URL || "file:local.db";
    globalForDb.__careeriumDb = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN || undefined,
    });
  }
  return globalForDb.__careeriumDb;
}
