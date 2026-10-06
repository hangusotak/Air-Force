// PWA: daftarkan service worker + tombol "Pasang di HP" (muncul di layar awal bila browser mendukung)
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

const installBtn = document.getElementById('install');
let installEvt = null;

addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  installEvt = e;
  if (!started) installBtn.style.display = 'block';
});
installBtn.addEventListener('click', async () => {
  if (!installEvt) return;
  installEvt.prompt();
  await installEvt.userChoice;
  installEvt = null;
  installBtn.style.display = 'none';
});
addEventListener('appinstalled', () => { installBtn.style.display = 'none'; });
