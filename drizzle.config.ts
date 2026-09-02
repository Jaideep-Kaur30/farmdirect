import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load local env (dev) then fall back to process env (CI / hosting dashboards)
dotenv.config({ path: ".env.local" });
dotenv.config();

const url =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@127.0.0.1:5434/app_db";

export default {
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: { url },
} satisfies Config;
