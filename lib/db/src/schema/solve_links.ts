import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const solveLinksTable = pgTable("solve_links", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  image: text("image"),
  shortenerUrl: text("shortener_url").notNull(),
  isTrending: boolean("is_trending").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSolveLinkSchema = createInsertSchema(solveLinksTable).omit({
  id: true,
  createdAt: true,
});
export type InsertSolveLink = z.infer<typeof insertSolveLinkSchema>;
export type SolveLink = typeof solveLinksTable.$inferSelect;
