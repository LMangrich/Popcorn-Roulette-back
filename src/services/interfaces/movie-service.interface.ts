import type { NewMovie, Movie } from "../../db/schema";
import type { MovieFilters } from "../../validators/movie.validator";

export interface IMovieService {
  getRandomMovie(filters: MovieFilters): Promise<Movie | null>;
  countMovies(filters: MovieFilters): Promise<number>;
  getMovies(
    filters: MovieFilters,
    page?: number,
    limit?: number
  ): Promise<{
    movies: Movie[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  getMovieById(id: number): Promise<Movie | null>;
  
  createMovie(movieData: NewMovie): Promise<Movie>;
  updateMovie(id: number, updates: Partial<NewMovie>): Promise<Movie | null>;
  deleteMovie(id: number): Promise<Movie | null>;
}
