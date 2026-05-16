import { Router } from "express";
import { db } from "@workspace/db";
import { watchlistTable, watchProgressTable, animeTable, episodesTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

function formatAnime(a: typeof animeTable.$inferSelect) {
  return {
    id: a.id,
    title: a.title,
    description: a.description ?? null,
    genres: a.genres,
    tags: a.tags,
    releaseYear: a.releaseYear ?? null,
    bannerImage: a.bannerImage ?? null,
    coverImage: a.coverImage ?? null,
    trailerUrl: a.trailerUrl ?? null,
    status: a.status,
    episodeCount: 0,
    viewCount: a.viewCount,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}

router.get("/watchlist", requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const rows = await db
    .select({ anime: animeTable })
    .from(watchlistTable)
    .innerJoin(animeTable, eq(watchlistTable.animeId, animeTable.id))
    .where(eq(watchlistTable.userId, userId))
    .orderBy(desc(watchlistTable.createdAt));

  res.json(rows.map(r => formatAnime(r.anime)));
});

router.post("/watchlist/:animeId", requireAuth, async (req, res) => {
  const animeId = parseInt(req.params.animeId);
  const userId = req.user!.id;

  if (isNaN(animeId)) { res.status(400).json({ error: "Invalid animeId" }); return; }

  const existing = await db
    .select()
    .from(watchlistTable)
    .where(and(eq(watchlistTable.userId, userId), eq(watchlistTable.animeId, animeId)))
    .limit(1);

  if (!existing.length) {
    await db.insert(watchlistTable).values({ userId, animeId });
  }

  res.json({ success: true });
});

router.delete("/watchlist/:animeId", requireAuth, async (req, res) => {
  const animeId = parseInt(req.params.animeId);
  const userId = req.user!.id;

  await db
    .delete(watchlistTable)
    .where(and(eq(watchlistTable.userId, userId), eq(watchlistTable.animeId, animeId)));

  res.status(204).send();
});

router.get("/watch-progress", requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const rows = await db
    .select({
      progress: watchProgressTable,
      episode: episodesTable,
      anime: animeTable,
    })
    .from(watchProgressTable)
    .innerJoin(episodesTable, eq(watchProgressTable.episodeId, episodesTable.id))
    .innerJoin(animeTable, eq(episodesTable.animeId, animeTable.id))
    .where(eq(watchProgressTable.userId, userId))
    .orderBy(desc(watchProgressTable.updatedAt))
    .limit(20);

  res.json(
    rows.map(r => ({
      episodeId: r.progress.episodeId,
      animeId: r.anime.id,
      animeTitle: r.anime.title,
      coverImage: r.anime.coverImage ?? null,
      episodeNumber: r.episode.number,
      episodeTitle: r.episode.title,
      progressSeconds: r.progress.progressSeconds,
      updatedAt: r.progress.updatedAt.toISOString(),
    }))
  );
});

router.post("/watch-progress/:episodeId", requireAuth, async (req, res) => {
  const episodeId = parseInt(req.params.episodeId);
  const userId = req.user!.id;
  const { progressSeconds } = req.body;

  if (isNaN(episodeId)) { res.status(400).json({ error: "Invalid episodeId" }); return; }

  const existing = await db
    .select()
    .from(watchProgressTable)
    .where(and(eq(watchProgressTable.userId, userId), eq(watchProgressTable.episodeId, episodeId)))
    .limit(1);

  if (existing.length) {
    await db
      .update(watchProgressTable)
      .set({ progressSeconds: progressSeconds ?? 0, updatedAt: new Date() })
      .where(and(eq(watchProgressTable.userId, userId), eq(watchProgressTable.episodeId, episodeId)));
  } else {
    await db.insert(watchProgressTable).values({
      userId,
      episodeId,
      progressSeconds: progressSeconds ?? 0,
    });
  }

  res.json({ success: true });
});

export default router;
