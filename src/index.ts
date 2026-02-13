import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import moviesRoutes from "./routes/movies.routes";
import { authMiddleware } from "./middlewares/auth.middleware";

const app = new Hono();

app.use("*", logger());

app.use("*", cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true,
}));

app.get("/", (c) => {
  return c.json({
    name: "Popcorn Roulette API",
    version: "1.0.0",
    status: "healthy",
    endpoints: {
      health: "GET /",
      roulette: "GET /movies/roulette",
      listMovies: "GET /movies",
      countMovies: "GET /movies/available-movies",
    },
  });
});

app.use("/movies/*", authMiddleware);
app.route("/movies", moviesRoutes);

app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

app.onError((err, c) => {
  console.error("Server error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

const port = parseInt(process.env.PORT || "3000", 10);

console.log(`Popcorn Roulette API starting on port ${port}...`);

export default {
  port,
  fetch: app.fetch,
};
