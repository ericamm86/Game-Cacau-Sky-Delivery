const API_BASE = "";
const AUTH_KEY = "cacauSkyAuth";
const LOCAL_ACCOUNTS_KEY = "cacauSkyLocalAccounts";

const appState = {
  token: null,
  user: null,
  progress: null,
  achievements: [],
  leaderboard: []
};

const ui = {
  accountName: document.getElementById("accountName"),
  accountLevel: document.getElementById("accountLevel"),
  xpFill: document.getElementById("xpFill"),
  cloudStatus: document.getElementById("cloudStatus"),
  authPanel: document.getElementById("authPanel"),
  tutorialPanel: document.getElementById("tutorialPanel"),
  leaderboardPanel: document.getElementById("leaderboardPanel"),
  achievementsPanel: document.getElementById("achievementsPanel"),
  authMessage: document.getElementById("authMessage"),
  loginForm: document.getElementById("loginForm"),
  registerForm: document.getElementById("registerForm"),
  leaderboardList: document.getElementById("leaderboardList"),
  achievementsList: document.getElementById("achievementsList"),
  logoutButton: document.getElementById("logoutButton")
};

function storedAuth() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY));
  } catch {
    return null;
  }
}

function persistAuth(token) {
  if (token) localStorage.setItem(AUTH_KEY, JSON.stringify({ token }));
  else localStorage.removeItem(AUTH_KEY);
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function defaultProgress() {
  return {
    user_id: 0,
    coins: 0,
    xp: 0,
    player_level: 1,
    phase: 1,
    best_score: 0,
    outfit: "classic",
    unlocked_outfits: "[\"classic\"]",
    unlockedOutfits: ["classic"],
    total_deliveries: 0,
    total_games: 0,
    tutorial_done: 0,
    updated_at: new Date().toISOString()
  };
}

function defaultAchievements() {
  return [
    { code: "first_delivery", title: "Primeira entrega", description: "Entregue seu primeiro filhote para a familia correta.", rewardCoins: 10, rewardXp: 40, unlockedAt: null, claimedAt: null },
    { code: "star_keeper", title: "Guardia das estrelas", description: "Acumule 50 moedas no total.", rewardCoins: 25, rewardXp: 80, unlockedAt: null, claimedAt: null },
    { code: "high_score_500", title: "Voo brilhante", description: "Faca 500 pontos em uma partida.", rewardCoins: 30, rewardXp: 100, unlockedAt: null, claimedAt: null },
    { code: "family_helper", title: "Ajudante das familias", description: "Complete 10 entregas no total.", rewardCoins: 50, rewardXp: 180, unlockedAt: null, claimedAt: null },
    { code: "level_5", title: "Cacau experiente", description: "Alcance o nivel de jogador 5.", rewardCoins: 75, rewardXp: 240, unlockedAt: null, claimedAt: null }
  ];
}

function readLocalAccounts() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_ACCOUNTS_KEY)) || {};
  } catch {
    return {};
  }
}

function writeLocalAccounts(accounts) {
  localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
}

function toBase64(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

async function passwordDigest(email, password) {
  const payload = new TextEncoder().encode(`${normalizeEmail(email)}:${String(password || "")}`);
  return toBase64(await crypto.subtle.digest("SHA-256", payload));
}

async function saveLocalAccount(email, password, data) {
  if (!email || !password || !data?.user) return;
  const accounts = readLocalAccounts();
  const key = normalizeEmail(email);
  accounts[key] = {
    passwordHash: await passwordDigest(key, password),
    user: { ...data.user, email: key },
    progress: data.progress || defaultProgress(),
    achievements: data.achievements || defaultAchievements()
  };
  writeLocalAccounts(accounts);
}

async function loadLocalAccount(email, password) {
  const key = normalizeEmail(email);
  const account = readLocalAccounts()[key];
  if (!account) return null;
  const hash = await passwordDigest(key, password);
  if (hash !== account.passwordHash) throw new Error("Senha incorreta.");
  return {
    token: `local:${key}`,
    user: account.user,
    progress: account.progress || defaultProgress(),
    achievements: account.achievements || defaultAchievements()
  };
}

function updateLocalAccount() {
  if (!String(appState.token || "").startsWith("local:") || !appState.user?.email) return;
  const accounts = readLocalAccounts();
  const key = normalizeEmail(appState.user.email);
  if (!accounts[key]) return;
  accounts[key].user = appState.user;
  accounts[key].progress = appState.progress || defaultProgress();
  accounts[key].achievements = appState.achievements || defaultAchievements();
  writeLocalAccounts(accounts);
}

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (appState.token) headers.Authorization = `Bearer ${appState.token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.error || Object.values(data.errors || {})[0] || "Nao foi possivel concluir a acao.";
    throw new Error(message);
  }
  return data;
}

function xpToNextLevel(level) {
  return Math.max(120, level * level * 120);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[char]);
}

function renderAccount() {
  const progress = appState.progress;
  const level = progress?.player_level || 1;
  const xp = progress?.xp || 0;
  const nextXp = xpToNextLevel(level);
  const previousXp = xpToNextLevel(Math.max(1, level - 1));
  const progressRatio = Math.max(0, Math.min(1, (xp - previousXp) / (nextXp - previousXp)));

  ui.accountName.textContent = appState.user?.name || "Visitante";
  ui.accountLevel.textContent = `Nivel ${level}`;
  ui.xpFill.style.width = `${Math.round(progressRatio * 100)}%`;
  ui.logoutButton.classList.toggle("hidden", !appState.user);
  const localMode = String(appState.token || "").startsWith("local:");
  ui.cloudStatus.textContent = appState.user
    ? `${localMode ? "Conta local" : "Nuvem ativa"}: ${progress?.coins || 0} moedas, ${xp} XP.`
    : "Entre na conta para salvar na nuvem.";
}

function applySession(data, token) {
  if (token) {
    appState.token = token;
    persistAuth(token);
  }
  appState.user = data.user;
  appState.progress = data.progress;
  appState.achievements = data.achievements || [];
  renderAccount();
  renderAchievements();
  window.CacauGame?.applyCloudProgress?.(data.progress);
  if (data.progress && !data.progress.tutorial_done) showPanel(ui.tutorialPanel);
}

function showPanel(panel) {
  panel.classList.remove("hidden");
}

function hidePanel(panel) {
  panel.classList.add("hidden");
}

function setAuthChecking(checking) {
  ui.authPanel.classList.toggle("is-checking", checking);
  ui.loginForm.classList.toggle("hidden", checking);
  ui.registerForm.classList.add("hidden");
  document.getElementById("loginTab").classList.toggle("active", !checking);
  document.getElementById("registerTab").classList.remove("active");
}

function showAuthGate(message = "") {
  setAuthChecking(false);
  setAuthMode("login");
  ui.authPanel.classList.add("auth-gate");
  hidePanel(ui.tutorialPanel);
  hidePanel(ui.leaderboardPanel);
  hidePanel(ui.achievementsPanel);
  showPanel(ui.authPanel);
  window.CacauGame?.showAuthGate?.();
  ui.authMessage.textContent = message;
}

function showMainMenu() {
  hidePanel(ui.authPanel);
  window.CacauGame?.showMainMenu?.();
}

function setAuthMode(mode) {
  const loginMode = mode === "login";
  document.getElementById("loginTab").classList.toggle("active", loginMode);
  document.getElementById("registerTab").classList.toggle("active", !loginMode);
  ui.loginForm.classList.toggle("hidden", !loginMode);
  ui.registerForm.classList.toggle("hidden", loginMode);
  ui.authMessage.textContent = "";
}

async function loadMe() {
  const auth = storedAuth();
  if (!auth?.token) {
    renderAccount();
    showAuthGate();
    return;
  }
  if (String(auth.token).startsWith("local:")) {
    const email = auth.token.slice("local:".length);
    const account = readLocalAccounts()[email];
    if (account) {
      appState.token = auth.token;
      applySession({
        user: account.user,
        progress: account.progress || defaultProgress(),
        achievements: account.achievements || defaultAchievements()
      });
      showMainMenu();
      return;
    }
    persistAuth(null);
  }
  appState.token = auth.token;
  setAuthChecking(true);
  showPanel(ui.authPanel);
  ui.authMessage.textContent = "Verificando conta salva...";
  try {
    applySession(await request("/api/me"));
    showMainMenu();
  } catch {
    appState.token = null;
    persistAuth(null);
    renderAccount();
    showAuthGate("Sessao expirada. Entre novamente.");
  }
}

async function loadLeaderboard() {
  const data = await request("/api/leaderboard");
  appState.leaderboard = data.leaderboard || [];
  renderLeaderboard();
}

function renderLeaderboard() {
  if (!appState.leaderboard.length) {
    ui.leaderboardList.innerHTML = `<div class="empty-state">Ainda nao ha pontuacoes no ranking.</div>`;
    return;
  }
  ui.leaderboardList.innerHTML = appState.leaderboard.map((row, index) => `
    <div class="list-row">
      <strong>${index + 1}. ${escapeHtml(row.name)}</strong>
      <span>${escapeHtml(row.score)} pts · fase ${escapeHtml(row.level)}</span>
    </div>
  `).join("");
}

function renderAchievements() {
  const achievements = appState.achievements || [];
  if (!achievements.length) {
    ui.achievementsList.innerHTML = `<div class="empty-state">Entre na conta para acompanhar conquistas.</div>`;
    return;
  }
  ui.achievementsList.innerHTML = achievements.map((item) => `
    <div class="achievement-row${item.unlockedAt ? " unlocked" : ""}">
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(item.description)}</span>
      </div>
      <small>${item.unlockedAt ? "Liberada" : `+${escapeHtml(item.rewardCoins)} moedas · +${escapeHtml(item.rewardXp)} XP`}</small>
    </div>
  `).join("");
}

async function submitGameResult(result) {
  if (!appState.user || !appState.token) return null;
  if (String(appState.token).startsWith("local:")) {
    const progress = appState.progress || defaultProgress();
    const score = Math.max(0, Number.parseInt(result?.score, 10) || 0);
    const levelReached = Math.max(1, Number.parseInt(result?.levelReached, 10) || 1);
    const deliveries = Math.max(0, Number.parseInt(result?.deliveries, 10) || 0);
    const coinsEarned = Math.max(0, Number.parseInt(result?.coinsEarned, 10) || 0);
    const xpAwarded = Math.min(6000, Math.floor(score * 0.28) + deliveries * 45 + levelReached * 12);

    appState.progress = {
      ...progress,
      coins: progress.coins + coinsEarned,
      xp: progress.xp + xpAwarded,
      player_level: Math.max(progress.player_level || 1, Math.floor(Math.sqrt(Math.max(0, progress.xp + xpAwarded) / 120)) + 1),
      phase: Math.max(progress.phase || 1, levelReached),
      best_score: Math.max(progress.best_score || 0, score),
      total_deliveries: (progress.total_deliveries || 0) + deliveries,
      total_games: (progress.total_games || 0) + 1,
      updated_at: new Date().toISOString()
    };
    updateLocalAccount();
    renderAccount();
    renderAchievements();
    return { progress: appState.progress, achievements: appState.achievements };
  }
  try {
    const data = await request("/api/game/session", {
      method: "POST",
      body: result
    });
    appState.progress = data.progress;
    appState.achievements = data.achievements || appState.achievements;
    renderAccount();
    renderAchievements();
    await loadLeaderboard();
    return data;
  } catch (error) {
    ui.cloudStatus.textContent = `Nuvem indisponivel: ${error.message}`;
    return null;
  }
}

async function saveOutfit(outfit) {
  if (!appState.user || !appState.token) {
    showAuthGate("Entre na conta para salvar looks.");
    return null;
  }
  if (String(appState.token).startsWith("local:")) {
    const progress = appState.progress || defaultProgress();
    const unlocked = Array.isArray(progress.unlockedOutfits) ? progress.unlockedOutfits : ["classic"];
    if (!unlocked.includes(outfit)) unlocked.push(outfit);
    appState.progress = {
      ...progress,
      outfit,
      unlockedOutfits: unlocked,
      unlocked_outfits: JSON.stringify(unlocked),
      updated_at: new Date().toISOString()
    };
    updateLocalAccount();
    renderAccount();
    return { progress: appState.progress };
  }
  try {
    const data = await request("/api/progress/outfit", {
      method: "PATCH",
      body: { outfit }
    });
    appState.progress = data.progress;
    renderAccount();
    return data;
  } catch (error) {
    ui.cloudStatus.textContent = `Nuvem indisponivel: ${error.message}`;
    return { error: error.message };
  }
}

document.getElementById("openAuthButton").addEventListener("click", () => {
  if (appState.user) return;
  showAuthGate();
});
document.getElementById("closeAuthButton").addEventListener("click", () => {
  if (!appState.user) return;
  hidePanel(ui.authPanel);
});
document.getElementById("loginTab").addEventListener("click", () => setAuthMode("login"));
document.getElementById("registerTab").addEventListener("click", () => setAuthMode("register"));

ui.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  ui.authMessage.textContent = "Entrando...";
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  try {
    const data = await request("/api/auth/login", {
      method: "POST",
      body: {
        email,
        password
      }
    });
    await saveLocalAccount(email, password, data);
    applySession(data, data.token);
    showMainMenu();
  } catch (error) {
    try {
      const localData = await loadLocalAccount(email, password);
      applySession(localData, localData.token);
      ui.authMessage.textContent = "";
      showMainMenu();
    } catch (localError) {
      ui.authMessage.textContent = localError.message === "Senha incorreta." ? localError.message : error.message;
    }
  }
});

ui.registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  ui.authMessage.textContent = "Criando conta...";
  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  try {
    const data = await request("/api/auth/register", {
      method: "POST",
      body: {
        name,
        email,
        password
      }
    });
    await saveLocalAccount(email, password, data);
    applySession(data, data.token);
    showMainMenu();
  } catch (error) {
    if (error.message !== "Este email ja esta cadastrado.") {
      ui.authMessage.textContent = error.message;
      return;
    }
    const localData = await loadLocalAccount(email, password).catch(() => null);
    if (!localData) {
      ui.authMessage.textContent = error.message;
      return;
    }
    applySession(localData, localData.token);
    showMainMenu();
  }
});

document.getElementById("logoutButton").addEventListener("click", async () => {
  if (appState.token) await request("/api/auth/logout", { method: "POST" }).catch(() => null);
  appState.token = null;
  appState.user = null;
  appState.progress = null;
  appState.achievements = [];
  persistAuth(null);
  renderAccount();
  renderAchievements();
  showAuthGate("Voce saiu da conta. Login obrigatorio para jogar.");
});

document.getElementById("leaderboardButton").addEventListener("click", async () => {
  await loadLeaderboard().catch(() => {
    ui.leaderboardList.innerHTML = `<div class="empty-state">Nao foi possivel carregar o ranking.</div>`;
  });
  showPanel(ui.leaderboardPanel);
});
document.getElementById("closeLeaderboardButton").addEventListener("click", () => hidePanel(ui.leaderboardPanel));

document.getElementById("achievementsButton").addEventListener("click", () => {
  renderAchievements();
  showPanel(ui.achievementsPanel);
});
document.getElementById("closeAchievementsButton").addEventListener("click", () => hidePanel(ui.achievementsPanel));

document.getElementById("finishTutorialButton").addEventListener("click", async () => {
  hidePanel(ui.tutorialPanel);
  if (!appState.user) return;
  const data = await request("/api/progress/tutorial", { method: "PATCH", body: { done: true } }).catch(() => null);
  if (data?.progress) {
    appState.progress = data.progress;
    renderAccount();
  }
});

window.CacauApp = {
  state: appState,
  submitGameResult,
  saveOutfit,
  renderAccount,
  loadLeaderboard,
  isAuthenticated: () => Boolean(appState.user && appState.token),
  showAuthGate
};

renderAccount();
renderAchievements();
loadMe();
