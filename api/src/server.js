import { createApp } from "./app.js";
import { config } from "./config/env.js";
import { runMigrations, runSeeds } from "./db/bootstrap.js";

const start = async () => {
  if (config.nodeEnv !== "production") {
    try {
      const dbUrl = new URL(config.databaseUrl);
      console.log(`DB -> ${dbUrl.host}/${dbUrl.pathname.replace("/", "")} (ssl=${config.databaseSsl ? "on" : "off"})`);
    } catch (_err) {
      console.log(`DB -> <unparsed> (ssl=${config.databaseSsl ? "on" : "off"})`);
    }
  }
  await runMigrations();
  if (config.autoSeed) {
    await runSeeds();
  } else {
    console.log("AUTO_SEED disabled -> skipping seed execution");
  }

  const app = createApp();
  const server = app.listen(config.port, () => {
    console.log(`API -> http://localhost:${config.port}`);
  });
  
  server.on('error', (err) => {
    console.error("Server error:", err);
  });
  
  console.log("Server is running...");
};

start().catch((err) => {
  console.error("Failed to start server", err);
  console.error(err.stack);
  process.exit(1);
});
