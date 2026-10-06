// Pengatur utama game: layar penuh, loop, tabrakan, skor, bonus, musuh besar, bos
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = 480;
const POINTS = 25;            // skor per musuh biasa (ubah di sini kalau terlalu cepat/lambat)
let H = 720;

let score, lives, over, won, frame, shake, sparks, bonusAt, midDone, bossDone;
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

function hit(a, b) {
  return Math.abs(a.x - b.x) < (a.w + b.w) / 2 && Math.abs(a.y - b.y) < (a.h + b.h) / 2;
}

function explode(x, y, n) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.28, v = 1 + Math.random() * 4;
    sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 30 + Math.random() * 20,
                  c: ['#ffd23f', '#ff9f1c', '#ef476f'][Math.floor(Math.random() * 3)] });
  }
}

function reset() {
  score = 0; lives = 3; over = false; won = false; frame = 0; shake = 0; sparks = [];
  bonusAt = 500; midDone = false; bossDone = false;
  Player.reset(); Enemies.reset(); Bonus.reset(); Big.reset();
}

// Pesawat kita tertabrak: bonus langsung hilang (pelindung hanya menahan 1 serangan)
function hurt() {
  if (Player.inv > 0) return;
  Player.inv = 90; shake = 14; Sound.hurt(); explode(Player.x, Player.y, 30);
  Player.weapon = 'normal'; Player.wt = 0;
  if (Player.shield > 0) { Player.shield = 0; return; }
  if (--lives <= 0) { over = true; explode(Player.x, Player.y, 60); }
}

function damageBig(n) {
  const B = Big.e;
  B.hp -= n; B.flash = 4;
  if (B.hp > 0) return;
  const boss = B.type === 'boss';
  explode(B.x, B.y, boss ? 130 : 70); Sound.boom(); shake = boss ? 25 : 15;
  score += boss ? 1000 : 200;
  if (boss) won = true;
  Big.e = null; EB.length = 0;
}

function update() {
  stars.forEach(s => { s.y += s.s; if (s.y > H) { s.y = 0; s.x = Math.random() * W; } });
  sparks.forEach(p => { p.x += p.vx; p.y += p.vy; p.life--; });
  sparks = sparks.filter(p => p.life > 0);

  if (over || won) {
    if (Input.keys['enter'] || Input.tap) reset();
    Input.tap = false;
    return;
  }
  Input.tap = false; frame++;

  const level = Math.min(10, Math.floor(score / 300) + 1);
  if (!Big.e) {                                           // munculkan musuh besar / bos
    if (!midDone && score >= 3000) { Big.spawn('mid'); midDone = true; }
    else if (midDone && !bossDone && score >= 5000) { Big.spawn('boss'); bossDone = true; }
  }
  if (score >= bonusAt) { Bonus.spawn(); bonusAt += 500; } // bonus tiap kelipatan 500

  Player.update(); Enemies.update(level, W, !Big.e); Bonus.update(); Big.update();
  Sound.step = Big.e ? 120 : 170;

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

function draw() {
  ctx.save();
  if (shake > 0) { ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake); shake *= 0.9; }
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#050a1c'); bg.addColorStop(1, '#14305f');
  ctx.fillStyle = bg; ctx.fillRect(-20, -20, W + 40, H + 40);
  ctx.fillStyle = '#b9ccf0';
  stars.forEach(s => ctx.fillRect(s.x, s.y, s.s, s.s * (1 + s.s)));

  Bonus.draw(ctx, frame); Player.draw(ctx); Enemies.draw(ctx); Big.draw(ctx);
  sparks.forEach(p => {
    ctx.globalAlpha = Math.min(1, p.life / 25); ctx.fillStyle = p.c;
    ctx.beginPath(); ctx.arc(p.x, p.y, 2 + p.life / 12, 0, 7); ctx.fill();
  });
  ctx.globalAlpha = 1;
  ctx.restore();

  ctx.fillStyle = '#fff'; ctx.font = '18px sans-serif';
  ctx.textAlign = 'left'; ctx.fillText('Skor: ' + score, 14, 28);
  ctx.textAlign = 'right';
  ctx.fillText('Nyawa: ' + lives + '  Level: ' + Math.min(10, Math.floor(score / 300) + 1), W - 14, 28);
  ctx.textAlign = 'left'; ctx.fillStyle = '#06d6a0';
  if (Player.wt > 0) ctx.fillText('Peluru Super (' + Math.ceil(Player.wt / 60) + 'd)', 14, 52);
  if (Player.shield > 0) { ctx.fillStyle = '#7df3ff'; ctx.fillText('Pelindung (' + Math.ceil(Player.shield / 60) + 'd)', 14, 74); }

  if (frame < 240 && !over) {
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.textAlign = 'center'; ctx.font = '16px sans-serif';
    ctx.fillText('Geser jari / tombol ◀ ▶ untuk bergerak', W / 2, H - 130);
  }
  if (over || won) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = won ? '#ffd23f' : '#fff'; ctx.textAlign = 'center'; ctx.font = '36px sans-serif';
    ctx.fillText(won ? 'MENANG!' : 'Game Over', W / 2, H / 2 - 10);
    ctx.fillStyle = '#fff'; ctx.font = '18px sans-serif';
    if (won) ctx.fillText('Bos utama berhasil dihancurkan', W / 2, H / 2 + 18);
    ctx.fillText('Skor akhir: ' + score, W / 2, H / 2 + 46);
    ctx.fillText('Tekan Enter / sentuh layar untuk main lagi', W / 2, H / 2 + 76);
  }
}

function loop() { update(); draw(); requestAnimationFrame(loop); }
reset();
loop();
