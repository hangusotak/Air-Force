// Menggambar pesawat dengan efek 3D (s = ukuran: 1 normal, 2.2 musuh besar, dst)
const jetGrad = {};
function jetPath(ctx) {
  ctx.beginPath();
  ctx.moveTo(0, -22); ctx.lineTo(7, -2); ctx.lineTo(20, 16); ctx.lineTo(20, 21);
  ctx.lineTo(6, 14); ctx.lineTo(5, 22); ctx.lineTo(0, 18); ctx.lineTo(-5, 22);
  ctx.lineTo(-6, 14); ctx.lineTo(-20, 21); ctx.lineTo(-20, 16); ctx.lineTo(-7, -2);
  ctx.closePath();
}

function drawJet(ctx, x, y, rot, cols, flame, s = 1) {
  ctx.save();                                     // bayangan
  ctx.translate(x + 14 * s, y + 28 * s); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; jetPath(ctx); ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  if (flame) {
    const fl = 30 + Math.random() * 12;
    ctx.fillStyle = 'rgba(255,159,28,0.35)';
    ctx.beginPath(); ctx.moveTo(-7, 19); ctx.lineTo(0, fl + 8); ctx.lineTo(7, 19); ctx.fill();
    ctx.fillStyle = '#ffb703';
    ctx.beginPath(); ctx.moveTo(-4, 20); ctx.lineTo(0, fl); ctx.lineTo(4, 20); ctx.fill();
  }
  const key = cols[0] + cols[1];
  let g = jetGrad[key];
  if (!g) {
    g = ctx.createLinearGradient(-20, 0, 20, 0);
    g.addColorStop(0, cols[0]); g.addColorStop(0.5, cols[1]); g.addColorStop(1, cols[0]);
    jetGrad[key] = g;
  }
  ctx.fillStyle = g; jetPath(ctx); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.3)';        // kilau badan
  ctx.beginPath(); ctx.moveTo(0, -22); ctx.lineTo(4, 10); ctx.lineTo(-4, 10); ctx.fill();
  ctx.fillStyle = '#c9f6ff';                      // kokpit
  ctx.beginPath(); ctx.ellipse(0, -6, 3, 7, 0, 0, 7); ctx.fill();
  ctx.restore();
}
