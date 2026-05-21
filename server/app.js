const path = require("path");
const express = require("express");
const cors = require("cors");
const {
  db,
  publicUser,
  calculatePlayerLevel,
  getProgress,
  getAchievements,
  unlockAchievement
} = require("./db");
const {
  authRequired,
  clampInteger,
  createToken,
  hashPassword,
  normalizeEmail,
  validateRegistration,
  verifyPassword
} = require("./security");

const app = express();
const PORT = Number(process.env.PORT || 5177);
const publicRoot = path.join(__dirname, "..");
const outfitCatalog = [
  { id: "classic", price: 0 },
  { id: "park", price: 35 },
  { id: "star", price: 75 }
];

app.use(cors());
app.use(express.json({ limit: "80kb" }));

function loadSession(userId) {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  return {
    user: publicUser(user),
    progress: getProgress(userId),
    achievements: getAchievements(userId)
  };
}

function requireUser(req, res, next) {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(Number(req.auth.sub));
  if (!user) return res.status(401).json({ error: "Usuario nao encontrado." });
  req.user = user;
  next();
}

app.post("/api/auth/register", async (req, res) => {
  const validation = validateRegistration(req.body || {});
  if (!validation.ok) return res.status(400).json({ errors: validation.errors });

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(validation.email);
  if (existing) return res.status(409).json({ errors: { email: "Este email ja esta cadastrado." } });

  const passwordHash = await hashPassword(req.body.password);
  const createUser = db.transaction(() => {
    const result = db.prepare(`
      INSERT INTO users (name, email, password_hash, last_login_at)
      VALUES (?, ?, ?, datetime('now'))
    `).run(validation.name, validation.email, passwordHash);

    db.prepare("INSERT INTO progress (user_id) VALUES (?)").run(result.lastInsertRowid);
    return db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
  });

  const user = createUser();
  res.status(201).json({ token: createToken(user), ...loadSession(user.id) });
});

app.post("/api/auth/login", async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || "");
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

  if (!user) return res.status(401).json({ error: "Email nao cadastrado." });
  if (!(await verifyPassword(password, user.password_hash))) return res.status(401).json({ error: "Senha incorreta." });

  db.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").run(user.id);
  res.json({ token: createToken(user), ...loadSession(user.id) });
});

app.get("/api/me", authRequired, requireUser, (req, res) => {
  res.json(loadSession(req.user.id));
});

app.post("/api/auth/logout", authRequired, (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/progress", authRequired, requireUser, (req, res) => {
  res.json({ progress: getProgress(req.user.id), achievements: getAchievements(req.user.id) });
});

app.patch("/api/progress/tutorial", authRequired, requireUser, (req, res) => {
  const done = req.body?.done === true ? 1 : 0;
  db.prepare(`
    UPDATE progress SET tutorial_done = ?, updated_at = datetime('now') WHERE user_id = ?
  `).run(done, req.user.id);
  res.json({ progress: getProgress(req.user.id) });
});

app.patch("/api/progress/outfit", authRequired, requireUser, (req, res) => {
  const outfitId = String(req.body?.outfit || "classic");
  const outfit = outfitCatalog.find((item) => item.id === outfitId);
  if (!outfit) return res.status(400).json({ error: "Look invalido." });

  const updateOutfit = db.transaction(() => {
    const current = getProgress(req.user.id);
    const unlocked = Array.isArray(current.unlockedOutfits) && current.unlockedOutfits.length
      ? current.unlockedOutfits
      : ["classic"];

    if (!unlocked.includes(outfit.id)) {
      if (current.coins < outfit.price) return { error: "A Cacau ainda precisa de mais estrelas." };
      unlocked.push(outfit.id);
      db.prepare(`
        UPDATE progress
        SET coins = coins - ?,
            outfit = ?,
            unlocked_outfits = ?,
            updated_at = datetime('now')
        WHERE user_id = ?
      `).run(outfit.price, outfit.id, JSON.stringify(unlocked), req.user.id);
    } else {
      db.prepare(`
        UPDATE progress
        SET outfit = ?,
            unlocked_outfits = ?,
            updated_at = datetime('now')
        WHERE user_id = ?
      `).run(outfit.id, JSON.stringify(unlocked), req.user.id);
    }

    return { progress: getProgress(req.user.id) };
  });

  const result = updateOutfit();
  if (result.error) return res.status(400).json({ error: result.error });
  res.json(result);
});

app.post("/api/game/session", authRequired, requireUser, (req, res) => {
  const requestedScore = clampInteger(req.body?.score, 0, 200000);
  const requestedLevel = clampInteger(req.body?.levelReached, 1, 500);
  const deliveries = clampInteger(req.body?.deliveries, 0, 500);
  const requestedCoins = clampInteger(req.body?.coinsEarned, 0, 5000);
  const durationSeconds = clampInteger(req.body?.durationSeconds, 1, 7200);

  // Server-side caps reduce easy client-side tampering while keeping the game lightweight.
  const fairScoreCap = 250 + durationSeconds * 110 + deliveries * 450;
  const score = Math.min(requestedScore, fairScoreCap);
  const levelReached = Math.min(requestedLevel, 1 + Math.floor(deliveries / 3));
  const fairCoinCap = 12 + deliveries * 4 + Math.floor(score / 80);
  const coinsAwarded = Math.min(requestedCoins, fairCoinCap);
  const xpAwarded = Math.min(6000, Math.floor(score * 0.28) + deliveries * 45 + levelReached * 12);

  const finishSession = db.transaction(() => {
    const current = getProgress(req.user.id);
    const nextXp = current.xp + xpAwarded;
    const nextLevel = calculatePlayerLevel(nextXp);
    const nextPhase = Math.max(current.phase, levelReached);
    const nextBest = Math.max(current.best_score, score);

    db.prepare(`
      INSERT INTO game_sessions
        (user_id, score, level_reached, deliveries, coins_awarded, xp_awarded, duration_seconds)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.id, score, levelReached, deliveries, coinsAwarded, xpAwarded, durationSeconds);

    db.prepare(`
      UPDATE progress
      SET coins = coins + ?,
          xp = ?,
          player_level = ?,
          phase = ?,
          best_score = ?,
          total_deliveries = total_deliveries + ?,
          total_games = total_games + 1,
          updated_at = datetime('now')
      WHERE user_id = ?
    `).run(coinsAwarded, nextXp, nextLevel, nextPhase, nextBest, deliveries, req.user.id);

    db.prepare(`
      INSERT INTO leaderboard (user_id, score, level)
      VALUES (?, ?, ?)
    `).run(req.user.id, score, levelReached);
  });

  finishSession();

  const unlocked = [];
  if (deliveries > 0) unlocked.push(unlockAchievement(req.user.id, "first_delivery"));
  if (score >= 500) unlocked.push(unlockAchievement(req.user.id, "high_score_500"));
  let progress = getProgress(req.user.id);
  if (progress.coins >= 50) unlocked.push(unlockAchievement(req.user.id, "star_keeper"));
  progress = getProgress(req.user.id);
  if (progress.total_deliveries >= 10) unlocked.push(unlockAchievement(req.user.id, "family_helper"));
  if (progress.player_level >= 5) unlocked.push(unlockAchievement(req.user.id, "level_5"));

  res.json({
    awarded: { coins: coinsAwarded, xp: xpAwarded },
    unlocked: unlocked.filter(Boolean),
    progress: getProgress(req.user.id),
    achievements: getAchievements(req.user.id)
  });
});

app.get("/api/leaderboard", (_req, res) => {
  const rows = db.prepare(`
    SELECT
      u.name,
      MAX(l.score) AS score,
      MAX(l.level) AS level,
      MAX(l.created_at) AS achievedAt
    FROM leaderboard l
    JOIN users u ON u.id = l.user_id
    GROUP BY l.user_id
    ORDER BY score DESC, level DESC, achievedAt ASC
    LIMIT 20
  `).all();

  res.json({ leaderboard: rows });
});

app.get("/api/achievements", authRequired, requireUser, (req, res) => {
  res.json({ achievements: getAchievements(req.user.id) });
});

app.use(express.static(publicRoot, {
  extensions: ["html"],
  setHeaders(res, filePath) {
    if (filePath.endsWith(".html")) res.setHeader("Cache-Control", "no-store");
  }
}));

app.listen(PORT, () => {
  console.log(`Cacau Sky Delivery online: http://localhost:${PORT}`);
  console.log(`Banco SQLite: ${process.env.DB_PATH || path.join(publicRoot, "data", "cacau-sky.sqlite")}`);
});
