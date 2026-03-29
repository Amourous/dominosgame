// SoundManager - simple sound effects using Web Audio API
export class SoundManager {
  constructor() {
    this.enabled = localStorage.getItem('domino_sound') !== 'false';
    this.audioCtx = null;
    this._initialized = false;
  }

  _init() {
    if (this._initialized) return;
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      this._initialized = true;
    } catch (e) {
      console.warn('Web Audio not available');
      this.enabled = false;
    }
  }

  play(type) {
    if (!this.enabled) return;
    this._init();
    if (!this.audioCtx) return;

    switch (type) {
      case 'place':
        this._playTone(200, 0.08, 'square', 0.3);
        setTimeout(() => this._playTone(300, 0.05, 'square', 0.2), 50);
        break;
      case 'knock':
        this._playTone(150, 0.1, 'sawtooth', 0.2);
        break;
      case 'draw':
        this._playTone(400, 0.06, 'sine', 0.15);
        break;
      case 'deal':
        for (let i = 0; i < 5; i++) {
          setTimeout(() => this._playTone(250 + i * 30, 0.04, 'square', 0.1), i * 80);
        }
        break;
      case 'roundEnd':
        this._playTone(330, 0.15, 'sine', 0.3);
        setTimeout(() => this._playTone(440, 0.15, 'sine', 0.3), 150);
        setTimeout(() => this._playTone(550, 0.2, 'sine', 0.3), 300);
        break;
      case 'win':
        const notes = [330, 392, 440, 523, 587, 659, 784];
        notes.forEach((freq, i) => {
          setTimeout(() => this._playTone(freq, 0.15, 'sine', 0.25), i * 100);
        });
        break;
      case 'invalid':
        this._playTone(100, 0.1, 'sawtooth', 0.15);
        break;
    }
  }

  _playTone(frequency, duration, type = 'sine', volume = 0.3) {
    if (!this.audioCtx) return;

    const oscillator = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);

    gainNode.gain.setValueAtTime(volume, this.audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    oscillator.start(this.audioCtx.currentTime);
    oscillator.stop(this.audioCtx.currentTime + duration + 0.05);
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('domino_sound', this.enabled);
    return this.enabled;
  }
}

export default SoundManager;
