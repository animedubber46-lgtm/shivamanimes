import { Router } from "express";
import { db } from "@workspace/db";
import { solveLinksTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

function format(s: typeof solveLinksTable.$inferSelect) {
  return {
    id: s.id,
    title: s.title,
    description: s.description ?? null,
    image: s.image ?? null,
    shortenerUrl: s.shortenerUrl,
    isTrending: s.isTrending,
    createdAt: s.createdAt.toISOString(),
  };
}

router.get("/solve-links", async (_req, res) => {
  const rows = await db.select().from(solveLinksTable).orderBy(desc(solveLinksTable.createdAt));
  res.json(rows.map(format));
});

router.post("/solve-links", requireAdmin, async (req, res) => {
  const { title, shortenerUrl, description, image, isTrending } = req.body;
  if (!title || !shortenerUrl) {
    res.status(400).json({ error: "title and shortenerUrl required" });
    return;
  }

  const [created] = await db.insert(solveLinksTable).values({
    title,
    description: description ?? null,
    image: image ?? null,
    shortenerUrl,
    isTrending: !!isTrending,
  }).returning();

  res.status(201).json(format(created));
});

router.delete("/solve-links/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(solveLinksTable).where(eq(solveLinksTable.id, id));
  res.status(204).send();
});

export default router;
