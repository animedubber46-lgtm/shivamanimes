import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { episodesTable } from "./episodes";

export const watchProgressTable = pgTable("watch_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  episodeId: integer("episode_id")
    .notNull()
    .references(() => episodesTable.id, { onDelete: "cascade" }),
  progressSeconds: integer("progress_seconds").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type WatchProgress = typeof watchProgressTable.$inferSelect;
