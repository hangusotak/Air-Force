// Suara dibuat langsung oleh browser (tanpa file mp3)
const Sound = {
  ctx: null,
  unlock() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  },
  tone(type, f1, f2, dur, vol) {
    if (!this.ctx) return;
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
    if (!this.ctx) return;
    const c = this.ctx, n = c.sampleRate * dur;
    const buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = c.createBufferSource(), g = c.createGain();
    s.buffer = buf; g.gain.value = vol;
    s.connect(g).connect(c.destination); s.start();
  },
  shoot() { this.tone('square', 880, 220, 0.1, 0.03); },
  boom()  { this.noise(0.4, 0.25); this.tone('sawtooth', 120, 30, 0.4, 0.12); },
  hurt()  { this.noise(0.6, 0.4);  this.tone('sawtooth', 200, 40, 0.5, 0.2); },
  power() { this.tone('sine', 440, 1320, 0.25, 0.12); }
};
['keydown', 'touchstart', 'mousedown'].forEach(ev => addEventListener(ev, () => Sound.unlock()));
