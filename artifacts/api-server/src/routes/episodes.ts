import { Router } from "express";
import { db } from "@workspace/db";
import { episodesTable, animeTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAdmin, requirePremium } from "../middlewares/auth";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? "shivam-animes-super-secret-key";
const STREAM_SECRET = process.env.STREAM_SECRET ?? "shivam-stream-secret-key";

function formatEpisode(e: typeof episodesTable.$inferSelect) {
  return {
    id: e.id,
    animeId: e.animeId,
    number: e.number,
    title: e.title,
    streamUrl: e.streamUrl ?? null,
    thumbnail: e.thumbnail ?? null,
    createdAt: e.createdAt.toISOString(),
  };
}

router.get("/anime/:animeId/episodes", async (req, res) => {
  const animeId = parseInt(req.params.animeId);
  if (isNaN(animeId)) { res.status(400).json({ error: "Invalid animeId" }); return; }

  const rows = await db
    .select()
    .from(episodesTable)
    .where(eq(episodesTable.animeId, animeId))
    .orderBy(episodesTable.number);

  res.json(rows.map(formatEpisode));
});

router.post("/anime/:animeId/episodes", requireAdmin, async (req, res) => {
  const animeId = parseInt(req.params.animeId);
  if (isNaN(animeId)) { res.status(400).json({ error: "Invalid animeId" }); return; }

  const { number, title, streamUrl, thumbnail } = req.body;
  if (!title || number === undefined) {
    res.status(400).json({ error: "number and title required" });
    return;
  }

  const [created] = await db.insert(episodesTable).values({
    animeId,
    number,
    title,
    streamUrl: streamUrl ?? null,
    thumbnail: thumbnail ?? null,
  }).returning();

  res.status(201).json(formatEpisode(created));
});

router.patch("/anime/:animeId/episodes/:episodeId", requireAdmin, async (req, res) => {
  const animeId = parseInt(req.params.animeId);
  const episodeId = parseInt(req.params.episodeId);

  if (isNaN(animeId) || isNaN(episodeId)) {
    res.status(400).json({ error: "Invalid IDs" });
    return;
  }

  const updates: Partial<typeof episodesTable.$inferInsert> = {};
  if (req.body.number !== undefined) updates.number = req.body.number;
  if (req.body.title !== undefined) updates.title = req.body.title;
  if (req.body.streamUrl !== undefined) updates.streamUrl = req.body.streamUrl;
  if (req.body.thumbnail !== undefined) updates.thumbnail = req.body.thumbnail;
  updates.updatedAt = new Date();

  const [updated] = await db
    .update(episodesTable)
    .set(updates)
    .where(and(eq(episodesTable.id, episodeId), eq(episodesTable.animeId, animeId)))
    .returning();

  if (!updated) { res.status(404).json({ error: "Episode not found" }); return; }

  res.json(formatEpisode(updated));
});

router.delete("/anime/:animeId/episodes/:episodeId", requireAdmin, async (req, res) => {
  const animeId = parseInt(req.params.animeId);
  const episodeId = parseInt(req.params.episodeId);

  await db
    .delete(episodesTable)
    .where(and(eq(episodesTable.id, episodeId), eq(episodesTable.animeId, animeId)));

  res.status(204).send();
});

router.get("/stream/token/:episodeId", requirePremium, async (req, res) => {
  const episodeId = parseInt(req.params.episodeId);
  if (isNaN(episodeId)) { res.status(400).json({ error: "Invalid episodeId" }); return; }

  const [episode] = await db
    .select()
    .from(episodesTable)
    .where(eq(episodesTable.id, episodeId))
    .limit(1);

  if (!episode || !episode.streamUrl) {
    res.status(404).json({ error: "Episode or stream not found" });
    return;
  }

  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const token = jwt.sign(
    { episodeId, userId: req.user!.id, url: episode.streamUrl },
    STREAM_SECRET,
    { expiresIn: "2h" }
  );

  res.json({ token, expiresAt: expiresAt.toISOString() });
});

export default router;
