// Bonus level: muncul tiap skor kelipatan 500, harus ditabrak pesawat untuk didapat
// S = Pelindung, M = Peluru Super, B = Bom (hancurkan semua musuh), + = Nyawa
const Bonus = {
  list: [],
  types: { shield: ['#00b4d8', 'S'], mega: ['#ffd166', 'M'], bomb: ['#ff5d8f', 'B'], life: ['#06d6a0', '+'] },
  reset() { this.list = []; },
  spawn() {
    const k = Object.keys(this.types);
    this.list.push({ x: 40 + Math.random() * (W - 80), y: -20, w: 32, h: 32, t: k[Math.floor(Math.random() * k.length)] });
  },
  update() {
    this.list.forEach(p => p.y += 2.5);
    this.list = this.list.filter(p => p.y < H + 30 && !p.got);
  },
  draw(ctx, frame) {
    this.list.forEach(p => {
      const [c, l] = this.types[p.t], r = 16 + Math.sin(frame / 8) * 2;
      ctx.fillStyle = c;
      ctx.globalAlpha = 0.3; ctx.beginPath(); ctx.arc(p.x, p.y, r + 8, 0, 7); ctx.fill();
      ctx.globalAlpha = 1;   ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7); ctx.fill();
      ctx.fillStyle = '#000'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(l, p.x, p.y + 6);
    });
  }
};
