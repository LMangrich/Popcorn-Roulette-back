import type { TMDBMovieDetails, TMDBDiscoverResponse } from "../../types/tmdb";

export interface ITMDBService {
  discoverMovies(
    page?: number,
    filters?: {
      year?: number;
      genres?: string;
      minRating?: number;
    }
  ): Promise<TMDBDiscoverResponse>;


  getMovieDetails(movieId: number): Promise<TMDBMovieDetails>;
  getTitlePtBr(details: TMDBMovieDetails): string | null;
  getSynopsisPtBr(details: TMDBMovieDetails): string | null;
  getDirectors(details: TMDBMovieDetails): string[];
  getCast(details: TMDBMovieDetails): Array<{ name: string; role: string }>;
  getCountries(details: TMDBMovieDetails): string[];
  getAgeRating(details: TMDBMovieDetails): string;
  getWhereToWatch(details: TMDBMovieDetails, countryCode?: string): string[];
  getGenres(details: TMDBMovieDetails): string[];
  getPosterUrl(posterPath: string | null): string | null;
  getYear(releaseDate: string): number | null;
}
