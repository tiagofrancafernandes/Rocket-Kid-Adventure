
export class AudioService {
  private context: AudioContext | null = null;
  private volume: number = 0.5;

  init() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  setVolume(v: number) {
    this.volume = v / 5;
  }

  playCountdown() {
    this.beep(440, 0.1, 'square');
  }

  playLaunch() {
    this.noise(0.5, 'lowpass', 400);
  }

  playExplosion() {
    // Explosão grande do foguete (Game Over)
    this.noise(0.8, 'lowpass', 100);
    this.beep(100, 0.5, 'triangle');
  }

  playSmallExplosion() {
    // Som de destruir obstáculo com tiro
    this.noise(0.2, 'highpass', 800);
    this.beep(300, 0.1, 'sine');
  }

  playCollision() {
    // Som de impacto (foguete batendo em obstáculo)
    this.noise(0.15, 'lowpass', 150);
    this.beep(80, 0.15, 'sawtooth');
  }

  playShoot() {
    this.beep(880, 0.05, 'sine');
  }

  private beep(freq: number, duration: number, type: OscillatorType) {
    if (!this.context) return;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, this.context.currentTime + duration);

    gain.gain.setValueAtTime(this.volume, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.context.destination);

    osc.start();
    osc.stop(this.context.currentTime + duration);
  }

  private noise(duration: number, filterType: BiquadFilterType, freq: number) {
    if (!this.context) return;
    const bufferSize = this.context.sampleRate * duration;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.context.createBufferSource();
    noise.buffer = buffer;

    const filter = this.context.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(freq, this.context.currentTime);

    const gain = this.context.createGain();
    gain.gain.setValueAtTime(this.volume, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.context.destination);

    noise.start();
  }
}

export const audioService = new AudioService();
