// Heladero Loco: the core (storage, languages, data, tubs, router, shell) and the tubs screen.
// No build step. Feature screens live in their own files and register themselves on window.HL:
// HL.routes[name] = { render(arg), tab }, HL.acts[name] = (el, event) => …, HL.tabs.push({ … }).
window.HL = (() => {
  const VERSION = '0.7.0'; // keep in sync with CHANGELOG.md
  const LANGS = ['es', 'ca', 'en'];
  const LOCALE = { es: 'es-ES', ca: 'ca-ES', en: 'en-GB' };
  const DEFAULTS = { tubs: 7, freezeHours: 24 };
  const FILL_ML = 400; // MAX FILL line of the NC302EU tub (473 ml), from Guille 2026-11-12

  const T = {
    tabTubs: { es: 'Tarrinas', ca: 'Terrines', en: 'Tubs' },
    stEmpty: { es: 'Vacía', ca: 'Buida', en: 'Empty' },
    stFreezing: { es: 'Congelando', ca: 'Congelant', en: 'Freezing' },
    stReady: { es: '¡Lista!', ca: 'A punt!', en: 'Ready!' },
    stSpun: { es: 'Valorar', ca: 'Valora', en: 'Rate it' },
    fill: { es: 'Llenar', ca: 'Omple', en: 'Fill' },
    left: { es: 'faltan {t}', ca: 'falten {t}', en: '{t} left' },
    spinNow: { es: 'A la Ninja', ca: 'A la Ninja', en: 'To the Ninja' },
    tub: { es: 'Tarrina', ca: 'Terrina', en: 'Tub' },
    counts: { es: 'Congelando: {f} · Listas: {r} · Vacías: {e}', ca: 'Congelant: {f} · A punt: {r} · Buides: {e}', en: 'Freezing: {f} · Ready: {r} · Empty: {e}' },
    back: { es: '‹ Volver', ca: '‹ Torna', en: '‹ Back' },
    notFound: { es: 'No encontrado.', ca: 'No trobat.', en: 'Not found.' },
    loadError: { es: 'No se han podido cargar los datos.', ca: 'No s’han pogut carregar les dades.', en: 'Couldn’t load the data.' },
    disclaimer: { es: 'Macros calculados con datos de etiqueta. No es consejo nutricional.', ca: 'Macros calculats amb dades d’etiqueta. No és consell nutricional.', en: 'Macros computed from label data. Not nutrition advice.' },
    install: { es: 'Instala la app', ca: 'Instal·la l’app', en: 'Install the app' },
    installOther: { es: 'Abre el menú del navegador (⋮) y elige «Instalar aplicación».', ca: 'Obre el menú del navegador (⋮) i tria «Instal·la l’aplicació».', en: 'Open the browser menu (⋮) and choose “Install app”.' },
    changelog: { es: 'Novedades', ca: 'Novetats', en: 'What’s new' },
    mute: { es: 'Sonido', ca: 'So', en: 'Sound' },
    hello: { es: '¡Bienvenido al laboratorio, maestro del frío!', ca: 'Benvingut al laboratori, mestre del fred!', en: 'Welcome to the lab, master of the cold!' },
    soon: { es: 'Esa máquina aún no está montada. ¡Pronto!', ca: 'Aquesta màquina encara no està muntada. Aviat!', en: 'That machine is not built yet. Soon!' },
    kcal: { es: 'kcal', ca: 'kcal', en: 'kcal' },
    mP: { es: 'P', ca: 'P', en: 'P' },
    mC: { es: 'C', ca: 'C', en: 'C' },
    mF: { es: 'G', ca: 'G', en: 'F' },
    protein: { es: 'Proteína', ca: 'Proteïna', en: 'Protein' },
    carbs: { es: 'Hidratos', ca: 'Hidrats', en: 'Carbs' },
    fat: { es: 'Grasas', ca: 'Greixos', en: 'Fat' },
  };

  // ---------- storage ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem('heladero.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('heladero.' + k, JSON.stringify(v)); } catch { /* private mode */ } },
  };
  const settings = () => ({ ...DEFAULTS, ...store.get('settings', {}) });

  // ---------- language ----------
  const guess = (navigator.language || '').slice(0, 2);
  let lang = LANGS.includes(store.get('lang')) ? store.get('lang') : LANGS.includes(guess) ? guess : 'es';
  // t('key') reads T; t({es,ca,en}) reads the object. {x} placeholders are filled from vars.
  function t(o, vars) {
    const src = typeof o === 'string' ? T[o] : o;
    let s = (src && (src[lang] ?? src.es)) || (typeof o === 'string' ? o : '');
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
    return s;
  }
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const $ = (id) => document.getElementById(id);
  const view = $('view'), foot = $('foot'), nav = $('nav'), toastEl = $('toast');
  const dateFmt = (iso, opts) => new Intl.DateTimeFormat(LOCALE[lang], opts || { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(iso));
  const timeFmt = (ms) => new Intl.DateTimeFormat(LOCALE[lang], { weekday: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(ms));
  const num = (p, n) => (n ? `<span class="num">${p}${n}</span>` : '');

  // ---------- data ----------
  const data = { ingredients: {}, recipes: [], guides: [], lines: {} };
  // The pantry: seeded ingredients with Guille's own additions and edits laid over them (SPEC § Data).
  function pantry() {
    const over = store.get('pantry', {});
    const all = {};
    for (const [id, ing] of Object.entries(data.ingredients)) all[id] = { ...ing, ...(over[id] || {}), id };
    for (const [id, ing] of Object.entries(over)) if (!all[id]) all[id] = { ...ing, id, custom: true };
    return all;
  }
  const ing = (id) => pantry()[id];
  const ingName = (i) => (i ? t(i.name) : '?');
  // Macros of a list of { ing, amount }: per-100 values times the amount. Unknown ingredients count as zero.
  function macros(...lists) {
    const p = pantry(), m = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
    for (const item of lists.flat()) {
      const per = p[item?.ing]?.per100; if (!per) continue;
      for (const k of Object.keys(m)) m[k] += ((per[k] || 0) * item.amount) / 100;
    }
    return m;
  }
  const r0 = (n) => Math.round(n);
  const macroLine = (m) => `${r0(m.kcal)} kcal · ${t('mP')} ${r0(m.protein)} · ${t('mC')} ${r0(m.carbs)} · ${t('mF')} ${r0(m.fat)}`;
  const macroBar = (m) => `<div class="macros"><div class="m kcal"><b>${r0(m.kcal)}</b><span>kcal</span></div>
    <div class="m"><b>${r0(m.protein)}<small>g</small></b><span>${esc(t('protein'))}</span></div>
    <div class="m"><b>${r0(m.carbs)}<small>g</small></b><span>${esc(t('carbs'))}</span></div>
    <div class="m"><b>${r0(m.fat)}<small>g</small></b><span>${esc(t('fat'))}</span></div></div>`;
  const amountText = (item) => { const i = ing(item.ing); return `${+item.amount.toFixed(2)} ${i?.unit || 'g'}`; };
  const mixVolume = (mix) => (mix || []).reduce((s, x) => s + x.amount, 0); // rough: 1 g counts as 1 ml

  // ---------- tubs ----------
  // Stored state is empty | frozen | spun. "Ready" is frozen with the freeze time passed (SPEC § The tub cycle).
  function tubs() {
    const n = settings().tubs, list = store.get('tubs', []);
    const out = [];
    for (let i = 0; i < Math.max(n, list.length); i++) {
      const tub = list[i] && list[i].state ? list[i] : { state: 'empty' };
      if (i < n || tub.state !== 'empty') out.push(tub);
    }
    return out;
  }
  const saveTubs = (list) => store.set('tubs', list);
  function setTub(slot, tub) { const list = tubs(); list[slot] = tub; saveTubs(list); }
  function tubInfo(tub) {
    if (tub.state !== 'frozen') return { view: tub.state, progress: tub.state === 'spun' ? 1 : 0 };
    const total = settings().freezeHours * 3600e3, readyAt = tub.filledAt + total, left = readyAt - Date.now();
    return { view: left <= 0 ? 'ready' : 'freezing', readyAt, left, progress: Math.min(1, Math.max(0, 1 - left / total)) };
  }
  function leftText(ms) {
    const min = Math.max(1, Math.ceil(ms / 60000)), h = Math.floor(min / 60);
    return h ? `${h} h ${min % 60} min` : `${min} min`;
  }
  // The tub's colour comes from the first flavour in the mix, else a plain vanilla.
  function tubColor(tub) {
    const p = pantry();
    for (const x of tub.mix || []) {
      const fl = p[x.ing]?.flavours?.find((f) => f.id === x.flavour);
      if (fl) return fl.color;
    }
    return '#ffe9a8';
  }
  // What each ingredient looks like inside the tub. A protein takes its flavour's colour.
  const ING_COLOR = { 'bebida-soja': '#f4ecd8', platano: '#ffe27a', 'yogur-griego-0': '#ffffff', 'cacao-puro': '#6e4630', 'crema-cacahuete': '#c98f5a',
    'crema-avellana': '#9a6a48', 'crema-pistacho': '#a8cf8a', cacahuetes: '#d9a868', avellanas: '#a97448' };
  const SHELF_COLOR = { base: '#f4ecd8', fruit: '#ffb3c8', other: '#e0d6ff', extra: '#c98f5a' };
  function ingColor(x, p) {
    const i = p[x.ing]; if (!i) return null;
    return i.flavours?.find((f) => f.id === x.flavour)?.color || ING_COLOR[x.ing] || SHELF_COLOR[i.shelf] || null;
  }
  // Swirls: the colours of the other ingredients, biggest first (tiny amounts only count for cocoa and the like).
  function tubSwirls(tub, main) {
    const p = pantry(), vol = mixVolume(tub.mix) || 1, out = [];
    for (const x of [...(tub.mix || [])].sort((a, b) => b.amount - a.amount)) {
      const c = ingColor(x, p), shelf = p[x.ing]?.shelf;
      if (!c || c === main || out.includes(c) || shelf === 'extra' || (x.amount / vol < 0.04 && shelf !== 'other')) continue;
      out.push(c);
    }
    return out.slice(0, 3);
  }
  // Toppings: the extras, whether they went in with the mix or at the machine.
  function tubToppings(tub) {
    const p = pantry();
    return [...new Set([...(tub.mix || []), ...(tub.extras || [])].filter((x) => p[x.ing]?.shelf === 'extra').map((x) => ingColor(x, p)).filter(Boolean))].slice(0, 3);
  }
  function flavourName(tub) {
    const p = pantry();
    const names = (tub.mix || []).map((x) => p[x.ing]?.flavours?.find((f) => f.id === x.flavour)?.name).filter(Boolean);
    return [...new Set(names)].join(' + ');
  }
  function tubSvg(tub, info, slot, opts = {}) {
    const level = opts.level ?? (tub.state === 'empty' ? 0 : Math.min(1, mixVolume(tub.mix) / FILL_ML || 0.8));
    const top = 114 - 90 * level, color = opts.color || tubColor(tub), id = `tubclip${slot}${opts.k || ''}`;
    const st = info.view;
    return `<svg viewBox="0 0 100 124" class="tubsvg st-${st}" aria-hidden="true">
      <defs><clipPath id="${id}"><path d="M15,24 L85,24 L78,110 Q78,115 73,115 L27,115 Q22,115 22,110 Z"/></clipPath></defs>
      <path class="tub-body" d="M15,24 L85,24 L78,110 Q78,115 73,115 L27,115 Q22,115 22,110 Z"/>
      <g clip-path="url(#${id})">
        <rect class="tub-fill" x="10" y="${top.toFixed(1)}" width="80" height="${(116 - top).toFixed(1)}" fill="${color}"/>
        ${level > 0 ? tubSwirls(tub, color).map((c, i, all) => { const y = (top + ((114 - top) * (i + 1)) / (all.length + 1)).toFixed(1);
          return `<path class="tub-band" d="M6,${y} q11,${i % 2 ? 7 : -7} 22,0 t22,0 t22,0 t22,0" fill="none" stroke="${c}" stroke-width="${Math.max(4, Math.min(8, (114 - top) / (all.length * 2.2))).toFixed(1)}" stroke-linecap="round"/>`; }).join('') : ''}
        ${level > 0 && st !== 'spun' ? tubToppings(tub).map((c, i) => `<ellipse class="tub-nut" cx="${30 + i * 19}" cy="${(top + 9 + (i % 2) * 5).toFixed(1)}" rx="4.5" ry="3.2" fill="${c}" transform="rotate(${i * 40 - 20} ${30 + i * 19} ${(top + 9).toFixed(1)})"/>`).join('') : ''}
        ${level > 0 ? `<path class="tub-wave" d="M10,${top.toFixed(1)} q10,-5 20,0 t20,0 t20,0 t20,0 v6 h-80 Z" fill="#fff" opacity="0.35"/>` : ''}
        ${st === 'freezing' || st === 'ready' ? `<rect class="tub-frost" x="10" y="20" width="80" height="100" fill="#eaf8ff" opacity="${(0.15 + 0.5 * info.progress).toFixed(2)}"/>
          <g class="tub-flakes" fill="#fff" opacity="${(0.3 + 0.7 * info.progress).toFixed(2)}"><circle cx="30" cy="50" r="2.2"/><circle cx="62" cy="40" r="1.8"/><circle cx="48" cy="72" r="2.4"/><circle cx="70" cy="88" r="1.8"/><circle cx="34" cy="96" r="2"/><circle cx="56" cy="104" r="1.6"/></g>` : ''}
      </g>
      <path class="tub-outline" d="M15,24 L85,24 L78,110 Q78,115 73,115 L27,115 Q22,115 22,110 Z"/>
      ${st === 'spun' ? `<path class="tub-swirl" d="M24,24 Q22,10 36,12 Q34,2 50,3 Q66,2 64,12 Q78,10 76,24 Z" fill="${color}"/>
        ${tubSwirls(tub, color).slice(0, 1).map((c) => `<path d="M31,19 Q40,12 50,17 T69,16" fill="none" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>`).join('')}
        ${(() => { const tops = tubToppings(tub); return tops.length ? [[37, 14], [50, 8], [62, 14], [44, 20], [57, 21]].map(([x, y], i) => `<ellipse class="tub-nut" cx="${x}" cy="${y}" rx="3.6" ry="2.6" fill="${tops[i % tops.length]}" transform="rotate(${i * 50} ${x} ${y})"/>`).join('') : ''; })()}` : `<rect class="tub-lid" x="9" y="12" width="82" height="13" rx="5"/>`}
      ${st === 'empty' ? '<path class="tub-plus" d="M50,58 v24 M38,70 h24"/>' : ''}
      ${st === 'ready' ? '<g class="tub-sparks"><path d="M12,40 l3,7 7,3 -7,3 -3,7 -3,-7 -7,-3 7,-3 Z"/><path d="M88,62 l2,5 5,2 -5,2 -2,5 -2,-5 -5,-2 5,-2 Z"/><path d="M80,6 l2,5 5,2 -5,2 -2,5 -2,-5 -5,-2 5,-2 Z"/></g>' : ''}
    </svg>`;
  }
  function tubCard(tub, slot) {
    const info = tubInfo(tub), st = info.view;
    const label = { empty: t('stEmpty'), freezing: t('stFreezing'), ready: t('stReady'), spun: t('stSpun') }[st];
    const sub = st === 'empty' ? `＋ ${t('fill')}`
      : st === 'freezing' ? t('left', { t: leftText(info.left) })
      : st === 'ready' ? `🌀 ${t('spinNow')}` : '⭐';
    const fl = flavourName(tub);
    return `<button type="button" class="tub st-${st}${tub.justReady ? ' just-ready' : ''}" data-act="tub" data-slot="${slot}" aria-label="${esc(t('tub'))} ${slot + 1}: ${esc(label)}">
      <span class="tub-n">${slot + 1}</span>${tubSvg(tub, info, slot)}
      <span class="tub-state">${esc(label)}</span>
      ${fl ? `<span class="tub-flavour">${esc(fl)}</span>` : ''}
      <span class="tub-sub">${esc(sub)}</span></button>`;
  }

  // The freezer: tubs three to a shelf.
  function shelvesHtml(list) {
    let out = '';
    for (let i = 0; i < list.length; i += 3) out += `<div class="frz-shelf">${list.slice(i, i + 3).map((tub, j) => tubCard(tub, i + j)).join('')}</div>`;
    return out;
  }
  const ICICLES = (() => { let d = 'M0,0 H300 V3', x = 300; const w = [14, 9, 18, 11, 7, 16, 10, 13, 8, 17]; for (let i = 0; x > 0; i++) { const s = w[i % w.length], h = 5 + ((i * 7) % 11); d += ` Q${x - s * 0.2},3 ${x - s / 2},${3 + h} Q${x - s * 0.8},3 ${Math.max(0, x - s)},3`; x -= s; } return `<svg class="frz-ice" viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true"><path d="${d} Z"/></svg>`; })();

  // ---------- mascot lines, toast and voice ----------
  const mascot = (pose) => (window.Heladero ? window.Heladero.svg(pose) : '<div class="mascot-fallback">🍦</div>');
  const lastLine = {};
  function line(key, vars) {
    const pool = data.lines?.[key]?.[lang] || data.lines?.[key]?.es;
    if (!pool?.length) return t(key, vars);
    let i = Math.floor(Math.random() * pool.length);
    if (pool.length > 1 && i === lastLine[key]) i = (i + 1) % pool.length;
    lastLine[key] = i;
    return t({ es: pool[i] }, vars);
  }
  let toastTimer = 0;
  // The mascot says a line: in the hero bubble when it is on screen, else in a small toast. Spoken unless quiet.
  function say(key, vars, { quiet = false, pose } = {}) {
    const text = line(key, vars), bubble = $('bubble');
    if (bubble && document.body.contains(bubble)) {
      bubble.textContent = text;
      bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop');
      if (pose && $('heroMascot')) $('heroMascot').innerHTML = mascot(pose);
    } else {
      toastEl.innerHTML = `<span class="toast-head">${window.Heladero ? window.Heladero.head(pose === 'freeze' ? 'freeze' : 'cheer') : '🍦'}</span><span>${esc(text)}</span>`;
      toastEl.hidden = false;
      toastEl.classList.remove('show'); void toastEl.offsetWidth; toastEl.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { toastEl.hidden = true; }, 4200);
    }
    if (!quiet) window.Sound?.speak(text, lang);
    return text;
  }
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); }
    catch { const ta = Object.assign(document.createElement('textarea'), { value: text }); document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
  }

  // ---------- routes and actions ----------
  const routes = {}, acts = {};
  const tabs = [{ id: 'home', hash: '#/', icon: '🍦', label: 'tabTubs' }];
  const go = (hash) => { if (location.hash === hash) route(); else location.hash = hash; };

  function renderHome() {
    const list = tubs(), infos = list.map(tubInfo);
    const count = (v) => infos.filter((i) => i.view === v).length;
    view.innerHTML = `
      <section class="hero">
        <button type="button" class="mascot" id="heroMascot" data-act="mascot" aria-label="El Heladero Loco">${mascot(count('ready') ? 'cheer' : 'idle')}</button>
        <div class="bubble" id="bubble">${esc(line(count('ready') ? 'readyHello' : 'hello'))}</div>
      </section>
      <section class="frz">
        <div class="frz-top"><span class="frz-led" aria-hidden="true">❄ −18 °C</span><span class="counts">${esc(t('counts', { f: count('freezing'), r: count('ready'), e: count('empty') }))}</span></div>
        ${ICICLES}
        <div class="tubs" id="tubs">${shelvesHtml(list)}</div>
        <i class="mist m1" aria-hidden="true"></i><i class="mist m2" aria-hidden="true"></i>
      </section>
      ${(window.HL.homeExtras || []).map((f) => f()).join('')}`;
    clearJustReady();
  }
  routes.home = { render: renderHome, tab: 'home' };
  // Tap a tub: each state opens its own screen (registered by the feature files).
  const TUB_ROUTE = { empty: 'build', freezing: 'tub', ready: 'spin', spun: 'rate' };
  acts.tub = (el) => {
    const slot = +el.dataset.slot, name = TUB_ROUTE[tubInfo(tubs()[slot]).view];
    window.Sound?.play('tap');
    if (routes[name]) go(`#/${name}/${slot + 1}`); else say('soon');
  };
  acts.mascot = (el) => {
    el.classList.remove('wiggle'); void el.offsetWidth; el.classList.add('wiggle');
    window.Sound?.play('pop');
    say('hello');
  };
  acts.mute = () => {
    window.Sound?.setMuted(!window.Sound.muted);
    renderMute();
    window.Sound?.play('chime');
  };
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (el && acts[el.dataset.act]) acts[el.dataset.act](el, e);
  });

  // A tub that turned ready while the app was open (or since the last visit) sparkles and chimes once.
  function checkReady() {
    const list = tubs();
    let fresh = 0;
    list.forEach((tub) => {
      if (tub.state === 'frozen' && !tub.readySeen && tubInfo(tub).view === 'ready') { tub.readySeen = true; tub.justReady = true; fresh++; }
    });
    if (fresh) saveTubs(list);
    return fresh;
  }
  function clearJustReady() {
    const list = tubs();
    if (list.some((x) => x.justReady)) { list.forEach((x) => delete x.justReady); saveTubs(list); }
  }
  setInterval(() => {
    if (current !== 'home' || document.hidden) return;
    const fresh = checkReady();
    const el = $('tubs');
    if (el) el.innerHTML = shelvesHtml(tubs());
    if (fresh) { window.Sound?.play('chime'); say('ready', {}, { pose: 'cheer' }); clearJustReady(); }
  }, 20000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && current === 'home') route(); });

  let current = '';
  function route() {
    if (!loaded) return;
    const [, name = 'home', arg] = location.hash.match(/^#\/([\w-]+)(?:\/(.+))?$/) || [];
    const r = routes[name] || routes.home;
    current = routes[name] ? name : 'home';
    if (current === 'home') checkReady();
    document.body.dataset.route = current;
    toastEl.hidden = true;
    r.render(arg ? decodeURIComponent(arg) : undefined);
    renderNav(r.tab);
    if (!r.keepScroll) window.scrollTo(0, 0);
  }
  function renderNav(active) {
    nav.hidden = tabs.length < 2;
    nav.innerHTML = tabs.map((x) => `<a href="${x.hash}" class="${x.id === active ? 'active' : ''}"><span aria-hidden="true">${x.icon}</span>${esc(t(x.label))}</a>`).join('');
  }

  // ---------- shell ----------
  let installEvent = null;
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  function renderFoot() {
    foot.innerHTML = `<p>${esc(t('disclaimer'))}</p>
      ${standalone ? '' : `<button class="btn small" id="installBtn" type="button">📲 ${esc(t('install'))}</button>
      <p class="install-help" id="installHelp" hidden>${esc(t('installOther'))}</p>`}
      <p class="ver"><a href="#/changelog">Heladero Loco v${VERSION} · ${esc(t('changelog'))}</a></p>`;
    $('installBtn')?.addEventListener('click', async () => {
      if (!installEvent) { $('installHelp').hidden = !$('installHelp').hidden; return; }
      installEvent.prompt();
      await installEvent.userChoice;
      installEvent = null;
    });
  }
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvent = e; });
  function renderMute() {
    const b = $('muteBtn'), m = window.Sound?.muted;
    b.textContent = m ? '🔇' : '🔊';
    b.setAttribute('aria-label', t('mute'));
    b.setAttribute('aria-pressed', m ? 'true' : 'false');
  }

  // The changelog page: CHANGELOG.md rendered with a very small Markdown subset (headings, bullets, bold, code).
  routes.changelog = {
    tab: 'home',
    render() {
      view.innerHTML = `<a class="back" href="#/">${esc(t('back'))}</a><article class="card prose" id="clog"><p class="muted">…</p></article>`;
      fetch('CHANGELOG.md', { cache: 'no-cache' }).then((r) => r.text()).then((md) => {
        const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`(.+?)`/g, '<code>$1</code>').replace(/\[(.+?)\]\((https?:[^)]+)\)/g, '$1');
        let html = '', inList = false;
        for (const l of md.split('\n')) {
          const li = l.match(/^\s*- (.*)/);
          if (li) { html += (inList ? '' : '<ul>') + `<li>${inline(li[1])}</li>`; inList = true; continue; }
          if (inList) { html += '</ul>'; inList = false; }
          const h = l.match(/^(#{1,3}) (.*)/);
          if (h) html += `<h${h[1].length + 1}>${inline(h[2])}</h${h[1].length + 1}>`;
          else if (l.trim()) html += `<p>${inline(l)}</p>`;
        }
        if ($('clog')) $('clog').innerHTML = html + (inList ? '</ul>' : '');
      }).catch(() => { if ($('clog')) $('clog').innerHTML = `<p>${esc(t('loadError'))}</p>`; });
    },
  };

  function setLang(next) {
    lang = next;
    store.set('lang', next);
    document.documentElement.lang = next;
    document.querySelectorAll('.langs button').forEach((b) => b.classList.toggle('active', b.dataset.lang === next));
    renderFoot(); renderMute(); route();
  }
  document.querySelector('.langs').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-lang]');
    if (b) setLang(b.dataset.lang);
  });
  window.addEventListener('hashchange', route);
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => { /* offline cache is optional */ });

  let loaded = false;
  const get = (f, d) => fetch(`data/${f}`, { cache: 'no-cache' }).then((r) => { if (!r.ok) throw new Error(f); return r.json(); }).catch(() => d);
  // Runs after every script has registered its routes.
  window.addEventListener('DOMContentLoaded', () => {
    Promise.all([get('lines.json', {}), get('ingredients.json', {}), get('recipes.json', []), get('guides.json', [])])
      .then(([lines, ingredients, recipes, guides]) => { Object.assign(data, { lines, ingredients, recipes, guides }); loaded = true; setLang(lang); });
  });

  return {
    VERSION, FILL_ML, T, t, esc, $, view, store, settings, data, pantry, ing, ingName, macros, macroLine, macroBar, amountText, mixVolume,
    tubs, saveTubs, setTub, tubInfo, tubSvg, tubColor, flavourName, leftText, mascot, line, say, copyText, routes, acts, tabs, go, route,
    dateFmt, timeFmt, num, r0, get lang() { return lang; },
  };
})();
