import { movieRepository } from "../repositories/movie.repository";
import type { NewMovie, Movie } from "../db/schema";
import type { MovieFilters } from "../validators/movie.validator";
import type { IMovieService } from "./interfaces/movie-service.interface";

export class MovieService implements IMovieService {
  async getRandomMovie(filters: MovieFilters): Promise<Movie | null> {
    return movieRepository.findRandomMovie(filters);
  }

  async countMovies(filters: MovieFilters): Promise<number> {
    return movieRepository.count(filters);
  }

  async getMovies(
    filters: MovieFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    movies: Movie[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const { movies, total } = await movieRepository.findMany(filters, page, limit);

    return {
      movies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMovieById(id: number): Promise<Movie | null> {
    return movieRepository.findById(id);
  }

  async createMovie(movieData: NewMovie): Promise<Movie> {
    return movieRepository.create(movieData);
  }

  async updateMovie(id: number, updates: Partial<NewMovie>): Promise<Movie | null> {
    return movieRepository.update(id, updates);
  }

  async deleteMovie(id: number): Promise<Movie | null> {
    return movieRepository.delete(id);
  }
}

export const movieService = new MovieService();
