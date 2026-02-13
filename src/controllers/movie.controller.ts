import { movieService } from "../services/movie.service";

export class MovieController {
  async roulette(c: any) {
    try {
      const filters = c.req.valid("query");
      const movie = await movieService.getRandomMovie(filters);

      if (!movie) {
        return c.json({ error: "No movies found matching your filters" }, 404);
      }

      return c.json(movie);
    } catch (error) {
      console.error("Roulette error:", error);
      return c.json({ error: "Failed to spin the roulette" }, 500);
    }
  }

  async count(c: any) {
    try {
      const filters = c.req.valid("query");
      const total = await movieService.countMovies(filters);

      return c.json({ 
        total,
        filters 
      });
    } catch (error) {
      console.error("Count movies error:", error);
      return c.json({ error: "Failed to count movies" }, 500);
    }
  }

  async list(c: any) {
    try {
      const { page = 1, limit = 20, ...filters } = c.req.valid("query");
      const result = await movieService.getMovies(filters, page, limit);

      return c.json(result);
    } catch (error) {
      console.error("List movies error:", error);
      return c.json({ error: "Failed to fetch movies" }, 500);
    }
  }
}

export const movieController = new MovieController();
