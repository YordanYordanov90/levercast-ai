import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

const rawDatabaseUrl = process.env.DATABASE_URL;
if (!rawDatabaseUrl) {
  throw new Error("Missing DATABASE_URL env var");
}

// Accept either plain postgres URL, or a copied `psql 'postgres://...'` snippet from Neon UI.
const databaseUrl = rawDatabaseUrl
  .trim()
  .replace(/^psql\s+/i, "")
  .replace(/^'(.*)'$/, "$1")
  .replace(/^"(.*)"$/, "$1");

if (!databaseUrl.startsWith("postgres://") && !databaseUrl.startsWith("postgresql://")) {
  throw new Error("DATABASE_URL must be a postgres connection string");
}

const sql = neon(databaseUrl);

export const db = drizzle(sql, { schema });

