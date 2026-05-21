const API_BASE = "";
const AUTH_KEY = "cacauSkyAuth";

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
  ui.cloudStatus.textContent = appState.user
    ? `Nuvem ativa: ${progress?.coins || 0} moedas, ${xp} XP.`
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
  try {
    const data = await request("/api/auth/login", {
      method: "POST",
      body: {
        email: document.getElementById("loginEmail").value,
        password: document.getElementById("loginPassword").value
      }
    });
    applySession(data, data.token);
    showMainMenu();
  } catch (error) {
    ui.authMessage.textContent = error.message;
  }
});

ui.registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  ui.authMessage.textContent = "Criando conta...";
  try {
    const data = await request("/api/auth/register", {
      method: "POST",
      body: {
        name: document.getElementById("registerName").value,
        email: document.getElementById("registerEmail").value,
        password: document.getElementById("registerPassword").value
      }
    });
    applySession(data, data.token);
    showMainMenu();
  } catch (error) {
    ui.authMessage.textContent = error.message;
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
