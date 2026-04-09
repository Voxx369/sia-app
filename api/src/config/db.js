import pkg from "pg";
import { config } from "./env.js";

const { Pool } = pkg;

const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.databaseSsl ? { rejectUnauthorized: false } : undefined,
});

pool.on("error", (err) => {
  console.error("Unexpected Postgres error", err);
  process.exit(1);
});

export const query = (text, params) => pool.query(text, params);
export const getClient = () => pool.connect();
export const poolInstance = pool;
