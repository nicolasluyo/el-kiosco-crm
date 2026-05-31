import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function getDb() {
  const connectionString = (process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "").trim();
  if (!connectionString) throw new Error("DATABASE_URL o POSTGRES_URL no está configurado");
  const client = postgres(connectionString, { ssl: "require" });
  return drizzle(client, { schema });
}

let _db: ReturnType<typeof getDb> | null = null;
export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_, prop) {
    if (!_db) _db = getDb();
    return (_db as any)[prop];
  },
});
export * from "./schema";
