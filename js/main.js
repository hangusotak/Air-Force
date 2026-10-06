// Pengatur utama game: loop, tabrakan, skor, nyawa, ledakan
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

let score = 0, lives = 3, over = false, frame = 0, shake = 0, sparks = [];
const stars = Array.from({ length: 60 }, () => ({
  x: Math.random() * W, y: Math.random() * H, s: Math.random() * 2 + 0.5
}));
const weaponName = { spread: 'Tembak 3 Arah', rapid: 'Tembak Cepat' };

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
  score = 0; lives = 3; over = false; frame = 0; sparks = [];
  Player.reset(); Enemies.reset(); Powerups.reset();
}

function update() {
  stars.forEach(s => { s.y += s.s; if (s.y > H) { s.y = 0; s.x = Math.random() * W; } });
  sparks.forEach(p => { p.x += p.vx; p.y += p.vy; p.life--; });
  sparks = sparks.filter(p => p.life > 0);

  if (over) {
    if (Input.keys['enter'] || Input.tap) reset();
    Input.tap = false;
    return;
  }
  Input.tap = false;
  frame++;

  const level = Math.floor(score / 100) + 1;
  Player.update(W); Enemies.update(level, W); Powerups.update();

  Enemies.list.forEach(e => {
    Player.bullets.forEach(b => {
      if (!e.dead && !b.dead && hit({ x: b.x, y: b.y + b.h / 2, w: b.w, h: b.h }, e)) {
        e.dead = true; b.dead = true; score += 10;
        explode(e.x, e.y, 22); Sound.boom(); Powerups.drop(e.x, e.y);
      }
    });
    if (!e.dead && Player.inv === 0 && hit(Player, e)) {
      e.dead = true; lives--; Player.inv = 90; shake = 14;
      explode(e.x, e.y, 30); Sound.hurt();
      if (lives <= 0) { over = true; explode(Player.x, Player.y, 50); }
    }
  });
  Powerups.list.forEach(p => {
    if (!p.got && hit(Player, p)) {
      p.got = true; Sound.power();
      if (p.t === 'heart') lives = Math.min(5, lives + 1);
      else { Player.weapon = p.t; Player.wt = 600; }
    }
  });
  Enemies.list = Enemies.list.filter(e => !e.dead && e.y < H + 40);
  Player.bullets = Player.bullets.filter(b => !b.dead);
}

function draw() {
  ctx.save();
  if (shake > 0) { ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake); shake *= 0.9; }
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#050a1c'); bg.addColorStop(1, '#14305f');
  ctx.fillStyle = bg; ctx.fillRect(-20, -20, W + 40, H + 40);
  ctx.fillStyle = '#b9ccf0';
  stars.forEach(s => ctx.fillRect(s.x, s.y, s.s, s.s * (1 + s.s)));  // bintang panjang = terasa bergerak cepat

  Powerups.draw(ctx); Player.draw(ctx); Enemies.draw(ctx);
  sparks.forEach(p => {
    ctx.globalAlpha = Math.min(1, p.life / 25); ctx.fillStyle = p.c;
    ctx.beginPath(); ctx.arc(p.x, p.y, 2 + p.life / 12, 0, 7); ctx.fill();
  });
  ctx.globalAlpha = 1;
  ctx.restore();

  ctx.fillStyle = '#fff'; ctx.font = '18px sans-serif';
  ctx.textAlign = 'left'; ctx.fillText('Skor: ' + score, 14, 28);
  ctx.textAlign = 'right'; ctx.fillText('Nyawa: ' + lives + '  Level: ' + (Math.floor(score / 100) + 1), W - 14, 28);
  if (Player.wt > 0) {
    ctx.textAlign = 'left'; ctx.fillStyle = '#06d6a0';
    ctx.fillText(weaponName[Player.weapon] + ' (' + Math.ceil(Player.wt / 60) + 'd)', 14, 52);
  }
  if (frame < 240 && !over) {
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.textAlign = 'center'; ctx.font = '16px sans-serif';
    ctx.fillText('Geser jari di layar / tombol panah untuk bergerak', W / 2, H - 40);
  }
  if (over) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = '36px sans-serif';
    ctx.fillText('Game Over', W / 2, H / 2 - 10);
    ctx.font = '18px sans-serif';
    ctx.fillText('Skor akhir: ' + score, W / 2, H / 2 + 24);
    ctx.fillText('Tekan Enter / sentuh layar untuk main lagi', W / 2, H / 2 + 56);
  }
}

function loop() { update(); draw(); requestAnimationFrame(loop); }
reset();
loop();
