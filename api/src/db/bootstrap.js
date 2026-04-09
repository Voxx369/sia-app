import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { query } from "../config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, "migrations");
const seedsDir = path.join(__dirname, "seeds");

const readSqlFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".sql"))
    .sort()
    .map((name) => ({
      name,
      sql: fs.readFileSync(path.join(dir, name), "utf8"),
    }));
};

export const runMigrations = async (logger = console.log) => {
  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      run_at TIMESTAMPTZ DEFAULT now()
    )
  `);

  const ran = new Set(
    (await query("SELECT name FROM schema_migrations")).rows.map((r) => r.name)
  );

  for (const { name, sql } of readSqlFiles(migrationsDir)) {
    if (ran.has(name)) continue;
    logger?.(`→ applying migration ${name}`);
    await query(sql);
    await query("INSERT INTO schema_migrations(name) VALUES ($1)", [name]);
  }
};

export const runSeeds = async (logger = console.log) => {
  await query(`
    CREATE TABLE IF NOT EXISTS seed_history (
      name TEXT PRIMARY KEY,
      run_at TIMESTAMPTZ DEFAULT now()
    )
  `);

  const ran = new Set(
    (await query("SELECT name FROM seed_history")).rows.map((r) => r.name)
  );

  for (const { name, sql } of readSqlFiles(seedsDir)) {
    if (ran.has(name)) continue;
    logger?.(`→ applying seed ${name}`);
    await query(sql);
    await query("INSERT INTO seed_history(name) VALUES ($1)", [name]);
  }
};
