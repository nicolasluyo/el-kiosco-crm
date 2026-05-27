import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!connectionString) throw new Error("DATABASE_URL o POSTGRES_URL no está configurado");
const client = postgres(connectionString, { ssl: "require" });
export const db = drizzle(client, { schema });
export * from "./schema";
