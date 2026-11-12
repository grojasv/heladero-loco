// Heladero Loco: rating an eaten tub, and the history that ranks the mixes by score.
(() => {
  const { t, esc, T, view, store, routes, acts } = HL;
  const play = (n) => window.Sound?.play(n);

  Object.assign(T, {
    tabHistory: { es: 'Historial', ca: 'Historial', en: 'History' },
    rateTitle: { es: '¿Qué tal la tarrina {n}?', ca: 'Què tal la terrina {n}?', en: 'How was tub {n}?' },
    texture: { es: 'Textura', ca: 'Textura', en: 'Texture' },
    taste: { es: 'Sabor', ca: 'Gust', en: 'Taste' },
    respin: { es: 'Necesitó RE-SPIN', ca: 'Va necessitar RE-SPIN', en: 'It needed a RE-SPIN' },
    note: { es: 'Nota (opcional)', ca: 'Nota (opcional)', en: 'Note (optional)' },
    notePh: { es: 'Muy dulce, algo arenoso, perfecto con pistacho…', ca: 'Molt dolç, una mica sorrenc, perfecte amb festuc…', en: 'Too sweet, a bit crumbly, perfect with pistachio…' },
    saveRating: { es: 'Guardar valoración', ca: 'Desa la valoració', en: 'Save rating' },
    pickBoth: { es: 'Puntúa textura y sabor para guardar.', ca: 'Puntua textura i gust per desar.', en: 'Rate texture and taste to save.' },
    skipRating: { es: 'Vaciar sin valorar', ca: 'Buida sense valorar', en: 'Empty without rating' },
    ranking: { es: 'Ranking de mezclas', ca: 'Rànquing de barreges', en: 'Mix ranking' },
    rankingHint: { es: 'Media de textura y sabor de cada mezcla que has probado.', ca: 'Mitjana de textura i gust de cada barreja que has tastat.', en: 'Average of texture and taste for each mix you have tried.' },
    noHistory: { es: 'Aún no hay tarrinas valoradas. ¡El laboratorio necesita datos!', ca: 'Encara no hi ha terrines valorades. El laboratori necessita dades!', en: 'No rated tubs yet. The lab needs data!' },
    times: { es: '{n} veces', ca: '{n} vegades', en: '{n} times' },
    once: { es: '1 vez', ca: '1 vegada', en: 'once' },
    lastTime: { es: 'última: {d}', ca: 'última: {d}', en: 'last: {d}' },
    repeat: { es: 'Repetir', ca: 'Repeteix', en: 'Repeat' },
    diary: { es: 'Diario', ca: 'Diari', en: 'Diary' },
    plainMix: { es: 'Mezcla sin proteína', ca: 'Barreja sense proteïna', en: 'Mix with no protein' },
    delAsk: { es: '¿Borrar esta valoración?', ca: 'Vols esborrar aquesta valoració?', en: 'Delete this rating?' },
    respinShort: { es: 'RE-SPIN', ca: 'RE-SPIN', en: 'RE-SPIN' },
    insights: { es: 'Qué funciona', ca: 'Què funciona', en: 'What works' },
    insightsHint: { es: 'Media de todas las tarrinas que llevan cada cosa. Con pocas tarrinas, es solo una pista.', ca: 'Mitjana de totes les terrines que porten cada cosa. Amb poques terrines, només és una pista.', en: 'Average of every tub that had each thing. With few tubs it is only a hint.' },
    gProtein: { es: 'Por proteína', ca: 'Per proteïna', en: 'By protein' },
    gFlavour: { es: 'Por sabor', ca: 'Per gust', en: 'By flavour' },
    gExtra: { es: 'Por extra', ca: 'Per extra', en: 'By extra' },
    gStab: { es: 'Estabilizante', ca: 'Estabilitzant', en: 'Stabiliser' },
    withStab: { es: 'Con estabilizante', ca: 'Amb estabilitzant', en: 'With a stabiliser' },
    noStab: { es: 'Sin estabilizante', ca: 'Sense estabilitzant', en: 'No stabiliser' },
    noExtra: { es: 'Sin extras', ca: 'Sense extres', en: 'No extras' },
    tubsN: { es: '{n} tarrinas', ca: '{n} terrines', en: '{n} tubs' },
    tubs1: { es: '1 tarrina', ca: '1 terrina', en: '1 tub' },
    respinPct: { es: 'RE-SPIN {p}%', ca: 'RE-SPIN {p}%', en: 'RE-SPIN {p}%' },
    topMix: { es: 'Top: {name}', ca: 'Top: {name}', en: 'Top: {name}' },
  });
  HL.tabs.push({ id: 'history', hash: '#/history', icon: '🏆', label: 'tabHistory' });

  const readLog = () => store.get('log', []);
  HL.readLog = readLog;
  // A short name for a mix: its proteins with their flavours, then the extras.
  function mixName(mix, extras) {
    const p = HL.pantry();
    const prots = (mix || []).filter((x) => p[x.ing]?.shelf === 'protein').map((x) => {
      const fl = p[x.ing].flavours?.find((f) => f.id === x.flavour);
      return `${HL.ingName(p[x.ing])}${fl ? ` ${fl.name}` : ''}`;
    });
    const ex = (extras || []).map((x) => HL.ingName(p[x.ing]));
    return [prots.join(' + ') || t('plainMix'), ...ex].join(' + ');
  }
  HL.mixName = mixName;
  // Mixes grouped by signature and sorted by average score (ties: the one made more often first).
  function ranking() {
    const groups = new Map();
    for (const e of readLog()) {
      const k = HL.sig(e.mix, e.extras);
      if (!groups.has(k)) groups.set(k, { mix: e.mix, extras: e.extras || [], entries: [] });
      groups.get(k).entries.push(e);
    }
    const avg = (list, f) => list.reduce((s, e) => s + f(e), 0) / list.length;
    return [...groups.values()].map((g) => ({
      ...g, n: g.entries.length, last: g.entries[0].at,
      texture: avg(g.entries, (e) => e.texture), taste: avg(g.entries, (e) => e.taste),
      score: avg(g.entries, (e) => (e.texture + e.taste) / 2),
    })).sort((a, b) => b.score - a.score || b.n - a.n);
  }
  // What works: average scores of every tub that had a given protein, flavour, extra, or a stabiliser.
  // A tub counts once per row, whatever the amounts, so small changes to a mix still add up.
  function insights() {
    const p = HL.pantry();
    const groups = { gProtein: new Map(), gFlavour: new Map(), gExtra: new Map(), gStab: new Map() };
    for (const e of readLog()) {
      const seen = new Set();
      const add = (g, key, label) => {
        if (seen.has(g + key)) return;
        seen.add(g + key);
        if (!groups[g].has(key)) groups[g].set(key, { label, entries: [] });
        groups[g].get(key).entries.push(e);
      };
      let stab = false, extra = false;
      for (const x of [...(e.mix || []), ...(e.extras || [])]) {
        const i = p[x.ing];
        if (!i) continue;
        if (i.shelf === 'protein') {
          add('gProtein', x.ing, HL.ingName(i));
          const fl = i.flavours?.find((f) => f.id === x.flavour);
          if (fl) add('gFlavour', fl.id, fl.name);
        } else if (i.shelf === 'stabiliser') stab = true;
        else if (i.shelf === 'extra') { extra = true; add('gExtra', x.ing, HL.ingName(i)); }
      }
      add('gStab', stab ? 'y' : 'n', t(stab ? 'withStab' : 'noStab'));
      if (!extra) add('gExtra', '-', t('noExtra'));
    }
    const avg = (list, f) => list.reduce((s, e) => s + f(e), 0) / list.length;
    return Object.entries(groups).map(([g, map]) => ({
      g, rows: [...map.values()].map((r) => ({
        label: r.label, n: r.entries.length, texture: avg(r.entries, (e) => e.texture), taste: avg(r.entries, (e) => e.taste),
        score: avg(r.entries, (e) => (e.texture + e.taste) / 2), respin: avg(r.entries, (e) => (e.respin ? 1 : 0)),
      })).sort((a, b) => b.score - a.score || b.n - a.n),
    })).filter((x) => x.rows.length);
  }
  HL.insights = insights;
  HL.loaders.push(() => ranking().slice(0, 3).map((g) => ({ label: `🏆 ${mixName(g.mix)} (${g.score.toFixed(1)})`, mix: g.mix })));

  // ---------- rate ----------
  let draft = null; // { slot, texture, taste, respin, note }
  const cones = (key, value) => `<div class="cones" role="group">${[1, 2, 3, 4, 5].map((n) =>
    `<button type="button" class="cone${n <= value ? ' on' : ''}" data-act="rate-set" data-key="${key}" data-v="${n}" aria-label="${n}">🍦</button>`).join('')}<b>${value || '–'}</b></div>`;
  function drawRate() {
    const slot = draft.slot, tub = HL.tubs()[slot], m = HL.macros(tub.mix, tub.extras);
    const okToSave = draft.texture && draft.taste;
    view.innerHTML = `
      <a class="back" href="#/">${esc(t('back'))}</a>
      <h1 class="title">${esc(t('rateTitle', { n: slot + 1 }))}</h1>
      <section class="card"><p class="mixname">${esc(mixName(tub.mix, tub.extras))}</p>
        ${HL.macroBar(m)}
        <details class="what"><summary>${esc(t('contents'))}</summary>${HL.contents([...(tub.mix || []), ...(tub.extras || [])])}</details>
        <p class="row end"><button type="button" class="btn small ghost" data-act="copy-macros" data-text="${esc(HL.copyLine(slot, m))}">📋 ${esc(t('copyMacros'))}</button></p></section>
      <section class="card rate">
        <h2>${esc(t('texture'))}</h2>${cones('texture', draft.texture)}
        <h2>${esc(t('taste'))}</h2>${cones('taste', draft.taste)}
        <label class="check"><input type="checkbox" id="rateRespin"${draft.respin ? ' checked' : ''}> ${esc(t('respin'))}</label>
        <label class="field">${esc(t('note'))}<textarea id="rateNote" rows="2" placeholder="${esc(t('notePh'))}">${esc(draft.note)}</textarea></label>
      </section>
      <div class="actions">
        ${okToSave ? '' : `<p class="muted center">${esc(t('pickBoth'))}</p>`}
        <button type="button" class="btn block" data-act="rate-save"${okToSave ? '' : ' disabled'}>⭐ ${esc(t('saveRating'))}</button>
        <button type="button" class="btn small ghost" data-act="tub-empty" data-slot="${slot}">🗑 ${esc(t('skipRating'))}</button>
      </div>`;
  }
  const keepInputs = () => {
    draft.respin = !!document.getElementById('rateRespin')?.checked;
    draft.note = document.getElementById('rateNote')?.value ?? draft.note;
  };
  routes.rate = {
    tab: 'home',
    render(arg) {
      const slot = +arg - 1, tub = HL.tubs()[slot];
      if (!tub || tub.state !== 'spun') { HL.go('#/'); return; }
      const fresh = !draft || draft.slot !== slot;
      if (fresh) draft = { slot, texture: 0, taste: 0, respin: false, note: '' };
      drawRate();
      if (fresh) HL.say('rateIntro', {}, { quiet: true });
    },
  };
  acts['rate-set'] = (el) => {
    keepInputs();
    draft[el.dataset.key] = +el.dataset.v;
    play('tick');
    const y = window.scrollY; drawRate(); window.scrollTo(0, y);
  };
  acts['rate-save'] = () => {
    if (!draft?.texture || !draft?.taste) return;
    keepInputs();
    const slot = draft.slot, tub = HL.tubs()[slot];
    const m = HL.macros(tub.mix, tub.extras);
    const entry = {
      at: new Date().toISOString(), mix: tub.mix, extras: tub.extras || [], filledAt: tub.filledAt,
      macros: { kcal: HL.r0(m.kcal), protein: HL.r0(m.protein), carbs: HL.r0(m.carbs), fat: HL.r0(m.fat) },
      texture: draft.texture, taste: draft.taste, respin: draft.respin, note: draft.note.trim(),
    };
    store.set('log', [entry, ...readLog()].slice(0, 500));
    HL.setTub(slot, { state: 'empty' });
    const score = (entry.texture + entry.taste) / 2;
    draft = null;
    if (score < 3) play('sad'); else { play('jingle'); sprinkles(); }
    HL.go('#/history');
    setTimeout(() => HL.say(score >= 4.5 ? 'rateTop' : score < 3 ? 'rateLow' : 'rateMid'), 80);
  };
  // A burst of sprinkles over the screen.
  function sprinkles() {
    const box = Object.assign(document.createElement('div'), { className: 'sprinkles' });
    const colors = ['#ff8fb1', '#8fe0c4', '#ffe9a8', '#bfe6ff', '#d9a8ff'];
    for (let i = 0; i < 36; i++) {
      const s = document.createElement('i');
      s.style.cssText = `left:${Math.random() * 100}%;background:${colors[i % colors.length]};animation-delay:${(Math.random() * 0.5).toFixed(2)}s;transform:rotate(${Math.floor(Math.random() * 180)}deg)`;
      box.append(s);
    }
    document.body.append(box);
    setTimeout(() => box.remove(), 2600);
  }
  HL.sprinkles = sprinkles;

  // ---------- history ----------
  const score1 = (n) => n.toFixed(1);
  const MEDAL = ['🥇', '🥈', '🥉'];
  routes.history = {
    tab: 'history',
    render() {
      const log = readLog(), rank = ranking();
      if (!log.length) {
        view.innerHTML = `<h1 class="title">🏆 ${esc(t('ranking'))}</h1><section class="hero"><div class="mascot">${HL.mascot('mix')}</div><div class="bubble">${esc(t('noHistory'))}</div></section>`;
        return;
      }
      view.innerHTML = `
        <h1 class="title">🏆 ${esc(t('ranking'))}</h1>
        <p class="muted hint">${esc(t('rankingHint'))}</p>
        <div class="list">${rank.map((g, i) => `<article class="card rank${i < 3 ? ` top${i + 1}` : ''}">
          <div class="rank-head"><span class="medal">${MEDAL[i] || `#${i + 1}`}</span><h3>${esc(mixName(g.mix, g.extras))}</h3><span class="score">${score1(g.score)}<small>/5</small></span></div>
          <p class="rank-sub">${esc(t('texture'))} ${score1(g.texture)} · ${esc(t('taste'))} ${score1(g.taste)} · ${esc(g.n === 1 ? t('once') : t('times', { n: g.n }))} · ${esc(t('lastTime', { d: HL.dateFmt(g.last, { day: 'numeric', month: 'short' }) }))}</p>
          <p class="rank-sub">${esc(HL.macroLine(HL.macros(g.mix, g.extras)))}</p>
          <details class="what"><summary>${esc(t('contents'))}</summary>${HL.contents([...g.mix, ...g.extras])}</details>
          <p class="row end"><button type="button" class="btn small mint" data-act="hist-repeat" data-i="${i}">🔁 ${esc(t('repeat'))}</button></p>
        </article>`).join('')}</div>
        <h2 class="sec">🔬 ${esc(t('insights'))}</h2>
        <p class="muted hint">${esc(t('insightsHint'))}</p>
        ${insights().map((x) => `<h3 class="sub">${esc(t(x.g))}</h3><ul class="card diary insight">${x.rows.map((r) => `<li><div><b>${esc(r.label)}</b>
          <span class="muted">${esc(r.n === 1 ? t('tubs1') : t('tubsN', { n: r.n }))} · ${esc(t('texture'))} ${score1(r.texture)} · ${esc(t('taste'))} ${score1(r.taste)}${r.respin ? ` · ${esc(t('respinPct', { p: Math.round(r.respin * 100) }))}` : ''}</span></div>
          <span class="score${r.n < 2 ? ' few' : ''}">${score1(r.score)}</span></li>`).join('')}</ul>`).join('')}
        <h2 class="sec">📓 ${esc(t('diary'))}</h2>
        <ul class="card diary">${log.map((e, i) => `<li><div><b>${esc(mixName(e.mix, e.extras))}</b>
          <span class="muted">${esc(HL.dateFmt(e.at))} · ${esc(t('texture'))} ${e.texture} · ${esc(t('taste'))} ${e.taste}${e.respin ? ` · ${esc(t('respinShort'))}` : ''} · ${e.macros?.kcal ?? '?'} kcal</span>
          ${e.note ? `<em>«${esc(e.note)}»</em>` : ''}</div>
          <button type="button" class="x" data-act="hist-del" data-i="${i}" aria-label="✕">✕</button></li>`).join('')}</ul>`;
    },
  };
  acts['hist-repeat'] = (el) => { const g = ranking()[+el.dataset.i]; if (g) { play('tap'); HL.startBuild(g.mix); } };
  acts['hist-del'] = (el) => {
    if (!confirm(t('delAsk'))) return;
    const log = readLog(); log.splice(+el.dataset.i, 1); store.set('log', log);
    play('pop'); HL.route();
  };
})();
