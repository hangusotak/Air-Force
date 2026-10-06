// Pesawat pemain, peluru, dan senjata (normal / spread / rapid)
const Player = {
  x: 240, y: 640, w: 36, h: 44, speed: 5,
  cd: 0, inv: 0, bullets: [], weapon: 'normal', wt: 0, tilt: 0,

  reset() {
    this.x = 240; this.y = 640; this.cd = 0; this.inv = 0;
    this.bullets = []; this.weapon = 'normal'; this.wt = 0; this.tilt = 0;
  },

  shoot() {
    const make = vx => this.bullets.push({ x: this.x, y: this.y - 24, w: 5, h: 14, vx });
    if (this.weapon === 'spread') { make(-2.5); make(0); make(2.5); }
    else make(0);
    this.cd = this.weapon === 'rapid' ? 5 : 12;
    Sound.shoot();
  },

  update(W) {
    const k = Input.keys, px = this.x;
    if (k['arrowleft'] || k['a']) this.x -= this.speed;
    if (k['arrowright'] || k['d']) this.x += this.speed;
    if (k['arrowup'] || k['w']) this.y -= this.speed;
    if (k['arrowdown'] || k['s']) this.y += this.speed;
    if (Input.touchX !== null) {            // pesawat mengikuti jari (sedikit di atas jari)
      this.x += (Input.touchX - this.x) * 0.25;
      this.y += (Input.touchY - 70 - this.y) * 0.25;
    }
    this.x = Math.max(20, Math.min(W - 20, this.x));
    this.y = Math.max(60, Math.min(700, this.y));
    this.tilt = Math.max(-1, Math.min(1, (this.x - px) / 6));

    if (this.cd > 0) this.cd--; else this.shoot();
    if (this.wt > 0 && --this.wt === 0) this.weapon = 'normal';

    this.bullets.forEach(b => { b.y -= 10; b.x += b.vx; });
    this.bullets = this.bullets.filter(b => b.y > -20);
    if (this.inv > 0) this.inv--;
  },

  draw(ctx) {
    ctx.save();
    ctx.shadowColor = '#ffd23f'; ctx.shadowBlur = 10; ctx.fillStyle = '#fff3a0';
    this.bullets.forEach(b => ctx.fillRect(b.x - b.w / 2, b.y, b.w, b.h));
    ctx.restore();
    if (this.inv % 10 >= 5) return;
    drawJet(ctx, this.x, this.y, this.tilt * 0.25, ['#0b5d8f', '#8fe3ff'], true);
  }
};
