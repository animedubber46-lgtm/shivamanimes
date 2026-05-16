import { Router } from "express";
import bcrypt from "bcrypt";
import { db } from "@workspace/db";
import { usersTable, sessionsTable, activityLogsTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import { signToken, requireAuth } from "../middlewares/auth";
import { logger } from "../lib/logger";

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

router.post("/auth/login", async (req, res) => {
  const { username, password, deviceId } = req.body as {
    username?: string;
    password?: string;
    deviceId?: string;
  };

  if (!username || !password) {
    res.status(400).json({ error: "Username and password required" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username))
    .limit(1);

  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  if (user.isSuspended) {
    res.status(403).json({ error: "Account suspended" });
    return;
  }

  if (user.role !== "admin") {
    if (user.isPremium && user.premiumUntil && user.premiumUntil < new Date()) {
      await db
        .update(usersTable)
        .set({ isPremium: false })
        .where(eq(usersTable.id, user.id));
      user.isPremium = false;
    }

    if (user.deviceId && deviceId && user.deviceId !== deviceId) {
      const now = new Date();
      const [activeSession] = await db
        .select()
        .from(sessionsTable)
        .where(
          and(eq(sessionsTable.userId, user.id), gt(sessionsTable.expiresAt, now))
        )
        .limit(1);

      if (activeSession) {
        res.status(403).json({
          error: "Account already active on another device.",
        });
        return;
      }
    }
  }

  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.socket.remoteAddress ?? null;
  const token = signToken({ userId: user.id });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db.insert(sessionsTable).values({
    userId: user.id,
    token,
    deviceId: deviceId ?? null,
    ip,
    expiresAt,
  });

  await db
    .update(usersTable)
    .set({
      lastLogin: new Date(),
      lastLoginIp: ip,
      deviceId: deviceId ?? user.deviceId,
    })
    .where(eq(usersTable.id, user.id));

  await db.insert(activityLogsTable).values({
    userId: user.id,
    username: user.username,
    action: "login",
    ip,
    details: `Device: ${deviceId ?? "unknown"}`,
  });

  const updatedUser = { ...user, lastLogin: new Date(), lastLoginIp: ip, deviceId: deviceId ?? user.deviceId };

  res.json({ token, user: formatUser(updatedUser) });
});

router.post("/auth/logout", requireAuth, async (req, res) => {
  const authHeader = req.headers.authorization ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (token) {
    await db.delete(sessionsTable).where(eq(sessionsTable.token, token));
  }

  res.json({ success: true });
});

router.get("/auth/me", requireAuth, async (req, res) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.user!.id))
    .limit(1);

  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  res.json(formatUser(user));
});

export default router;
