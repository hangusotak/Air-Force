// Pengatur utama game: loop, tabrakan, skor, nyawa
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

let score = 0, lives = 3, over = false;
const stars = Array.from({ length: 50 }, () => ({
  x: Math.random() * W, y: Math.random() * H, s: Math.random() * 2 + 0.5
}));

function hit(a, b) {
  return Math.abs(a.x - b.x) < (a.w + b.w) / 2 && Math.abs(a.y - b.y) < (a.h + b.h) / 2;
}

function reset() {
  score = 0; lives = 3; over = false;
  Player.reset(); Enemies.reset();
}

function update() {
  stars.forEach(s => { s.y += s.s; if (s.y > H) { s.y = 0; s.x = Math.random() * W; } });

  if (over) {
    if (Input.keys['enter'] || Input.tap) reset();
    Input.tap = false;
    return;
  }
  Input.tap = false;

  const level = Math.floor(score / 100) + 1;
  Player.update(W);
  Enemies.update(level, W);

  Enemies.list.forEach(e => {
    Player.bullets.forEach(b => {
      if (!e.dead && !b.dead && hit({ x: b.x, y: b.y + b.h / 2, w: b.w, h: b.h }, e)) {
        e.dead = true; b.dead = true; score += 10;
      }
    });
    if (!e.dead && Player.inv === 0 && hit(Player, e)) {
      e.dead = true; lives--; Player.inv = 90;
      if (lives <= 0) over = true;
    }
  });
  Enemies.list = Enemies.list.filter(e => !e.dead && e.y < H + 40);
  Player.bullets = Player.bullets.filter(b => !b.dead);
}

function draw() {
  ctx.fillStyle = '#0e1a38';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#9fb3d9';
  stars.forEach(s => ctx.fillRect(s.x, s.y, s.s, s.s));

  Player.draw(ctx);
  Enemies.draw(ctx);

  ctx.fillStyle = '#fff';
  ctx.font = '18px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Skor: ' + score, 14, 28);
  ctx.textAlign = 'right';
  ctx.fillText('Nyawa: ' + lives + '  Level: ' + (Math.floor(score / 100) + 1), W - 14, 28);

  if (over) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = '36px sans-serif';
    ctx.fillText('Game Over', W / 2, H / 2 - 10);
    ctx.font = '18px sans-serif';
    ctx.fillText('Skor akhir: ' + score, W / 2, H / 2 + 24);
    ctx.fillText('Tekan Enter / sentuh layar untuk main lagi', W / 2, H / 2 + 56);
  }
}

function loop() { update(); draw(); requestAnimationFrame(loop); }
reset();
loop();
