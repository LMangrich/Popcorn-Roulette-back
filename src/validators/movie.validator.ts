import { z } from "zod";
import { COUNTRY_MAP } from "../enums/country.enum";
import { GENRE_MAP } from "../enums/genre.enum";
import { AGE_RATING_MAP } from "../enums/ageRate.enum";

const allCountries = Object.values(COUNTRY_MAP) as [string, ...string[]];
const allGenres = Object.values(GENRE_MAP) as [string, ...string[]];
const allAgeRatings = [...new Set(
  Object.values(AGE_RATING_MAP).flatMap(countryRatings => Object.values(countryRatings))
)].sort() as [string, ...string[]];

export const countrySchema = z.enum(allCountries);
export const ageRatingSchema = z.enum(allAgeRatings);

export const countryFilterSchema = z.enum(allCountries);
export const genreFilterSchema = z.enum(allGenres);

const numberFromString = z.string().transform((val) => parseFloat(val));
const intFromString = z.string().transform((val) => parseInt(val, 10));

const stringOrArray = (schema: z.ZodEnum<any>) => 
  z.union([schema, z.array(schema)]).transform((val) => Array.isArray(val) ? val : [val]).optional();

export const movieFiltersSchema = z.object({
  countries: stringOrArray(countryFilterSchema),
  ageRating: ageRatingSchema.optional(),
  genres: stringOrArray(genreFilterSchema),
  minRating: numberFromString.optional(),
  maxRating: numberFromString.optional(),
  minDuration: intFromString.optional(),
  maxDuration: intFromString.optional(),
  minYear: intFromString.optional(),
  maxYear: intFromString.optional(),
  whereToWatch: z.union([z.string(), z.array(z.string())]).transform((val) => Array.isArray(val) ? val : [val]).optional(),
});

export const createMovieSchema = z.object({
  title: z.string().min(1),
  originalTitle: z.string().optional(),
  countries: z.array(countrySchema).min(1),
  ageRating: ageRatingSchema,
  genres: z.array(genreFilterSchema).min(1),
  imdbRating: z.string().optional(),
  duration: z.number().positive().optional(),
  year: z.number().int().min(1900).optional(),
  directors: z.array(z.string()).default([]),
  cast: z.array(z.object({
    name: z.string(),
    role: z.string(),
  })).default([]),
  whereToWatch: z.array(z.string()).default([]),
  posterUrl: z.string().url().optional(),
  synopsis: z.string().optional(),
});

export const updateMovieSchema = createMovieSchema.partial();

export type MovieFilters = z.infer<typeof movieFiltersSchema>;
export type CreateMovie = z.infer<typeof createMovieSchema>;
export type UpdateMovie = z.infer<typeof updateMovieSchema>;
