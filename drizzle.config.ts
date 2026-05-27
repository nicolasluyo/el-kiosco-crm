import type { Config } from "drizzle-kit";
import { config } from "dotenv";
config({ path: ".env.local", override: true });

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: (process.env.DATABASE_URL ?? process.env.POSTGRES_URL)!,
  },
} satisfies Config;
