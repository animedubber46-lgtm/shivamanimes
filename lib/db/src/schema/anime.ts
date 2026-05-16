import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const animeTable = pgTable("anime", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  genres: text("genres").array().notNull().default([]),
  tags: text("tags").array().notNull().default([]),
  releaseYear: integer("release_year"),
  bannerImage: text("banner_image"),
  coverImage: text("cover_image"),
  trailerUrl: text("trailer_url"),
  status: text("status").notNull().default("ongoing"),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAnimeSchema = createInsertSchema(animeTable).omit({
  id: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertAnime = z.infer<typeof insertAnimeSchema>;
export type Anime = typeof animeTable.$inferSelect;
