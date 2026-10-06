// Suara & musik latar dibuat langsung oleh browser (tanpa file mp3)
const Sound = {
  ctx: null, muted: false, mt: null, step: 170,

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
    const c = this.ctx, n = c.sampleRate * dur;
    const buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = c.createBufferSource(), g = c.createGain();
    s.buffer = buf; g.gain.value = vol;
    s.connect(g).connect(c.destination); s.start();
  },
  // Backsound: bass + melodi berulang. Tempo lebih cepat saat lawan bos (Sound.step)
  startMusic() {
    if (this.mt) return;
    const bass = [110, 110, 131, 98], lead = [440, 523, 659, 523, 440, 523, 784, 659];
    let i = 0;
    const play = () => {
      if (!this.muted) {
        const b = bass[(i >> 3) % 4], l = lead[i % 8];
        if (i % 2 === 0) this.tone('sawtooth', b, b * 0.97, 0.25, 0.03);
        this.tone('triangle', l, l * 0.99, 0.18, 0.02);
      }
      i++;
      this.mt = setTimeout(play, this.step);
    };
    play();
  },
  shoot() { this.tone('square', 880, 220, 0.1, 0.03); },
  eshot() { this.tone('sawtooth', 300, 100, 0.15, 0.04); },
  boom()  { this.noise(0.4, 0.25); this.tone('sawtooth', 120, 30, 0.4, 0.12); },
  hurt()  { this.noise(0.6, 0.4);  this.tone('sawtooth', 200, 40, 0.5, 0.2); },
  power() { this.tone('sine', 440, 1320, 0.25, 0.12); }
};
['keydown', 'touchstart', 'mousedown', 'pointerdown'].forEach(ev => addEventListener(ev, () => Sound.unlock()));

const muteBtn = document.getElementById('mute');
muteBtn.addEventListener('click', () => {
  Sound.muted = !Sound.muted;
  muteBtn.textContent = Sound.muted ? '🔇' : '🔊';
});
