// Suara & musik latar dibuat langsung oleh browser (tanpa file mp3)
const Sound = {
  ctx: null, muted: false, mt: null, step: 170, boss: false, paused: false, lb: 0, nb: {},

  unlock() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.startMusic();
  },
  tone(type, f1, f2, dur, vol) {
    if (!this.ctx || this.muted) return;
    const c = this.ctx, t = c.currentTime, o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f1, t);
    o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t); o.stop(t + dur);
  },
  noise(dur, vol) {
    if (!this.ctx || this.muted) return;
    const c = this.ctx;
    let buf = this.nb[dur];                       // buffer dibuat sekali lalu dipakai ulang (hemat memori)
    if (!buf) {
      const n = c.sampleRate * dur;
      buf = c.createBuffer(1, n, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
      this.nb[dur] = buf;
    }
    const s = c.createBufferSource(), g = c.createGain();
    s.buffer = buf; g.gain.value = vol;
    s.connect(g).connect(c.destination); s.start();
  },
  // Backsound: bass + melodi berulang. Tempo lebih cepat saat lawan bos (Sound.step)
  startMusic() {
    if (this.mt) return;
    const bass = [110, 110, 131, 98], lead = [440, 523, 659, 523, 440, 523, 784, 659];
    const dark = [55, 58.3, 55, 51.9], hl = [440, 466, 415, 440, 622, 587, 466, 415]; // nada sumbang untuk bos
    let i = 0;
    const play = () => {
      if (!this.muted && !this.paused) {
        if (this.boss) {                               // musik bos: gelap, berat, dentuman
          const b = dark[(i >> 3) % 4], l = hl[i % 8];
          if (i % 4 === 0) this.tone('sine', 90, 35, 0.3, 0.3);
          if (i % 2 === 0) this.tone('sawtooth', b, b * 0.95, 0.3, 0.12);
          this.tone('square', l, l * 0.97, 0.14, 0.05);
          if (i % 8 === 0) this.tone('sawtooth', b * 8, b * 7.4, 0.9, 0.04);
        } else {                                       // musik biasa (volume dinaikkan)
          const b = bass[(i >> 3) % 4], l = lead[i % 8];
          if (i % 2 === 0) this.tone('sawtooth', b, b * 0.97, 0.25, 0.09);
          this.tone('triangle', l, l * 0.99, 0.18, 0.07);
        }
      }
      i++;
      this.mt = setTimeout(play, this.step);
    };
    play();
  },
  shoot() { this.tone('square', 880, 220, 0.1, 0.03); },
  eshot() { this.tone('sawtooth', 300, 100, 0.15, 0.04); },
  boom()  {
    const t = performance.now();
    if (t - this.lb < 60) return;                 // cegah puluhan suara ledakan sekaligus
    this.lb = t;
    this.noise(0.4, 0.25); this.tone('sawtooth', 120, 30, 0.4, 0.12);
  },
  hurt()  { this.noise(0.6, 0.4);  this.tone('sawtooth', 200, 40, 0.5, 0.2); },
  power() { this.tone('sine', 440, 1320, 0.25, 0.12); }
};
['keydown', 'touchstart', 'mousedown', 'pointerdown'].forEach(ev => addEventListener(ev, () => Sound.unlock()));

const muteBtn = document.getElementById('mute');
muteBtn.addEventListener('click', () => {
  Sound.muted = !Sound.muted;
  muteBtn.textContent = Sound.muted ? '🔇' : '🔊';
});
