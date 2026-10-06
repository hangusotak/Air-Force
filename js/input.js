// Membaca kontrol: keyboard (panah / WASD) dan sentuhan layar
const Input = { keys: {}, touchX: null, tap: false };
const gameEl = document.getElementById('game');

addEventListener('keydown', e => {
  Input.keys[e.key.toLowerCase()] = true;
  if (e.key.startsWith('Arrow') || e.key === ' ') e.preventDefault();
});
addEventListener('keyup', e => { Input.keys[e.key.toLowerCase()] = false; });

function setTouch(e) {
  const r = gameEl.getBoundingClientRect();
  Input.touchX = (e.touches[0].clientX - r.left) * gameEl.width / r.width;
}
gameEl.addEventListener('touchstart', e => { setTouch(e); Input.tap = true; });
gameEl.addEventListener('touchmove', e => { e.preventDefault(); setTouch(e); }, { passive: false });
gameEl.addEventListener('touchend', () => { Input.touchX = null; });
