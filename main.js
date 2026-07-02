/* ===================================================================
   GALAXIA DE AMOR  ·  Three.js
   - Galaxia espiral de partículas
   - Estrellas grandes de colores
   - Corazón de partículas + haz que sube desde el núcleo
   - Burbujas con fotos que orbitan (clic -> mensaje romántico)
   =================================================================== */

/* Three.js se carga global desde libs/ (ver index.html) */
const OrbitControls = THREE.OrbitControls;

/* Usa la foto incrustada (fotos.js) si existe; si no, la ruta normal.
   Las fotos incrustadas (data:) se ven aunque abras con doble clic (file://). */
function fotoSrc(path) {
  return (window.FOTOS && window.FOTOS[path]) ? window.FOTOS[path] : path;
}

/* -------------------------------------------------------------------
   1. DATOS  ·  edita aquí los mensajes, etiquetas y fotos
   Las fotos van en la carpeta  img/  (img/1.jpg, img/2.jpg, ...)
------------------------------------------------------------------- */
const BUBBLES = [
  { img: 'img/1.jpg',  ring: '#ff4fa3', label: 'Te amo',        title: 'Tu carita',
    text: 'Tu carita es la cosa más hermosa que vi en mi vida.' },
  { img: 'img/2.jpg',  ring: '#ff7bd5', label: 'Mi amor', title: 'Tu sonrisa',
    text: 'Cada sonrisa tuya me llena el corazón.' },
  { img: 'img/3.jpg',  ring: '#9b6bff', label: 'Cosa hermosa',    title: 'Dos almas, un amor',
    text: 'Gracias por cruzarte en mi camino.' },
  { img: 'img/4.jpg',  ring: '#54d6ff', label: 'Mi cielo',   title: 'Nuestras locuras',
    text: 'Cada locura contigo vale la pena.' },
  { img: 'img/5.jpg',  ring: '#ffd166', label: 'Te adoro',   title: 'Amor',
    text: 'Este momento contigo es inolvidable.' },
  { img: 'img/6.jpg',  ring: '#ff4fa3', label: 'Siempre tú',          title: 'Juntos para siempre',
    text: 'Eres lo primero y lo último en mi mente.' },
  { img: 'img/7.jpg',  ring: '#7bffa0', label: 'Mi todo',  title: 'Soy tuyo',
    text: 'Sos mi día a día, mi amor y mi hogar.' },
  { img: 'img/8.jpg',  ring: '#ff7bd5', label: 'Mi corazón',title: 'Mi corazón es tuyo',
    text: 'Simplemente amo tu compañía.' },
  { img: 'img/9.jpg',  ring: '#9b6bff', label: 'Hermosa',title: 'Hermosa',
    text: 'Me encanta todo de ti.' },
  { img: 'img/10.jpg', ring: '#54d6ff', label: 'Mi reina',   title: 'Hermosa',
    text: 'Amo verte y hablarte, mi amor.' },
  { img: 'img/11.jpg', ring: '#ffd166', label: 'Feliz día',  title: 'Mujer perfecta',
    text: 'Espero que estés feliz y que siempre estemos juntos.' },
  { img: 'img/12.jpg', ring: '#ff4fa3', label: 'Mi vida',    title: 'Cosita hermosa',
    text: 'Cada vez que te veo, sonrío como un niño.' },
];

/* -------------------------------------------------------------------
   2. ESCENA BÁSICA
------------------------------------------------------------------- */
const canvas = document.getElementById('webgl');
const scene = new THREE.Scene();

const sizes = { w: window.innerWidth, h: window.innerHeight };

const camera = new THREE.PerspectiveCamera(60, sizes.w / sizes.h, 0.1, 200);
camera.position.set(0, 13, 0.2);          // empieza casi cenital (vista de entrada)
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(sizes.w, sizes.h);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);      // fondo lo pone el CSS (nebulosa)

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;
controls.minDistance = 4;
controls.maxDistance = 16;
controls.minPolarAngle = 0.35;
controls.maxPolarAngle = Math.PI * 0.62;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.55;
controls.enabled = false;                 // se activa al terminar la entrada

/* -------------------------------------------------------------------
   3. TEXTURAS AUXILIARES
------------------------------------------------------------------- */
// Punto circular suave (para estrellas y galaxia)
function makeGlowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0,   'rgba(255,255,255,1)');
  g.addColorStop(0.2, 'rgba(255,255,255,0.9)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.35)');
  g.addColorStop(1,   'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}
const glowTex = makeGlowTexture();

/* -------------------------------------------------------------------
   4. GALAXIA ESPIRAL
------------------------------------------------------------------- */
const galaxyParams = {
  count: 90000,
  radius: 6.2,
  branches: 4,
  spin: 1.05,
  randomness: 0.28,
  randomnessPower: 3.2,
  inside: new THREE.Color('#ff9d54'),   // núcleo cálido
  outside: new THREE.Color('#5b3bff'),  // brazos morado/azul
};

let galaxyPoints;
function buildGalaxy() {
  const positions = new Float32Array(galaxyParams.count * 3);
  const colors = new Float32Array(galaxyParams.count * 3);
  const mixColor = new THREE.Color();

  for (let i = 0; i < galaxyParams.count; i++) {
    const i3 = i * 3;
    const r = Math.pow(Math.random(), 1.4) * galaxyParams.radius;
    const branchAngle = ((i % galaxyParams.branches) / galaxyParams.branches) * Math.PI * 2;
    const spinAngle = r * galaxyParams.spin;

    const rp = galaxyParams.randomnessPower;
    const rand = () =>
      Math.pow(Math.random(), rp) * (Math.random() < 0.5 ? 1 : -1) * galaxyParams.randomness * r;

    const rx = rand(), ry = rand() * 0.45, rz = rand();

    positions[i3]     = Math.cos(branchAngle + spinAngle) * r + rx;
    positions[i3 + 1] = ry;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + rz;

    mixColor.copy(galaxyParams.inside).lerp(galaxyParams.outside, r / galaxyParams.radius);
    // toque rosado en los brazos
    mixColor.lerp(new THREE.Color('#ff4fa3'), Math.random() * 0.25 * (r / galaxyParams.radius));
    colors[i3] = mixColor.r; colors[i3 + 1] = mixColor.g; colors[i3 + 2] = mixColor.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.06,
    map: glowTex,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    transparent: true,
  });

  galaxyPoints = new THREE.Points(geo, mat);
  scene.add(galaxyPoints);
}
buildGalaxy();

/* Núcleo brillante */
const coreMat = new THREE.SpriteMaterial({
  map: glowTex, color: '#ffd9ef', blending: THREE.AdditiveBlending,
  transparent: true, depthWrite: false,
});
const core = new THREE.Sprite(coreMat);
core.scale.set(3.4, 3.4, 1);
scene.add(core);

/* -------------------------------------------------------------------
   5. ESTRELLAS GRANDES DE COLORES (puntos esparcidos)
------------------------------------------------------------------- */
function buildStars() {
  const N = 1400;
  const positions = new Float32Array(N * 3);
  const colors = new Float32Array(N * 3);
  const palette = ['#ff4fa3', '#54d6ff', '#ffe14f', '#7bff8a', '#c46bff', '#ff8a3c', '#ffffff'];
  const col = new THREE.Color();

  for (let i = 0; i < N; i++) {
    const i3 = i * 3;
    const r = 9 + Math.random() * 9;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = r * Math.cos(phi) * 0.7;
    positions[i3 + 2] = r * Math.sin(phi) * Math.sin(theta);

    col.set(palette[(Math.random() * palette.length) | 0]);
    colors[i3] = col.r; colors[i3 + 1] = col.g; colors[i3 + 2] = col.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.42, map: glowTex, sizeAttenuation: true, depthWrite: false,
    blending: THREE.AdditiveBlending, vertexColors: true, transparent: true,
  });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  return pts;
}
const stars = buildStars();

/* -------------------------------------------------------------------
   6. CORAZÓN DE PARTÍCULAS (plano vertical sobre el núcleo)
------------------------------------------------------------------- */
const heartGroup = new THREE.Group();
heartGroup.position.set(0, 3.5, 0);
scene.add(heartGroup);

const particleLabelLayer = document.getElementById('particleLabels');
const particleMessages = [
  { text: 'Te amo', pos: new THREE.Vector3(-2.6, 4.6, 1.3) },
  { text: 'Mi amor', pos: new THREE.Vector3(2.2, 4.2, 0.8) },
  { text: 'Mi cielo', pos: new THREE.Vector3(-1.2, 3.0, 2.1) },
  { text: 'Mi reina', pos: new THREE.Vector3(1.4, 2.6, 1.9) },
  { text: 'Cosa hermosa', pos: new THREE.Vector3(0.0, 4.9, 0.2) },
  { text: 'Siempre tú', pos: new THREE.Vector3(-3.2, 2.2, -0.8) },
];
const particleLabelEls = [];

if (particleLabelLayer) {
  particleMessages.forEach((item) => {
    const el = document.createElement('div');
    el.className = 'particle-label';
    el.textContent = item.text;
    el.style.fontSize = item.text.length > 10 ? '1rem' : '1.2rem';
    particleLabelLayer.appendChild(el);
    particleLabelEls.push({ ...item, el });
  });
}

function updateParticleLabels() {
  if (!particleLabelLayer || !particleLabelEls.length) return;
  const time = clock.elapsedTime;
  particleLabelEls.forEach((item, index) => {
    const worldPos = item.pos.clone();
    worldPos.y += Math.sin(time * 0.7 + index) * 0.04;
    worldPos.project(camera);
    const x = (worldPos.x * 0.5 + 0.5) * sizes.w;
    const y = (-worldPos.y * 0.5 + 0.5) * sizes.h;
    const depth = Math.min(1, Math.max(0.2, 1 - (worldPos.z + 1) * 0.5));
    item.el.style.left = `${x}px`;
    item.el.style.top = `${y}px`;
    item.el.style.opacity = `${0.7 + depth * 0.3}`;
    item.el.style.transform = `translate(-50%, -50%) scale(${0.9 + depth * 0.16})`;
    item.el.style.display = worldPos.z > 1 ? 'none' : 'block';
  });
}

const heartVideoWrap = document.getElementById('heartVideoBtnWrap');
const heartVideoBtn = document.getElementById('heartVideoBtn');
const gameBtnWrap = document.getElementById('gameBtnWrap');
const gameBtn = document.getElementById('gameBtn');
const musicBtnWrap = document.getElementById('musicBtnWrap');
const musicBtn = document.getElementById('musicBtn');
const comingSoonBtnWrap = document.getElementById('comingSoonBtnWrap');
const videoModal = document.getElementById('videoModal');
const gameModal = document.getElementById('gameModal');
const videoPlayer = document.getElementById('heartVideoPlayer');
const closeVideoBtn = document.getElementById('closeVideoBtn');
const closeGameBtn = document.getElementById('closeGameBtn');
const videoMessage = document.getElementById('videoMessage');
const gameCanvas = document.getElementById('gameCanvas');
const gameOverlay = document.getElementById('gameOverlay');
const gameOverlayText = document.getElementById('gameOverlayText');
const gameOverlayBtn = document.getElementById('gameOverlayBtn');
const comingSoonBtn = document.getElementById('comingSoonBtn');
const comingSoonModal = document.getElementById('comingSoonModal');
const closeComingSoonBtn = document.getElementById('closeComingSoonBtn');
const addPhotoBtn = document.getElementById('addPhotoBtn');
const photoUploadInput = document.getElementById('photoUploadInput');
const photoStatus = document.getElementById('photoStatus');
const videoCandidates = ['vid/1.mp4', 'vid/1.webm', 'vid/1.ogg', 'vid/1.m4v', 'vid/1.mov', 'vid/video.mp4', 'vid/video.webm', 'vid/video.ogg', 'vid/video.m4v', 'vid/video.mov'];
const liveClock = document.getElementById('liveClock');
const meetDateText = document.getElementById('meetDateText');
const meetMonthsText = document.getElementById('meetMonthsText');
const proposalDateText = document.getElementById('proposalDateText');
const relationshipMonthsText = document.getElementById('relationshipMonthsText');
const meetDate = new Date(2026, 0, 18);
const proposalDate = new Date(2026, 6, 5);
let videoReady = false;
let bgmWasPlayingBeforeVideo = false;
let gameAnimationId = null;
let nextBubblePhotoIndex = 0;
let gameCtx = null;
let gameState = null;
let gameTouchSide = null;
let gameLastFrame = null;
let gameHasStarted = false;
let gameWinner = null;

function formatSpanishDate(date) {
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
}

function getMonthDiff(startDate, endDate = new Date()) {
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  return Math.max(0, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()));
}

function updateLoveTimeline() {
  if (meetDateText) meetDateText.textContent = formatSpanishDate(meetDate);
  if (proposalDateText) proposalDateText.textContent = formatSpanishDate(proposalDate);
  if (meetMonthsText) meetMonthsText.textContent = `Llevamos ${getMonthDiff(meetDate)} meses`;
  if (relationshipMonthsText) relationshipMonthsText.textContent = `Llevamos ${getMonthDiff(proposalDate)} meses`;
}

function updateClock() {
  if (!liveClock) return;
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  liveClock.textContent = time;
}

updateLoveTimeline();
updateClock();
setInterval(updateLoveTimeline, 60000);
setInterval(updateClock, 1000);

function updateHeartVideoButton() {
  if (!heartVideoWrap) return;
  const anchor = heartGroup.localToWorld(new THREE.Vector3(0, 0.22, 0));
  anchor.project(camera);
  const x = (anchor.x * 0.5 + 0.5) * sizes.w;
  const y = (-anchor.y * 0.5 + 0.5) * sizes.h;
  const distance = camera.position.distanceTo(anchor);
  const scale = Math.max(0.7, Math.min(1.15, 1.18 - distance * 0.06));
  heartVideoWrap.style.left = `${x}px`;
  heartVideoWrap.style.top = `${y}px`;
  heartVideoWrap.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

function tryLoadVideo(index = 0, onReady) {
  if (index >= videoCandidates.length) {
    videoReady = false;
    videoPlayer.classList.add('hidden');
    videoMessage.classList.remove('hidden');
    videoMessage.textContent = 'Sube un video en la carpeta vid para verlo aquí.';
    if (typeof onReady === 'function') onReady(false);
    return;
  }

  const src = videoCandidates[index];
  videoPlayer.src = src;
  videoPlayer.load();
  videoPlayer.preload = 'auto';
  videoPlayer.muted = false;
  videoPlayer.playsInline = true;

  const finish = (ok) => {
    videoPlayer.onloadedmetadata = null;
    videoPlayer.onerror = null;
    videoPlayer.oncanplay = null;
    if (typeof onReady === 'function') onReady(ok);
  };

  videoPlayer.onloadedmetadata = () => {
    videoReady = true;
    videoPlayer.classList.remove('hidden');
    videoMessage.classList.add('hidden');
    finish(true);
  };
  videoPlayer.oncanplay = () => {
    videoReady = true;
    videoPlayer.classList.remove('hidden');
    videoMessage.classList.add('hidden');
    finish(true);
  };
  videoPlayer.onerror = () => {
    tryLoadVideo(index + 1, onReady);
  };
}

function setScenePaused(paused) {
  if (galaxyPoints) galaxyPoints.visible = !paused;
  if (stars) stars.visible = !paused;
  heartGroup.visible = !paused;
  if (beam) beam.visible = !paused;
  bubbleSprites.forEach((sprite) => { sprite.visible = !paused; });
  controls.enabled = !paused;
}

function updateMusicButtonState() {
  if (!musicBtn) return;
  const isPaused = !bgm || bgm.paused || bgm.muted;
  musicBtn.classList.toggle('paused', isPaused);
  musicBtn.classList.toggle('playing', !isPaused);
  const label = musicBtn.querySelector('.music-btn-text');
  if (label) label.textContent = isPaused ? 'REANUDAR' : 'PAUSAR';
  const icon = musicBtn.querySelector('.music-btn-icon');
  if (icon) icon.textContent = isPaused ? '⏸' : '🎵';
  if (musicBtnWrap) {
    musicBtnWrap.setAttribute('aria-hidden', isPaused ? 'true' : 'false');
  }
}

function openVideoModal() {
  bgmWasPlayingBeforeVideo = !bgm.paused && !bgm.muted;
  tryLoadVideo(0, (ok) => {
    videoModal.classList.remove('hidden');
    if (ok) {
      if (bgmWasPlayingBeforeVideo) {
        bgm.pause();
        updateMusicButtonState();
      }
      setScenePaused(true);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      videoPlayer.currentTime = 0;
      videoPlayer.playbackRate = 1;
      videoPlayer.play().catch(() => {});
    }
  });
}

function closeVideoModal() {
  videoModal.classList.add('hidden');
  videoPlayer.pause();
  videoPlayer.currentTime = 0;
  if (bgmWasPlayingBeforeVideo) {
    bgm.play().catch(() => {});
    updateMusicButtonState();
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  setScenePaused(false);
}

function openComingSoonModal() {
  bgmWasPlayingBeforeVideo = !bgm.paused && !bgm.muted;
  comingSoonModal.classList.remove('hidden');
  if (bgmWasPlayingBeforeVideo) {
    bgm.pause();
    updateMusicButtonState();
  }
  setScenePaused(true);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
}

function closeComingSoonModal() {
  comingSoonModal.classList.add('hidden');
  if (bgmWasPlayingBeforeVideo) {
    bgm.play().catch(() => {});
    updateMusicButtonState();
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  setScenePaused(false);
}

function createInitialGameState() {
  return {
    leftY: 0.5,
    rightY: 0.5,
    ballX: 0.5,
    ballY: 0.5,
    ballVx: 0.0052 + Math.random() * 0.0004,
    ballVy: 0.0032 + Math.random() * 0.0004,
    scoreLeft: 0,
    scoreRight: 0,
    lastWinner: Math.random() > 0.5 ? 'left' : 'right',
  };
}

function resetGameState() {
  gameState = createInitialGameState();
  gameWinner = null;
  gameHasStarted = false;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function updateGameState(dt) {
  if (!gameState || !gameHasStarted) return;
  const step = dt * 60;
  const moveSpeed = 0.012 * step;

  if (keys.w) gameState.leftY -= moveSpeed;
  if (keys.s) gameState.leftY += moveSpeed;
  if (keys.arrowUp) gameState.rightY -= moveSpeed;
  if (keys.arrowDown) gameState.rightY += moveSpeed;

  gameState.leftY = clamp(gameState.leftY, 0.08, 0.92);
  gameState.rightY = clamp(gameState.rightY, 0.08, 0.92);

  gameState.ballX += gameState.ballVx * step * 0.8;
  gameState.ballY += gameState.ballVy * step * 0.8;

  if (gameState.ballY <= 0.03 || gameState.ballY >= 0.97) {
    gameState.ballVy *= -1;
    gameState.ballY = clamp(gameState.ballY, 0.03, 0.97);
  }

  const leftX = 0.06;
  const rightX = 0.94;
  const leftPaddleTop = gameState.leftY - 0.12;
  const rightPaddleTop = gameState.rightY - 0.12;

  if (
    gameState.ballX <= leftX + 0.03 &&
    gameState.ballY > leftPaddleTop &&
    gameState.ballY < leftPaddleTop + 0.24
  ) {
    gameState.ballX = leftX + 0.03;
    gameState.ballVx = Math.abs(gameState.ballVx) * 1.001;
    gameState.ballVy += (gameState.ballY - (leftPaddleTop + 0.12)) * 0.008;
  }

  if (
    gameState.ballX >= rightX - 0.03 &&
    gameState.ballY > rightPaddleTop &&
    gameState.ballY < rightPaddleTop + 0.24
  ) {
    gameState.ballX = rightX - 0.03;
    gameState.ballVx = -Math.abs(gameState.ballVx) * 1.001;
    gameState.ballVy += (gameState.ballY - (rightPaddleTop + 0.12)) * 0.008;
  }

  if (gameState.ballX < -0.04) {
    gameState.scoreRight += 1;
    resetBall('right');
  }
  if (gameState.ballX > 1.04) {
    gameState.scoreLeft += 1;
    resetBall('left');
  }

  if (gameState.scoreLeft >= 5 || gameState.scoreRight >= 5) {
    const winnerName = gameState.scoreLeft >= 5 ? 'Leidy' : 'Kevin';
    gameState = createInitialGameState();
    gameWinner = winnerName;
    gameHasStarted = false;
    updateGameOverlay();
  }
}

function resetBall(winner) {
  if (!gameState) return;
  gameState.ballX = 0.5;
  gameState.ballY = 0.5;
  gameState.ballVx = (winner === 'left' ? 0.0052 : -0.0052) + Math.random() * 0.0004;
  gameState.ballVy = (Math.random() - 0.5) * 0.0032;
}

function drawGameScene(ts) {
  if (!gameCtx || !gameCanvas) return;
  const width = gameCanvas.clientWidth;
  const height = gameCanvas.clientHeight;
  if (!width || !height) return;

  const now = performance.now();
  if (!gameState) resetGameState();
  if (gameLastFrame) {
    updateGameState((now - gameLastFrame) / 1000);
  }
  gameLastFrame = now;

  gameCtx.clearRect(0, 0, width, height);

  const sky = gameCtx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, '#fff7ff');
  sky.addColorStop(0.45, '#ffe3f0');
  sky.addColorStop(1, '#ffc2de');
  gameCtx.fillStyle = sky;
  gameCtx.fillRect(0, 0, width, height);

  gameCtx.strokeStyle = 'rgba(255,255,255,0.75)';
  gameCtx.lineWidth = 2.5;
  gameCtx.setLineDash([10, 8]);
  gameCtx.beginPath();
  gameCtx.moveTo(width / 2, 18);
  gameCtx.lineTo(width / 2, height - 18);
  gameCtx.stroke();
  gameCtx.setLineDash([]);

  drawPaddle(gameCtx, 24, (gameState.leftY * height) - 50, width, height, '#ff4fa3');
  drawPaddle(gameCtx, width - 34, (gameState.rightY * height) - 50, width, height, '#4da3ff');

  const ballX = gameState.ballX * width;
  const ballY = gameState.ballY * height;
  gameCtx.beginPath();
  gameCtx.arc(ballX, ballY, Math.max(9, width * 0.014), 0, Math.PI * 2);
  gameCtx.fillStyle = '#726d6d';
  gameCtx.shadowColor = 'rgba(255, 79, 163, 0.9)';
  gameCtx.shadowBlur = 16;
  gameCtx.fill();
  gameCtx.shadowBlur = 0;

  gameCtx.fillStyle = '#2b153b';
  gameCtx.font = '700 24px Poppins, sans-serif';
  gameCtx.textAlign = 'center';
  gameCtx.fillText(`${gameState.scoreLeft}`, width * 0.32, 42);
  gameCtx.fillText(`${gameState.scoreRight}`, width * 0.68, 42);

  gameCtx.font = '500 14px Poppins, sans-serif';
  gameCtx.fillText('Leidy', width * 0.32, height - 18);
  gameCtx.fillText('Kevin', width * 0.68, height - 18);

  gameAnimationId = window.requestAnimationFrame(drawGameScene);
}

function updateGameOverlay() {
  if (!gameOverlay || !gameOverlayText || !gameOverlayBtn) return;
  const showOverlay = !gameHasStarted;
  gameOverlay.classList.toggle('hidden', !showOverlay);
  if (gameWinner) {
    gameOverlayText.textContent = `¡${gameWinner} ganó!`;
    gameOverlayBtn.textContent = 'JUGAR DE NUEVO';
  } else {
    gameOverlayText.textContent = 'Presiona jugar para empezar';
    gameOverlayBtn.textContent = 'JUGAR';
  }
}

function drawPaddle(ctx, x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.shadowColor = `${color}88`;
  ctx.shadowBlur = 18;
  ctx.fillRect(x, y, 12, Math.max(70, height * 0.16));
  ctx.shadowBlur = 0;
}

function startGameAnimation() {
  if (!gameCanvas) return;
  gameCtx = gameCanvas.getContext('2d');
  if (!gameCtx) return;
  const resizeCanvas = () => {
    const rect = gameCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    gameCanvas.width = rect.width * dpr;
    gameCanvas.height = rect.height * dpr;
    gameCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resizeCanvas();
  resetGameState();
  updateGameOverlay();
  window.addEventListener('resize', resizeCanvas);
  gameLastFrame = performance.now();
  gameAnimationId = window.requestAnimationFrame(drawGameScene);
}

function stopGameAnimation() {
  if (gameAnimationId) {
    window.cancelAnimationFrame(gameAnimationId);
    gameAnimationId = null;
  }
  gameLastFrame = null;
}

function openGameModal() {
  bgmWasPlayingBeforeVideo = !bgm.paused && !bgm.muted;
  gameModal.classList.remove('hidden');
  if (bgmWasPlayingBeforeVideo) {
    bgm.pause();
    updateMusicButtonState();
  }
  setScenePaused(true);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  startGameAnimation();
}

function startPongGame() {
  gameState = createInitialGameState();
  gameHasStarted = true;
  gameWinner = null;
  updateGameOverlay();
}

function closeGameModal() {
  gameModal.classList.add('hidden');
  stopGameAnimation();
  if (bgmWasPlayingBeforeVideo) {
    bgm.play().catch(() => {});
    updateMusicButtonState();
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  setScenePaused(false);
}

const keys = { w: false, s: false, arrowUp: false, arrowDown: false };
window.addEventListener('keydown', (e) => {
  if (e.key === 'w' || e.key === 'W') keys.w = true;
  if (e.key === 's' || e.key === 'S') keys.s = true;
  if (e.key === 'ArrowUp') keys.arrowUp = true;
  if (e.key === 'ArrowDown') keys.arrowDown = true;
});
window.addEventListener('keyup', (e) => {
  if (e.key === 'w' || e.key === 'W') keys.w = false;
  if (e.key === 's' || e.key === 'S') keys.s = false;
  if (e.key === 'ArrowUp') keys.arrowUp = false;
  if (e.key === 'ArrowDown') keys.arrowDown = false;
});

if (gameCanvas) {
  gameCanvas.addEventListener('pointerdown', (e) => {
    if (!gameHasStarted) {
      startPongGame();
    }
    const rect = gameCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    gameTouchSide = x < 0.5 ? 'left' : 'right';
  });
  gameCanvas.addEventListener('pointermove', (e) => {
    if (!gameState || !gameTouchSide) return;
    const rect = gameCanvas.getBoundingClientRect();
    const y = (e.clientY - rect.top) / rect.height;
    const clamped = clamp(y, 0.08, 0.92);
    if (gameTouchSide === 'left') gameState.leftY = clamped;
    else gameState.rightY = clamped;
  });
  gameCanvas.addEventListener('pointerup', () => { gameTouchSide = null; });
  gameCanvas.addEventListener('pointerleave', () => { gameTouchSide = null; });
}

if (gameOverlayBtn) {
  gameOverlayBtn.addEventListener('click', () => {
    startPongGame();
  });
}

heartVideoBtn.addEventListener('click', openVideoModal);
gameBtn.addEventListener('click', openGameModal);
if (musicBtn) {
  musicBtn.addEventListener('click', () => {
    if (!bgm) return;
    if (bgm.paused) {
      bgm.play().then(() => updateMusicButtonState()).catch(() => updateMusicButtonState());
    } else {
      bgm.pause();
      updateMusicButtonState();
    }
  });
}
closeVideoBtn.addEventListener('click', closeVideoModal);
closeGameBtn.addEventListener('click', closeGameModal);
closeComingSoonBtn.addEventListener('click', closeComingSoonModal);
videoModal.addEventListener('click', (e) => {
  if (e.target === videoModal) closeVideoModal();
});
gameModal.addEventListener('click', (e) => {
  if (e.target === gameModal) closeGameModal();
});
comingSoonModal.addEventListener('click', (e) => {
  if (e.target === comingSoonModal) closeComingSoonModal();
});

if (comingSoonBtn) {
  comingSoonBtn.addEventListener('click', openComingSoonModal);
}
if (addPhotoBtn) {
  addPhotoBtn.addEventListener('click', () => photoUploadInput.click());
}
if (photoUploadInput) {
  photoUploadInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        applyPhotoToNextBubble(event.target.result);
        if (photoStatus) {
          photoStatus.textContent = `Foto añadida: ${file.name}`;
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  });
}

tryLoadVideo();

function heartXY(t) {
  // ecuación clásica del corazón
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return [x, y];
}
function buildHeart() {
  const N = 4300;
  const positions = new Float32Array(N * 3);
  const s = 0.096;
  for (let i = 0; i < N; i++) {
    const i3 = i * 3;
    const t = Math.random() * Math.PI * 2;
    let [x, y] = heartXY(t);
    // relleno más uniforme para que se vea más compacto y con más puntos
    const k = 0.68 + Math.random() * 0.32;
    x *= k; y *= k;
    positions[i3]     = x * s + (Math.random() - 0.5) * 0.035;
    positions[i3 + 1] = y * s - 0.15 + (Math.random() - 0.5) * 0.035;
    positions[i3 + 2] = (Math.random() - 0.5) * 0.14;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.11, map: glowTex, color: '#ff2e88', sizeAttenuation: true,
    depthWrite: false, blending: THREE.AdditiveBlending, transparent: true,
  });
  heartGroup.add(new THREE.Points(geo, mat));
}
buildHeart();

/* Haz de partículas que sube del núcleo al corazón */
const beamCount = 600;
const beamPos = new Float32Array(beamCount * 3);
const beamSpeed = new Float32Array(beamCount);
for (let i = 0; i < beamCount; i++) {
  const rad = Math.random() * 0.22;
  const a = Math.random() * Math.PI * 2;
  beamPos[i * 3]     = Math.cos(a) * rad;
  beamPos[i * 3 + 1] = Math.random() * 3.5;
  beamPos[i * 3 + 2] = Math.sin(a) * rad;
  beamSpeed[i] = 0.6 + Math.random() * 1.2;
}
const beamGeo = new THREE.BufferGeometry();
beamGeo.setAttribute('position', new THREE.BufferAttribute(beamPos, 3));
const beam = new THREE.Points(beamGeo, new THREE.PointsMaterial({
  size: 0.13, map: glowTex, color: '#ff5ea8', sizeAttenuation: true,
  depthWrite: false, blending: THREE.AdditiveBlending, transparent: true,
}));
scene.add(beam);

/* -------------------------------------------------------------------
   7. BURBUJAS CON FOTOS (sprites que orbitan)
------------------------------------------------------------------- */
const bubbleSprites = [];
const RING_R = 7.2;

function buildBubbleCanvas(b, imageOverride = null) {
  const W = 320, H = 400, R = 150, CX = W / 2, CY = R + 8;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  let tex;

  const draw = (img) => {
    ctx.clearRect(0, 0, W, H);

    ctx.save();
    ctx.shadowColor = b.ring;
    ctx.shadowBlur = 35;
    ctx.beginPath(); ctx.arc(CX, CY, R - 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath(); ctx.arc(CX, CY, R - 12, 0, Math.PI * 2); ctx.clip();
    if (img) {
      const s = Math.max((2 * (R - 12)) / img.width, (2 * (R - 12)) / img.height);
      const dw = img.width * s, dh = img.height * s;
      ctx.drawImage(img, CX - dw / 2, CY - dh / 2, dw, dh);
    } else {
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, b.ring); g.addColorStop(1, '#3a1060');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.font = '120px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('💖', CX, CY);
    }
    ctx.restore();

    ctx.beginPath(); ctx.arc(CX, CY, R - 10, 0, Math.PI * 2);
    ctx.lineWidth = 9; ctx.strokeStyle = b.ring;
    ctx.shadowColor = b.ring; ctx.shadowBlur = 20; ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.arc(CX, CY, R - 16, 0, Math.PI * 2);
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.stroke();

    ctx.font = '600 30px Poppins, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = b.ring; ctx.shadowBlur = 16;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(b.label, CX, H - 42);
    ctx.shadowBlur = 0;

    if (tex) tex.needsUpdate = true;
  };

  draw(null);
  tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;

  if (imageOverride) {
    draw(imageOverride);
  } else {
    const image = new Image();
    image.onload = () => draw(image);
    image.onerror = () => {};
    image.src = fotoSrc(b.img);
  }

  return tex;
}

function buildBubbles() {
  BUBBLES.forEach((b, i) => {
    const tex = buildBubbleCanvas(b);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(mat);

    const a = (i / BUBBLES.length) * Math.PI * 2;
    const yWobble = Math.sin(i * 1.7) * 0.3;
    sprite.position.set(Math.cos(a) * RING_R, yWobble, Math.sin(a) * RING_R);
    sprite.scale.set(1.55, 1.94, 1);
    sprite.userData = { ...b, baseAngle: a, yBase: yWobble };
    scene.add(sprite);
    bubbleSprites.push(sprite);
  });
}

function applyPhotoToNextBubble(dataUrl) {
  if (!bubbleSprites.length) return;
  const sprite = bubbleSprites[nextBubblePhotoIndex % bubbleSprites.length];
  nextBubblePhotoIndex = (nextBubblePhotoIndex + 1) % bubbleSprites.length;
  const image = new Image();
  image.onload = () => {
    const tex = buildBubbleCanvas(sprite.userData, image);
    sprite.material.map = tex;
    sprite.material.needsUpdate = true;
    sprite.material.transparent = true;
    sprite.material.depthWrite = false;
  };
  image.src = dataUrl;
}
// esperar a que cargue la fuente Poppins para que las etiquetas se vean bien
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(buildBubbles);
  setTimeout(() => { if (!bubbleSprites.length) buildBubbles(); }, 1500); // respaldo
} else {
  buildBubbles();
}

/* -------------------------------------------------------------------
   8. INTERACCIÓN  ·  clic en burbuja -> modal
------------------------------------------------------------------- */
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let downXY = null;

function onPointerDown(e) { downXY = { x: e.clientX, y: e.clientY }; }
function onPointerUp(e) {
  if (!downXY) return;
  const moved = Math.hypot(e.clientX - downXY.x, e.clientY - downXY.y);
  downXY = null;
  if (moved > 8) return;                    // fue arrastre, no clic

  pointer.x = (e.clientX / sizes.w) * 2 - 1;
  pointer.y = -(e.clientY / sizes.h) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(bubbleSprites, false);
  if (hits.length) openModal(hits[0].object.userData);
}
canvas.addEventListener('pointerdown', onPointerDown);
canvas.addEventListener('pointerup', onPointerUp);

const modal = document.getElementById('modal');
function openModal(d) {
  document.getElementById('modalTitle').textContent = d.title;
  document.getElementById('modalText').textContent = d.text;
  const img = document.getElementById('modalImg');
  img.src = fotoSrc(d.img);
  img.onerror = () => { img.removeAttribute('src'); };
  modal.classList.remove('hidden');
  controls.autoRotate = false;
}
document.getElementById('closeBtn').addEventListener('click', () => {
  modal.classList.add('hidden');
  controls.autoRotate = true;
});
modal.addEventListener('click', (e) => { if (e.target === modal) document.getElementById('closeBtn').click(); });

/* -------------------------------------------------------------------
   9. INICIO  ·  botón INICIAR -> animación de entrada + música
------------------------------------------------------------------- */
const landing = document.getElementById('landing');
const tip = document.getElementById('tip');
const bgm = document.getElementById('bgm');
let intro = false, introT = 0;

document.getElementById('startBtn').addEventListener('click', () => {
  landing.classList.add('hide');
  intro = true;
  introT = 0;
  if (heartVideoWrap) {
    heartVideoWrap.classList.remove('hidden');
    heartVideoWrap.setAttribute('aria-hidden', 'false');
  }
  if (gameBtnWrap) {
    gameBtnWrap.classList.remove('hidden');
    gameBtnWrap.setAttribute('aria-hidden', 'false');
  }
  if (musicBtnWrap) {
    musicBtnWrap.classList.remove('hidden');
    musicBtnWrap.setAttribute('aria-hidden', 'false');
  }
  if (comingSoonBtnWrap) {
    comingSoonBtnWrap.classList.remove('hidden');
    comingSoonBtnWrap.setAttribute('aria-hidden', 'false');
  }
  bgm.volume = 0.6;
  bgm.play().then(() => updateMusicButtonState()).catch(() => updateMusicButtonState());
  setTimeout(() => tip.classList.remove('hidden'), 3200);
  setTimeout(() => tip.classList.add('hidden'), 9000);
});

// posiciones de cámara para la entrada
const camFrom = new THREE.Vector3(0, 13, 0.2);
const camTo = new THREE.Vector3(0, 3.5, 10);   // ángulo bajo -> disco elíptico como el video
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

/* -------------------------------------------------------------------
   10. BUCLE DE ANIMACIÓN
------------------------------------------------------------------- */
const clock = new THREE.Clock();

function tick() {
  const dt = clock.getDelta();
  const t = clock.elapsedTime;

  // entrada de cámara
  if (intro) {
    introT += dt / 3.4;                     // ~3.4 s
    const k = easeInOut(Math.min(introT, 1));
    camera.position.lerpVectors(camFrom, camTo, k);
    camera.lookAt(0, 0, 0);
    if (introT >= 1) { intro = false; controls.enabled = true; }
  }

  // rotaciones
  if (galaxyPoints) galaxyPoints.rotation.y += dt * 0.06;
  stars.rotation.y -= dt * 0.012;

  // núcleo latiendo
  const pulse = 3.2 + Math.sin(t * 2.0) * 0.25;
  core.scale.set(pulse, pulse, 1);

  // corazón latiendo + leve vaivén
  const hb = 1 + Math.sin(t * 2.2) * 0.06;
  heartGroup.scale.set(hb, hb, hb);
  heartGroup.rotation.z = Math.sin(t * 0.8) * 0.04;

  // haz de partículas subiendo
  const bp = beamGeo.attributes.position.array;
  for (let i = 0; i < beamCount; i++) {
    bp[i * 3 + 1] += beamSpeed[i] * dt;
    if (bp[i * 3 + 1] > 3.5) {
      bp[i * 3 + 1] = 0;
      const rad = Math.random() * 0.22, a = Math.random() * Math.PI * 2;
      bp[i * 3]     = Math.cos(a) * rad;
      bp[i * 3 + 2] = Math.sin(a) * rad;
    }
  }
  beamGeo.attributes.position.needsUpdate = true;

  // burbujas: leve flotación vertical
  for (const s of bubbleSprites) {
    s.position.y = s.userData.yBase + Math.sin(t * 0.9 + s.userData.baseAngle * 2) * 0.18;
  }

  updateHeartVideoButton();
  updateParticleLabels();

  if (controls.enabled) controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

/* -------------------------------------------------------------------
   11. RESIZE
------------------------------------------------------------------- */
window.addEventListener('resize', () => {
  sizes.w = window.innerWidth;
  sizes.h = window.innerHeight;
  camera.aspect = sizes.w / sizes.h;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.w, sizes.h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
