// Bonus yang jatuh dari musuh: 3 = tembak 3 arah, R = tembak cepat, + = tambah nyawa
const Powerups = {
  list: [],
  info: { spread: ['#06d6a0', '3'], rapid: ['#ffd166', 'R'], heart: ['#ef476f', '+'] },
  reset() { this.list = []; },
  drop(x, y) {
    if (Math.random() < 0.2) {
      const types = ['spread', 'rapid', 'heart'];
      this.list.push({ x, y, w: 28, h: 28, t: types[Math.floor(Math.random() * 3)] });
    }
  },
  update() {
    this.list.forEach(p => p.y += 2);
    this.list = this.list.filter(p => p.y < 760 && !p.got);
  },
  draw(ctx) {
    this.list.forEach(p => {
      const [c, l] = this.info[p.t];
      ctx.save();
      ctx.shadowColor = c; ctx.shadowBlur = 18; ctx.fillStyle = c;
      ctx.beginPath(); ctx.arc(p.x, p.y, 14, 0, 7); ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#000'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(l, p.x, p.y + 6);
    });
  }
};
