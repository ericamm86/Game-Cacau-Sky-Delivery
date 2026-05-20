const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dataDir = path.join(__dirname, "..", "data");
const dbPath = process.env.DB_PATH || path.join(dataDir, "cacau-sky.sqlite");
const schemaPath = path.join(__dirname, "schema.sql");

fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(fs.readFileSync(schemaPath, "utf8"));

const defaultAchievements = [
  ["first_delivery", "Primeira entrega", "Entregue seu primeiro filhote para a familia correta.", 10, 40],
  ["star_keeper", "Guardia das estrelas", "Acumule 50 moedas no total.", 25, 80],
  ["high_score_500", "Voo brilhante", "Faca 500 pontos em uma partida.", 30, 100],
  ["family_helper", "Ajudante das familias", "Complete 10 entregas no total.", 50, 180],
  ["level_5", "Cacau experiente", "Alcance o nivel de jogador 5.", 75, 240]
];

const seedAchievement = db.prepare(`
  INSERT OR IGNORE INTO achievements (code, title, description, reward_coins, reward_xp)
  VALUES (?, ?, ?, ?, ?)
`);

for (const achievement of defaultAchievements) seedAchievement.run(...achievement);

function publicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at
  };
}

function calculatePlayerLevel(xp) {
  return Math.max(1, Math.floor(Math.sqrt(Math.max(0, xp) / 120)) + 1);
}

function getProgress(userId) {
  return db.prepare("SELECT * FROM progress WHERE user_id = ?").get(userId);
}

function getAchievements(userId) {
  return db.prepare(`
    SELECT
      a.code,
      a.title,
      a.description,
      a.reward_coins AS rewardCoins,
      a.reward_xp AS rewardXp,
      ua.unlocked_at AS unlockedAt,
      ua.claimed_at AS claimedAt
    FROM achievements a
    LEFT JOIN user_achievements ua
      ON ua.achievement_id = a.id AND ua.user_id = ?
    ORDER BY a.id ASC
  `).all(userId);
}

function unlockAchievement(userId, code) {
  const achievement = db.prepare("SELECT * FROM achievements WHERE code = ?").get(code);
  if (!achievement) return null;

  const exists = db.prepare(`
    SELECT 1 FROM user_achievements WHERE user_id = ? AND achievement_id = ?
  `).get(userId, achievement.id);
  if (exists) return null;

  db.prepare(`
    INSERT INTO user_achievements (user_id, achievement_id)
    VALUES (?, ?)
  `).run(userId, achievement.id);

  db.prepare(`
    UPDATE progress
    SET coins = coins + ?,
        xp = xp + ?,
        player_level = ?,
        updated_at = datetime('now')
    WHERE user_id = ?
  `).run(
    achievement.reward_coins,
    achievement.reward_xp,
    calculatePlayerLevel((getProgress(userId)?.xp || 0) + achievement.reward_xp),
    userId
  );

  return {
    code: achievement.code,
    title: achievement.title,
    rewardCoins: achievement.reward_coins,
    rewardXp: achievement.reward_xp
  };
}

module.exports = {
  db,
  publicUser,
  calculatePlayerLevel,
  getProgress,
  getAchievements,
  unlockAchievement
};
