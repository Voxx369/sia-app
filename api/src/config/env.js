import dotenv from "dotenv";

// In local/dev runs, people often have stale env vars set in their terminal.
// Prefer the checked-in `.env` file in dev to reduce confusion.
dotenv.config({ override: process.env.NODE_ENV !== "production" });

const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
};

const parseOrigins = (value) => {
  if (!value) return "*";
  const origins = String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (origins.length === 0) return "*";
  if (origins.includes("*")) return "*";
  return origins.length === 1 ? origins[0] : origins;
};

export const config = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/sia",
  databaseSsl: parseBoolean(process.env.DATABASE_SSL, process.env.NODE_ENV === "production"),
  autoSeed: parseBoolean(process.env.AUTO_SEED, process.env.NODE_ENV !== "production"),
  corsOrigin: parseOrigins(process.env.CORS_ORIGIN),
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "devsecret",
};
