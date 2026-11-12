// Heladero Loco: the freezer wait (a tub's detail while it freezes) and the machine step (program, extras, final macros).
(() => {
  const { t, esc, T, view, routes, acts } = HL;
  const play = (n) => window.Sound?.play(n);

  Object.assign(T, {
    tubTitle: { es: 'Tarrina {n}', ca: 'Terrina {n}', en: 'Tub {n}' },
    readyAt: { es: 'Lista el {when}', ca: 'A punt {when}', en: 'Ready {when}' },
    frozenFor: { es: 'Congelada desde {when}', ca: 'Congelada des de {when}', en: 'Frozen since {when}' },
    contents: { es: 'Qué lleva', ca: 'Què porta', en: 'What is in it' },
    spinAnyway: { es: 'Procesar ya', ca: 'Processa ja', en: 'Spin it now' },
    spinAnywayAsk: { es: 'Aún no han pasado las horas de congelado. ¿Procesarla ya?', ca: 'Encara no han passat les hores de congelat. La vols processar ja?', en: 'The freezing time is not over yet. Spin it anyway?' },
    emptyTub: { es: 'Vaciar tarrina', ca: 'Buida la terrina', en: 'Empty the tub' },
    emptyAsk: { es: '¿Vaciar la tarrina {n} sin valorarla?', ca: 'Vols buidar la terrina {n} sense valorar-la?', en: 'Empty tub {n} without rating it?' },
    copyMacros: { es: 'Copiar macros', ca: 'Copia els macros', en: 'Copy macros' },
    copied: { es: '¡Copiado!', ca: 'Copiat!', en: 'Copied!' },
    spinTitle: { es: 'Tarrina {n} a la Ninja', ca: 'Terrina {n} a la Ninja', en: 'Tub {n} to the Ninja' },
    machine: { es: 'En la máquina', ca: 'A la màquina', en: 'On the machine' },
    step1: { es: 'Programa <b>LIGHT ICE CREAM</b>, nada más sacarla del congelador.', ca: 'Programa <b>LIGHT ICE CREAM</b>, tot just treta del congelador.', en: 'Run <b>LIGHT ICE CREAM</b>, straight out of the freezer.' },
    step2: { es: '¿Queda arenoso? Echa 1 cucharada de bebida en el centro y pulsa <b>RE-SPIN</b>.', ca: 'Queda sorrenc? Posa 1 cullerada de beguda al centre i prem <b>RE-SPIN</b>.', en: 'Crumbly? Add 1 tablespoon of drink in the centre and press <b>RE-SPIN</b>.' },
    step3: { es: 'Extras: haz un hueco hasta el fondo, échalos dentro y pulsa <b>EXTRAS</b>.', ca: 'Extres: fes un forat fins al fons, posa’ls a dins i prem <b>EXTRAS</b>.', en: 'Extras: dig a hole to the bottom, drop them in and press <b>EXTRAS</b>.' },
    extras: { es: 'Extras', ca: 'Extres', en: 'Extras' },
    noExtras: { es: 'Sin extras. Toca uno abajo para añadirlo.', ca: 'Sense extres. Toca’n un a sota per afegir-lo.', en: 'No extras. Tap one below to add it.' },
    baseLine: { es: 'Base', ca: 'Base', en: 'Base' },
    finalMacros: { es: 'Macros finales', ca: 'Macros finals', en: 'Final macros' },
    spunDone: { es: '¡Helado hecho!', ca: 'Gelat fet!', en: 'Ice cream done!' },
  });

  const slotOf = (arg) => { const slot = +arg - 1, tub = HL.tubs()[slot]; return tub ? { slot, tub } : null; };
  const contents = (list) => `<ul class="contents">${(list || []).map((x) => {
    const i = HL.ing(x.ing), fl = i?.flavours?.find((f) => f.id === x.flavour);
    return `<li><span aria-hidden="true">${esc(i?.emoji || '🥄')}</span> ${esc(HL.ingName(i))}${fl ? ` <em>${esc(fl.name)}</em>` : ''} <b>${esc(HL.amountText(x))}</b></li>`;
  }).join('')}</ul>`;
  HL.contents = contents;
  // One line to paste into a tracker: "Tarrina 3 · 372 kcal · P 49 · C 15 · G 12".
  HL.copyLine = (slot, m) => `${t('tub')} ${slot + 1} · ${HL.macroLine(m)}`;
  acts['copy-macros'] = async (el) => {
    await HL.copyText(el.dataset.text);
    play('pop');
    el.textContent = `✓ ${t('copied')}`;
  };
  acts['tub-empty'] = (el) => {
    const slot = +el.dataset.slot;
    if (!confirm(t('emptyAsk', { n: slot + 1 }))) return;
    HL.setTub(slot, { state: 'empty' });
    play('pop');
    HL.go('#/');
    setTimeout(() => HL.say('emptied'), 80);
  };

  // ---------- a tub in the freezer ----------
  routes.tub = {
    tab: 'home',
    render(arg) {
      const s = slotOf(arg);
      if (!s || s.tub.state !== 'frozen') { HL.go('#/'); return; }
      const { slot, tub } = s, info = HL.tubInfo(tub);
      if (info.view === 'ready') { HL.go(`#/spin/${slot + 1}`); return; }
      const m = HL.macros(tub.mix);
      view.innerHTML = `
        <a class="back" href="#/">${esc(t('back'))}</a>
        <h1 class="title">${esc(t('tubTitle', { n: slot + 1 }))} · ${esc(t('stFreezing'))}</h1>
        <section class="card freezer">
          <div class="freezer-tub">${HL.tubSvg(tub, info, slot, { k: 'd' })}</div>
          <div><p class="big">${esc(t('left', { t: HL.leftText(info.left) }))}</p>
            <p class="muted">${esc(t('readyAt', { when: HL.timeFmt(info.readyAt) }))}</p>
            <div class="meter"><i style="width:${(info.progress * 100).toFixed(0)}%"></i></div></div>
        </section>
        <h2 class="sec">${esc(t('contents'))}</h2>
        <section class="card">${contents(tub.mix)}${HL.macroBar(m)}</section>
        <div class="actions">
          <button type="button" class="btn small ghost" data-act="copy-macros" data-text="${esc(HL.copyLine(slot, m))}">📋 ${esc(t('copyMacros'))}</button>
          <button type="button" class="btn small vanilla" data-act="spin-anyway" data-slot="${slot}">🌀 ${esc(t('spinAnyway'))}</button>
          <button type="button" class="btn small ghost" data-act="tub-empty" data-slot="${slot}">🗑 ${esc(t('emptyTub'))}</button>
        </div>`;
      HL.say('notReady', {}, { quiet: true, pose: 'freeze' });
    },
  };
  let forced = -1;
  acts['spin-anyway'] = (el) => {
    if (!confirm(t('spinAnywayAsk'))) return;
    forced = +el.dataset.slot;
    HL.go(`#/spin/${forced + 1}`);
  };

  // ---------- the machine ----------
  let draft = null; // { slot, extras: [{ ing, amount }] }
  function drawSpin(why) {
    const slot = draft.slot, tub = HL.tubs()[slot];
    const base = HL.macros(tub.mix), total = HL.macros(tub.mix, draft.extras);
    view.innerHTML = `
      <a class="back" href="#/">${esc(t('back'))}</a>
      <h1 class="title">${esc(t('spinTitle', { n: slot + 1 }))}</h1>
      <section class="card machine">
        <div class="spin-tub" id="spinTub">${HL.tubSvg(tub, { view: 'ready', progress: 1 }, slot, { k: 's' })}</div>
        <ol class="steps"><li>${t('step1')}</li><li>${t('step2')}</li>${draft.extras.length ? `<li>${t('step3')}</li>` : ''}</ol>
      </section>
      <h2 class="sec">${esc(t('extras'))}</h2>
      ${draft.extras.length ? HL.picker.items(draft.extras) : `<p class="empty">${esc(t('noExtras'))}</p>`}
      ${HL.picker.fridge(['extra'], draft.extras)}
      <h2 class="sec">${esc(t('finalMacros'))}</h2>
      <section class="card">${HL.macroBar(total).replace('class="macros"', `class="macros${why ? ' bump' : ''}"`)}
        ${draft.extras.length ? `<p class="muted small">${esc(t('baseLine'))}: ${esc(HL.macroLine(base))}</p>` : ''}
        <details class="what"><summary>${esc(t('contents'))}</summary>${contents(tub.mix)}</details></section>
      <div class="actions">
        <button type="button" class="btn small ghost" data-act="copy-macros" data-text="${esc(HL.copyLine(slot, total))}">📋 ${esc(t('copyMacros'))}</button>
        <button type="button" class="btn mint block" data-act="spin-done">🌀 ${esc(t('spunDone'))}</button>
        <button type="button" class="btn small ghost" data-act="tub-empty" data-slot="${slot}">🗑 ${esc(t('emptyTub'))}</button>
      </div>`;
  }
  routes.spin = {
    tab: 'home',
    render(arg) {
      const s = slotOf(arg);
      if (!s || s.tub.state !== 'frozen') { HL.go('#/'); return; }
      if (HL.tubInfo(s.tub).view !== 'ready' && forced !== s.slot) { HL.go(`#/tub/${s.slot + 1}`); return; }
      const fresh = !draft || draft.slot !== s.slot;
      if (fresh) draft = { slot: s.slot, extras: [] };
      HL.picker.open(draft.extras, drawSpin);
      drawSpin();
      if (fresh) HL.say('spinIntro', {}, { quiet: true });
    },
  };
  acts['spin-done'] = (el) => {
    if (!draft) return;
    const slot = draft.slot, tub = HL.tubs()[slot];
    el.disabled = true;
    document.getElementById('spinTub')?.classList.add('spinning');
    play('whirr');
    setTimeout(() => {
      HL.setTub(slot, { ...tub, state: 'spun', extras: draft.extras.map((x) => ({ ...x })), spunAt: Date.now() });
      draft = null; forced = -1;
      HL.go(routes.rate ? `#/rate/${slot + 1}` : '#/');
      setTimeout(() => HL.say('spun', {}, { pose: 'cheer' }), 80);
    }, 1500);
  };
})();
