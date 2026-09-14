/**
 * The sound of a page turning, synthesised.
 *
 * Not a sample. A paper rustle is broadband noise shaped by a moving resonance — which is
 * about twenty lines of Web Audio and no network request, where an mp3 good enough to
 * survive being heard six times in a row is a hundred kilobytes and a licence to check.
 * Synthesising it also means every turn is slightly different: the playback rate, the
 * filter sweep and the second crinkle are all jittered, so it never acquires the
 * mechanical sameness that makes a UI sound irritating by the fourth repeat.
 *
 * The shape, in order: a fast attack as the sheet leaves the block, a dip as it travels,
 * a second swell as it lands and the far edge slaps down, then a tail. The bandpass sweeps
 * up and back over the same span, which is what gives it the "shhk" rather than a hiss.
 *
 * Autoplay policy: the context is created on the first turn, which is by definition inside
 * a user gesture, and resumed defensively on every play in case the tab was backgrounded.
 * Nothing here ever makes a sound the visitor did not ask for by turning a page.
 */

const STORAGE_KEY = 'eka:book-sound';

let ctx = null;
let noise = null;
let enabled = null;

function readPreference() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== 'off';
  } catch {
    // Private mode, or storage blocked. Sound on is the sensible default either way.
    return true;
  }
}

export function isSoundOn() {
  if (enabled === null) enabled = readPreference();
  return enabled;
}

export function setSoundOn(next) {
  enabled = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off');
  } catch {
    // Preference simply will not persist. Not worth failing the toggle over.
  }
}

function ensureContext() {
  if (ctx) return ctx;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;

  ctx = new AudioCtx();

  // One second of white noise, generated once and reused. Every turn is a differently
  // filtered, differently rated window onto the same buffer.
  const length = Math.floor(ctx.sampleRate * 1);
  noise = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;

  return ctx;
}

/**
 * @param {'next'|'prev'} direction  Pans the rustle the way the sheet travels.
 * @param {number} intensity  1 for a page, ~1.5 for the cover — a board is louder.
 */
export function playPageTurn(direction = 'next', intensity = 1) {
  if (!isSoundOn()) return;

  const audio = ensureContext();
  if (!audio) return;
  if (audio.state === 'suspended') audio.resume().catch(() => {});

  const t = audio.currentTime;
  const jitter = (spread) => 1 + (Math.random() * 2 - 1) * spread;

  const source = audio.createBufferSource();
  source.buffer = noise;
  source.playbackRate.value = 0.86 * jitter(0.16);
  // Start somewhere random in the buffer so two turns never share a waveform.
  const offset = Math.random() * 0.3;

  // Cut the rumble. Paper has no bottom end, and without this it reads as wind.
  const highpass = audio.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = 420 * jitter(0.1);

  // The moving resonance — the part that actually sounds like paper.
  const band = audio.createBiquadFilter();
  band.type = 'bandpass';
  band.Q.value = 0.75;
  band.frequency.setValueAtTime(1150 * jitter(0.12), t);
  band.frequency.exponentialRampToValueAtTime(3900 * jitter(0.1), t + 0.13);
  band.frequency.exponentialRampToValueAtTime(880 * jitter(0.1), t + 0.52);

  const gain = audio.createGain();
  const peak = 0.26 * intensity;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peak, t + 0.03);
  gain.gain.exponentialRampToValueAtTime(peak * 0.34, t + 0.17);
  // The landing: the far edge comes down a beat after the sheet has travelled.
  gain.gain.exponentialRampToValueAtTime(peak * 0.55, t + 0.31);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.66);

  source.connect(highpass).connect(band).connect(gain);

  // Follows the sheet across the spine. Safari on older versions has no panner; there the
  // sound is simply centred rather than absent.
  if (typeof audio.createStereoPanner === 'function') {
    const panner = audio.createStereoPanner();
    const from = direction === 'next' ? 0.4 : -0.4;
    panner.pan.setValueAtTime(from, t);
    panner.pan.linearRampToValueAtTime(-from * 0.8, t + 0.5);
    gain.connect(panner).connect(audio.destination);
  } else {
    gain.connect(audio.destination);
  }

  source.start(t, offset);
  source.stop(t + 0.72);
}
