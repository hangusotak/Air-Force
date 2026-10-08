// Pengatur utama game: layar penuh, loop, tabrakan, skor, bonus, musuh besar, bos
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const act = document.getElementById('act');   // tombol MULAI / MAIN LAGI
const W = 480;
const POINTS = 25;            // skor per musuh biasa (ubah di sini kalau terlalu cepat/lambat)
const MID_AT = 3 * 60;        // Bos 1 muncul di detik ke-180 (3 menit)
const BOSS_AT = 5 * 60;       // Bos Besar muncul di detik ke-300 (5 menit)
let H = 720, bgG, bgH;

let score, lives, over, won, frame, shake, sparks, bonusAt, midDone, bossDone;
let started = false, cd = 0, overAt = 0;   // started: sudah klik MULAI, cd: hitung mundur, overAt: waktu game over
const stars = Array.from({ length: 60 }, () => ({
  x: Math.random() * W, y: Math.random() * 1000, s: Math.random() * 2 + 0.5
}));

// Tinggi game menyesuaikan layar HP supaya penuh atas-bawah
function resize() {
  H = Math.max(640, Math.min(1100, Math.round(W * innerHeight / innerWidth)));
  canvas.width = W; canvas.height = H;
  const s = Math.min(innerWidth / W, innerHeight / H);
  canvas.style.width = W * s + 'px';
  canvas.style.height = H * s + 'px';
}
addEventListener('resize', resize);
resize();

// Tombol & tombol keyboard PAUSE (P / Esc). Otomatis pause kalau pindah tab/aplikasi
const pauseBtn = document.getElementById('pause');
let paused = false;

// ===== BARU: Menu pause, tombol "Lanjutkan" & "Mulai Ulang" di tengah layar =====
const pauseMenu = document.createElement('div');
pauseMenu.style.cssText = 'position:fixed;transform:translateX(-50%);display:none;flex-direction:column;gap:14px;z-index:50;';

function menuBtn(text, bg, shadow, onClick) {   // membuat 1 tombol dan memasukkannya ke menu
  const b = document.createElement('button');
  b.textContent = text;
  b.style.cssText = 'width:220px;height:54px;border:0;border-radius:28px;color:#fff;font:bold 20px sans-serif;' +
    'cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;' +
    'background:' + bg + ';box-shadow:' + shadow + ';';
  b.addEventListener('click', () => { b.blur(); onClick(); });
  pauseMenu.appendChild(b);
}
menuBtn('Lanjutkan', '#e63946', '0 4px 0 #9d1f2a', () => setPause(false));
menuBtn('Mulai Ulang', 'rgba(30,40,70,0.95)', 'inset 0 0 0 2px rgba(255,255,255,0.4)', restartGame);
document.body.appendChild(pauseMenu);

// Letakkan menu di tengah area game (mengikuti ukuran layar)
function placePauseMenu() {
  const r = canvas.getBoundingClientRect();
  pauseMenu.style.left = r.left + r.width / 2 + 'px';
  pauseMenu.style.top = r.top + (H / 2 - 25) * (r.height / H) + 'px';
}
addEventListener('resize', placePauseMenu);

// Mulai Ulang: reset semua, lalu hitung mundur 3-2-1 seperti saat menekan MULAI
function restartGame() {
  setPause(false);
  reset();
  started = true; cd = 180;
}

function setPause(v) {
  if (over || won || !started) v = false;
  paused = v; Sound.paused = v;
  Input.touchX = null; Input.touchY = null;
  pauseBtn.textContent = v ? '▶' : '⏸';
  pauseMenu.style.display = v ? 'flex' : 'none';   // tampilkan / sembunyikan menu
  if (v) placePauseMenu();
}
// ===== akhir bagian BARU =====

pauseBtn.addEventListener('click', () => setPause(!paused));
addEventListener('keydown', e => { if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') setPause(!paused); });
document.addEventListener('visibilitychange', () => { if (document.hidden) setPause(true); });

function hit(a, b) {
  return Math.abs(a.x - b.x) < (a.w + b.w) / 2 && Math.abs(a.y - b.y) < (a.h + b.h) / 2;
}

// Ledakan: asap (k:'s'), bola api (k:'f'), dan gelombang kejut (k:'r')
function explode(x, y, n) {
  const m = sparks.length > 200 ? n * 0.4 : n;   // batasi partikel supaya tidak berat
  for (let i = 0; i < m / 3; i++) {
    const a = Math.random() * 6.28, v = Math.random() * 1.5, l = 40 + Math.random() * 30;
    sparks.push({ k: 's', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.4, life: l, max: l, r: 6 + Math.random() * 6 });
  }
  for (let i = 0; i < m; i++) {
    const a = Math.random() * 6.28, v = Math.random() * (2 + n / 15), l = 25 + Math.random() * 25;
    sparks.push({ k: 'f', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.5, life: l, max: l, r: 4 + Math.random() * 5 + n / 12 });
  }
  sparks.push({ k: 'r', x, y, vx: 0, vy: 0, life: 18, max: 18, r: n / 2 + 14 });
}

function reset() {
  score = 0; lives = 3; over = false; won = false; frame = 0; shake = 0; sparks = []; Sound.boss = false;
  bonusAt = 500; midDone = false; bossDone = false;
  Player.reset(); Enemies.reset(); Bonus.reset(); Big.reset();
  overAt = 0; act.style.display = 'none';
}

// Klik MULAI / MAIN LAGI -> hitung mundur 3-2-1 -> game jalan
function activate() {
  if (act.style.display === 'none') return;
  if (started) reset();
  started = true; cd = 180;
  act.style.display = 'none'; act.blur();
  const ib = document.getElementById('install'); if (ib) ib.style.display = 'none';
}
act.addEventListener('click', activate);
addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') activate(); });

// Pesawat kita terkena serangan. Pelindung menahan SEMUA tembakan & benturan selama aktif
function hurt() {
  if (Player.shield > 0) { // pelindung aktif: nyawa & senjata aman
    if (Player.sf === 0) { Player.sf = 15; shake = 4; Sound.hurt(); explode(Player.x, Player.y, 10); }
    return;
  }
  if (Player.inv > 0) return;
  Player.inv = 90; shake = 14; Sound.hurt(); explode(Player.x, Player.y, 30);
  Player.weapon = 'normal'; Player.wt = 0;
  if (--lives <= 0) { over = true; explode(Player.x, Player.y, 60); }
}

function damageBig(n) {
  const B = Big.e;
  B.hp -= n; B.flash = 4;
  if (B.hp > 0) return;
  const boss = B.type === 'boss';
  for (let i = 0; i < (boss ? 6 : 3); i++)
    explode(B.x + (Math.random() - 0.5) * B.w, B.y + (Math.random() - 0.5) * B.h, boss ? 60 : 40);
  Sound.boom(); shake = boss ? 25 : 15;
  score += boss ? 1000 : 200;
  if (boss) { won = true; Sound.boss = false; }
  Big.e = null; EB.length = 0;
}

function update() {
  if (paused) return;
  stars.forEach(s => { s.y += s.s; if (s.y > H) { s.y = 0; s.x = Math.random() * W; } });
  sparks.forEach(p => { p.x += p.vx; p.y += p.vy; p.vx *= 0.96; p.vy = p.vy * 0.96 - 0.02; p.life--; });
  sparks = sparks.filter(p => p.life > 0);

  if (!started) return;
  if (over || won) {                       // tombol MAIN LAGI baru muncul setelah 1,5 detik
    if (!overAt) overAt = performance.now();
    if (performance.now() - overAt > 1500) { act.textContent = 'MAIN LAGI'; act.style.display = 'block'; }
    Input.tap = false;
    return;
  }
  Input.tap = false;
  if (cd > 0) { cd--; return; }
  frame++;

  const level = Math.min(10, Math.floor(score / 300) + 1);
  if (!Big.e) {                                           // munculkan musuh besar / bos
    if (!midDone && frame >= MID_AT * 60) { Big.spawn('mid'); midDone = true; }
    else if (midDone && !bossDone && frame >= BOSS_AT * 60) { Big.spawn('boss'); bossDone = true; }
  }
  if (score >= bonusAt) { Bonus.spawn(); bonusAt += 500; } // bonus tiap kelipatan 500

  Player.update(); Enemies.update(level, W, !Big.e); Bonus.update(); Big.update();
  Sound.boss = !!Big.e && Big.e.type === 'boss';
  Sound.step = Sound.boss ? 140 : Big.e ? 120 : 170;

  Enemies.list.forEach(e => {
    Player.bullets.forEach(b => {
      if (!e.dead && !b.dead && hit({ x: b.x, y: b.y + b.h / 2, w: b.w, h: b.h }, e)) {
        e.dead = true; b.dead = true; score += POINTS;
        explode(e.x, e.y, 22); Sound.boom();
      }
    });
    if (!e.dead && hit(Player, e)) { e.dead = true; explode(e.x, e.y, 20); hurt(); }
  });
  Enemies.list = Enemies.list.filter(e => !e.dead && e.y < H + 40);

  Player.bullets.forEach(b => {
    if (Big.e && !b.dead && hit({ x: b.x, y: b.y + b.h / 2, w: b.w, h: b.h }, Big.e)) { b.dead = true; damageBig(1); }
  });
  if (Big.e && hit(Player, { x: Big.e.x, y: Big.e.y, w: Big.e.w * 0.7, h: Big.e.h * 0.7 })) hurt();
  for (let i = EB.length - 1; i >= 0; i--) {
    if (hit({ x: EB[i].x, y: EB[i].y, w: 8, h: 8 }, { x: Player.x, y: Player.y, w: 22, h: 30 })) { EB.splice(i, 1); hurt(); }
  }

  Bonus.list.forEach(p => {
    if (p.got || !hit(Player, p)) return;
    p.got = true; Sound.power();
    if (p.t === 'shield') Player.shield = 900;
    else if (p.t === 'mega') { Player.weapon = 'mega'; Player.wt = 600; }
    else if (p.t === 'life') lives = Math.min(5, lives + 1);
    else {                                                // bom
      Enemies.list.forEach(e => { if (!e.dead) { e.dead = true; score += POINTS; explode(e.x, e.y, 18); } });
      if (Big.e) damageBig(10);
      EB.length = 0; Sound.boom(); shake = 12;
    }
  });
}

// ===== HUD (tampilan atas) =====
const fmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');

function panel(x, y, w, h) { // kotak semi-transparan dengan sudut membulat
  const r = 12;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fillStyle = 'rgba(8,16,40,0.65)'; ctx.fill();
  ctx.strokeStyle = 'rgba(125,243,255,0.35)'; ctx.lineWidth = 1.5; ctx.stroke();
}

function drawHud() {
  const level = Math.min(10, Math.floor(score / 300) + 1);
  ctx.textAlign = 'left';

  panel(10, 10, 160, 44); // panel kiri: skor
  ctx.fillStyle = '#8fb4e8'; ctx.font = 'bold 11px sans-serif'; ctx.fillText('SKOR', 22, 27);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 22px sans-serif'; ctx.fillText(score, 22, 47);

  panel(310, 10, 160, 44); // panel kanan: nyawa (hati) & level
  ctx.fillStyle = '#8fb4e8'; ctx.font = 'bold 11px sans-serif'; ctx.fillText('NYAWA', 322, 27);
  ctx.font = '18px sans-serif';
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i < lives ? '#ff4d6d' : 'rgba(255,255,255,0.2)';
    ctx.fillText('♥', 322 + i * 18, 47);
  }
  ctx.textAlign = 'right';
  ctx.fillStyle = '#8fb4e8'; ctx.font = 'bold 11px sans-serif'; ctx.fillText('LEVEL', 458, 27);
  ctx.fillStyle = '#ffd23f'; ctx.font = 'bold 22px sans-serif'; ctx.fillText(level, 458, 47);

  // waktu & hitung mundur bos
  ctx.font = 'bold 11px sans-serif'; ctx.fillStyle = '#cfe3ff';
  ctx.textAlign = 'left'; ctx.fillText('WAKTU ' + fmt(Math.floor(frame / 60)), 12, 68);
  let info = '';
  if (Big.e) info = Big.e.type === 'boss' ? 'BOS BESAR MENYERANG!' : 'BOS 1 MENYERANG!';
  else if (!midDone) info = 'Bos 1 dalam ' + fmt(Math.max(0, Math.ceil((MID_AT * 60 - frame) / 60)));
  else if (!bossDone) info = 'Bos Besar dalam ' + fmt(Math.max(0, Math.ceil((BOSS_AT * 60 - frame) / 60)));
  ctx.textAlign = 'right'; ctx.fillStyle = Big.e ? '#ff5d8f' : '#cfe3ff';
  ctx.fillText(info, W - 12, 68);

  const bw = W - 20; // bar kemajuan menuju Bos Besar, garis kuning = Bos 1
  ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(10, 73, bw, 6);
  ctx.fillStyle = '#ff5d8f'; ctx.fillRect(10, 73, bw * Math.min(1, frame / (BOSS_AT * 60)), 6);
  ctx.fillStyle = '#ffd23f'; ctx.fillRect(10 + bw * MID_AT / BOSS_AT - 1, 70, 2, 12);
}

function draw() {
  ctx.save();
  if (shake > 0.5) { ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake); shake *= 0.9; }
  else shake = 0;
  if (bgH !== H) {                               // gradient latar disimpan, tidak dibuat ulang tiap frame
    bgG = ctx.createLinearGradient(0, 0, 0, H);
    bgG.addColorStop(0, '#050a1c'); bgG.addColorStop(1, '#14305f');
    bgH = H;
  }
  ctx.fillStyle = bgG; ctx.fillRect(-20, -20, W + 40, H + 40);
  ctx.fillStyle = '#b9ccf0';
  stars.forEach(s => ctx.fillRect(s.x, s.y, s.s, s.s * (1 + s.s)));

  Bonus.draw(ctx, frame); Player.draw(ctx); Enemies.draw(ctx); Big.draw(ctx);
  sparks.forEach(p => {                                  // asap & gelombang kejut
    const t = p.life / p.max;
    if (p.k === 'r') {
      ctx.globalAlpha = t * 0.8; ctx.strokeStyle = '#ffd9a0'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1 - t) + 4, 0, 7); ctx.stroke();
    } else if (p.k === 's') {
      ctx.globalAlpha = t * 0.45; ctx.fillStyle = '#2b2b33';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (2 - t), 0, 7); ctx.fill();
    }
  });
  ctx.globalAlpha = 0.9;                                 // api digambar per warna (lebih ringan)
  ctx.globalCompositeOperation = 'lighter';
  ['#d62828', '#ff9f1c', '#fff1b0'].forEach((c, ci) => {
    ctx.fillStyle = c; ctx.beginPath();
    sparks.forEach(p => {
      if (p.k !== 'f') return;
      const t = p.life / p.max, r = p.r * t + 1;
      if ((t > 0.66 ? 2 : t > 0.33 ? 1 : 0) !== ci) return;
      ctx.moveTo(p.x + r, p.y); ctx.arc(p.x, p.y, r, 0, 7);
    });
    ctx.fill();
  });
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.restore();

  drawHud();
  ctx.textAlign = 'left'; ctx.font = '16px sans-serif'; ctx.fillStyle = '#06d6a0';
  if (Player.wt > 0) ctx.fillText('Peluru Super (' + Math.ceil(Player.wt / 60) + 'd)', 14, 104);
  if (Player.shield > 0) { ctx.fillStyle = '#7df3ff'; ctx.fillText('Pelindung (' + Math.ceil(Player.shield / 60) + 'd)', 14, 126); }

  if (started && cd === 0 && frame < 240 && !over) {
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.textAlign = 'center'; ctx.font = '16px sans-serif';
    ctx.fillText('Geser jari / tombol ◀ ▶ untuk bergerak', W / 2, H - 130);
  }
  if (!started) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center'; ctx.fillStyle = '#4cc9f0'; ctx.font = 'bold 52px sans-serif';
    ctx.fillText('AIR FORCE', W / 2, H / 2 - 60);
    ctx.fillStyle = '#fff'; ctx.font = '18px sans-serif';
    ctx.fillText('Ajak temanmu, lalu tekan MULAI bersama-sama', W / 2, H / 2 - 20);
    ctx.fillText('Setelah itu ada hitung mundur 3 - 2 - 1', W / 2, H / 2 + 8);
  } else if (cd > 0) {
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = 'bold 96px sans-serif';
    ctx.fillText(Math.ceil(cd / 60), W / 2, H / 2 + 30);
  }
  if (paused) {                                          // BARU: tulisan PAUSE saja, tombol ada di menu HTML
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = 'bold 40px sans-serif';
    ctx.fillText('PAUSE', W / 2, H / 2 - 50);
  }
  if (over || won) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = won ? '#ffd23f' : '#fff'; ctx.textAlign = 'center'; ctx.font = '36px sans-serif';
    ctx.fillText(won ? 'MENANG!' : 'Game Over', W / 2, H / 2 - 10);
    ctx.fillStyle = '#fff'; ctx.font = '18px sans-serif';
    if (won) ctx.fillText('Bos utama berhasil dihancurkan', W / 2, H / 2 + 18);
    ctx.fillText('Skor akhir: ' + score, W / 2, H / 2 + 46);
  }
}

// Waktu game dibuat tetap 60 langkah/detik, jadi kecepatannya sama di HP 60Hz maupun 120Hz
// Tambahkan ?fps di akhir alamat web (contoh: .../index.html?fps) untuk melihat angka FPS di layar
const showFps = location.search.includes('fps');
let last = 0, acc = 0, fpsN = 0, fpsT = 0, fpsV = 0;
function loop(now) {
  acc += Math.min(100, now - last); last = now;
  let n = 0;
  while (acc >= 14 && n < 3) { update(); acc -= 16.67; n++; }
  if (n === 3) acc = 0;
  draw();
  if (showFps) {
    fpsN++;
    if (now - fpsT >= 500) { fpsV = Math.round(fpsN * 1000 / (now - fpsT)); fpsN = 0; fpsT = now; }
    ctx.fillStyle = '#0f0'; ctx.font = '14px monospace'; ctx.textAlign = 'center';
    ctx.fillText('FPS ' + fpsV, W / 2, 76);
  }
  requestAnimationFrame(loop);
}
reset();
act.textContent = 'MULAI'; act.style.display = 'block';
requestAnimationFrame(t => { last = t; loop(t); });
