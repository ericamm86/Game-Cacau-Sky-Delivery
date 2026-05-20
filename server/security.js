const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-change-this-secret-before-production";
const TOKEN_TTL = "7d";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function validateRegistration({ name, email, password }) {
  const cleanName = String(name || "").trim();
  const cleanEmail = normalizeEmail(email);
  const errors = {};

  if (cleanName.length < 2 || cleanName.length > 60) errors.name = "Informe um nome entre 2 e 60 caracteres.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) errors.email = "Informe um email valido.";
  if (String(password || "").length < 6) errors.password = "A senha precisa ter pelo menos 6 caracteres.";

  return { ok: Object.keys(errors).length === 0, errors, name: cleanName, email: cleanEmail };
}

async function hashPassword(password) {
  return bcrypt.hash(String(password), 12);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(String(password), hash);
}

function createToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Autenticacao obrigatoria." });

  try {
    req.auth = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Sessao expirada. Entre novamente." });
  }
}

function clampInteger(value, min, max) {
  const number = Number.parseInt(value, 10);
  if (!Number.isFinite(number)) return min;
  return Math.max(min, Math.min(max, number));
}

module.exports = {
  validateRegistration,
  normalizeEmail,
  hashPassword,
  verifyPassword,
  createToken,
  authRequired,
  clampInteger
};
