/**
 * Tiny Web Audio synth: every sound is generated on the fly, so there are no audio files to load.
 * Browsers only allow audio after a user gesture, so `unlockAudio()` must be called from one.
 */

type Wave = OscillatorType;

type ToneOptions = {
  freq: number;
  to?: number;
  dur?: number;
  type?: Wave;
  vol?: number;
  delay?: number;
  attack?: number;
};

export type SoundName =
  | 'click'
  | 'tap'
  | 'hover'
  | 'open'
  | 'close'
  | 'coin'
  | 'start'
  | 'levelUp'
  | 'achievement'
  | 'whoosh'
  | 'flip'
  | 'toggle'
  | 'secret'
  | 'hit'
  | 'none';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;
let lastHover = 0;
let voices = 0;

const MAX_VOICES = 24;
/**
 * Loud enough at half system volume. The compressor below keeps stacked sounds (a chest cascade, a
 * confetti burst) from clipping, so the gain can sit this high without distorting.
 */
const MASTER_VOLUME = 0.85;

/** Pentatonic scale (C major pentatonic across 3 octaves): anything you play sounds pleasant. */
const PENTATONIC = [
  261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51, 1567.98,
];

export function unlockAudio(): void {
  if (typeof window === 'undefined') return;
  if (!ctx) {
    const Ctor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    try {
      ctx = new Ctor();
    } catch {
      return; // Audio unavailable (e.g. blocked by the browser): the site works silently.
    }
    master = ctx.createGain();
    master.gain.value = muted ? 0 : MASTER_VOLUME;
    // Compressor-limiter: lifts the quiet synth tones and catches peaks, so it sounds fuller and louder.
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -20;
    limiter.knee.value = 10;
    limiter.ratio.value = 8;
    limiter.attack.value = 0.002;
    limiter.release.value = 0.12;
    master.connect(limiter);
    limiter.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
}

export function setMuted(value: boolean): void {
  muted = value;
  if (ctx && master) master.gain.setTargetAtTime(value ? 0 : MASTER_VOLUME, ctx.currentTime, 0.02);
}

function tone(opts: ToneOptions): void {
  if (!ctx || !master || muted || voices >= MAX_VOICES) return;
  const { freq, to, dur = 0.12, type = 'square', vol = 0.2, delay = 0, attack = 0.004 } = opts;
  const t = ctx.currentTime + delay;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);

  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  osc.connect(gain);
  gain.connect(master);
  voices++;
  osc.onended = () => {
    voices--;
    osc.disconnect();
    gain.disconnect();
  };
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function noise(dur: number, from: number, to: number, vol = 0.15, delay = 0): void {
  if (!ctx || !master || muted) return;
  const t = ctx.currentTime + delay;
  const length = Math.floor(ctx.sampleRate * dur);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;

  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = 1.2;
  filter.frequency.setValueAtTime(from, t);
  filter.frequency.exponentialRampToValueAtTime(to, t + dur);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + dur * 0.3);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  src.onended = () => {
    src.disconnect();
    filter.disconnect();
    gain.disconnect();
  };
  src.start(t);
  src.stop(t + dur + 0.02);
}

const jitter = (f: number, amount = 0.04) => f * (1 + (Math.random() * 2 - 1) * amount);

export function play(name: SoundName): void {
  if (muted || name === 'none') return;
  switch (name) {
    case 'click':
      tone({ freq: jitter(620), to: jitter(980), dur: 0.07, type: 'square', vol: 0.12 });
      break;
    case 'tap':
      tone({ freq: jitter(420, 0.12), to: jitter(260), dur: 0.06, type: 'triangle', vol: 0.18 });
      break;
    case 'hover': {
      const now = performance.now();
      if (now - lastHover < 45) return;
      lastHover = now;
      tone({ freq: jitter(1400, 0.06), dur: 0.025, type: 'sine', vol: 0.05 });
      break;
    }
    case 'open':
      tone({ freq: 440, to: 880, dur: 0.12, type: 'triangle', vol: 0.18 });
      tone({ freq: 660, to: 1320, dur: 0.1, type: 'square', vol: 0.05, delay: 0.04 });
      break;
    case 'close':
      tone({ freq: 760, to: 380, dur: 0.12, type: 'triangle', vol: 0.16 });
      break;
    case 'coin':
      tone({ freq: 987.77, dur: 0.08, type: 'square', vol: 0.12 });
      tone({ freq: 1318.51, dur: 0.32, type: 'square', vol: 0.12, delay: 0.07 });
      break;
    case 'flip':
      noise(0.18, 600, 3200, 0.12);
      tone({ freq: 300, to: 900, dur: 0.16, type: 'sine', vol: 0.12 });
      break;
    case 'toggle':
      tone({ freq: 520, dur: 0.05, type: 'square', vol: 0.1 });
      tone({ freq: 780, dur: 0.08, type: 'square', vol: 0.1, delay: 0.05 });
      break;
    case 'hit':
      noise(0.12, 2400, 300, 0.32);
      tone({ freq: 220, to: 70, dur: 0.18, type: 'square', vol: 0.16 });
      break;
    case 'whoosh':
      noise(0.35, 300, 4000, 0.18);
      break;
    case 'start': {
      const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5];
      notes.forEach((f, i) => {
        tone({ freq: f, dur: 0.16, type: 'square', vol: 0.11, delay: i * 0.055 });
      });
      [523.25, 659.25, 783.99].forEach((f) => {
        tone({ freq: f, dur: 0.9, type: 'triangle', vol: 0.12, delay: 0.42, attack: 0.02 });
      });
      noise(0.6, 200, 6000, 0.08, 0.38);
      break;
    }
    case 'levelUp': {
      const notes = [392.0, 523.25, 659.25, 783.99, 1046.5];
      notes.forEach((f, i) => {
        tone({ freq: f, dur: 0.14, type: 'square', vol: 0.12, delay: i * 0.07 });
      });
      tone({ freq: 1046.5, dur: 0.6, type: 'triangle', vol: 0.14, delay: 0.36 });
      tone({ freq: 1318.51, dur: 0.6, type: 'triangle', vol: 0.1, delay: 0.36 });
      break;
    }
    case 'achievement':
      [783.99, 987.77, 1174.66, 1567.98].forEach((f, i) => {
        tone({ freq: f, dur: 0.22, type: 'triangle', vol: 0.14, delay: i * 0.06 });
        tone({ freq: f * 2, dur: 0.1, type: 'sine', vol: 0.04, delay: i * 0.06 });
      });
      break;
    case 'secret': {
      const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.51, 1567.98, 2093.0];
      notes.forEach((f, i) => {
        tone({ freq: f, dur: 0.12, type: 'square', vol: 0.1, delay: i * 0.06 });
      });
      break;
    }
  }
}

/** Plays a note from the pentatonic scale; `index` wraps, so any integer works. */
export function playNote(index: number, type: Wave = 'triangle'): void {
  if (muted) return;
  const i = ((index % PENTATONIC.length) + PENTATONIC.length) % PENTATONIC.length;
  const f = PENTATONIC[i];
  tone({ freq: f, dur: 0.35, type, vol: 0.18 });
  tone({ freq: f * 2, dur: 0.12, type: 'sine', vol: 0.05 });
}
