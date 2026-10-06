// Pesawat musuh: muncul dari atas, makin cepat tiap level
const Enemies = {
  list: [], t: 0,

  reset() { this.list = []; this.t = 0; },

  update(level, W) {
    this.t++;
    if (this.t >= Math.max(20, 60 - level * 5)) {
      this.t = 0;
      this.list.push({ x: 30 + Math.random() * (W - 60), y: -30, w: 34, h: 34, vy: 2 + level * 0.4 });
    }
    this.list.forEach(e => e.y += e.vy);
  },

  draw(ctx) {
    ctx.fillStyle = '#ef476f';
    this.list.forEach(e => {
      ctx.beginPath();
      ctx.moveTo(e.x, e.y + e.h / 2);
      ctx.lineTo(e.x + e.w / 2, e.y - e.h / 2);
      ctx.lineTo(e.x - e.w / 2, e.y - e.h / 2);
      ctx.closePath();
      ctx.fill();
    });
  }
};
