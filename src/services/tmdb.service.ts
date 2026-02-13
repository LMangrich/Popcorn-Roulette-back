import { AGE_RATING_MAP } from "../enums/ageRate.enum";
import { COUNTRY_MAP } from "../enums/country.enum";
import type { TMDBMovieDetails, TMDBDiscoverResponse } from "../types/tmdb";
import type { ITMDBService } from "./interfaces/tmdb-service.interface";

const TMDB_API_KEY = process.env.TMDB_API_KEY!;
const TMDB_BASE_URL = process.env.TMDB_API_BASE_URL;

export class TMDBService implements ITMDBService {
  private async fetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.set("api_key", TMDB_API_KEY);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  async discoverMovies(page: number = 1, filters?: {
    year?: number;
    genres?: string;
    minRating?: number;
    voteCountGte?: number;
    sortBy?: string;
  }): Promise<TMDBDiscoverResponse> {
    const params: Record<string, string> = {
      page: page.toString(),
      language: "en-US",
      sort_by: filters?.sortBy || "popularity.desc",
    };

    if (filters?.year) {
      params.primary_release_year = filters.year.toString();
    }
    if (filters?.genres) {
      params.with_genres = filters.genres;
    }
    if (filters?.minRating) {
      params["vote_average.gte"] = filters.minRating.toString();
    }
    if (filters?.voteCountGte) {
      params["vote_count.gte"] = filters.voteCountGte.toString();
    }

    return this.fetch<TMDBDiscoverResponse>("/discover/movie", params);
  }

  async getMovieDetails(movieId: number): Promise<TMDBMovieDetails> {
    return this.fetch<TMDBMovieDetails>(
      `/movie/${movieId}`,
      {
        append_to_response: "credits,release_dates,watch/providers,translations",
        language: "en-US",
      }
    );
  }

  getTitlePtBr(details: TMDBMovieDetails): string | null {
    const translations = (details as any).translations?.translations;
    if (!translations) return null;

    const ptBrTranslation = translations.find(
      (t: any) => t.iso_3166_1 === "BR" && t.iso_639_1 === "pt"
    );

    return ptBrTranslation?.data?.title || null;
  }

  getDirectors(details: TMDBMovieDetails): string[] {
    return details.credits.crew
      .filter((member) => member.job === "Director")
      .map((director) => director.name);
  }

  getCast(details: TMDBMovieDetails): Array<{ name: string; role: string }> {
    return details.credits.cast
      .slice(0, 10)
      .map((actor) => ({
        name: actor.name,
        role: actor.character,
      }));
  }


  getCountries(details: TMDBMovieDetails): string[] {
    const mappedCountries = details.production_countries
      .map((country) => COUNTRY_MAP[country.iso_3166_1])
      .filter((country) => country !== undefined);
    
    return [...new Set(mappedCountries)];
  }

  getAgeRating(details: TMDBMovieDetails): string {
    const releaseDates = details.release_dates.results;
    
    const brRating = this.extractRatingForCountry(releaseDates, "BR");
    if (brRating) return brRating;

    const usRating = this.extractRatingForCountry(releaseDates, "US");
    if (usRating) return usRating;

    const productionCountries = details.production_countries
      .map(c => c.iso_3166_1)
      .filter(code => code in COUNTRY_MAP);
    
    for (const countryCode of productionCountries) {
      const rating = this.extractRatingForCountry(releaseDates, countryCode);
      if (rating) return rating;
    }

    const supportedCountryCodes = Object.keys(AGE_RATING_MAP);
    for (const countryCode of supportedCountryCodes) {
      if (countryCode !== "BR" && countryCode !== "US" && !productionCountries.includes(countryCode)) {
        const rating = this.extractRatingForCountry(releaseDates, countryCode);
        if (rating) return rating;
      }
    }

    return "14+";
  }

  private extractRatingForCountry(
    releaseDates: Array<{ iso_3166_1: string; release_dates: Array<{ certification: string }> }>,
    countryCode: string
  ): string | null {
    const countryRelease = releaseDates.find((r) => r.iso_3166_1 === countryCode);
    
    if (!countryRelease || countryRelease.release_dates.length === 0) {
      return null;
    }

    for (const release of countryRelease.release_dates) {
      const cert = release.certification?.trim();
      if (cert && AGE_RATING_MAP[countryCode]?.[cert]) {
        return AGE_RATING_MAP[countryCode][cert];
      }
    }

    return null;
  }

  getWhereToWatch(details: TMDBMovieDetails, countryCode: string = "BR"): string[] {
    const providers = details["watch/providers"].results[countryCode];
    if (!providers) return [];

    const allProviders: string[] = [];
    
    if (providers.flatrate) {
      allProviders.push(...providers.flatrate.map((p) => p.provider_name));
    }
    if (providers.rent) {
      allProviders.push(...providers.rent.map((p) => p.provider_name));
    }
    if (providers.buy) {
      allProviders.push(...providers.buy.map((p) => p.provider_name));
    }

    return [...new Set(allProviders)];
  }

  getGenres(details: TMDBMovieDetails): string[] {
    return details.genres.map((g) => g.name);
  }


  getPosterUrl(posterPath: string | null): string | null {
    if (!posterPath) return null;
    return `https://image.tmdb.org/t/p/w500${posterPath}`;
  }

  getYear(releaseDate: string): number | null {
    if (!releaseDate) return null;
    return parseInt(releaseDate.split("-")[0], 10);
  }
}

export const tmdbService = new TMDBService();
