import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { movieFiltersSchema, createMovieSchema, updateMovieSchema } from "../validators/movie.validator";
import { movieController } from "../controllers/movie.controller";
import { z } from "zod";

const app = new Hono();

app.get("/roulette", zValidator("query", movieFiltersSchema), (c) => movieController.roulette(c));
app.get("/available-movies", zValidator("query", movieFiltersSchema), (c) => movieController.count(c));
app.get("/", zValidator("query", movieFiltersSchema.extend({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
  })),
  (c) => movieController.list(c)
);

export default app;
