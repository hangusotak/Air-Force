// Pesawat pemain + peluru (menembak otomatis)
const Player = {
  x: 240, y: 640, w: 36, h: 44, speed: 5,
  cd: 0, inv: 0, bullets: [],

  reset() {
    this.x = 240; this.y = 640;
    this.cd = 0; this.inv = 0; this.bullets = [];
  },

  update(W) {
    const k = Input.keys;
    if (k['arrowleft'] || k['a']) this.x -= this.speed;
    if (k['arrowright'] || k['d']) this.x += this.speed;
    if (k['arrowup'] || k['w']) this.y -= this.speed;
    if (k['arrowdown'] || k['s']) this.y += this.speed;
    if (Input.touchX !== null) this.x += (Input.touchX - this.x) * 0.2;

    this.x = Math.max(this.w / 2, Math.min(W - this.w / 2, this.x));
    this.y = Math.max(60, Math.min(700, this.y));

    if (this.cd > 0) this.cd--;
    else {
      this.bullets.push({ x: this.x, y: this.y - this.h / 2, w: 4, h: 14 });
      this.cd = 12;
    }
    this.bullets.forEach(b => b.y -= 9);
    this.bullets = this.bullets.filter(b => b.y > -20);
    if (this.inv > 0) this.inv--;
  },

  draw(ctx) {
    ctx.fillStyle = '#ffd23f';
    this.bullets.forEach(b => ctx.fillRect(b.x - b.w / 2, b.y, b.w, b.h));

    if (this.inv % 10 >= 5) return; // berkedip saat kebal
    ctx.fillStyle = '#4cc9f0';
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - this.h / 2);
    ctx.lineTo(this.x + this.w / 2, this.y + this.h / 2);
    ctx.lineTo(this.x, this.y + this.h / 4);
    ctx.lineTo(this.x - this.w / 2, this.y + this.h / 2);
    ctx.closePath();
    ctx.fill();
  }
};
