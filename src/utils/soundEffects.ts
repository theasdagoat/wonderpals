// Synthesized Kid-Friendly Audio FX using standard Web Audio API
// 100% offline, zero external asset dependencies, zero lag!

let audioCtx: AudioContext | null = null;
let isAudioMuted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function isMuted(): boolean {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('wonderpals_muted');
    if (stored !== null) {
      isAudioMuted = stored === 'true';
    }
  }
  return isAudioMuted;
}

export function toggleAudioMute(): boolean {
  isAudioMuted = !isMuted();
  if (typeof window !== 'undefined') {
    localStorage.setItem('wonderpals_muted', String(isAudioMuted));
  }
  return isAudioMuted;
}

export function playPopSound() {
  if (isMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  const now = ctx.currentTime;
  osc.type = 'sine';
  osc.frequency.setValueAtTime(450, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.09);
}

export function playChimeSound() {
  if (isMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  [523.25, 659.25, 783.99].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + i * 0.06);

    gain.gain.setValueAtTime(0.15, now + i * 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + i * 0.06);
    osc.stop(now + i * 0.06 + 0.3);
  });
}

export function playStarTwinkle() {
  if (isMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [659.25, 880, 1046.5, 1318.5]; // E5, A5, C6, E6
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.05);

    gain.gain.setValueAtTime(0.12, now + idx * 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.05);
    osc.stop(now + idx * 0.05 + 0.26);
  });
}

export function playHighFiveBoing() {
  if (isMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(580, now + 0.12);
  osc.frequency.exponentialRampToValueAtTime(330, now + 0.2);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.23);
}

export function playSuccessFanfare() {
  if (isMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const chords = [
    { freq: 523.25, t: 0 },
    { freq: 659.25, t: 0.1 },
    { freq: 783.99, t: 0.2 },
    { freq: 1046.5, t: 0.32 },
  ];

  chords.forEach(({ freq, t }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + t);

    gain.gain.setValueAtTime(0.18, now + t);
    gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + t);
    osc.stop(now + t + 0.5);
  });
}

export function playDrawingBrushTick() {
  if (isMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(800 + Math.random() * 200, now);
  gain.gain.setValueAtTime(0.03, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.03);
}
