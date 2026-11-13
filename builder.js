// Heladero Loco: the builder. Open the fridge, tap ingredients into a tub, watch the macros, send it to the freezer.
// Also the shared ingredient picker (HL.picker) that the spin screen reuses for extras.
(() => {
  const { t, esc, T, view, store, routes, acts } = HL;
  const play = (n) => window.Sound?.play(n);

  Object.assign(T, {
    build: { es: 'Llenar la tarrina {n}', ca: 'Omple la terrina {n}', en: 'Fill tub {n}' },
    fridge: { es: 'La nevera', ca: 'La nevera', en: 'The fridge' },
    inTub: { es: 'En la tarrina', ca: 'A la terrina', en: 'In the tub' },
    nothingYet: { es: 'Toca un ingrediente de la nevera para echarlo.', ca: 'Toca un ingredient de la nevera per posar-lo.', en: 'Tap an ingredient in the fridge to add it.' },
    shBase: { es: 'Base', ca: 'Base', en: 'Base' },
    shProtein: { es: 'Proteína', ca: 'Proteïna', en: 'Protein' },
    shFruit: { es: 'Fruta', ca: 'Fruita', en: 'Fruit' },
    shStabiliser: { es: 'Espesantes', ca: 'Espessidors', en: 'Stabilisers' },
    shOther: { es: 'Otros', ca: 'Altres', en: 'Other' },
    shExtra: { es: 'Extras', ca: 'Extres', en: 'Extras' },
    volume: { es: '{v} de {max} ml', ca: '{v} de {max} ml', en: '{v} of {max} ml' },
    warnOver: { es: 'Te pasas de la línea MAX FILL ({max} ml). Quita algo o rebosará.', ca: 'Passes de la línia MAX FILL ({max} ml). Treu alguna cosa o vessarà.', en: 'This is past the MAX FILL line ({max} ml). Remove something or it will overflow.' },
    warnStab: { es: 'Sin espesante, la mezcla puede separarse en dos capas al congelar. Añade goma xantana.', ca: 'Sense espessidor, la barreja es pot separar en dues capes en congelar-se. Afegeix goma xantana.', en: 'With no stabiliser the mix can split into two layers while freezing. Add xanthan gum.' },
    warnUnconfirmed: { es: '? = dato genérico, sin confirmar con tu etiqueta. Corrígelo en la despensa.', ca: '? = dada genèrica, sense confirmar amb la teva etiqueta. Corregeix-la al rebost.', en: '? = generic value, not checked against your label. Fix it in the pantry.' },
    freeze: { es: 'Al congelador', ca: 'Al congelador', en: 'Into the freezer' },
    howMany: { es: 'Tarrinas iguales', ca: 'Terrines iguals', en: 'Identical tubs' },
    sameAs: { es: 'Igual que la {n}', ca: 'Igual que la {n}', en: 'Same as tub {n}' },
    load: { es: 'Empezar desde', ca: 'Comença des de', en: 'Start from' },
    clear: { es: 'Vaciar', ca: 'Buida', en: 'Clear' },
    remove: { es: 'Quitar', ca: 'Treu', en: 'Remove' },
    less: { es: 'Menos', ca: 'Menys', en: 'Less' },
    more: { es: 'Más', ca: 'Més', en: 'More' },
    flavour: { es: 'Sabor', ca: 'Sabor', en: 'Flavour' },
  });
  const SHELVES = ['base', 'protein', 'fruit', 'stabiliser', 'other', 'extra'];
  const shelfName = (s) => t('sh' + s[0].toUpperCase() + s.slice(1));

  // Two mixes are the same when their ingredients, amounts and flavours match (SPEC § Data).
  HL.sig = (mix, extras) => [mix, extras || []].map((list) => list.map((x) => `${x.ing}:${+x.amount.toFixed(2)}:${x.flavour || ''}`).sort().join(',')).join('|');
  const clone = (mix) => (mix || []).map((x) => ({ ...x }));

  // ---------- the shared picker ----------
  // HL.picker.open(list, shelves, onChange) makes `list` ([{ ing, amount, flavour }]) the one the picker actions edit.
  let target = null;
  const picker = HL.picker = {
    open(list, onChange) { target = { list, onChange }; },
    // The fridge: one row of ingredient buttons per shelf.
    fridge(shelves, list) {
      const all = Object.values(HL.pantry()).filter((i) => !i.hidden).sort((a, b) => a.n - b.n);
      return `<section class="fridge"><h2><span aria-hidden="true">🧊</span> ${esc(t('fridge'))}</h2>${shelves.map((s) => {
        const items = all.filter((i) => i.shelf === s);
        if (!items.length) return '';
        return `<div class="shelf"><h3>${esc(shelfName(s))}</h3><div class="shelf-row">${items.map((i) => {
          const inMix = list.find((x) => x.ing === i.id);
          return `<button type="button" class="ing${inMix ? ' on' : ''}" data-act="ing-add" data-ing="${esc(i.id)}">
            <span class="ing-emoji" aria-hidden="true">${esc(i.emoji || '🥄')}</span>
            <span class="ing-name">${esc(HL.ingName(i))}${i.confirmed === false ? '<sup>?</sup>' : ''}</span>
            <span class="ing-amt">${inMix ? `✓ ${esc(HL.amountText(inMix))}` : `+ ${+i.default} ${i.unit}`}</span></button>`;
        }).join('')}</div></div>`;
      }).join('')}</section>`;
    },
    // What is in the list, with a stepper per item and flavour chips for proteins.
    items(list) {
      if (!list.length) return `<p class="empty">${esc(t('nothingYet'))}</p>`;
      return `<ul class="mix">${list.map((x) => {
        const i = HL.ing(x.ing); if (!i) return '';
        const m = HL.macros([x]);
        return `<li><div class="mix-row"><span class="ing-emoji" aria-hidden="true">${esc(i.emoji || '🥄')}</span>
          <span class="mix-name">${esc(HL.ingName(i))}${i.confirmed === false ? '<sup>?</sup>' : ''}<small>${HL.r0(m.kcal)} kcal · ${t('mP')} ${HL.r0(m.protein)}${i.hint ? ` · ${esc(t(i.hint))}` : ''}</small></span>
          <span class="stepper"><button type="button" data-act="ing-step" data-ing="${esc(i.id)}" data-dir="-1" aria-label="${esc(t('less'))}">−</button>
            <b>${esc(HL.amountText(x))}</b>
            <button type="button" data-act="ing-step" data-ing="${esc(i.id)}" data-dir="1" aria-label="${esc(t('more'))}">+</button></span>
          <button type="button" class="x" data-act="ing-del" data-ing="${esc(i.id)}" aria-label="${esc(t('remove'))}">✕</button></div>
          ${i.flavours?.length ? `<div class="flavours" role="group" aria-label="${esc(t('flavour'))}">${i.flavours.map((f) => `<button type="button" class="chip${x.flavour === f.id ? ' on' : ''}" data-act="ing-flavour" data-ing="${esc(i.id)}" data-flavour="${esc(f.id)}"><i style="background:${esc(f.color)}"></i>${esc(f.name)}</button>`).join('')}</div>` : ''}
        </li>`;
      }).join('')}</ul>`;
    },
  };
  const lastFlavour = () => store.get('lastFlavour', {});
  acts['ing-add'] = (el) => {
    if (!target) return;
    const i = HL.ing(el.dataset.ing); if (!i) return;
    const have = target.list.find((x) => x.ing === i.id);
    if (have) have.amount = +(have.amount + i.step).toFixed(2);
    else {
      const item = { ing: i.id, amount: i.default };
      if (i.flavours?.length) item.flavour = i.flavours.find((f) => f.id === lastFlavour()[i.id])?.id || i.flavours[0].id;
      target.list.push(item);
    }
    play(have ? 'tick' : 'plop');
    const from = el.getBoundingClientRect();
    target.onChange('add', i);
    HL.fx?.fly(i.emoji, from);
  };
  acts['ing-step'] = (el) => {
    const x = target?.list.find((y) => y.ing === el.dataset.ing), i = HL.ing(el.dataset.ing); if (!x || !i) return;
    const next = +(x.amount + i.step * +el.dataset.dir).toFixed(2);
    if (next <= 0) return acts['ing-del'](el);
    x.amount = next; play('tick');
    target.onChange('step', i);
  };
  acts['ing-del'] = (el) => {
    if (!target) return;
    const at = target.list.findIndex((y) => y.ing === el.dataset.ing); if (at < 0) return;
    target.list.splice(at, 1); play('pop');
    target.onChange('del');
  };
  acts['ing-flavour'] = (el) => {
    const x = target?.list.find((y) => y.ing === el.dataset.ing); if (!x) return;
    x.flavour = el.dataset.flavour; play('tap');
    store.set('lastFlavour', { ...lastFlavour(), [x.ing]: x.flavour });
    target.onChange('flavour');
  };

  // ---------- the builder screen ----------
  // Other screens can offer starting points ("Receta R2", "Igual que la 3"): HL.loaders.push(() => [{ label, mix }]).
  HL.loaders = [() => {
    const seen = new Set();
    return HL.tubs().map((tub, i) => ({ tub, i })).filter(({ tub }) => tub.state !== 'empty' && tub.mix?.length && !seen.has(HL.sig(tub.mix)) && seen.add(HL.sig(tub.mix)))
      .map(({ tub, i }) => ({ label: `🍦 ${t('sameAs', { n: i + 1 })}`, mix: tub.mix }));
  }];
  let draft = null, wasOver = false, shown = null; // shown: the macros on screen, to roll the numbers from
  // HL.startBuild(mix) opens the builder on the first empty tub with that mix loaded. Returns false if none is empty.
  HL.startBuild = (mix) => {
    const slot = HL.tubs().findIndex((x) => x.state === 'empty');
    if (slot < 0) { play('oops'); HL.say('noEmpty'); return false; }
    draft = { slot, mix: clone(mix), count: 1 };
    HL.go(`#/build/${slot + 1}`);
    return true;
  };
  const emptySlots = () => HL.tubs().map((x, i) => (x.state === 'empty' ? i : -1)).filter((i) => i >= 0);
  function warnings() {
    const p = HL.pantry(), out = [], vol = HL.mixVolume(draft.mix);
    if (vol > HL.FILL_ML) out.push(['over', t('warnOver', { max: HL.FILL_ML })]);
    const prots = draft.mix.filter((x) => p[x.ing]?.shelf === 'protein');
    if (prots.length && !prots.some((x) => p[x.ing].protein?.kind === 'casein') && !draft.mix.some((x) => p[x.ing]?.shelf === 'stabiliser')) out.push(['stab', t('warnStab')]);
    if (draft.mix.some((x) => p[x.ing]?.confirmed === false)) out.push(['q', t('warnUnconfirmed')]);
    return out;
  }
  function draw(why, ingAdded) {
    const slot = draft.slot, vol = HL.mixVolume(draft.mix), m = HL.macros(draft.mix);
    const level = Math.min(1, vol / HL.FILL_ML), free = emptySlots(), maxCount = Math.max(1, free.length);
    draft.count = Math.min(draft.count, maxCount);
    const fake = { state: 'frozen', mix: draft.mix };
    const loads = HL.loaders.flatMap((f) => f()).filter((l) => l.mix?.length);
    const warns = warnings();
    view.innerHTML = `
      <a class="back" href="#/">${esc(t('back'))}</a>
      <h1 class="title">${esc(t('build', { n: slot + 1 }))}</h1>
      <section class="bench card">
        <span class="bench-face" aria-hidden="true">${window.Heladero ? window.Heladero.head(vol > HL.FILL_ML ? 'freeze' : m.protein >= 40 ? 'cheer' : 'idle') : ''}</span>
        <div class="bench-tub${why === 'step' || why === 'flavour' ? ' slosh' : ''}${why === 'add' && !HL.fx ? ' drop' : ''}">
          ${HL.tubSvg(fake, { view: 'frozen', progress: 0 }, slot, { level, k: 'b' })}</div>
        <div class="bench-side">${HL.macroBar(m).replace('class="macros"', `class="macros${why ? ' bump' : ''}"`)}
          <div class="meter${vol > HL.FILL_ML ? ' over' : ''}"><i style="width:${Math.min(100, (vol / HL.FILL_ML) * 100).toFixed(0)}%"></i></div>
          <p class="meter-text">${esc(t('volume', { v: HL.r0(vol), max: HL.FILL_ML }))}</p></div>
      </section>
      ${warns.map(([k, text]) => `<p class="warn w-${k}">${k === 'q' ? '' : '⚠️ '}${esc(text)}</p>`).join('')}
      <h2 class="sec">${esc(t('inTub'))}${draft.mix.length ? ` <button type="button" class="btn small ghost" data-act="build-clear">${esc(t('clear'))}</button>` : ''}</h2>
      ${picker.items(draft.mix)}
      ${!draft.mix.length && loads.length ? `<p class="loads"><b>${esc(t('load'))}:</b> ${loads.map((l, i) => `<button type="button" class="chip" data-act="build-load" data-i="${i}">${esc(l.label)}</button>`).join('')}</p>` : ''}
      ${picker.fridge(SHELVES, draft.mix)}
      <div class="actions">
        ${maxCount > 1 ? `<div class="count"><span>${esc(t('howMany'))}</span><span class="stepper"><button type="button" data-act="build-count" data-dir="-1" aria-label="${esc(t('less'))}">−</button><b>× ${draft.count}</b><button type="button" data-act="build-count" data-dir="1" aria-label="${esc(t('more'))}">+</button></span></div>` : ''}
        ${(HL.buildExtras || []).map((f) => f(draft)).join('')}
        <button type="button" class="btn mint block" data-act="build-freeze"${draft.mix.length ? '' : ' disabled'}>❄️ ${esc(t('freeze'))}</button>
      </div>`;
    if (shown && why) view.querySelectorAll('.bench .macros .m b').forEach((b, i) => { const k = ['kcal', 'protein', 'carbs', 'fat'][i]; HL.fx?.count(b, shown[k], m[k]); });
    shown = m;
    const over = vol > HL.FILL_ML;
    if (over && !wasOver) { play('oops'); HL.say('overfill'); }
    wasOver = over;
  }
  routes.build = {
    tab: 'home',
    render(arg) {
      const slot = +arg - 1, tub = HL.tubs()[slot];
      if (!tub || tub.state !== 'empty') { HL.go('#/'); return; }
      const fresh = !draft || draft.slot !== slot;
      if (fresh) draft = { slot, mix: [], count: 1 };
      wasOver = HL.mixVolume(draft.mix) > HL.FILL_ML;
      picker.open(draft.mix, draw);
      shown = null;
      draw();
      if (fresh) HL.say('build', {}, { quiet: true });
    },
  };
  acts['build-clear'] = () => { draft.mix.length = 0; play('pop'); draw('del'); };
  acts['build-load'] = (el) => {
    const l = HL.loaders.flatMap((f) => f()).filter((x) => x.mix?.length)[+el.dataset.i]; if (!l) return;
    draft.mix.splice(0, draft.mix.length, ...clone(l.mix).map(({ ing, amount, flavour }) => (flavour ? { ing, amount, flavour } : { ing, amount })));
    play('plop'); draw('add');
  };
  acts['build-count'] = (el) => {
    draft.count = Math.min(Math.max(1, emptySlots().length), Math.max(1, draft.count + +el.dataset.dir));
    play('tick'); draw();
  };
  acts['build-freeze'] = () => {
    if (!draft?.mix.length) return;
    const list = HL.tubs(), now = Date.now();
    const slots = [draft.slot, ...emptySlots().filter((i) => i !== draft.slot)].slice(0, draft.count);
    for (const i of slots) list[i] = { state: 'frozen', mix: clone(draft.mix), filledAt: now };
    HL.saveTubs(list);
    draft = null;
    play('frost');
    HL.go('#/');
    setTimeout(() => HL.say('frozen', {}, { pose: 'freeze' }), 80);
  };
})();
