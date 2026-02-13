export type TMDBMovie = {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  runtime: number;
  genres: Array<{ id: number; name: string }>;
  production_countries: Array<{ iso_3166_1: string; name: string }>;
  spoken_languages: Array<{ iso_639_1: string; name: string }>;
}

export type TMDBCredits = {
  cast: Array<{
    name: string;
    character: string;
    order: number;
  }>;
  crew: Array<{
    name: string;
    job: string;
    department: string;
  }>;
}

export type TMDBReleaseDates = {
  results: Array<{
    iso_3166_1: string;
    release_dates: Array<{
      certification: string;
      type: number;
    }>;
  }>;
}

export type TMDBWatchProviders = {
  results: {
    [countryCode: string]: {
      link: string;
      flatrate?: Array<{ provider_name: string }>;
      rent?: Array<{ provider_name: string }>;
      buy?: Array<{ provider_name: string }>;
    };
  };
}

export type TMDBMovieDetails = TMDBMovie & {
  credits: TMDBCredits;
  release_dates: TMDBReleaseDates;
  "watch/providers": TMDBWatchProviders;
}

export type TMDBDiscoverResponse = {
  page: number;
  results: Array<{
    id: number;
    title: string;
    original_title: string;
    genre_ids: number[];
    release_date?: string;
  }>;
  total_pages: number;
  total_results: number;
}
