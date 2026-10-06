// Musuh besar: 'mid' (skor 3000) dan 'boss' (skor 5000), plus peluru musuh (EB)
const EB = [];
const Big = {
  e: null,

  spawn(type) {
    const boss = type === 'boss', s = boss ? 3.4 : 2.2;
    this.e = { type, x: W / 2, y: -140, s, w: s * 36, h: s * 40, t: 0, dir: 1, flash: 0,
               hp: boss ? 120 : 30, max: boss ? 120 : 30,
               cols: boss ? ['#7f0000', '#ff6d00'] : ['#5a189a', '#c77dff'] };
  },
  reset() { this.e = null; EB.length = 0; },

  fire(vx, vy) { EB.push({ x: this.e.x, y: this.e.y + this.e.h / 2, vx, vy }); Sound.eshot(); },
  aim(spd) {
    const e = this.e, dx = Player.x - e.x, dy = Player.y - e.y, d = Math.hypot(dx, dy) || 1;
    this.fire(dx / d * spd, dy / d * spd);
  },

  update() {
    const e = this.e;
    if (e) {
      e.t++; if (e.flash > 0) e.flash--;
      const ty = e.type === 'boss' ? 150 : 120;
      if (e.y < ty) e.y += 1.2;
      e.x += e.dir * (e.type === 'boss' ? 2 : 1.5);
      const m = e.w / 2 + 10;
      if (e.x > W - m) e.dir = -1;
      if (e.x < m) e.dir = 1;
      if (e.y >= ty - 1) {
        if (e.type === 'mid') { if (e.t % 90 === 0) this.aim(4); }
        else {                                    // bos: tembakan 5 arah, makin sering saat darah < 50%
          const half = e.hp < e.max / 2;
          if (e.t % (half ? 50 : 75) === 0)
            for (let a = -2; a <= 2; a++) {
              const an = Math.PI / 2 + a * 0.3;
              this.fire(Math.cos(an) * 4, Math.sin(an) * 4);
            }
          if (half && e.t % 100 === 0) this.aim(5);
        }
      }
    }
    EB.forEach(b => { b.x += b.vx; b.y += b.vy; });
    for (let i = EB.length - 1; i >= 0; i--) {
      const b = EB[i];
      if (b.y > H + 20 || b.y < -20 || b.x < -20 || b.x > W + 20) EB.splice(i, 1);
    }
  },

  draw(ctx) {
    const e = this.e;
    if (e) {
      ctx.save();
      if (e.flash % 2 === 1) ctx.globalAlpha = 0.55;
      drawJet(ctx, e.x, e.y, Math.PI, e.cols, false, e.s);
      ctx.restore();
      const bw = e.w + 20, by = e.y - e.h / 2 - 16;  // bar darah
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(e.x - bw / 2, by, bw, 8);
      ctx.fillStyle = e.type === 'boss' ? '#ff3b3b' : '#c77dff';
      ctx.fillRect(e.x - bw / 2, by, bw * e.hp / e.max, 8);
    }
    ctx.save();
    ctx.shadowColor = '#ff6b00'; ctx.shadowBlur = 12; ctx.fillStyle = '#ffb347';
    EB.forEach(b => { ctx.beginPath(); ctx.arc(b.x, b.y, 6, 0, 7); ctx.fill(); });
    ctx.restore();
  }
};
