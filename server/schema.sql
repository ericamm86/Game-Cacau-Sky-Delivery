PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 2 AND 60),
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS progress (
  user_id INTEGER PRIMARY KEY,
  coins INTEGER NOT NULL DEFAULT 0 CHECK (coins >= 0),
  xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  player_level INTEGER NOT NULL DEFAULT 1 CHECK (player_level >= 1),
  phase INTEGER NOT NULL DEFAULT 1 CHECK (phase >= 1),
  best_score INTEGER NOT NULL DEFAULT 0 CHECK (best_score >= 0),
  outfit TEXT NOT NULL DEFAULT 'classic',
  unlocked_outfits TEXT NOT NULL DEFAULT '["classic"]',
  total_deliveries INTEGER NOT NULL DEFAULT 0 CHECK (total_deliveries >= 0),
  total_games INTEGER NOT NULL DEFAULT 0 CHECK (total_games >= 0),
  tutorial_done INTEGER NOT NULL DEFAULT 0 CHECK (tutorial_done IN (0, 1)),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS leaderboard (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0),
  level INTEGER NOT NULL CHECK (level >= 1),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_score
ON leaderboard(score DESC, level DESC, created_at ASC);

CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reward_coins INTEGER NOT NULL DEFAULT 0 CHECK (reward_coins >= 0),
  reward_xp INTEGER NOT NULL DEFAULT 0 CHECK (reward_xp >= 0)
);

CREATE TABLE IF NOT EXISTS user_achievements (
  user_id INTEGER NOT NULL,
  achievement_id INTEGER NOT NULL,
  unlocked_at TEXT NOT NULL DEFAULT (datetime('now')),
  claimed_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, achievement_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS game_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  score INTEGER NOT NULL,
  level_reached INTEGER NOT NULL,
  deliveries INTEGER NOT NULL,
  coins_awarded INTEGER NOT NULL,
  xp_awarded INTEGER NOT NULL,
  duration_seconds INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
