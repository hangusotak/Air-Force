// Kontrol: keyboard, geser jari di layar, dan tombol kiri/kanan
const Input = { keys: {}, touchX: null, touchY: null, tap: false };
const gameEl = document.getElementById('game');

addEventListener('keydown', e => {
  Input.keys[e.key.toLowerCase()] = true;
  if (e.key.startsWith('Arrow') || e.key === ' ') e.preventDefault();
});
addEventListener('keyup', e => { Input.keys[e.key.toLowerCase()] = false; });

function setTouch(e) {
  const t = e.changedTouches[0], r = gameEl.getBoundingClientRect();
  Input.touchX = (t.clientX - r.left) * gameEl.width / r.width;
  Input.touchY = (t.clientY - r.top) * gameEl.height / r.height;
}
gameEl.addEventListener('touchstart', e => { setTouch(e); Input.tap = true; });
gameEl.addEventListener('touchmove', e => { e.preventDefault(); setTouch(e); }, { passive: false });
gameEl.addEventListener('touchend', () => { Input.touchX = null; Input.touchY = null; });

// Tombol layar: tahan untuk bergerak
function holdBtn(id, key) {
  const b = document.getElementById(id);
  b.addEventListener('pointerdown', e => { e.preventDefault(); Input.keys[key] = true; Input.tap = true; });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(n =>
    b.addEventListener(n, () => { Input.keys[key] = false; }));
}
holdBtn('btnL', 'arrowleft');
holdBtn('btnR', 'arrowright');
