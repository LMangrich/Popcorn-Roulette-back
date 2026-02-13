import { db } from "../db";
import { movies } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";
import type { NewMovie, Movie } from "../db/schema";
import type { MovieFilters } from "../validators/movie.validator";
import type { IMovieRepository } from "./interfaces/movie-repository.interface";

export class MovieRepository implements IMovieRepository {
  async findRandomMovie(filters: MovieFilters): Promise<Movie | null> {
    const conditions = this.buildWhereConditions(filters);

    const [movie] = await db
      .select()
      .from(movies)
      .where(and(...conditions))
      .orderBy(sql`RANDOM()`)
      .limit(1);

    return movie || null;
  }

  async findMany(
    filters: MovieFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<{ movies: Movie[]; total: number }> {
    const conditions = this.buildWhereConditions(filters);
    const offset = (page - 1) * limit;

    const [moviesList, [{ count }]] = await Promise.all([
      db
        .select()
        .from(movies)
        .where(and(...conditions))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(movies)
        .where(and(...conditions)),
    ]);

    return {
      movies: moviesList,
      total: count,
    };
  }

  async count(filters: MovieFilters): Promise<number> {
    const conditions = this.buildWhereConditions(filters);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(movies)
      .where(and(...conditions));

    return count;
  }

  async findById(id: number): Promise<Movie | null> {
    const [movie] = await db.select().from(movies).where(eq(movies.id, id));
    return movie || null;
  }

  async create(movieData: NewMovie): Promise<Movie> {
    const [newMovie] = await db.insert(movies).values(movieData).returning();
    return newMovie;
  }

  async update(id: number, updates: Partial<NewMovie>): Promise<Movie | null> {
    const [updatedMovie] = await db
      .update(movies)
      .set(updates)
      .where(eq(movies.id, id))
      .returning();

    return updatedMovie || null;
  }

  async delete(id: number): Promise<Movie | null> {
    const [deletedMovie] = await db.delete(movies).where(eq(movies.id, id)).returning();
    return deletedMovie || null;
  }

  private buildWhereConditions(filters: MovieFilters) {
    const conditions: any[] = [];

    if (filters.countries && filters.countries.length > 0) {
      conditions.push(sql`${movies.countries} && ARRAY[${sql.join(
        filters.countries.map((c) => sql`${c}::country`),
        sql`, `
      )}]`);
    }

    if (filters.ageRating) {
      conditions.push(eq(movies.ageRating, filters.ageRating as any));
    }

    if (filters.genres && filters.genres.length > 0) {
      conditions.push(sql`${movies.genres} && ARRAY[${sql.join(
        filters.genres.map((g) => sql`${g}`),
        sql`, `
      )}]`);
    }

    if (filters.minRating) {
      conditions.push(sql`${movies.imdbRating}::numeric >= ${filters.minRating}`);
    }

    if (filters.maxRating) {
      conditions.push(sql`${movies.imdbRating}::numeric <= ${filters.maxRating}`);
    }

    if (filters.minDuration) {
      conditions.push(sql`${movies.duration} >= ${filters.minDuration}`);
    }

    if (filters.maxDuration) {
      conditions.push(sql`${movies.duration} <= ${filters.maxDuration}`);
    }

    if (filters.minYear) {
      conditions.push(sql`${movies.year} >= ${filters.minYear}`);
    }

    if (filters.maxYear) {
      conditions.push(sql`${movies.year} <= ${filters.maxYear}`);
    }

    if (filters.whereToWatch && filters.whereToWatch.length > 0) {
      conditions.push(sql`${movies.whereToWatch} && ARRAY[${sql.join(
        filters.whereToWatch.map((w) => sql`${w}`),
        sql`, `
      )}]`);
    }

    return conditions.length > 0 ? conditions : [sql`1=1`];
  }
}

export const movieRepository = new MovieRepository();
