import { pgTable, serial, text, integer, decimal, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const countryEnum = pgEnum("country", [
  "USA", 
  "Brazil", 
  "South Korea", 
  "UK", 
  "France", 
  "Japan", 
  "Canada",
  "Mexico",
  "Argentina",
  "Colombia",
  "Germany",
  "Italy",
  "Spain",
  "Portugal",
  "Ireland",
  "Sweden",
  "Norway",
  "Denmark",
  "Netherlands",
  "China",
  "India",
  "Hong Kong",
  "Thailand",
  "Australia",
  "New Zealand",
  "Turkey",
  "Israel",
  "South Africa",
  "Nigeria"
]);

export const ageRatingEnum = pgEnum("age_rating", ["L", "10+", "12+", "14+", "16+", "18+"]);

export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  
  title: text("title").notNull(),
  titlePtBr: text("title_pt_br"),
  originalTitle: text("original_title"),
  
  countries: countryEnum("countries").array().notNull().default(sql`ARRAY[]::country[]`),
  ageRating: ageRatingEnum("age_rating").notNull().default("L"),
  genres: text("genres").array().notNull().default(sql`ARRAY[]::text[]`),
  
  imdbRating: decimal("imdb_rating", { precision: 3, scale: 1 }),
  duration: integer("duration"), //minutos 
  year: integer("year"),
  
  directors: text("directors").array().notNull().default(sql`ARRAY[]::text[]`),
  cast: jsonb("cast").default(sql`'[]'::jsonb`), 
  whereToWatch: text("where_to_watch").array().notNull().default(sql`ARRAY[]::text[]`),
  
  posterUrl: text("poster_url"),
  synopsis: text("synopsis"),
});

export type Movie = typeof movies.$inferSelect;
export type NewMovie = typeof movies.$inferInsert;
