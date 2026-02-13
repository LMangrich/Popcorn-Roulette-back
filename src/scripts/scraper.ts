import { tmdbService } from "../services/tmdb.service";
import { movieRepository } from "../repositories/movie.repository";

/*
Coleta os filmes do TMDB e os importa para o banco de dados

# Filmes recentes e populares (2021-2026)
    bun run scrape recent

# Filmes dessa década (2020-2026)
    bun run scrape decade

# Filmes desde 2000
    bun run scrape all

# Filmes modernos (1990-1999)
    bun run scrape modern

# Filmes Era de Ouro (1940-1989)
    bun run scrape golden-era
*/


interface YearRange {
  start: number;
  end: number;
}

async function importMovie(movieId: number): Promise<boolean> {
  try {
    const details = await tmdbService.getMovieDetails(movieId);

    const directors = tmdbService.getDirectors(details);
    const cast = tmdbService.getCast(details);
    const countries = tmdbService.getCountries(details);
    const ageRating = tmdbService.getAgeRating(details);
    const genres = tmdbService.getGenres(details);
    const whereToWatch = tmdbService.getWhereToWatch(details, "BR");
    const posterUrl = tmdbService.getPosterUrl(details.poster_path);
    const year = tmdbService.getYear(details.release_date);
    const titlePtBr = tmdbService.getTitlePtBr(details);
    const synopsisPtBr = tmdbService.getSynopsisPtBr(details);

    if (countries.length === 0) {
      console.log(`Skipping ${details.title} - no mapped countries`);
      return false;
    }

    await movieRepository.create({
      title: details.title,
      titlePtBr,
      originalTitle: details.original_title,
      countries: countries as any,
      ageRating: ageRating as any,
      genres,
      imdbRating: details.vote_average?.toString(),
      duration: details.runtime,
      year,
      directors,
      cast,
      whereToWatch,
      posterUrl,
      synopsis: details.overview,
      synopsisPtBr,
    });

    console.log(`Imported: ${details.title} (${year}) - ${countries.join(", ")} - ${ageRating}`);

    return true;
  } catch (error: any) {
    if (error.message?.includes("duplicate key")) {
      console.log(`Skipping ${movieId} - already exists`);

      return false;
    }
    console.error(`Error importing movie ${movieId}:`, error.message);

    return false;
  }
}

async function scrapeByYearRange(yearRange: YearRange, maxPages: number = 500): Promise<number> {
  let totalImported = 0;
  const { start, end } = yearRange;

  console.log(`\n${"=".repeat(60)}`);
  console.log(`Year Range: ${start}-${end}`);
  console.log(`${"=".repeat(60)}`);

  for (let page = 1; page <= maxPages; page++) {
    try {
      console.log(`\nProcessing page ${page}/${maxPages} (${start}-${end})...`);

      const response = await tmdbService.discoverMovies(page, {
        year: start === end ? start : undefined,
        minRating: 6.0,
        voteCountGte: 100,
        sortBy: "popularity.desc",
      });

      if (!response.results || response.results.length === 0) {
        console.log(`No more results for ${start}-${end}`);
        break;
      }

      for (const movie of response.results) {
        const movieYear = movie.release_date ? tmdbService.getYear(movie.release_date) : null;
        
        if (start !== end && movieYear && (movieYear < start || movieYear > end)) {
          continue;
        }

        console.log(`Fetching details for movie ID ${movie.id}...`);
        const success = await importMovie(movie.id);
        if (success) totalImported++;

        await new Promise((resolve) => setTimeout(resolve, 250));
      }

      console.log(`Page ${page} complete`);

      if (page >= response.total_pages) {
        console.log(`eached last available page (${response.total_pages})`);
        break;
      }

    } catch (error: any) {
      console.error(`Error on page ${page}:`, error.message);
      continue;
    }
  }

  return totalImported;
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "recent"; 

  console.log("Starting Movie Import...\n");

  let yearRanges: YearRange[] = [];
  let totalImported = 0;

  switch (command) {
    case "recent":
      yearRanges = [
        { start: 2024, end: 2026 },
        { start: 2021, end: 2023 },
      ];
      break;

    case "decade":
      yearRanges = [
        { start: 2024, end: 2026 },
        { start: 2021, end: 2023 },
        { start: 2020, end: 2020 },
      ];
      break;

    case "all":
      yearRanges = [
        { start: 2024, end: 2026 },
        { start: 2022, end: 2023 },
        { start: 2020, end: 2021 },
        { start: 2018, end: 2019 },
        { start: 2016, end: 2017 },
        { start: 2014, end: 2015 },
        { start: 2012, end: 2013 },
        { start: 2010, end: 2011 },
        { start: 2008, end: 2009 },
        { start: 2006, end: 2007 },
        { start: 2004, end: 2005 },
        { start: 2002, end: 2003 },
        { start: 2000, end: 2001 },
      ];
      break;

    case "modern":
      yearRanges = [
        { start: 1995, end: 1999 },
        { start: 1990, end: 1994 },
      ];
      break;

    case "golden-era":
      yearRanges = [
        { start: 1985, end: 1989 }, 
        { start: 1980, end: 1984 },
        { start: 1970, end: 1979 }, 
        { start: 1960, end: 1969 }, 
        { start: 1950, end: 1959 }, 
        { start: 1940, end: 1949 }, 
      ];
      break;

    default:
      console.error("Invalid command. Use: recent, decade, all, modern or golden-era");
      process.exit(1);
  }

  console.log(`Command: ${command}`);
  console.log(`Year ranges: ${yearRanges.length}`);
  console.log(`Filters: min rating 6.0, min votes 100, sort by popularity`);
  console.log(`Max pages per range: 500\n`);

  for (const range of yearRanges) {
    const imported = await scrapeByYearRange(range, 500);
    totalImported += imported;
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`Import Complete!`);
  console.log(`Total movies imported: ${totalImported}`);
  console.log(`${"=".repeat(60)}\n`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
