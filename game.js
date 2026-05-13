const scoreValue = document.getElementById("scoreValue");
const levelValue = document.getElementById("levelValue");
const livesValue = document.getElementById("livesValue");
const timerValue = document.getElementById("timerValue");
const energyValue = document.getElementById("energyValue");
const coinValue = document.getElementById("coinValue");
const bestValue = document.getElementById("bestValue");
const pawBag = document.getElementById("pawBag");
const missionText = document.getElementById("missionText");
const gameRoot = document.getElementById("gameRoot");
const startPanel = document.getElementById("startPanel");
const pausePanel = document.getElementById("pausePanel");
const gameOverPanel = document.getElementById("gameOverPanel");
const shopPanel = document.getElementById("shopPanel");
const shopGrid = document.getElementById("shopGrid");
const shopStatus = document.getElementById("shopStatus");
const finalScore = document.getElementById("finalScore");
const rankLine = document.getElementById("rankLine");
const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const resumeButton = document.getElementById("resumeButton");
const restartButton = document.getElementById("restartButton");
const shopButton = document.getElementById("shopButton");
const closeShopButton = document.getElementById("closeShopButton");

const W = 1280;
const H = 720;
const bagCapacity = 1;

const animalEmoji = {
  panda: String.fromCodePoint(0x1f43c),
  puppy: String.fromCodePoint(0x1f436),
  kitten: String.fromCodePoint(0x1f431),
  bunny: String.fromCodePoint(0x1f430),
  fox: String.fromCodePoint(0x1f98a),
  koala: String.fromCodePoint(0x1f428),
  turtle: String.fromCodePoint(0x1f422),
  duckling: String.fromCodePoint(0x1f425)
};

const deliveryTypes = [
  { id: "panda", name: "bebe panda", destination: "Familia Panda", kind: "Bebe", colorName: "branco", color: 0xf7fafc, familyColor: 0x2f4052, home: { x: 500, y: 418, w: 178, h: 122 } },
  { id: "puppy", name: "bebe cachorrinho", destination: "Familia Cachorro", kind: "Bebe", colorName: "caramelo", color: 0xd88c44, familyColor: 0x9a5b2f, home: { x: 705, y: 428, w: 178, h: 112 } },
  { id: "kitten", name: "bebe gatinho", destination: "Familia Gato", kind: "Bebe", colorName: "cinza", color: 0xcbd5e1, familyColor: 0x64748b, home: { x: 895, y: 405, w: 178, h: 132 } },
  { id: "bunny", name: "bebe coelhinho", destination: "Familia Coelho", kind: "Bebe", colorName: "rosa", color: 0xf9a8d4, familyColor: 0xd9468f, home: { x: 540, y: 252, w: 168, h: 112 } },
  { id: "fox", name: "bebe raposinha", destination: "Familia Raposa", kind: "Bebe", colorName: "laranja", color: 0xfb923c, familyColor: 0xc2410c, home: { x: 785, y: 232, w: 170, h: 116 } },
  { id: "koala", name: "bebe koala", destination: "Familia Koala", kind: "Bebe", colorName: "azul", color: 0xbfdbfe, familyColor: 0x2563eb, home: { x: 985, y: 265, w: 168, h: 110 } },
  { id: "turtle", name: "bebe tartaruga", destination: "Familia Tartaruga", kind: "Bebe", colorName: "verde", color: 0x86efac, familyColor: 0x15803d, home: { x: 650, y: 535, w: 180, h: 108 } },
  { id: "duckling", name: "bebe patinho", destination: "Familia Pato", kind: "Bebe", colorName: "amarelo", color: 0xfde68a, familyColor: 0xca8a04, home: { x: 940, y: 530, w: 178, h: 108 } }
];

const babyDeliveryTypes = deliveryTypes.filter((delivery) => delivery.kind === "Bebe");

const scenes = [
  { name: "Ceu Solar", sky: [0x76d8ff, 0xfff1c2, 0xbdf3b1], ground: 0x37a866, trees: true, city: false, park: true, mountains: true, night: false, garden: true },
  { name: "Cidade dos Animais", sky: [0x8edcff, 0xfff0c7, 0xd9f2df], ground: 0x23845e, trees: true, city: true, park: false, mountains: true, night: false, garden: true },
  { name: "Floresta Fofa", sky: [0x9fe7c2, 0xe6fff1, 0xb7dd8f], ground: 0x16714f, trees: true, city: false, park: true, mountains: true, night: false, garden: false },
  { name: "Montanhas Doces", sky: [0x8ac5ff, 0xfff8d5, 0xc8f0b5], ground: 0x3b9d57, trees: true, city: false, park: false, mountains: true, night: false, garden: true }
];

const outfits = [
  { id: "classic", name: "Aviadora", price: 0, scarf: 0xef4444, pack: 0xb9f3ff },
  { id: "park", name: "Parque Verde", price: 35, scarf: 0x22c55e, pack: 0xbbf7d0 },
  { id: "star", name: "Cacau Estelar", price: 75, scarf: 0xfbbf24, pack: 0xddd6fe }
];

const confettiColors = [0xff5ca8, 0xffc857, 0x45d483, 0x4db7ff, 0xb58cff, 0xff8a5c];

let save = loadSave();
let gameScene = null;

function loadSave() {
  try {
    const stored = JSON.parse(localStorage.getItem("passaroEntregadorSave"));
    if (stored) {
      return {
        best: stored.best || 0,
        totalCoins: stored.totalCoins || 0,
        outfit: stored.outfit || "classic",
        unlocked: stored.unlocked || ["classic"]
      };
    }
  } catch (error) {
    console.warn("Nao foi possivel carregar o ranking local.", error);
  }
  return { best: 0, totalCoins: 0, outfit: "classic", unlocked: ["classic"] };
}

function persistSave() {
  localStorage.setItem("passaroEntregadorSave", JSON.stringify(save));
}

function updatePawHud(carrying) {
  const puppyCount = carrying?.kind === "Bebe" ? 1 : 0;
  pawBag.innerHTML = "";
  for (let i = 0; i < bagCapacity; i += 1) {
    const paw = document.createElement("span");
    paw.className = `paw-icon${i < puppyCount ? " active" : ""}`;
    paw.textContent = carrying ? animalEmoji[carrying.id] : String.fromCodePoint(0x1f43e);
    pawBag.appendChild(paw);
  }
}

function rectsOverlap(a, b) {
  return Phaser.Geom.Intersects.RectangleToRectangle(
    new Phaser.Geom.Rectangle(a.x, a.y, a.w, a.h),
    new Phaser.Geom.Rectangle(b.x, b.y, b.w, b.h)
  );
}

function renderShop() {
  shopGrid.innerHTML = "";
  shopStatus.textContent = `Estrelas disponiveis: ${save.totalCoins}`;
  for (const outfit of outfits) {
    const unlocked = save.unlocked.includes(outfit.id);
    const active = save.outfit === outfit.id;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `shop-item${active ? " active" : ""}`;
    button.innerHTML = `<strong>${outfit.name}</strong><small>${unlocked ? (active ? "Em uso" : "Selecionar") : `${outfit.price} estrelas`}</small>`;
    button.addEventListener("click", () => {
      if (!unlocked) {
        if (save.totalCoins < outfit.price) {
          shopStatus.textContent = "A Cacau ainda precisa de mais estrelas.";
          return;
        }
        save.totalCoins -= outfit.price;
        save.unlocked.push(outfit.id);
      }
      save.outfit = outfit.id;
      persistSave();
      renderShop();
      gameScene?.updateHud();
    });
    shopGrid.appendChild(button);
  }
}

function setGameUiState(state) {
  gameRoot.classList.remove("is-menu", "is-playing", "is-paused", "is-ended", "is-shop");
  gameRoot.classList.add(`is-${state}`);
}

class CacauScene extends Phaser.Scene {
  constructor() {
    super("CacauScene");
  }

  create() {
    gameScene = this;
    this.g = this.add.graphics();
    this.fx = this.add.graphics();
    this.labels = this.add.text(0, 0, "", { fontFamily: "Arial", fontSize: "16px", fontStyle: "900", color: "#173047" }).setVisible(false);
    this.score = 0;
    this.coins = 0;
    this.level = 1;
    this.lives = 3;
    this.timer = 60;
    this.energy = 100;
    this.deliveries = 0;
    this.worldTime = 0;
    this.running = false;
    this.paused = false;
    this.audioContext = null;
    this.pointerTarget = null;
    this.clouds = [];
    this.hazards = [];
    this.stars = [];
    this.coinsOnMap = [];
    this.hearts = [];
    this.energyBolts = [];
    this.pops = [];
    this.bones = [];
    this.sparkles = [];
    this.barkTimer = 2.4;
    this.timers = { cloud: 0.2, hazard: 1.6, star: 0.7, coin: 1.1, heart: 5.4, bolt: 4.2 };
    this.bird = { x: 210, y: 340, w: 78, h: 54, speed: 390, wing: 0, hurt: 0, carrying: null, direcao: "direita" };
    this.route = {
      state: "pickup",
      order: null,
      nursery: { x: 315, y: 168, w: 184, h: 138, label: "Berçário", phase: 0, vx: 36, vy: 24 },
      destination: { x: 500, y: 434, w: 176, h: 118, label: "Casinha Destino", phase: 1.8, vx: 32, vy: 22 }
    };
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });
    this.input.on("pointerdown", (pointer) => this.pointerTarget = this.toWorldPoint(pointer));
    this.input.on("pointermove", (pointer) => {
      if (pointer.isDown) this.pointerTarget = this.toWorldPoint(pointer);
    });
    this.input.on("pointerup", () => this.pointerTarget = null);
    this.startRoute();
    this.updateHud();
  }

  toWorldPoint(pointer) {
    const sx = W / this.scale.gameSize.width;
    const sy = H / this.scale.gameSize.height;
    return { x: pointer.x * sx, y: pointer.y * sy };
  }

  resetGame() {
    this.score = 0;
    this.coins = 0;
    this.level = 1;
    this.lives = 3;
    this.timer = 60;
    this.energy = 100;
    this.deliveries = 0;
    this.bird.x = 210;
    this.bird.y = 340;
    this.bird.hurt = 0;
    this.bird.carrying = null;
    this.clouds.length = 0;
    this.hazards.length = 0;
    this.stars.length = 0;
    this.coinsOnMap.length = 0;
    this.hearts.length = 0;
    this.energyBolts.length = 0;
    this.pops.length = 0;
    this.bones.length = 0;
    this.sparkles.length = 0;
    this.barkTimer = 1.8;
    this.timers = { cloud: 0.2, hazard: 1.6, star: 0.7, coin: 1.1, heart: 5.4, bolt: 4.2 };
    this.startRoute();
    this.running = true;
    this.paused = false;
    setGameUiState("playing");
    pausePanel.classList.add("hidden");
    pauseButton.classList.remove("hidden");
    pauseButton.textContent = "Pausar";
    pauseButton.setAttribute("aria-pressed", "false");
    this.playSound("start");
    this.time.delayedCall(180, () => this.playSound("happyBark"));
    this.updateHud();
  }

  startRoute() {
    const order = Phaser.Utils.Array.GetRandom(babyDeliveryTypes);
    this.route.state = "pickup";
    this.route.order = { ...order, requiredId: order.id, requiredColor: order.colorName };
    this.route.nursery = this.makeMovingRoutePoint({ x: 270, y: Phaser.Math.Between(136, 320), w: 184, h: 138, label: "Berçário" }, 0);
    this.route.destination = this.makeMovingRoutePoint({ ...order.home, label: order.destination }, 1);
    this.bird.carrying = null;
  }

  makeMovingRoutePoint(point, lane) {
    const baseX = W + Phaser.Math.Between(lane === 0 ? 90 : 180, lane === 0 ? 260 : 360);
    const baseY = Phaser.Math.Clamp(point.y + Phaser.Math.Between(-95, 95), this.safeTopY(), H - point.h - 94);
    return {
      ...point,
      x: baseX,
      y: baseY,
      baseX,
      baseY,
      phase: Phaser.Math.FloatBetween(0, Math.PI * 2),
      speed: Phaser.Math.FloatBetween(145, 185) + this.level * 13,
      floatAmp: Phaser.Math.FloatBetween(16, 34),
      floatSpeed: Phaser.Math.FloatBetween(1.0, 1.55),
      lane
    };
  }

  currentSceneData() {
    return scenes[(this.level - 1) % scenes.length];
  }

  updateHud() {
    scoreValue.textContent = this.score;
    levelValue.textContent = this.level;
    livesValue.textContent = this.lives;
    timerValue.textContent = Math.ceil(this.timer);
    energyValue.textContent = Math.max(0, Math.ceil(this.energy));
    coinValue.textContent = this.coins;
    bestValue.textContent = save.best;
    updatePawHud(this.bird.carrying);
    if (this.bird.carrying) {
      missionText.textContent = `Voe sempre em frente: entregue ${this.bird.carrying.name} quando a ${this.route.destination.label} cruzar a Cacau.`;
    } else {
      missionText.textContent = `Voe sempre em frente: pegue ${this.route.order?.name || "um bebe animal"} quando o ${this.route.nursery.label} cruzar a Cacau.`;
    }
  }

  ensureAudio() {
    if (!this.audioContext) this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (this.audioContext.state === "suspended") this.audioContext.resume();
  }

  tone(frequency, duration, type = "sine", gain = 0.045, delay = 0) {
    if (!this.audioContext) return;
    const start = this.audioContext.currentTime + delay;
    const osc = this.audioContext.createOscillator();
    const vol = this.audioContext.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);
    vol.gain.setValueAtTime(0.0001, start);
    vol.gain.exponentialRampToValueAtTime(gain, start + 0.02);
    vol.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(vol);
    vol.connect(this.audioContext.destination);
    osc.start(start);
    osc.stop(start + duration + 0.03);
  }

  playSound(name) {
    if (this.paused) return;
    this.ensureAudio();
    if (name === "start") { this.tone(440, 0.08, "triangle"); this.tone(660, 0.1, "triangle", 0.04, 0.08); }
    if (name === "bark") { this.tone(720, 0.055, "triangle", 0.032); this.tone(960, 0.07, "triangle", 0.028, 0.075); }
    if (name === "happyBark") { this.tone(780, 0.052, "triangle", 0.035); this.tone(1040, 0.06, "triangle", 0.032, 0.065); this.tone(1320, 0.065, "sine", 0.022, 0.135); }
    if (name === "star") { this.tone(880, 0.07); this.tone(1175, 0.07, "sine", 0.035, 0.06); }
    if (name === "coin") this.tone(1046, 0.08, "square", 0.03);
    if (name === "baby") this.tone(740, 0.11, "triangle");
    if (name === "delivery") { this.tone(523, 0.08, "triangle"); this.tone(659, 0.08, "triangle", 0.04, 0.07); this.tone(784, 0.12, "triangle", 0.04, 0.14); }
    if (name === "hit") { this.tone(180, 0.12, "sawtooth", 0.035); this.tone(120, 0.14, "sawtooth", 0.03, 0.08); }
    if (name === "level") { this.tone(659, 0.08); this.tone(988, 0.12, "sine", 0.04, 0.1); }
    if (name === "over") { this.tone(294, 0.14, "triangle", 0.035); this.tone(220, 0.18, "triangle", 0.03, 0.14); }
  }

  gameSpeed() {
    return 1 + (this.level - 1) * 0.22;
  }

  isPhonePortrait() {
    return window.matchMedia("(max-width: 640px) and (orientation: portrait)").matches;
  }

  safeTopY() {
    return this.isPhonePortrait() ? 150 : 88;
  }

  spawnCloud() {
    const size = Phaser.Math.FloatBetween(0.72, 1.35);
    const aimAtRoute = this.level >= 2 && Math.random() < 0.42;
    const activePoint = this.route.state === "pickup" ? this.route.nursery : this.route.destination;
    const y = aimAtRoute ? activePoint.y + Phaser.Math.Between(-34, 34) : Phaser.Math.FloatBetween(this.safeTopY() + 12, H - 150);
    this.clouds.push({ x: W + 110, y: Phaser.Math.Clamp(y, this.safeTopY(), H - 150), w: 116 * size, h: 62 * size, speed: Phaser.Math.FloatBetween(215, 295) * this.gameSpeed(), phase: Phaser.Math.FloatBetween(0, Math.PI * 2) });
  }

  spawnHazard() {
    const type = Phaser.Utils.Array.GetRandom(this.level < 2 ? ["balloon"] : ["balloon", "kite"]);
    const smart = this.level >= 2 && Math.random() < Math.min(0.62, 0.22 + this.level * 0.07);
    const targetY = smart ? this.bird.y + Phaser.Math.Between(-80, 80) : Phaser.Math.FloatBetween(this.safeTopY() + 18, H - 150);
    const hazard = { type, x: W + 90, y: Phaser.Math.Clamp(targetY, this.safeTopY(), H - 150), w: 62, h: 54, speed: Phaser.Math.FloatBetween(230, 320) * this.gameSpeed(), phase: Phaser.Math.FloatBetween(0, Math.PI * 2), smart };
    if (type === "balloon") { hazard.w = 54; hazard.h = 86; hazard.speed *= 0.82; }
    if (type === "kite") { hazard.w = 72; hazard.h = 78; hazard.speed *= 1.08; }
    this.hazards.push(hazard);
  }

  spawnStar() {
    this.stars.push({ x: W + 54, y: Phaser.Math.FloatBetween(this.safeTopY() + 18, H - 118), w: 38, h: 38, speed: Phaser.Math.FloatBetween(205, 270) * this.gameSpeed(), spin: Phaser.Math.FloatBetween(0, Math.PI * 2) });
  }

  spawnCoin() {
    this.coinsOnMap.push({ x: W + 46, y: Phaser.Math.FloatBetween(this.safeTopY() + 18, H - 124), w: 32, h: 32, speed: Phaser.Math.FloatBetween(220, 285) * this.gameSpeed(), spin: Phaser.Math.FloatBetween(0, Math.PI * 2) });
  }

  spawnHeart() {
    this.hearts.push({ x: W + 54, y: Phaser.Math.FloatBetween(this.safeTopY() + 20, H - 130), w: 40, h: 36, speed: Phaser.Math.FloatBetween(205, 255) * this.gameSpeed(), spin: Phaser.Math.FloatBetween(0, Math.PI * 2) });
  }

  spawnEnergyBolt() {
    this.energyBolts.push({ x: W + 62, y: Phaser.Math.FloatBetween(this.safeTopY() + 18, H - 150), w: 48, h: 74, speed: Phaser.Math.FloatBetween(215, 270) * this.gameSpeed(), spin: Phaser.Math.FloatBetween(0, Math.PI * 2) });
  }

  update(time, deltaMs) {
    const dt = Math.min(0.033, deltaMs / 1000);
    if (!this.paused) this.worldTime += dt;
    if (this.running && !this.paused) this.updateGame(dt);
    this.draw();
  }

  togglePause() {
    if (this.paused) this.resumeGame();
    else this.pauseGame();
  }

  pauseGame() {
    if (!this.running || this.paused) return;
    this.paused = true;
    setGameUiState("paused");
    this.pointerTarget = null;
    pausePanel.classList.remove("hidden");
    pauseButton.classList.add("hidden");
    pauseButton.setAttribute("aria-pressed", "true");
    if (this.audioContext?.state === "running") this.audioContext.suspend();
  }

  resumeGame() {
    if (!this.running || !this.paused) return;
    this.paused = false;
    setGameUiState("playing");
    pausePanel.classList.add("hidden");
    pauseButton.classList.remove("hidden");
    pauseButton.textContent = "Pausar";
    pauseButton.setAttribute("aria-pressed", "false");
    if (this.audioContext?.state === "suspended") this.audioContext.resume();
  }

  updateGame(dt) {
    this.timer -= dt;
    this.energy -= dt * (1.1 + this.level * 0.12);
    if (this.timer <= 0) { this.timer = 0; this.endGame(); return; }
    if (this.energy <= 0) {
      this.energy = 42;
      this.lives -= 1;
      this.bird.hurt = 1.15;
      this.playSound("hit");
      this.addPop(this.bird.x + 35, this.bird.y + 24, 0xee5d5a, 18);
      if (this.lives <= 0) { this.endGame(); return; }
    }

    this.updateCacau(dt);
    this.updateRoutePoints(dt);
    this.updateBarks(dt);
    this.updateSpawns(dt);
    this.moveList(this.clouds, dt);
    this.moveList(this.hazards, dt);
    this.moveList(this.stars, dt);
    this.moveList(this.coinsOnMap, dt);
    this.moveList(this.hearts, dt);
    this.moveList(this.energyBolts, dt);
    this.updateFx(dt);
    this.handleCollisions();
    this.cleanup();
    this.updateHud();
  }

  updateCacau(dt) {
    const move = this.bird.speed * dt;
    let dx = 0;
    let dy = 0;
    if (this.keys.right.isDown || this.keys.d.isDown) dx += 1;
    if (this.keys.left.isDown || this.keys.a.isDown) dx -= 1;
    if (this.keys.up.isDown || this.keys.w.isDown) dy -= 1;
    if (this.keys.down.isDown || this.keys.s.isDown) dy += 1;
    if (this.pointerTarget) {
      this.bird.x += (this.pointerTarget.x - this.bird.x - this.bird.w / 2) * Math.min(1, dt * 5);
      this.bird.y += (this.pointerTarget.y - this.bird.y - this.bird.h / 2) * Math.min(1, dt * 8);
    } else {
      if (dx > 0) this.bird.x += move * 0.95;
      if (dx < 0) this.bird.x -= move * 0.58;
      this.bird.y += dy * move;
    }
    this.bird.direcao = "direita";
    this.bird.x = Phaser.Math.Clamp(this.bird.x, 170, W * 0.58);
    this.bird.y = Phaser.Math.Clamp(this.bird.y, this.safeTopY(), H - this.bird.h - 56);
    this.bird.wing += dt * 15;
    this.bird.hurt = Math.max(0, this.bird.hurt - dt);
  }

  updateBarks(dt) {
    this.barkTimer -= dt;
    if (this.barkTimer > 0 || this.bird.hurt > 0) return;
    this.playSound("bark");
    this.barkTimer = Phaser.Math.FloatBetween(5.5, 8.5);
  }

  updateRoutePoints(dt) {
    if (this.route.state === "pickup") this.moveRoutePoint(this.route.nursery, dt);
    if (this.route.state === "delivery") this.moveRoutePoint(this.route.destination, dt);
  }

  moveRoutePoint(point, dt) {
    if (!point) return;
    point.phase += dt * point.floatSpeed;
    point.baseX -= point.speed * this.gameSpeed() * dt;
    point.x = point.baseX;
    point.y = point.baseY + Math.sin(point.phase) * point.floatAmp;

    if (point.x + point.w < this.bird.x - 18) this.missRoutePoint(point);
  }

  missRoutePoint(point) {
    if (point.missed) return;
    point.missed = true;
    this.score = Math.max(0, this.score - 25);
    this.energy = Math.max(10, this.energy - 12);
    this.playSound("hit");
    this.addPop(Math.max(40, point.x + point.w), point.y + point.h / 2, 0xee5d5a, 10);
    if (this.route.state === "pickup") {
      this.route.nursery = this.makeMovingRoutePoint({ x: 0, y: Phaser.Math.Between(136, 420), w: 184, h: 138, label: "Berçário" }, 0);
    } else if (this.route.order) {
      this.route.destination = this.makeMovingRoutePoint({ ...this.route.order.home, label: this.route.order.destination }, 1);
    }
  }

  updateSpawns(dt) {
    this.timers.cloud -= dt;
    this.timers.hazard -= dt;
    this.timers.star -= dt;
    this.timers.coin -= dt;
    this.timers.heart -= dt;
    this.timers.bolt -= dt;
    if (this.timers.cloud <= 0) { this.spawnCloud(); this.timers.cloud = Math.max(0.38, Phaser.Math.FloatBetween(0.82, 1.22) - this.level * 0.06); }
    if (this.timers.hazard <= 0) { this.spawnHazard(); this.timers.hazard = Math.max(0.52, Phaser.Math.FloatBetween(1.05, 1.78) - this.level * 0.065); }
    if (this.timers.star <= 0) { this.spawnStar(); this.timers.star = Phaser.Math.FloatBetween(0.95, 1.55); }
    if (this.timers.coin <= 0) { this.spawnCoin(); this.timers.coin = Phaser.Math.FloatBetween(1.25, 1.95); }
    if (this.timers.heart <= 0) { this.spawnHeart(); this.timers.heart = Phaser.Math.FloatBetween(8.0, 12.0); }
    if (this.timers.bolt <= 0) { this.spawnEnergyBolt(); this.timers.bolt = Phaser.Math.FloatBetween(5.5, 8.5); }
  }

  moveList(items, dt) {
    for (const item of items) {
      item.x -= item.speed * dt;
      if (item.spin !== undefined) item.spin += dt * 5;
      if (item.smart) {
        const targetY = this.bird.y + this.bird.h * 0.5 - item.h * 0.5;
        item.y += Phaser.Math.Clamp(targetY - item.y, -95 * dt, 95 * dt);
      } else if (item.type === "kite") {
        item.y += Math.sin(this.worldTime * 3.2 + item.phase) * 32 * dt;
      }
    }
  }

  updateFx(dt) {
    for (const pop of this.pops) { pop.x += pop.vx * dt; pop.y += pop.vy * dt; pop.vy += 180 * dt; pop.life -= dt; }
    for (const bone of this.bones) { bone.x += bone.vx * dt; bone.y += bone.vy * dt; bone.vy += 420 * dt; bone.rotation += bone.spin * dt; bone.life -= dt; }
    for (const sparkle of this.sparkles) { sparkle.x += sparkle.vx * dt; sparkle.y += sparkle.vy * dt; sparkle.rotation += sparkle.spin * dt; sparkle.life -= dt; }
    if (this.running) this.addFlightSparkle();
  }

  handleCollisions() {
    const hitbox = { x: this.bird.x + 12, y: this.bird.y + 9, w: this.bird.w - 22, h: this.bird.h - 16 };
    this.handleRouteCollision(hitbox);

    for (const hazard of this.hazards) {
      if (!hazard.hit && this.bird.hurt <= 0 && rectsOverlap(hitbox, hazard)) {
        hazard.hit = true;
        this.lives -= 1;
        this.energy = Math.max(8, this.energy - 24);
        this.bird.hurt = 1.05;
        this.playSound("hit");
        this.addPop(this.bird.x + 35, this.bird.y + 24, 0xee5d5a, 18);
        if (this.lives <= 0) this.endGame();
        return;
      }
    }

    this.collectList(this.stars, hitbox, (star) => {
      this.score += 20;
      this.energy = Math.min(100, this.energy + 18);
      this.playSound("star");
      this.addPop(star.x, star.y, 0xffca3a, 12);
      this.addBoneBurst(star.x + 18, star.y + 18, 6);
    });
    this.collectList(this.coinsOnMap, hitbox, (coin) => {
      this.coins += 1;
      this.score += 12;
      this.energy = Math.min(100, this.energy + 10);
      this.playSound("coin");
      this.addPop(coin.x + 16, coin.y + 16, 0xffca3a, 10);
      this.addBoneBurst(coin.x + 16, coin.y + 16, 5);
    });
    this.collectList(this.hearts, hitbox, (heart) => {
      this.lives = Math.min(5, this.lives + 1);
      this.score += 30;
      this.playSound("happyBark");
      this.addPop(heart.x + 20, heart.y + 18, 0xff5ca8, 18);
      this.addBoneBurst(heart.x + 20, heart.y + 18, 8);
    });
    this.collectList(this.energyBolts, hitbox, (bolt) => {
      this.energy = Math.min(100, this.energy + 40);
      this.score += 25;
      this.playSound("star");
      this.addPop(bolt.x + 24, bolt.y + 34, 0x38bdf8, 22);
      this.addBoneBurst(bolt.x + 24, bolt.y + 34, 10);
    });
  }

  handleRouteCollision(hitbox) {
    if (this.route.state === "pickup" && !this.bird.carrying && rectsOverlap(hitbox, this.route.nursery)) {
      this.bird.carrying = {
        id: this.route.order.id,
        name: this.route.order.name,
        destination: this.route.order.destination,
        kind: this.route.order.kind,
        colorName: this.route.order.colorName,
        color: this.route.order.color,
        familyColor: this.route.order.familyColor
      };
      this.route.state = "delivery";
      this.route.destination = this.makeMovingRoutePoint({ ...this.route.order.home, label: this.route.order.destination }, 1);
      this.score += 35;
      this.playSound("baby");
      this.time.delayedCall(90, () => this.playSound("bark"));
      this.addPop(this.route.nursery.x + this.route.nursery.w / 2, this.route.nursery.y + this.route.nursery.h / 2, 0x65d6ad, 12);
      this.addBoneBurst(this.route.nursery.x + this.route.nursery.w / 2, this.route.nursery.y + this.route.nursery.h / 2, 8);
    }

    if (this.route.state === "delivery" && this.bird.carrying && rectsOverlap(hitbox, this.route.destination)) {
      const validDelivery = this.bird.carrying.id === this.route.order.requiredId && this.bird.carrying.colorName === this.route.order.requiredColor;
      if (validDelivery) {
        this.score += 150 + this.level * 30;
        this.timer = Math.min(75, this.timer + 8);
        this.energy = Math.min(100, this.energy + 18);
        this.deliveries += 1;
        this.bird.carrying = null;
        this.playSound("delivery");
        this.time.delayedCall(170, () => this.playSound("happyBark"));
        this.addPop(this.route.destination.x + this.route.destination.w / 2, this.route.destination.y + this.route.destination.h / 2, 0x65d6ad, 28);
        this.addBoneBurst(this.route.destination.x + this.route.destination.w / 2, this.route.destination.y + this.route.destination.h / 2, 18);
        if (this.deliveries % 3 === 0) {
          this.level += 1;
          this.timer = Math.min(75, this.timer + 12);
          this.playSound("level");
          this.addPop(this.bird.x + 40, this.bird.y + 22, 0xffca3a, 35);
          this.addBoneBurst(this.bird.x + 48, this.bird.y + 18, 22);
        }
        this.startRoute();
      } else {
        this.score = Math.max(0, this.score - 40);
        this.energy = Math.max(10, this.energy - 20);
        this.bird.hurt = 0.8;
        this.playSound("hit");
        this.addPop(this.route.destination.x + this.route.destination.w / 2, this.route.destination.y + this.route.destination.h / 2, 0xee5d5a, 16);
      }
    }
  }

  collectList(items, hitbox, onCollect) {
    for (const item of items) {
      if (!item.hit && rectsOverlap(hitbox, item)) {
        item.hit = true;
        onCollect(item);
      }
    }
  }

  cleanup() {
    this.removeDead(this.clouds);
    this.removeDead(this.hazards);
    this.removeDead(this.stars);
    this.removeDead(this.coinsOnMap);
    this.removeDead(this.hearts);
    this.removeDead(this.energyBolts);
    this.pops = this.pops.filter((pop) => pop.life > 0);
    this.bones = this.bones.filter((bone) => bone.life > 0);
    this.sparkles = this.sparkles.filter((sparkle) => sparkle.life > 0);
  }

  removeDead(items) {
    for (let i = items.length - 1; i >= 0; i -= 1) {
      if (items[i].x + items[i].w < -80 || items[i].hit) items.splice(i, 1);
    }
  }

  endGame() {
    if (!this.running) return;
    this.running = false;
    this.paused = false;
    setGameUiState("ended");
    pausePanel.classList.add("hidden");
    pauseButton.classList.add("hidden");
    pauseButton.textContent = "Pausar";
    pauseButton.setAttribute("aria-pressed", "false");
    this.playSound("over");
    save.best = Math.max(save.best, this.score);
    save.totalCoins += this.coins;
    persistSave();
    finalScore.textContent = `${this.score} pontos`;
    rankLine.textContent = `Recorde: ${save.best} | Estrelas guardadas: ${save.totalCoins}`;
    this.updateHud();
    renderShop();
    gameOverPanel.classList.remove("hidden");
  }

  addPop(x, y, color, amount) {
    for (let i = 0; i < amount; i += 1) {
      this.pops.push({ x, y, vx: Phaser.Math.FloatBetween(-150, 150), vy: Phaser.Math.FloatBetween(-150, 120), life: Phaser.Math.FloatBetween(0.35, 0.85), color });
    }
  }

  addBoneBurst(x, y, amount = 10) {
    for (let i = 0; i < amount; i += 1) {
      this.bones.push({ x, y, vx: Phaser.Math.FloatBetween(-190, 190), vy: Phaser.Math.FloatBetween(-230, -70), rotation: Phaser.Math.FloatBetween(0, Math.PI * 2), spin: Phaser.Math.FloatBetween(-7, 7), size: Phaser.Math.FloatBetween(0.72, 1.18), life: Phaser.Math.FloatBetween(0.65, 1.15) });
    }
  }

  addFlightSparkle() {
    if (this.worldTime % 0.045 > 0.018) return;
    const faceSign = this.bird.direcao === "esquerda" ? -1 : 1;
    this.sparkles.push({
      x: this.bird.x + 35 - 42 * faceSign,
      y: this.bird.y + Phaser.Math.FloatBetween(16, 54),
      vx: Phaser.Math.FloatBetween(-95, -45) * faceSign,
      vy: Phaser.Math.FloatBetween(-18, 26),
      rotation: Phaser.Math.FloatBetween(0, Math.PI * 2),
      spin: Phaser.Math.FloatBetween(-5, 5),
      size: Phaser.Math.FloatBetween(5, 11),
      color: Phaser.Utils.Array.GetRandom(confettiColors),
      life: Phaser.Math.FloatBetween(0.28, 0.55)
    });
  }

  draw() {
    this.g.clear();
    this.fx.clear();
    this.drawWorld();
    this.drawRoutePoints();
    for (const star of this.stars) this.drawStar(star);
    for (const coin of this.coinsOnMap) this.drawCoin(coin);
    for (const heart of this.hearts) this.drawHeart(heart);
    for (const bolt of this.energyBolts) this.drawEnergyBolt(bolt);
    for (const cloud of this.clouds) this.drawCloud(cloud);
    for (const hazard of this.hazards) this.drawHazard(hazard);
    for (const sparkle of this.sparkles) this.drawSparkle(sparkle);
    this.drawCacau();
    for (const pop of this.pops) this.drawPop(pop);
    for (const bone of this.bones) this.drawBone(bone);
  }

  drawWorld() {
    const scene = this.currentSceneData();
    const slow = (this.worldTime * 18 * this.gameSpeed()) % W;
    const fast = (this.worldTime * 46 * this.gameSpeed()) % W;
    this.g.fillGradientStyle(scene.sky[0], scene.sky[0], scene.sky[2], scene.sky[2], 1);
    this.g.fillRect(0, 0, W, H);
    this.g.fillStyle(0xffffff, 0.66);
    this.g.fillCircle(105 + Math.sin(this.worldTime * 0.25) * 8, 95, 46);
    if (scene.night) this.drawNightStars();
    this.drawBackgroundClouds(slow, 0.44, 120);
    this.drawBackgroundClouds(fast, 0.28, 230);
    if (scene.mountains) this.drawMountains(slow, scene.garden ? 0x9bbbd2 : (scene.name === "Montanhas" ? 0x7896ad : 0x9ec4c5));
    if (scene.city) this.drawAnimalCity();
    if (scene.trees) this.drawForest();
    if (scene.park) this.drawPark();
    if (scene.garden) this.drawFlowerGarden(fast);
    this.g.fillStyle(scene.ground);
    this.g.fillRect(0, H - 66, W, 66);
    this.g.fillStyle(0x21784f);
    for (let x = -(fast % 44); x < W + 60; x += 44) this.triangle(x, H - 60, x + 20, H - 112, x + 42, H - 60);
    this.g.fillStyle(0xffffff, 0.82);
    this.g.fillRoundedRect(20, 92, 210, 34, 17);
    this.drawText(scene.name.toUpperCase(), 36, 111, "14px", "#197a62", "left");
    this.drawRainbowRibbon(fast);
  }

  drawRainbowRibbon(offset) {
    const colors = [0xff5ca8, 0xffc857, 0x45d483, 0x4db7ff, 0xb58cff];
    const drift = (offset * 0.12) % 420;
    for (let i = 0; i < colors.length; i += 1) {
      this.g.lineStyle(13, colors[i], 0.38);
      for (let x = -360 - drift; x < W + 420; x += 420) {
        const y = 238 + Math.sin(this.worldTime * 0.45 + i + x * 0.01) * 8;
        this.g.beginPath();
        this.g.arc(x + 210, y + 108 + i * 9, 188 - i * 12, Math.PI * 1.08, Math.PI * 1.92);
        this.g.strokePath();
      }
    }
  }

  drawBackgroundClouds(offset, alpha, baseY) {
    this.g.fillStyle(0xffffff, alpha);
    for (let i = 0; i < 6; i += 1) {
      const x = ((i * 260 - offset) % (W + 260)) - 120;
      const y = baseY + Math.sin(this.worldTime * 0.7 + i) * 12 + (i % 2) * 44;
      this.g.fillEllipse(x, y, 96, 40);
      this.g.fillEllipse(x + 42, y - 8, 80, 50);
      this.g.fillEllipse(x + 86, y, 96, 40);
      this.g.fillRect(x, y - 2, 90, 24);
    }
  }

  drawMountains(offset, color) {
    this.g.fillStyle(color);
    for (const m of [[440, 640, 240, 265], [700, 655, 310, 300], [980, 645, 240, 240]]) {
      this.triangle(m[0] - offset * 0.25 - m[2], m[1], m[0] - offset * 0.25, m[1] - m[3], m[0] - offset * 0.25 + m[2], m[1]);
      this.triangle(m[0] - offset * 0.25 + W - m[2], m[1], m[0] - offset * 0.25 + W, m[1] - m[3], m[0] - offset * 0.25 + W + m[2], m[1]);
    }
  }

  triangle(x1, y1, x2, y2, x3, y3) {
    this.g.beginPath();
    this.g.moveTo(x1, y1);
    this.g.lineTo(x2, y2);
    this.g.lineTo(x3, y3);
    this.g.closePath();
    this.g.fillPath();
  }

  strokeTriangle(x1, y1, x2, y2, x3, y3) {
    this.g.beginPath();
    this.g.moveTo(x1, y1);
    this.g.lineTo(x2, y2);
    this.g.lineTo(x3, y3);
    this.g.closePath();
    this.g.strokePath();
  }

  drawSoftEar(ear, faceSign, alpha = 1) {
    this.g.fillStyle(0x0d0f12, alpha);
    this.triangle(ear.root.x, ear.root.y, ear.tip.x, ear.tip.y, ear.outer.x, ear.outer.y);
    this.g.fillCircle(ear.root.x, ear.root.y, 4.8);
    this.g.fillCircle(ear.outer.x, ear.outer.y, 5.4);

    this.g.lineStyle(3, 0x2b1d16, alpha);
    this.g.lineBetween(ear.root.x, ear.root.y, ear.tip.x, ear.tip.y);
    this.g.lineBetween(ear.tip.x, ear.tip.y, ear.outer.x, ear.outer.y);
    this.g.lineBetween(ear.outer.x, ear.outer.y, ear.root.x, ear.root.y);

    const innerRoot = { x: ear.root.x + 2.2 * faceSign, y: ear.root.y + 2 };
    const innerTip = { x: ear.tip.x + 2.8 * faceSign, y: ear.tip.y + 7 };
    const innerOuter = { x: ear.outer.x - 5 * faceSign, y: ear.outer.y - 2 };
    this.g.fillStyle(0x4d312c, alpha * 0.95);
    this.triangle(innerRoot.x, innerRoot.y, innerTip.x, innerTip.y, innerOuter.x, innerOuter.y);
  }

  drawPropeller(cx, cy, spin) {
    const pulse = 0.82 + Math.abs(Math.sin(spin)) * 0.18;
    const bladeLength = 31 * pulse;
    const bladeHeight = 7;

    this.g.fillStyle(0xff1744, 0.18);
    this.g.fillEllipse(cx, cy, 78 * pulse, 13);

    this.g.fillStyle(0xff1744, 0.98);
    this.g.lineStyle(2, 0x9f1239, 0.95);
    this.g.fillRoundedRect(cx - bladeLength - 5, cy - bladeHeight / 2, bladeLength, bladeHeight, 4);
    this.g.strokeRoundedRect(cx - bladeLength - 5, cy - bladeHeight / 2, bladeLength, bladeHeight, 4);
    this.g.fillRoundedRect(cx + 5, cy - bladeHeight / 2, bladeLength, bladeHeight, 4);
    this.g.strokeRoundedRect(cx + 5, cy - bladeHeight / 2, bladeLength, bladeHeight, 4);

    this.g.fillStyle(0xff7aa8, 0.85);
    this.g.fillRoundedRect(cx - bladeLength - 1, cy - 2.2, bladeLength * 0.42, 3, 2);
    this.g.fillRoundedRect(cx + 9, cy - 2.2, bladeLength * 0.42, 3, 2);

    this.g.fillStyle(0xffffff, 0.9);
    this.g.fillCircle(cx, cy, 6.5);
    this.g.lineStyle(2.5, 0xff1744, 0.95);
    this.g.strokeCircle(cx, cy, 6.5);
    this.g.fillStyle(0x9f1239);
    this.g.fillCircle(cx, cy, 3.2);
  }

  drawPropellerBlade(cx, cy, angle, color, alpha = 1, scale = 1) {
    const dirX = Math.cos(angle);
    const dirY = Math.sin(angle);
    const perpX = -dirY;
    const perpY = dirX;
    const base = 7 * scale;
    const neck = 20 * scale;
    const tip = 39 * scale;
    const halfBase = 3 * scale;
    const halfTip = 6.5 * scale;
    const points = [
      { x: cx + dirX * base + perpX * -halfBase, y: cy + dirY * base + perpY * -halfBase },
      { x: cx + dirX * neck + perpX * -halfTip, y: cy + dirY * neck + perpY * -halfTip },
      { x: cx + dirX * tip, y: cy + dirY * tip },
      { x: cx + dirX * neck + perpX * halfTip, y: cy + dirY * neck + perpY * halfTip },
      { x: cx + dirX * base + perpX * halfBase, y: cy + dirY * base + perpY * halfBase }
    ];

    this.g.fillStyle(color, alpha);
    this.g.lineStyle(2, 0x8a164e, alpha * 0.85);
    this.g.beginPath();
    this.g.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i += 1) this.g.lineTo(points[i].x, points[i].y);
    this.g.closePath();
    this.g.fillPath();
    this.g.strokePath();

    this.g.fillStyle(0xffffff, alpha * 0.34);
    this.g.fillCircle(cx + dirX * (neck + 2 * scale) + perpX * -2 * scale, cy + dirY * (neck + 2 * scale) + perpY * -2 * scale, 3.4 * scale);
  }

  drawForest() {
    for (let x = 35; x < W; x += 82) {
      const height = 120 + (x % 3) * 24;
      this.g.fillStyle(0x7a4b2b);
      this.g.fillRect(x - 8, H - 80 - height * 0.45, 16, height * 0.58);
      this.g.fillStyle(0x146d45);
      this.g.fillCircle(x, H - 118 - height * 0.42, 48);
      this.g.fillStyle(0x1c8d5d);
      this.g.fillCircle(x - 18, H - 102 - height * 0.42, 38);
      this.g.fillCircle(x + 21, H - 104 - height * 0.42, 34);
    }
  }

  drawAnimalCity() {
    const base = H - 66;
    for (const house of [
      { x: 600, w: 70, h: 90, color: 0xf4b86a },
      { x: 690, w: 88, h: 125, color: 0xf0908f },
      { x: 800, w: 78, h: 104, color: 0x9fd6c5 },
      { x: 900, w: 96, h: 142, color: 0xf7d37b },
      { x: 1020, w: 82, h: 116, color: 0x83b8d8 }
    ]) {
      this.g.fillStyle(house.color);
      this.g.fillRect(house.x, base - house.h, house.w, house.h);
      this.g.fillStyle(0x7a4b2b);
      this.triangle(house.x - 7, base - house.h, house.x + house.w / 2, base - house.h - 34, house.x + house.w + 7, base - house.h);
      this.g.fillStyle(0xffffff, 0.72);
      this.g.fillRect(house.x + 14, base - house.h + 26, 18, 18);
      this.g.fillRect(house.x + house.w - 32, base - house.h + 26, 18, 18);
    }
  }

  drawPark() {
    this.g.fillStyle(0xfbbf24);
    this.g.fillRoundedRect(710, H - 126, 160, 12, 6);
    this.g.fillStyle(0x7a4b2b);
    this.g.fillRect(730, H - 115, 12, 52);
    this.g.fillRect(838, H - 115, 12, 52);
    this.g.lineStyle(6, 0xffffff);
    this.g.strokeCircle(214, H - 126, 38);
    this.g.fillStyle(0xf472b6);
    this.g.fillCircle(1010, H - 132, 22);
  }

  drawFlowerGarden(offset) {
    this.g.fillStyle(0x6fd36f, 0.52);
    this.g.fillEllipse(250, H - 88, 560, 62);
    this.g.fillEllipse(840, H - 92, 680, 70);

    const flowers = [
      0xff6fae,
      0xffd166,
      0x8bd3ff,
      0xc084fc,
      0xff9f7a,
      0xffffff
    ];

    for (let i = 0; i < 42; i += 1) {
      const x = ((i * 73 - offset * 0.45) % (W + 80)) - 40;
      const y = H - 72 - (i % 5) * 8;
      const color = flowers[i % flowers.length];
      this.g.lineStyle(2, 0x247a48, 0.72);
      this.g.lineBetween(x, y + 12, x, y);
      this.g.fillStyle(color, 0.95);
      this.g.fillCircle(x - 4, y, 4);
      this.g.fillCircle(x + 4, y, 4);
      this.g.fillCircle(x, y - 4, 4);
      this.g.fillCircle(x, y + 4, 4);
      this.g.fillStyle(0xfff7b8);
      this.g.fillCircle(x, y, 2.2);
    }

    this.g.fillStyle(0xffffff, 0.28);
    for (let i = 0; i < 8; i += 1) {
      const x = ((i * 165 - offset * 0.22) % (W + 180)) - 90;
      const y = H - 132 - (i % 3) * 18;
      this.g.fillEllipse(x, y, 70, 20);
    }
  }

  drawNightStars() {
    this.g.fillStyle(0xfff7b8);
    for (let i = 0; i < 46; i += 1) {
      const x = (i * 89 + Math.sin(this.worldTime * 0.5 + i) * 6) % W;
      const y = 30 + ((i * 47) % 250);
      this.g.fillStyle(0xfff7b8, 0.42 + (i % 4) * 0.12);
      this.g.fillCircle(x, y, 1.5 + (i % 3));
    }
  }

  drawRoutePoints() {
    if (!this.route.order) return;
    if (this.route.state === "pickup") this.drawNursery(this.route.nursery);
    if (this.route.state === "delivery") this.drawDestinationHouse(this.route.destination);
  }

  drawNursery(point) {
    const active = this.route.state === "pickup";
    const pulse = active ? 1 + Math.sin(this.worldTime * 5) * 0.035 : 1;
    const bob = Math.sin(this.worldTime * 3.2 + point.phase) * 3;
    const x = point.x;
    const y = point.y + bob;
    const cx = x + point.w / 2;
    const cy = y + 72;

    this.g.fillStyle(0x173047, 0.16);
    this.g.fillEllipse(cx, y + point.h + 8, point.w * 0.78, 18);
    this.g.fillStyle(0xe0f7ff, active ? 0.98 : 0.72);
    this.g.lineStyle(active ? 5 : 3, this.route.order.familyColor, active ? 1 : 0.45);
    this.g.fillRoundedRect(x, y, point.w, point.h, 24);
    this.g.strokeRoundedRect(x, y, point.w, point.h, 24);
    this.g.fillStyle(this.route.order.color, 0.18);
    this.g.fillCircle(cx, cy, 64 * pulse);
    this.g.fillStyle(0xffffff, 0.68);
    this.g.fillCircle(cx - 33, cy - 30, 18);
    this.g.fillCircle(cx + 38, cy - 36, 12);
    this.drawBabyAnimalPortrait(this.route.order.id, cx, cy + 2, pulse);
    this.g.fillStyle(0xffffff, 0.94);
    this.g.fillRoundedRect(x + 24, y + 8, point.w - 48, 26, 13);
    this.g.lineStyle(2, this.route.order.familyColor, 0.45);
    this.g.strokeRoundedRect(x + 24, y + 8, point.w - 48, 26, 13);
    this.drawText(this.route.order.name.replace("bebe ", ""), cx, y + 13, "13px", "#173047", "center");
  }

  drawBabyAnimalPortrait(id, cx, cy, pulse = 1) {
    const data = {
      panda: { body: 0xf8fafc, head: 0xffffff, accent: 0x172033, belly: 0xf8fafc, nose: 0x172033, eye: 0x1d4ed8, ear: 0x172033 },
      puppy: { body: 0xd88c44, head: 0xe8a45d, accent: 0x8b4a24, belly: 0xffedd5, nose: 0x4a2414, eye: 0x2563eb, ear: 0x8b4a24 },
      kitten: { body: 0xcbd5e1, head: 0xe2e8f0, accent: 0x64748b, belly: 0xffffff, nose: 0xec4899, eye: 0x0ea5e9, ear: 0x94a3b8 },
      bunny: { body: 0xf9a8d4, head: 0xffd6e7, accent: 0xf472b6, belly: 0xffffff, nose: 0xdb2777, eye: 0x2563eb, ear: 0xf472b6 },
      fox: { body: 0xfb923c, head: 0xffa85c, accent: 0xc2410c, belly: 0xfff7ed, nose: 0x172033, eye: 0x0f766e, ear: 0xc2410c },
      koala: { body: 0xbfdbfe, head: 0xdbeafe, accent: 0x64748b, belly: 0xffffff, nose: 0x334155, eye: 0x2563eb, ear: 0x94a3b8 },
      turtle: { body: 0x86efac, head: 0xbbf7d0, accent: 0x15803d, belly: 0xfef3c7, nose: 0x166534, eye: 0x2563eb, ear: 0x22c55e },
      duckling: { body: 0xfde68a, head: 0xfef08a, accent: 0xf59e0b, belly: 0xfffbeb, nose: 0xf97316, eye: 0x2563eb, ear: 0xfacc15 }
    }[id] || { body: 0xffffff, head: 0xffffff, accent: 0x2478c7, belly: 0xffffff, nose: 0x173047, eye: 0x2563eb, ear: 0x2478c7 };
    const blink = Math.sin(this.worldTime * 3.1) > 0.965;
    const look = Math.sin(this.worldTime * 1.7) * 1.8;

    this.g.fillStyle(0x173047, 0.12);
    this.g.fillEllipse(cx, cy + 49, 76, 15);
    this.g.fillStyle(data.body);
    this.g.lineStyle(4, data.accent, 0.82);

    if (id === "turtle") {
      this.g.fillEllipse(cx, cy + 19, 74, 56);
      this.g.strokeEllipse(cx, cy + 19, 74, 56);
      this.g.fillStyle(data.accent, 0.34);
      this.g.fillEllipse(cx, cy + 17, 48, 34);
      this.g.lineStyle(2, data.accent, 0.55);
      this.g.lineBetween(cx - 18, cy + 2, cx + 18, cy + 32);
      this.g.lineBetween(cx + 18, cy + 2, cx - 18, cy + 32);
      this.g.fillStyle(data.head);
      this.g.fillEllipse(cx, cy - 23, 52, 44);
    } else if (id === "duckling") {
      this.g.fillEllipse(cx, cy + 19, 56, 62);
      this.g.strokeEllipse(cx, cy + 19, 56, 62);
      this.g.fillStyle(data.head);
      this.g.fillEllipse(cx, cy - 21, 64, 54);
    } else {
      this.g.fillEllipse(cx, cy + 20, 58, 66);
      this.g.strokeEllipse(cx, cy + 20, 58, 66);
      this.g.fillStyle(data.belly);
      this.g.fillEllipse(cx, cy + 24, 34, 39);
      this.drawAnimalEars(id, cx, cy, data);
      this.g.fillStyle(data.head);
      this.g.lineStyle(4, data.accent, 0.85);
      this.g.fillEllipse(cx, cy - 20, 72, 58);
      this.g.strokeEllipse(cx, cy - 20, 72, 58);
    }

    if (id === "panda") {
      this.g.fillStyle(data.accent);
      this.g.fillEllipse(cx - 18, cy - 23, 22, 27);
      this.g.fillEllipse(cx + 18, cy - 23, 22, 27);
      this.g.fillStyle(data.head);
      this.g.fillEllipse(cx, cy - 15, 36, 28);
    }
    if (id === "fox") {
      this.g.fillStyle(data.belly);
      this.triangle(cx - 32, cy - 25, cx, cy + 4, cx + 32, cy - 25);
    }

    this.drawAnimalEyes(cx, cy - 23, data.eye, blink, look);
    this.drawAnimalNoseAndMouth(id, cx, cy - 5, data);
    this.g.fillStyle(0xffffff, 0.5);
    this.g.fillEllipse(cx - 18, cy - 43, 24, 10);
    this.g.fillStyle(0xffffff, 0.32);
    this.g.fillCircle(cx + 34, cy - 45, 4 * pulse);
    this.g.fillCircle(cx + 43, cy - 35, 2.6 * pulse);
  }

  drawAnimalEars(id, cx, cy, data) {
    this.g.fillStyle(data.ear);
    this.g.lineStyle(3, data.accent, 0.8);
    if (id === "bunny") {
      this.g.fillEllipse(cx - 22, cy - 56, 18, 56);
      this.g.fillEllipse(cx + 22, cy - 56, 18, 56);
      this.g.fillStyle(0xffe4ef);
      this.g.fillEllipse(cx - 22, cy - 55, 8, 36);
      this.g.fillEllipse(cx + 22, cy - 55, 8, 36);
      return;
    }
    if (id === "kitten" || id === "fox") {
      this.triangle(cx - 34, cy - 34, cx - 21, cy - 66, cx - 8, cy - 35);
      this.triangle(cx + 34, cy - 34, cx + 21, cy - 66, cx + 8, cy - 35);
      this.g.fillStyle(0xffd6e7, 0.82);
      this.triangle(cx - 27, cy - 37, cx - 21, cy - 52, cx - 15, cy - 37);
      this.triangle(cx + 27, cy - 37, cx + 21, cy - 52, cx + 15, cy - 37);
      return;
    }
    this.g.fillCircle(cx - 28, cy - 37, 17);
    this.g.fillCircle(cx + 28, cy - 37, 17);
    if (id === "puppy") {
      this.g.fillEllipse(cx - 36, cy - 25, 18, 42);
      this.g.fillEllipse(cx + 36, cy - 25, 18, 42);
    }
  }

  drawAnimalEyes(cx, cy, color, blink, look) {
    for (const side of [-1, 1]) {
      const ex = cx + side * 16;
      if (blink) {
        this.g.lineStyle(4, 0x173047, 0.8);
        this.g.lineBetween(ex - 9, cy, ex + 9, cy);
        continue;
      }
      this.g.fillStyle(0xffffff);
      this.g.fillCircle(ex, cy, 13);
      this.g.lineStyle(2, 0x173047, 0.4);
      this.g.strokeCircle(ex, cy, 13);
      this.g.fillStyle(color);
      this.g.fillCircle(ex + look, cy + 1, 7);
      this.g.fillStyle(0x07111f);
      this.g.fillCircle(ex + look, cy + 1, 4);
      this.g.fillStyle(0xffffff);
      this.g.fillCircle(ex + look + 3, cy - 3, 2.8);
    }
  }

  drawAnimalNoseAndMouth(id, cx, cy, data) {
    if (id === "duckling") {
      this.g.fillStyle(data.nose);
      this.triangle(cx - 14, cy - 1, cx + 14, cy - 1, cx, cy + 13);
      return;
    }
    this.g.fillStyle(data.nose);
    this.g.fillEllipse(cx, cy, 12, 8);
    this.g.lineStyle(2, 0x173047, 0.5);
    this.g.beginPath();
    this.g.arc(cx - 5, cy + 8, 6, 0.12, Math.PI - 0.08);
    this.g.arc(cx + 5, cy + 8, 6, 0.08, Math.PI - 0.12);
    this.g.strokePath();
  }

  drawDestinationHouse(point) {
    const active = this.route.state === "delivery";
    this.g.fillStyle(0xfffdf5, active ? 1 : 0.62);
    this.g.lineStyle(active ? 5 : 3, 0x197a62, active ? 1 : 0.45);
    this.g.fillRoundedRect(point.x, point.y + 22, point.w, point.h - 22, 18);
    this.g.strokeRoundedRect(point.x, point.y + 22, point.w, point.h - 22, 18);
    this.g.fillStyle(this.route.order.familyColor);
    this.triangle(point.x - 8, point.y + 32, point.x + point.w / 2, point.y - 12, point.x + point.w + 8, point.y + 32);
    this.drawText("PONTO B", point.x + point.w / 2, point.y + 45, "15px", "#197a62", "center");
    this.drawText(this.route.order.destination, point.x + point.w / 2, point.y + 71, "15px", "#173047", "center");
    this.drawText(`pedido: ${this.route.order.requiredColor}`, point.x + point.w / 2, point.y + 91, "12px", "#173047", "center");
    this.drawText(animalEmoji[this.route.order.id], point.x + point.w / 2, point.y + 114, "26px", "#173047", "center");
  }

  drawCacau() {
    if (this.bird.hurt > 0 && Math.floor(this.bird.hurt * 14) % 2 === 0) return;
    const x = this.bird.x;
    const y = this.bird.y;
    const propellerSpin = this.bird.wing * 1.35;
    const tailWag = Math.sin(this.bird.wing * 1.6) * 9;
    const faceSign = this.bird.direcao === "esquerda" ? -1 : 1;
    const body = { x: x + 45, y: y + 35 };
    const head = { x: body.x + 38 * faceSign, y: y + 24 };
    const muzzle = { x: head.x + 24 * faceSign, y: y + 35 };
    const nose = { x: head.x + 42 * faceSign, y: y + 34 };
    const eye = { x: head.x + 10 * faceSign, y: y + 20 };
    const earSwing = Math.sin(this.bird.wing * 0.72) * 3.8;
    const frontEar = {
      root: { x: head.x + 5 * faceSign, y: y + 8 },
      tip: { x: head.x + (13 + earSwing * 0.45) * faceSign, y: y - 24 + Math.abs(earSwing) * 0.18 },
      outer: { x: head.x + 18 * faceSign, y: y + 14 }
    };
    const backEar = {
      root: { x: head.x - 9 * faceSign, y: y + 11 },
      tip: { x: head.x - (4 - earSwing * 0.35) * faceSign, y: y - 18 + Math.abs(earSwing) * 0.14 },
      outer: { x: head.x + 5 * faceSign, y: y + 15 }
    };
    const outfit = outfits.find((item) => item.id === save.outfit) || outfits[0];

    this.g.fillStyle(0x153047, 0.18);
    this.g.fillEllipse(x + 40, y + 61, 84, 18);

    // Mochila no dorso, com a helice exclusivamente no topo.
    this.g.fillStyle(outfit.pack);
    this.g.fillRoundedRect(x + 18, y + 14, 34, 39, 10);
    this.g.fillStyle(0xffffff, 0.38);
    this.g.fillRoundedRect(x + 24, y + 19, 13, 24, 6);
    this.g.lineStyle(3, 0x197a62);
    this.g.strokeRoundedRect(x + 18, y + 14, 34, 39, 10);
    const propellerBase = { x: x + 34, y: y + 15 };
    const propellerHub = { x: x + 35, y: y - 5 };
    this.g.lineStyle(4, 0x197a62);
    this.g.lineBetween(propellerBase.x, propellerBase.y, propellerHub.x, propellerHub.y);
    this.drawPropeller(propellerHub.x, propellerHub.y, propellerSpin);

    this.g.lineStyle(4, 0x7a4b2b, 0.92);
    this.g.beginPath();
    this.g.arc(x + 47, y + 32, 33, Math.PI * 0.1, Math.PI * 0.92);
    this.g.strokePath();
    this.g.fillStyle(0xf4c27a);
    this.g.fillRoundedRect(x + 10, y + 37, 34, 28, 8);
    this.g.lineStyle(3, 0x9a5b2f);
    this.g.strokeRoundedRect(x + 10, y + 37, 34, 28, 8);

    this.g.fillStyle(0xffffff, 0.22);
    this.g.fillEllipse(body.x + 9 * faceSign, y + 22, 70, 34);

    // Corpo da Cacau, com volumes arredondados para um visual infantil suave.
    this.g.lineStyle(5, 0x2b1d16);
    this.g.fillStyle(0x111417);
    this.g.fillEllipse(body.x, body.y, 86, 54);
    this.g.strokeEllipse(body.x, body.y, 86, 54);
    this.g.fillStyle(0x252a31, 0.55);
    this.g.fillEllipse(body.x - 17 * faceSign, y + 25, 34, 24);

    this.g.fillStyle(0x171a1f);
    this.g.fillEllipse(head.x, head.y, 52, 42);
    this.g.lineStyle(5, 0x2b1d16);
    this.g.strokeEllipse(head.x, head.y, 52, 42);

    // Orelhas lateralizadas, mais arredondadas e com balanco suave no voo.
    this.drawSoftEar(backEar, faceSign, 0.72);
    this.drawSoftEar(frontEar, faceSign, 1);

    // Perfil lateral: focinho e olho acompanham a direcao do voo.

    this.g.fillStyle(0xb86b33);
    this.g.fillEllipse(muzzle.x, muzzle.y, 35, 24);
    this.g.lineStyle(3, 0x7a3f22);
    this.g.strokeEllipse(muzzle.x, muzzle.y, 35, 24);
    this.g.fillCircle(head.x - 12 * faceSign, y + 25, 5);
    this.g.fillCircle(head.x + 8 * faceSign, y + 25, 5);
    this.g.fillEllipse(body.x - 17 * faceSign, y + 51, 18, 16);
    this.g.fillEllipse(body.x + 15 * faceSign, y + 51, 18, 16);
    this.g.fillStyle(0x6f3a1d);
    this.g.fillCircle(nose.x, nose.y, 4.4);

    // Um olho lateral grande, com pupila olhando para frente da direcao do voo.
    this.g.fillStyle(0xffffff);
    this.g.fillCircle(eye.x, eye.y, 8.2);
    this.g.fillStyle(0x1f2937);
    this.g.fillCircle(eye.x + 2.6 * faceSign, eye.y + 1, 3.9);
    this.g.fillStyle(0xffffff);
    this.g.fillCircle(eye.x + 4.2 * faceSign, eye.y - 1.7, 1.8);
    this.g.lineStyle(2.5, 0x2b3a67, 0.95);
    this.g.strokeCircle(eye.x, eye.y, 10);
    this.g.lineBetween(eye.x + 10 * faceSign, eye.y, eye.x + 19 * faceSign, eye.y + 1);

    // Patinhas e rabinho animado.
    this.g.lineStyle(7, 0xb86b33);
    this.g.lineBetween(body.x - 19 * faceSign, y + 48, body.x - 14 * faceSign, y + 70);
    this.g.lineBetween(body.x + 15 * faceSign, y + 48, body.x + 11 * faceSign, y + 71);
    this.g.lineStyle(4.5, 0x111417);
    this.g.beginPath();
    this.g.moveTo(body.x - 43 * faceSign, y + 34);
    this.g.lineTo(body.x - 52 * faceSign, y + 24 + tailWag * 0.08);
    this.g.lineTo(body.x - 48 * faceSign, y + 14 + tailWag * 0.28);
    this.g.strokePath();
    this.g.fillStyle(0xb86b33);
    this.g.fillCircle(body.x - 48 * faceSign, y + 14 + tailWag * 0.28, 2.6);

    // Pequenos brilhos para dar acabamento 3D suave.
    this.g.fillStyle(0xffffff, 0.18);
    this.g.fillEllipse(head.x - 12 * faceSign, y + 15, 34, 12);
    this.g.fillEllipse(body.x - 12 * faceSign, y + 25, 28, 10);

    if (this.bird.carrying) {
      this.g.fillStyle(0xffffff);
      this.g.fillRoundedRect(x + 20, y - 34, 52, 34, 10);
      this.g.lineStyle(3, this.bird.carrying.familyColor);
      this.g.strokeRoundedRect(x + 20, y - 34, 52, 34, 10);
      this.drawText(animalEmoji[this.bird.carrying.id], x + 46, y - 28, "25px", "#173047", "center");
    }
  }

  updateEyePosition(cabeca, offset = 9) {
    if (this.bird.direcao === "esquerda") return { x: cabeca.x - offset, y: cabeca.y };
    return { x: cabeca.x + offset, y: cabeca.y };
  }

  updateEarPosition(cabeca, offset = 12) {
    if (this.bird.direcao === "esquerda") return { x: cabeca.x - offset, y: cabeca.y };
    return { x: cabeca.x + offset, y: cabeca.y };
  }

  drawCloud(cloud) {
    const bob = Math.sin(this.worldTime * 4 + cloud.phase) * 4;
    const x = cloud.x;
    const y = cloud.y + bob;
    this.g.fillStyle(0xdbeafe, 0.42);
    this.g.fillEllipse(x + cloud.w * 0.48, y + cloud.h * 0.74, cloud.w * 0.9, cloud.h * 0.28);
    this.g.fillStyle(0xffffff, 0.98);
    this.g.fillEllipse(x + cloud.w * 0.22, y + cloud.h * 0.6, cloud.w * 0.44, cloud.h * 0.68);
    this.g.fillEllipse(x + cloud.w * 0.46, y + cloud.h * 0.42, cloud.w * 0.56, cloud.h * 0.88);
    this.g.fillEllipse(x + cloud.w * 0.7, y + cloud.h * 0.62, cloud.w * 0.48, cloud.h * 0.64);
    this.g.fillRoundedRect(x + cloud.w * 0.15, y + cloud.h * 0.52, cloud.w * 0.67, cloud.h * 0.34, cloud.h * 0.17);
    this.g.fillStyle(0x9fb6ce, 0.72);
    this.g.fillCircle(x + cloud.w * 0.38, y + cloud.h * 0.52, 3.5);
    this.g.fillCircle(x + cloud.w * 0.58, y + cloud.h * 0.52, 3.5);
    this.g.lineStyle(2, 0x9fb6ce, 0.56);
    this.g.beginPath();
    this.g.arc(x + cloud.w * 0.48, y + cloud.h * 0.58, 8, 0.12, Math.PI - 0.12);
    this.g.strokePath();
  }

  drawHazard(hazard) {
    if (hazard.type === "balloon") this.drawBalloon(hazard);
    if (hazard.type === "kite") this.drawKite(hazard);
  }

  drawSkyBird(birdHazard) {
    const flap = Math.sin(this.worldTime * 9 + birdHazard.phase) * 8;
    this.g.lineStyle(5, 0x7a4b2b);
    this.g.beginPath();
    this.g.moveTo(birdHazard.x + 4, birdHazard.y + 26);
    this.g.lineTo(birdHazard.x + 20, birdHazard.y + 7 + flap);
    this.g.lineTo(birdHazard.x + 36, birdHazard.y + 26);
    this.g.lineTo(birdHazard.x + 51, birdHazard.y + 7 - flap);
    this.g.lineTo(birdHazard.x + 66, birdHazard.y + 26);
    this.g.strokePath();
    this.g.fillStyle(0xf59e0b);
    this.g.fillCircle(birdHazard.x + 35, birdHazard.y + 28, 8);
  }

  drawBalloon(balloon) {
    this.g.fillStyle(0xf472b6);
    this.g.fillEllipse(balloon.x + 27, balloon.y + 28, 50, 62);
    this.g.fillStyle(0xffffff, 0.42);
    this.g.fillEllipse(balloon.x + 18, balloon.y + 20, 14, 26);
    this.g.lineStyle(2, 0x7a4b2b);
    this.g.lineBetween(balloon.x + 18, balloon.y + 56, balloon.x + 24, balloon.y + 79);
    this.g.lineBetween(balloon.x + 36, balloon.y + 56, balloon.x + 30, balloon.y + 79);
    this.g.fillStyle(0xf4c27a);
    this.g.fillRect(balloon.x + 18, balloon.y + 76, 18, 12);
  }

  drawKite(kite) {
    const bob = Math.sin(this.worldTime * 4 + kite.phase) * 5;
    const cx = kite.x + 34;
    const cy = kite.y + 28 + bob;
    this.g.fillStyle(0xff5ca8);
    this.g.lineStyle(3, 0x9f1239);
    this.g.beginPath();
    this.g.moveTo(cx, cy - 28);
    this.g.lineTo(cx + 28, cy);
    this.g.lineTo(cx, cy + 32);
    this.g.lineTo(cx - 28, cy);
    this.g.closePath();
    this.g.fillPath();
    this.g.strokePath();
    this.g.lineStyle(2, 0xffffff, 0.75);
    this.g.lineBetween(cx, cy - 24, cx, cy + 26);
    this.g.lineBetween(cx - 22, cy, cx + 22, cy);
    this.g.lineStyle(3, 0x7a4b2b, 0.85);
    this.g.beginPath();
    this.g.moveTo(cx, cy + 32);
    this.g.lineTo(cx + 12, cy + 46);
    this.g.lineTo(cx - 8, cy + 59);
    this.g.strokePath();
    this.g.fillStyle(0xffc857);
    this.g.fillCircle(cx + 12, cy + 46, 4);
    this.g.fillCircle(cx - 8, cy + 59, 4);
  }

  drawLightning(lightning) {
    this.g.fillStyle(0xfacc15);
    this.g.lineStyle(3, 0xf59e0b);
    this.g.beginPath();
    this.g.moveTo(lightning.x + 24, lightning.y);
    this.g.lineTo(lightning.x + 6, lightning.y + 48);
    this.g.lineTo(lightning.x + 27, lightning.y + 48);
    this.g.lineTo(lightning.x + 16, lightning.y + 108);
    this.g.lineTo(lightning.x + 43, lightning.y + 40);
    this.g.lineTo(lightning.x + 23, lightning.y + 40);
    this.g.closePath();
    this.g.fillPath();
    this.g.strokePath();
  }

  drawWindGust(wind) {
    this.g.lineStyle(5, 0xffffff, 0.82);
    for (let i = 0; i < 3; i += 1) {
      const y = wind.y + 12 + i * 15;
      this.g.beginPath();
      this.g.moveTo(wind.x + 8, y);
      this.g.lineTo(wind.x + 42, y - 18);
      this.g.lineTo(wind.x + 72, y + 18);
      this.g.lineTo(wind.x + 116, y);
      this.g.strokePath();
    }
  }

  drawStar(star) {
    this.g.fillStyle(0xffffff, 0.34);
    this.g.fillCircle(star.x + star.w / 2, star.y + star.h / 2, 28 + Math.sin(this.worldTime * 8 + star.spin) * 3);
    this.g.fillStyle(0xffca3a);
    this.g.lineStyle(2, 0xd98b00);
    this.g.beginPath();
    for (let i = 0; i < 10; i += 1) {
      const radius = i % 2 === 0 ? 20 : 8;
      const angle = star.spin + (Math.PI * 2 * i) / 10 - Math.PI / 2;
      const x = star.x + star.w / 2 + Math.cos(angle) * radius;
      const y = star.y + star.h / 2 + Math.sin(angle) * radius;
      if (i === 0) this.g.moveTo(x, y); else this.g.lineTo(x, y);
    }
    this.g.closePath();
    this.g.fillPath();
    this.g.strokePath();
  }

  drawCoin(coin) {
    const scale = Math.max(0.34, Math.abs(Math.cos(coin.spin)));
    this.g.fillStyle(0xffca3a);
    this.g.lineStyle(3, 0xd98b00);
    this.g.fillEllipse(coin.x + 16, coin.y + 16, 32 * scale, 32);
    this.g.strokeEllipse(coin.x + 16, coin.y + 16, 32 * scale, 32);
    this.drawText("*", coin.x + 16, coin.y + 5, "22px", "#fff7b8", "center");
  }

  drawHeart(heart) {
    const beat = 1 + Math.sin(this.worldTime * 7 + heart.spin) * 0.08;
    const cx = heart.x + heart.w / 2;
    const cy = heart.y + heart.h / 2;
    this.g.fillStyle(0xffffff, 0.32);
    this.g.fillCircle(cx, cy, 26 * beat);
    this.g.fillStyle(0xff4f8b);
    this.g.lineStyle(3, 0xb91c5c);
    this.g.beginPath();
    this.g.moveTo(cx, cy + 14 * beat);
    this.g.lineTo(cx - 19 * beat, cy - 2 * beat);
    this.g.arc(cx - 10 * beat, cy - 8 * beat, 10 * beat, Math.PI, 0, false);
    this.g.arc(cx + 10 * beat, cy - 8 * beat, 10 * beat, Math.PI, 0, false);
    this.g.lineTo(cx, cy + 14 * beat);
    this.g.closePath();
    this.g.fillPath();
    this.g.strokePath();
  }

  drawEnergyBolt(bolt) {
    this.g.fillStyle(0x38bdf8, 0.2);
    this.g.fillCircle(bolt.x + 24, bolt.y + 36, 36 + Math.sin(this.worldTime * 7 + bolt.spin) * 4);
    this.g.fillStyle(0xfacc15);
    this.g.lineStyle(4, 0x0284c7);
    this.g.beginPath();
    this.g.moveTo(bolt.x + 31, bolt.y);
    this.g.lineTo(bolt.x + 8, bolt.y + 35);
    this.g.lineTo(bolt.x + 27, bolt.y + 35);
    this.g.lineTo(bolt.x + 16, bolt.y + 74);
    this.g.lineTo(bolt.x + 47, bolt.y + 27);
    this.g.lineTo(bolt.x + 28, bolt.y + 27);
    this.g.closePath();
    this.g.fillPath();
    this.g.strokePath();
    this.drawText("2x", bolt.x + 25, bolt.y + 21, "13px", "#0f4c81", "center");
  }

  drawPop(pop) {
    this.g.fillStyle(pop.color, Math.max(0, pop.life));
    this.g.fillCircle(pop.x, pop.y, 4);
  }

  drawSparkle(sparkle) {
    const alpha = Math.max(0, Math.min(1, sparkle.life * 2.4));
    this.g.fillStyle(sparkle.color, alpha);
    this.g.lineStyle(2, 0xffffff, alpha * 0.7);
    this.g.beginPath();
    for (let i = 0; i < 8; i += 1) {
      const radius = i % 2 === 0 ? sparkle.size : sparkle.size * 0.42;
      const angle = sparkle.rotation + (Math.PI * 2 * i) / 8;
      const px = sparkle.x + Math.cos(angle) * radius;
      const py = sparkle.y + Math.sin(angle) * radius;
      if (i === 0) this.g.moveTo(px, py); else this.g.lineTo(px, py);
    }
    this.g.closePath();
    this.g.fillPath();
    this.g.strokePath();
  }

  drawBone(bone) {
    const alpha = Math.max(0, Math.min(1, bone.life));
    const c = Math.cos(bone.rotation);
    const s = Math.sin(bone.rotation);
    const p = (px, py) => ({
      x: bone.x + (px * c - py * s) * bone.size,
      y: bone.y + (px * s + py * c) * bone.size
    });
    const a = p(-13, -5);
    const b = p(-13, 5);
    const c1 = p(13, -5);
    const d = p(13, 5);
    const center = p(0, 0);
    this.g.fillStyle(0xfff8df, alpha);
    this.g.lineStyle(2, 0xd69c4f, alpha);
    this.g.fillCircle(a.x, a.y, 6 * bone.size);
    this.g.fillCircle(b.x, b.y, 6 * bone.size);
    this.g.fillCircle(c1.x, c1.y, 6 * bone.size);
    this.g.fillCircle(d.x, d.y, 6 * bone.size);
    this.g.fillEllipse(center.x, center.y, 32 * bone.size, 12 * bone.size);
    this.g.strokeCircle(a.x, a.y, 6 * bone.size);
    this.g.strokeCircle(b.x, b.y, 6 * bone.size);
    this.g.strokeCircle(c1.x, c1.y, 6 * bone.size);
    this.g.strokeCircle(d.x, d.y, 6 * bone.size);
  }

  drawText(text, x, y, size, color, align = "center") {
    this.labels.setStyle({ fontSize: size, color, align, fontFamily: "Arial", fontStyle: "900" });
    this.labels.setText(text);
    this.labels.setPosition(x, y);
    this.labels.setOrigin(align === "center" ? 0.5 : 0, 0);
    this.labels.setVisible(true);
    this.labels.updateText();
    this.labels.setVisible(false);
    const temp = this.add.text(x, y, text, { fontFamily: "Arial", fontSize: size, fontStyle: "900", color }).setOrigin(align === "center" ? 0.5 : 0, 0);
    temp.setDepth(2);
    this.time.delayedCall(0, () => temp.destroy());
  }
}

if (!window.Phaser) {
  missionText.textContent = "Phaser nao carregou. Verifique a conexao com a internet e recarregue a pagina.";
  throw new Error("Phaser CDN unavailable");
}

const config = {
  type: Phaser.AUTO,
  parent: "gameCanvas",
  width: W,
  height: H,
  backgroundColor: "#8bd7ff",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: CacauScene
};

new Phaser.Game(config);

function openShop() {
  setGameUiState("shop");
  renderShop();
  shopPanel.classList.remove("hidden");
}

function closeShop() {
  shopPanel.classList.add("hidden");
  if (!gameScene?.running) setGameUiState(gameOverPanel.classList.contains("hidden") ? "menu" : "ended");
  else if (gameScene.paused) setGameUiState("paused");
  else setGameUiState("playing");
}

startButton.addEventListener("click", () => {
  startPanel.classList.add("hidden");
  pausePanel.classList.add("hidden");
  gameOverPanel.classList.add("hidden");
  closeShop();
  gameScene?.resetGame();
});

pauseButton.addEventListener("click", () => gameScene?.togglePause());
resumeButton.addEventListener("click", () => gameScene?.resumeGame());
window.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() !== "p" && event.key !== "Escape") return;
  event.preventDefault();
  gameScene?.togglePause();
});

restartButton.addEventListener("click", () => {
  pausePanel.classList.add("hidden");
  gameOverPanel.classList.add("hidden");
  closeShop();
  gameScene?.resetGame();
});

shopButton.addEventListener("click", openShop);
closeShopButton.addEventListener("click", closeShop);

renderShop();
updatePawHud(null);
setGameUiState("menu");
pauseButton.classList.add("hidden");
