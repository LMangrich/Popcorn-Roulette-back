import type { NewMovie, Movie } from "../../db/schema";
import type { MovieFilters } from "../../validators/movie.validator";

export interface IMovieRepository {
  findRandomMovie(filters: MovieFilters): Promise<Movie | null>;
  findMany(
    filters: MovieFilters,
    page?: number,
    limit?: number
  ): Promise<{ movies: Movie[]; total: number }>;
  count(filters: MovieFilters): Promise<number>;
  findById(id: number): Promise<Movie | null>;

  create(movieData: NewMovie): Promise<Movie>;
  update(id: number, updates: Partial<NewMovie>): Promise<Movie | null>;
  delete(id: number): Promise<Movie | null>;
}
