import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { config } from "./config/env.js";
import { errorMiddleware, notFoundMiddleware } from "./middleware/error.js";

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: config.corsOrigin === "*" ? true : config.corsOrigin,
    })
  );
  app.use(express.json());

  app.use(routes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};
