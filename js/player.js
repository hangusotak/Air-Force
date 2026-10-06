// Pesawat pemain: gerak, tembak, bonus peluru super (mega) & pelindung (shield)
const Player = {
  x: 240, y: 600, w: 36, h: 44, speed: 5,
  cd: 0, inv: 0, bullets: [], weapon: 'normal', wt: 0, shield: 0, tilt: 0,

  reset() {
    this.x = W / 2; this.y = H - 140; this.cd = 0; this.inv = 0;
    this.bullets = []; this.weapon = 'normal'; this.wt = 0; this.shield = 0; this.tilt = 0;
  },

  shoot() {
    const mk = vx => this.bullets.push({ x: this.x, y: this.y - 24, w: 5, h: 14, vx });
    if (this.weapon === 'mega') { for (let i = -3; i <= 3; i++) mk(i * 1.3); this.cd = 7; }
    else { mk(0); this.cd = 12; }
    Sound.shoot();
  },

  update() {
    const k = Input.keys, px = this.x;
    if (k['arrowleft'] || k['a']) this.x -= this.speed;
    if (k['arrowright'] || k['d']) this.x += this.speed;
    if (k['arrowup'] || k['w']) this.y -= this.speed;
    if (k['arrowdown'] || k['s']) this.y += this.speed;
    if (Input.touchX !== null) {                 // pesawat mengikuti jari
      this.x += (Input.touchX - this.x) * 0.25;
      this.y += (Input.touchY - 70 - this.y) * 0.25;
    }
    this.x = Math.max(20, Math.min(W - 20, this.x));
    this.y = Math.max(60, Math.min(H - 110, this.y));
    this.tilt = Math.max(-1, Math.min(1, (this.x - px) / 6));

    if (this.cd > 0) this.cd--; else this.shoot();
    if (this.wt > 0 && --this.wt === 0) this.weapon = 'normal';
    if (this.shield > 0) this.shield--;
    if (this.inv > 0) this.inv--;

    this.bullets.forEach(b => { b.y -= 10; b.x += b.vx; });
    this.bullets = this.bullets.filter(b => b.y > -20 && !b.dead);
  },

  draw(ctx) {
    ctx.save();
    ctx.shadowColor = '#ffd23f'; ctx.shadowBlur = 10; ctx.fillStyle = '#fff3a0';
    this.bullets.forEach(b => ctx.fillRect(b.x - b.w / 2, b.y, b.w, b.h));
    ctx.restore();
    if (this.inv % 10 < 5) drawJet(ctx, this.x, this.y, this.tilt * 0.25, ['#0b5d8f', '#8fe3ff'], true);
    if (this.shield > 0 && (this.shield > 120 || this.shield % 10 < 5)) {
      ctx.save();
      ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 20;
      ctx.strokeStyle = '#7df3ff'; ctx.lineWidth = 3; ctx.fillStyle = 'rgba(0,229,255,0.15)';
      ctx.beginPath(); ctx.arc(this.x, this.y, 36, 0, 7); ctx.fill(); ctx.stroke();
      ctx.restore();
    }
  }
};
