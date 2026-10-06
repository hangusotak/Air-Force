// Pesawat musuh biasa: makin cepat tiap level (maksimal level 10)
const Enemies = {
  list: [], t: 0,
  reset() { this.list = []; this.t = 0; },
  update(level, W, spawn) {
    this.t++;
    if (spawn && this.t >= Math.max(22, 60 - level * 4)) {
      this.t = 0;
      this.list.push({ x: 30 + Math.random() * (W - 60), y: -30, w: 34, h: 34, vy: Math.min(5, 2 + level * 0.3) });
    }
    this.list.forEach(e => e.y += e.vy);
  },
  draw(ctx) {
    this.list.forEach(e => drawJet(ctx, e.x, e.y, Math.PI, ['#7a1230', '#ff7a95'], false));
  }
};
