// Menggambar pesawat dengan efek 3D: bayangan, gradasi cahaya, kilau
function jetPath(ctx) {
  ctx.beginPath();
  ctx.moveTo(0, -22); ctx.lineTo(7, -2); ctx.lineTo(20, 16); ctx.lineTo(20, 21);
  ctx.lineTo(6, 14); ctx.lineTo(5, 22); ctx.lineTo(0, 18); ctx.lineTo(-5, 22);
  ctx.lineTo(-6, 14); ctx.lineTo(-20, 21); ctx.lineTo(-20, 16); ctx.lineTo(-7, -2);
  ctx.closePath();
}

function drawJet(ctx, x, y, rot, cols, flame) {
  // bayangan di "tanah" supaya terlihat melayang
  ctx.save();
  ctx.translate(x + 14, y + 28); ctx.rotate(rot);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; jetPath(ctx); ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  if (flame) {
    ctx.shadowColor = '#ff9f1c'; ctx.shadowBlur = 14;
    ctx.fillStyle = '#ffb703';
    ctx.beginPath(); ctx.moveTo(-4, 20); ctx.lineTo(0, 30 + Math.random() * 12); ctx.lineTo(4, 20); ctx.fill();
    ctx.shadowBlur = 0;
  }
  const g = ctx.createLinearGradient(-20, 0, 20, 0);
  g.addColorStop(0, cols[0]); g.addColorStop(0.5, cols[1]); g.addColorStop(1, cols[0]);
  ctx.fillStyle = g; jetPath(ctx); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.3)';           // kilau badan
  ctx.beginPath(); ctx.moveTo(0, -22); ctx.lineTo(4, 10); ctx.lineTo(-4, 10); ctx.fill();
  ctx.fillStyle = '#c9f6ff';                         // kokpit
  ctx.beginPath(); ctx.ellipse(0, -6, 3, 7, 0, 0, 7); ctx.fill();
  ctx.restore();
}
