// Kontrol: keyboard (panah / WASD) dan geser jari di layar
const Input = { keys: {}, touchX: null, touchY: null, tap: false };
const gameEl = document.getElementById('game');

addEventListener('keydown', e => {
  Input.keys[e.key.toLowerCase()] = true;
  if (e.key.startsWith('Arrow') || e.key === ' ') e.preventDefault();
});
addEventListener('keyup', e => { Input.keys[e.key.toLowerCase()] = false; });

function setTouch(e) {
  const r = gameEl.getBoundingClientRect();
  Input.touchX = (e.touches[0].clientX - r.left) * gameEl.width / r.width;
  Input.touchY = (e.touches[0].clientY - r.top) * gameEl.height / r.height;
}
gameEl.addEventListener('touchstart', e => { setTouch(e); Input.tap = true; });
gameEl.addEventListener('touchmove', e => { e.preventDefault(); setTouch(e); }, { passive: false });
gameEl.addEventListener('touchend', () => { Input.touchX = null; Input.touchY = null; });
