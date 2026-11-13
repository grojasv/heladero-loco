// Heladero Loco: effects. The intro, ingredients that fly into the tub, rolling numbers, the reward card,
// and the mascot's small life (eyes that follow a tap, a dance after five quick taps). All optional: nothing
// here changes data, and everything is skipped with prefers-reduced-motion.
(() => {
  const { t, esc, T, store, acts } = HL;
  const play = (n) => window.Sound?.play(n);
  const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  Object.assign(T, {
    skip: { es: 'Toca para entrar', ca: 'Toca per entrar', en: 'Tap to enter' },
    tapClose: { es: 'Toca para seguir', ca: 'Toca per continuar', en: 'Tap to continue' },
  });

  // ---------- intro: the lab doors open, the mascot pops up, the name drips in ----------
  function intro() {
    const today = new Date().toISOString().slice(0, 10), forced = /[?&]intro\b/.test(location.search);
    if (!forced && (calm() || store.get('introDay') === today)) return;
    store.set('introDay', today);
    const letters = (word, cls, from) => [...word].map((c, i) => `<span class="${cls}" style="animation-delay:${(0.95 + (from + i) * 0.055).toFixed(2)}s">${c}</span>`).join('');
    const el = Object.assign(document.createElement('div'), { className: 'intro', id: 'intro' });
    el.innerHTML = `<div class="intro-stage">
        <div class="intro-mascot">${HL.mascot('cheer')}</div>
        <p class="intro-logo" aria-label="Heladero Loco">${letters('Heladero', 'a', 0)} <b>${letters('Loco', 'b', 8)}</b></p>
        <p class="intro-skip">${esc(t('skip'))}</p>
      </div>
      <i class="mist m1"></i><i class="mist m2"></i>
      <i class="door l"><b></b><u>❄</u></i><i class="door r"><b></b><u>❄</u></i>`;
    document.body.append(el);
    const close = () => { el.classList.add('out'); setTimeout(() => el.remove(), 350); };
    el.addEventListener('click', () => { play('pop'); close(); });
    setTimeout(close, 2900);
  }

  // ---------- an ingredient flies from the fridge into the tub ----------
  function splash(box) {
    for (let i = 0; i < 7; i++) {
      const d = Object.assign(document.createElement('i'), { className: 'droplet' });
      d.style.left = `${box.left + box.width / 2}px`; d.style.top = `${box.top + box.height * 0.3}px`;
      document.body.append(d);
      const a = -Math.PI * (0.15 + 0.7 * (i / 6)), r = 26 + (i % 3) * 10;
      d.animate([{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: `translate(calc(-50% + ${(Math.cos(a) * r).toFixed(0)}px), calc(-50% + ${(Math.sin(a) * r).toFixed(0)}px)) scale(0.3)`, opacity: 0 }],
        { duration: 420, easing: 'cubic-bezier(.2,.7,.4,1)' }).onfinish = () => d.remove();
    }
  }
  const landing = () => document.querySelector('.bench-tub, .ninja-bay');
  function fly(emoji, from) {
    const to = landing(); if (!to) return;
    const land = () => { const now = landing(); if (!now) return; now.classList.remove('drop'); void now.offsetWidth; now.classList.add('drop'); if (!calm()) splash(now.getBoundingClientRect()); };
    if (calm() || !from) { land(); return; }
    const box = to.getBoundingClientRect(), el = Object.assign(document.createElement('span'), { className: 'flying', textContent: emoji || '🥄' });
    const x0 = from.left + from.width / 2, y0 = from.top + from.height / 2, dx = box.left + box.width / 2 - x0, dy = box.top + box.height * 0.25 - y0;
    el.style.left = `${x0}px`; el.style.top = `${y0}px`;
    document.body.append(el);
    const at = (x, y, s, r) => `translate(calc(-50% + ${x.toFixed(0)}px), calc(-50% + ${y.toFixed(0)}px)) scale(${s}) rotate(${r}deg)`;
    el.animate([{ transform: at(0, 0, 1.2, 0) }, { transform: at(dx * 0.55, Math.min(dy * 0.5, 0) - 90, 1.5, 200), offset: 0.55 }, { transform: at(dx, dy, 0.6, 380) }],
      { duration: 520, easing: 'cubic-bezier(.4,0,.6,1)' }).onfinish = () => { el.remove(); land(); };
  }

  // ---------- numbers that roll to their new value ----------
  function count(b, from, to) {
    const node = b?.firstChild;
    if (!node || calm() || Math.round(from) === Math.round(to)) return;
    const t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / 380);
      node.nodeValue = Math.round(from + (to - from) * (1 - (1 - k) ** 2));
      if (k < 1 && b.isConnected) requestAnimationFrame(step);
    };
    step(t0);
  }

  // ---------- the reward card: a new record, a new badge ----------
  function reward({ emoji = '🏆', title, lines = [] }) {
    document.querySelector('.reward')?.remove();
    const el = Object.assign(document.createElement('div'), { className: 'reward' });
    el.innerHTML = `<div class="reward-card"><div class="reward-emoji">${esc(emoji)}</div><h2>${esc(title)}</h2>
      ${lines.map((l) => `<p>${esc(l)}</p>`).join('')}<div class="reward-head">${window.Heladero ? window.Heladero.head('cheer') : ''}</div>
      <small>${esc(t('tapClose'))}</small></div>`;
    document.body.append(el);
    const close = () => el.remove();
    el.addEventListener('click', close);
    setTimeout(close, 6000);
    HL.sprinkles?.();
  }

  // ---------- the mascot's life ----------
  let lookTimer = 0;
  document.addEventListener('pointerdown', (e) => {
    const g = document.querySelector('#heroMascot .hl-look'); if (!g) return;
    const r = g.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), d = Math.hypot(dx, dy) || 1;
    g.style.transform = `translate(${((dx / d) * 4).toFixed(1)}px, ${((dy / d) * 4).toFixed(1)}px)`;
    clearTimeout(lookTimer);
    lookTimer = setTimeout(() => { g.style.transform = ''; }, 1500);
  });
  // Five quick taps on him: a dance.
  let taps = [];
  const hello = acts.mascot;
  acts.mascot = (el, e) => {
    const now = Date.now();
    taps = [...taps.filter((x) => now - x < 2200), now];
    if (taps.length < 5) return hello(el, e);
    taps = [];
    el.innerHTML = HL.mascot('cheer');
    el.classList.remove('wiggle'); el.classList.add('dance');
    play('jingle'); HL.sprinkles?.();
    HL.say('dance');
    setTimeout(() => el.classList.remove('dance'), 2200);
  };

  HL.fx = { fly, count, reward, intro, calm };
  intro();
})();
