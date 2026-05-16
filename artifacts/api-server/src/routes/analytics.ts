import { Router } from "express";
import { db } from "@workspace/db";
import {
  usersTable,
  animeTable,
  episodesTable,
  sessionsTable,
  activityLogsTable,
} from "@workspace/db";
import { eq, gt, sql, desc } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

router.get("/analytics/summary", requireAdmin, async (_req, res) => {
  const now = new Date();

  const [[{ totalUsers }], [{ premiumUsers }], [{ totalAnime }], [{ totalEpisodes }], [{ totalViews }], [{ activeSessions }], [{ expiringPremium }]] =
    await Promise.all([
      db.select({ totalUsers: sql<number>`count(*)` }).from(usersTable),
      db.select({ premiumUsers: sql<number>`count(*)` }).from(usersTable).where(eq(usersTable.isPremium, true)),
      db.select({ totalAnime: sql<number>`count(*)` }).from(animeTable),
      db.select({ totalEpisodes: sql<number>`count(*)` }).from(episodesTable),
      db.select({ totalViews: sql<number>`coalesce(sum(view_count), 0)` }).from(animeTable),
      db.select({ activeSessions: sql<number>`count(*)` }).from(sessionsTable).where(gt(sessionsTable.expiresAt, now)),
      db.select({ expiringPremium: sql<number>`count(*)` }).from(usersTable).where(
        sql`${usersTable.isPremium} = true AND ${usersTable.premiumUntil} < NOW() + INTERVAL '3 days'`
      ),
    ]);

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [{ dailyVisits }] = await db
    .select({ dailyVisits: sql<number>`count(*)` })
    .from(activityLogsTable)
    .where(gt(activityLogsTable.createdAt, oneDayAgo));

  res.json({
    totalUsers: Number(totalUsers),
    premiumUsers: Number(premiumUsers),
    totalAnime: Number(totalAnime),
    totalEpisodes: Number(totalEpisodes),
    totalViews: Number(totalViews),
    activeSessions: Number(activeSessions),
    dailyVisits: Number(dailyVisits),
    expiringPremium: Number(expiringPremium),
  });
});

router.get("/analytics/top-anime", async (_req, res) => {
  const rows = await db
    .select()
    .from(animeTable)
    .orderBy(desc(animeTable.viewCount))
    .limit(10);

  res.json(
    rows.map(a => ({
      animeId: a.id,
      title: a.title,
      coverImage: a.coverImage ?? null,
      viewCount: a.viewCount,
    }))
  );
});

router.get("/analytics/recent-activity", requireAdmin, async (_req, res) => {
  const rows = await db
    .select()
    .from(activityLogsTable)
    .orderBy(desc(activityLogsTable.createdAt))
    .limit(50);

  res.json(
    rows.map(r => ({
      id: r.id,
      userId: r.userId ?? null,
      username: r.username ?? null,
      action: r.action,
      ip: r.ip ?? null,
      details: r.details ?? null,
      createdAt: r.createdAt.toISOString(),
    }))
  );
});

export default router;
