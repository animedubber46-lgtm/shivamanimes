import { Router } from "express";
import { db } from "@workspace/db";
import { animeTable, episodesTable } from "@workspace/db";
import { eq, ilike, sql, desc, and } from "drizzle-orm";
import { requireAdmin, requirePremium } from "../middlewares/auth";

const router = Router();

function formatAnime(a: typeof animeTable.$inferSelect, episodeCount = 0) {
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
    episodeCount,
    viewCount: a.viewCount,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}

router.get("/anime", async (req, res) => {
  const { search, genre, status, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, parseInt(limit) || 20);
  const offset = (pageNum - 1) * limitNum;

  let conditions: ReturnType<typeof eq>[] = [];
  if (status) {
    conditions.push(eq(animeTable.status, status));
  }

  let query = db.select().from(animeTable);
  let countQuery = db.select({ count: sql<number>`count(*)` }).from(animeTable);

  if (search) {
    const searchCond = ilike(animeTable.title, `%${search}%`);
    query = query.where(searchCond) as typeof query;
    countQuery = countQuery.where(searchCond) as typeof countQuery;
  } else if (conditions.length > 0) {
    const cond = conditions[0];
    query = query.where(cond) as typeof query;
    countQuery = countQuery.where(cond) as typeof countQuery;
  }

  const [animeRows, [{ count }]] = await Promise.all([
    query.orderBy(desc(animeTable.updatedAt)).limit(limitNum).offset(offset),
    countQuery,
  ]);

  const episodeCounts = await db
    .select({ animeId: episodesTable.animeId, count: sql<number>`count(*)` })
    .from(episodesTable)
    .where(
      animeRows.length > 0
        ? sql`${episodesTable.animeId} = ANY(${sql.raw(`ARRAY[${animeRows.map(a => a.id).join(",")}]`)})`
        : sql`false`
    )
    .groupBy(episodesTable.animeId);

  const countMap = new Map(episodeCounts.map(e => [e.animeId, Number(e.count)]));

  res.json({
    anime: animeRows.map(a => formatAnime(a, countMap.get(a.id) ?? 0)),
    total: Number(count),
    page: pageNum,
    limit: limitNum,
  });
});

router.get("/anime/featured", async (_req, res) => {
  const rows = await db
    .select()
    .from(animeTable)
    .orderBy(desc(animeTable.viewCount))
    .limit(6);

  const ids = rows.map(a => a.id);
  const episodeCounts = ids.length > 0
    ? await db
        .select({ animeId: episodesTable.animeId, count: sql<number>`count(*)` })
        .from(episodesTable)
        .where(sql`${episodesTable.animeId} = ANY(${sql.raw(`ARRAY[${ids.join(",")}]`)})`)
        .groupBy(episodesTable.animeId)
    : [];

  const countMap = new Map(episodeCounts.map(e => [e.animeId, Number(e.count)]));
  res.json(rows.map(a => formatAnime(a, countMap.get(a.id) ?? 0)));
});

router.get("/anime/recent", async (_req, res) => {
  const rows = await db
    .select()
    .from(animeTable)
    .orderBy(desc(animeTable.updatedAt))
    .limit(8);

  const ids = rows.map(a => a.id);
  const episodeCounts = ids.length > 0
    ? await db
        .select({ animeId: episodesTable.animeId, count: sql<number>`count(*)` })
        .from(episodesTable)
        .where(sql`${episodesTable.animeId} = ANY(${sql.raw(`ARRAY[${ids.join(",")}]`)})`)
        .groupBy(episodesTable.animeId)
    : [];

  const countMap = new Map(episodeCounts.map(e => [e.animeId, Number(e.count)]));
  res.json(rows.map(a => formatAnime(a, countMap.get(a.id) ?? 0)));
});

router.get("/anime/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [anime] = await db.select().from(animeTable).where(eq(animeTable.id, id)).limit(1);
  if (!anime) { res.status(404).json({ error: "Anime not found" }); return; }

  const episodes = await db
    .select()
    .from(episodesTable)
    .where(eq(episodesTable.animeId, id))
    .orderBy(episodesTable.number);

  res.json({
    ...formatAnime(anime, episodes.length),
    episodes: episodes.map(e => ({
      id: e.id,
      animeId: e.animeId,
      number: e.number,
      title: e.title,
      thumbnail: e.thumbnail ?? null,
      createdAt: e.createdAt.toISOString(),
    })),
  });
});

router.post("/anime", requireAdmin, async (req, res) => {
  const { title, description, genres, tags, releaseYear, bannerImage, coverImage, trailerUrl, status } = req.body;

  if (!title) { res.status(400).json({ error: "Title required" }); return; }

  const [created] = await db.insert(animeTable).values({
    title,
    description: description ?? null,
    genres: genres ?? [],
    tags: tags ?? [],
    releaseYear: releaseYear ?? null,
    bannerImage: bannerImage ?? null,
    coverImage: coverImage ?? null,
    trailerUrl: trailerUrl ?? null,
    status: status ?? "ongoing",
  }).returning();

  res.status(201).json(formatAnime(created, 0));
});

router.patch("/anime/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const updates: Partial<typeof animeTable.$inferInsert> = {};
  const fields = ["title", "description", "genres", "tags", "releaseYear", "bannerImage", "coverImage", "trailerUrl", "status"] as const;
  for (const f of fields) {
    if (req.body[f] !== undefined) (updates as Record<string, unknown>)[f === "releaseYear" ? "releaseYear" : f === "bannerImage" ? "bannerImage" : f === "coverImage" ? "coverImage" : f === "trailerUrl" ? "trailerUrl" : f] = req.body[f];
  }
  updates.updatedAt = new Date();

  const [updated] = await db.update(animeTable).set(updates).where(eq(animeTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Anime not found" }); return; }

  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(episodesTable).where(eq(episodesTable.animeId, id));
  res.json(formatAnime(updated, Number(count)));
});

router.delete("/anime/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  await db.delete(animeTable).where(eq(animeTable.id, id));
  res.status(204).send();
});

export default router;
