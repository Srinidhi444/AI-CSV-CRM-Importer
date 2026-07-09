import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { healthRouter } from "./routes/health.routes.js";
import { importRouter } from "./routes/import.routes.js";
import {
  generalRateLimiter,
  importRateLimiter,
} from "./middleware/rateLimiter.middleware.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

export const app = express();

app.disable("x-powered-by");

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);

app.use(
  cors({
    origin: env.ALLOWED_ORIGIN,
    methods: ["GET", "POST"],
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/health", generalRateLimiter, healthRouter);
app.use("/api/import", importRateLimiter, importRouter);

app.use(errorMiddleware);