/* Heladero Loco sounds: soft synthesised effects (Web Audio, no files) and the mascot's voice (Web Speech).
 * One mute switch silences both. The AudioContext is created on the first tap, as browsers require. */
(function () {
  'use strict';
  const KEY = 'heladero.mute';
  let muted = false;
  try { muted = localStorage.getItem(KEY) === '1'; } catch { /* private mode */ }
  let ctx = null, master = null;

  function ac() {
    if (muted) return null;
    if (!ctx) {
      const A = window.AudioContext || window.webkitAudioContext;
      if (!A) return null;
      ctx = new A();
      master = ctx.createGain();
      master.gain.value = 0.6;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  // One soft note: f → f2 over d seconds, starting t seconds from now.
  function tone({ f = 440, f2, type = 'sine', t = 0, d = 0.15, g = 0.12 }) {
    const c = ac(); if (!c) return;
    const o = c.createOscillator(), a = c.createGain(), s = c.currentTime + t;
    o.type = type;
    o.frequency.setValueAtTime(f, s);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, s + d);
    a.gain.setValueAtTime(0.0001, s);
    a.gain.exponentialRampToValueAtTime(g, s + 0.015);
    a.gain.exponentialRampToValueAtTime(0.0001, s + d);
    o.connect(a); a.connect(master);
    o.start(s); o.stop(s + d + 0.03);
  }
  // Filtered noise: a swish (frost) or a motor (spin).
  function noise({ t = 0, d = 0.4, g = 0.05, f = 1500, f2, q = 1.2 }) {
    const c = ac(); if (!c) return;
    const n = Math.floor(c.sampleRate * d), buf = c.createBuffer(1, n, c.sampleRate), ch = buf.getChannelData(0);
    for (let i = 0; i < n; i++) ch[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource(), bp = c.createBiquadFilter(), a = c.createGain(), s = c.currentTime + t;
    src.buffer = buf; bp.type = 'bandpass'; bp.Q.value = q;
    bp.frequency.setValueAtTime(f, s);
    if (f2) bp.frequency.exponentialRampToValueAtTime(f2, s + d);
    a.gain.setValueAtTime(0.0001, s);
    a.gain.exponentialRampToValueAtTime(g, s + d * 0.25);
    a.gain.exponentialRampToValueAtTime(0.0001, s + d);
    src.connect(bp); bp.connect(a); a.connect(master);
    src.start(s); src.stop(s + d + 0.03);
  }
  const bells = (notes, gap, d = 0.5, g = 0.09) => notes.forEach((f, i) => {
    tone({ f, t: i * gap, d, g });
    tone({ f: f * 2, t: i * gap, d: d * 0.6, g: g * 0.3 });
  });

  const Sfx = {
    tap() { tone({ f: 520, f2: 640, d: 0.06, g: 0.05 }); },
    tick() { tone({ f: 880, d: 0.04, g: 0.04, type: 'triangle' }); },
    plop() { tone({ f: 520, f2: 150, d: 0.16, g: 0.14 }); tone({ f: 300, f2: 620, t: 0.13, d: 0.09, g: 0.06 }); },
    pop() { tone({ f: 260, f2: 520, d: 0.08, g: 0.08 }); },
    frost() { noise({ d: 0.7, f: 2500, f2: 6000, g: 0.05 }); bells([1318.5, 1568, 2093], 0.12, 0.6, 0.05); },
    chime() { bells([783.99, 987.77, 1174.66, 1567.98], 0.13, 0.8, 0.09); },
    whirr() {
      noise({ d: 1.4, f: 300, f2: 1400, g: 0.07, q: 3 });
      tone({ f: 70, f2: 190, type: 'sawtooth', d: 1.4, g: 0.035 });
      tone({ f: 1046.5, t: 1.35, d: 0.35, g: 0.07 });
    },
    jingle() { bells([523.25, 659.25, 783.99, 1046.5, 1318.5], 0.09, 0.5, 0.09); },
    sad() { tone({ f: 392, f2: 311, d: 0.3, g: 0.07, type: 'triangle' }); tone({ f: 311, f2: 233, t: 0.28, d: 0.4, g: 0.07, type: 'triangle' }); },
    oops() { tone({ f: 330, f2: 220, d: 0.18, g: 0.07, type: 'triangle' }); },
  };

  const CODES = { es: 'es-ES', ca: 'ca-ES', en: 'en-GB' };
  let talkTimer = 0;
  function stopTalk() { clearTimeout(talkTimer); document.body.classList.remove('talking'); }
  function speak(text, lang) {
    const synth = window.speechSynthesis;
    if (muted || !synth || !text) return;
    try {
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const voices = synth.getVoices();
      const pick = (code) => voices.find((v) => v.lang.replace('_', '-').toLowerCase().startsWith(code.slice(0, 2)));
      const voice = pick(CODES[lang] || 'es-ES') || (lang === 'ca' ? pick('es-ES') : null); // no Catalan voice: Spanish reads it
      if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = CODES[lang] || 'es-ES';
      u.pitch = 1.25; u.rate = 1.05; u.volume = 0.9;
      u.onend = u.onerror = stopTalk;
      document.body.classList.add('talking');
      clearTimeout(talkTimer);
      talkTimer = setTimeout(stopTalk, 600 + text.length * 80); // onend is unreliable on some phones
      synth.speak(u);
    } catch { stopTalk(); }
  }

  window.Sound = {
    Sfx,
    speak,
    get muted() { return muted; },
    setMuted(v) {
      muted = !!v;
      try { localStorage.setItem(KEY, muted ? '1' : '0'); } catch { /* private mode */ }
      if (muted) { try { window.speechSynthesis?.cancel(); } catch { /* no speech */ } stopTalk(); }
    },
    play(name) { try { Sfx[name]?.(); } catch { /* sound is optional */ } },
  };
})();
