import { Router } from "express";
import bcrypt from "bcrypt";
import { db } from "@workspace/db";
import { usersTable, sessionsTable, activityLogsTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    isPremium: user.isPremium,
    premiumUntil: user.premiumUntil?.toISOString() ?? null,
    isSuspended: user.isSuspended,
    deviceId: user.deviceId ?? null,
    lastLogin: user.lastLogin?.toISOString() ?? null,
    lastLoginIp: user.lastLoginIp ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}

router.get("/users", requireAdmin, async (req, res) => {
  const { page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, parseInt(limit) || 20);
  const offset = (pageNum - 1) * limitNum;

  const [users, [{ count }]] = await Promise.all([
    db.select().from(usersTable).orderBy(desc(usersTable.createdAt)).limit(limitNum).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(usersTable),
  ]);

  res.json({ users: users.map(formatUser), total: Number(count), page: pageNum, limit: limitNum });
});

router.post("/users", requireAdmin, async (req, res) => {
  const { username, password, isPremium, premiumDays } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: "username and password required" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  let premiumUntil: Date | null = null;
  if (isPremium && premiumDays) {
    premiumUntil = new Date(Date.now() + premiumDays * 24 * 60 * 60 * 1000);
  }

  const [created] = await db.insert(usersTable).values({
    username,
    passwordHash,
    role: "user",
    isPremium: !!isPremium,
    premiumUntil,
  }).returning();

  res.status(201).json(formatUser(created));
});

router.patch("/users/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const updates: Partial<typeof usersTable.$inferInsert> = {};

  if (req.body.isPremium !== undefined) updates.isPremium = req.body.isPremium;
  if (req.body.isSuspended !== undefined) updates.isSuspended = req.body.isSuspended;
  if (req.body.password) {
    updates.passwordHash = await bcrypt.hash(req.body.password, 12);
  }
  if (req.body.premiumDays) {
    const days = parseInt(req.body.premiumDays);
    updates.premiumUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }
  updates.updatedAt = new Date();

  const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "User not found" }); return; }

  res.json(formatUser(updated));
});

router.delete("/users/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.status(204).send();
});

router.post("/users/:id/reset-device", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [updated] = await db
    .update(usersTable)
    .set({ deviceId: null, updatedAt: new Date() })
    .where(eq(usersTable.id, id))
    .returning();

  if (!updated) { res.status(404).json({ error: "User not found" }); return; }

  await db.delete(sessionsTable).where(eq(sessionsTable.userId, id));

  res.json(formatUser(updated));
});

router.post("/users/:id/force-logout", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  await db.delete(sessionsTable).where(eq(sessionsTable.userId, id));

  res.json({ success: true });
});

export default router;
