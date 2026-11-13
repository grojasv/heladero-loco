// Heladero Loco: recipes, the batch shopping total, the pantry editor, guides and settings (tubs, freeze time, backup).
(() => {
  const { t, esc, T, view, store, routes, acts } = HL;
  const play = (n) => window.Sound?.play(n);
  const $ = (id) => document.getElementById(id);

  Object.assign(T, {
    tabRecipes: { es: 'Recetas', ca: 'Receptes', en: 'Recipes' },
    tabMore: { es: 'Más', ca: 'Més', en: 'More' },
    recipes: { es: 'Recetas', ca: 'Receptes', en: 'Recipes' },
    untested: { es: 'sin probar', ca: 'sense provar', en: 'untested' },
    mine: { es: 'mía', ca: 'meva', en: 'mine' },
    use: { es: 'Usar', ca: 'Fes servir', en: 'Use' },
    del: { es: 'Borrar', ca: 'Esborra', en: 'Delete' },
    delRecipeAsk: { es: '¿Borrar la receta «{name}»?', ca: 'Vols esborrar la recepta «{name}»?', en: 'Delete the recipe “{name}”?' },
    saveRecipe: { es: 'Guardar como receta', ca: 'Desa com a recepta', en: 'Save as recipe' },
    recipeNameAsk: { es: 'Nombre de la receta:', ca: 'Nom de la recepta:', en: 'Recipe name:' },
    shop: { es: 'Lista de la compra', ca: 'Llista de la compra', en: 'Shopping list' },
    shopHint: { es: 'Elige cuántas tarrinas de cada receta vas a hacer.', ca: 'Tria quantes terrines de cada recepta faràs.', en: 'Choose how many tubs of each recipe you will make.' },
    shopTotal: { es: 'Para {n} tarrinas necesitas', ca: 'Per a {n} terrines necessites', en: 'For {n} tubs you need' },
    shopNone: { es: 'Sube alguna receta para ver el total.', ca: 'Puja alguna recepta per veure el total.', en: 'Add some tubs to see the total.' },
    copyList: { es: 'Copiar lista', ca: 'Copia la llista', en: 'Copy list' },
    pantry: { es: 'Despensa', ca: 'Rebost', en: 'Pantry' },
    pantryHint: { es: 'Valores por 100 g o 100 ml. Toca un ingrediente para corregirlo con tu etiqueta.', ca: 'Valors per 100 g o 100 ml. Toca un ingredient per corregir-lo amb la teva etiqueta.', en: 'Values per 100 g or 100 ml. Tap an ingredient to correct it from your label.' },
    addIng: { es: 'Añadir ingrediente', ca: 'Afegeix un ingredient', en: 'Add ingredient' },
    newIng: { es: 'Nuevo ingrediente', ca: 'Nou ingredient', en: 'New ingredient' },
    fName: { es: 'Nombre', ca: 'Nom', en: 'Name' },
    fEmoji: { es: 'Emoji', ca: 'Emoji', en: 'Emoji' },
    fShelf: { es: 'Estante', ca: 'Prestatge', en: 'Shelf' },
    fUnit: { es: 'Se mide en', ca: 'Es mesura en', en: 'Measured in' },
    fPer: { es: 'Por 100 {u}', ca: 'Per 100 {u}', en: 'Per 100 {u}' },
    fDefault: { es: 'Cantidad habitual ({u})', ca: 'Quantitat habitual ({u})', en: 'Usual amount ({u})' },
    fStep: { es: 'Paso de − y + ({u})', ca: 'Pas de − i + ({u})', en: 'Step of − and + ({u})' },
    fConfirmed: { es: 'Comprobado con mi etiqueta', ca: 'Comprovat amb la meva etiqueta', en: 'Checked against my label' },
    fHidden: { es: 'Ocultar en la nevera', ca: 'Amaga a la nevera', en: 'Hide from the fridge' },
    save: { es: 'Guardar', ca: 'Desa', en: 'Save' },
    resetIng: { es: 'Volver a los valores de serie', ca: 'Torna als valors de sèrie', en: 'Back to the built-in values' },
    delIngAsk: { es: '¿Borrar este ingrediente?', ca: 'Vols esborrar aquest ingredient?', en: 'Delete this ingredient?' },
    source: { es: 'Fuente', ca: 'Font', en: 'Source' },
    needName: { es: 'Ponle un nombre.', ca: 'Posa-li un nom.', en: 'Give it a name.' },
    hiddenTag: { es: 'oculto', ca: 'amagat', en: 'hidden' },
    guides: { es: 'Guías y arreglos', ca: 'Guies i solucions', en: 'Guides and fixes' },
    settings: { es: 'Ajustes', ca: 'Configuració', en: 'Settings' },
    sTubs: { es: 'Número de tarrinas', ca: 'Nombre de terrines', en: 'Number of tubs' },
    sFreeze: { es: 'Horas de congelado', ca: 'Hores de congelat', en: 'Freezing hours' },
    sSound: { es: 'Sonidos y voz', ca: 'Sons i veu', en: 'Sounds and voice' },
    on: { es: 'Activados', ca: 'Activats', en: 'On' },
    off: { es: 'Silenciados', ca: 'Silenciats', en: 'Muted' },
    backup: { es: 'Copia de seguridad', ca: 'Còpia de seguretat', en: 'Backup' },
    backupHint: { es: 'Todo se guarda solo en este teléfono. Exporta un archivo de vez en cuando para no perder tu historial.', ca: 'Tot es desa només en aquest telèfon. Exporta un fitxer de tant en tant per no perdre l’historial.', en: 'Everything is stored only on this phone. Export a file now and then so you do not lose your history.' },
    export: { es: 'Exportar archivo', ca: 'Exporta el fitxer', en: 'Export file' },
    import: { es: 'Importar archivo', ca: 'Importa un fitxer', en: 'Import file' },
    importAsk: { es: 'Esto sustituye todos los datos de este teléfono por los del archivo ({n} valoraciones). ¿Seguir?', ca: 'Això substitueix totes les dades d’aquest telèfon per les del fitxer ({n} valoracions). Continuar?', en: 'This replaces all the data on this phone with the file ({n} ratings). Continue?' },
    importBad: { es: 'Ese archivo no es una copia de Heladero Loco.', ca: 'Aquest fitxer no és una còpia d’Heladero Loco.', en: 'That file is not a Heladero Loco backup.' },
    lastBackup: { es: 'Última copia: {d}', ca: 'Última còpia: {d}', en: 'Last backup: {d}' },
    neverBackup: { es: 'Aún no has hecho ninguna copia.', ca: 'Encara no has fet cap còpia.', en: 'You have not made a backup yet.' },
    backupNudge: { es: 'Tienes {n} valoraciones sin copia de seguridad.', ca: 'Tens {n} valoracions sense còpia de seguretat.', en: 'You have {n} ratings with no backup.' },
    later: { es: 'Luego', ca: 'Després', en: 'Later' },
    exported: { es: 'Archivo exportado.', ca: 'Fitxer exportat.', en: 'File exported.' },
  });
  HL.tabs.push({ id: 'recipes', hash: '#/recipes', icon: '📖', label: 'tabRecipes' }, { id: 'more', hash: '#/more', icon: '⚙️', label: 'tabMore' });
  const SHELVES = ['base', 'protein', 'fruit', 'stabiliser', 'other', 'extra'];
  const shelfName = (s) => t('sh' + s[0].toUpperCase() + s.slice(1));

  // ---------- recipes ----------
  // Seeded recipes (data/recipes.json) plus Guille's own (on the phone). Numbers R<n> are never reused.
  const mine = () => store.get('recipes', []);
  const allRecipes = () => [...HL.data.recipes.map((r) => ({ ...r, label: t(r.name) })), ...mine().map((r) => ({ ...r, label: r.name, own: true }))];
  HL.loaders.push(() => allRecipes().map((r) => ({ label: `📖 R${r.n} ${r.label}`, mix: r.mix })));
  let buildDraft = null;
  (HL.buildExtras ||= []).push((draft) => {
    buildDraft = draft;
    return draft.mix.length ? `<button type="button" class="btn small ghost" data-act="recipe-save">📖 ${esc(t('saveRecipe'))}</button>` : '';
  });
  acts['recipe-save'] = () => {
    if (!buildDraft?.mix.length) return;
    const name = (prompt(t('recipeNameAsk'), HL.mixName(buildDraft.mix)) || '').trim();
    if (!name) return;
    const used = [...HL.data.recipes, ...mine()].map((r) => r.n), next = Math.max(store.get('recipeSeq', 0), ...used) + 1;
    store.set('recipeSeq', next);
    store.set('recipes', [...mine(), { n: next, name, mix: buildDraft.mix.map((x) => ({ ...x })) }]);
    play('jingle'); HL.say('recipeSaved');
  };
  routes.recipes = {
    tab: 'recipes',
    render() {
      const list = allRecipes();
      view.innerHTML = `<h1 class="title">📖 ${esc(t('recipes'))}</h1>
        <div class="list">${list.map((r, i) => `<article class="card recipe">
          <div class="rank-head"><h3>${HL.num('R', r.n)}${esc(r.label)}</h3>${r.tested === false ? `<span class="pill warn">${esc(t('untested'))}</span>` : ''}${r.own ? `<span class="pill mint">${esc(t('mine'))}</span>` : ''}</div>
          ${r.note ? `<p class="rank-sub">${esc(t(r.note))}</p>` : ''}
          ${HL.contents(r.mix)}
          <p class="rank-sub">${esc(HL.macroLine(HL.macros(r.mix)))}</p>
          <p class="row end">${r.own ? `<button type="button" class="btn small ghost" data-act="recipe-del" data-n="${r.n}">${esc(t('del'))}</button>` : ''}
            <button type="button" class="btn small mint" data-act="recipe-use" data-i="${i}">🍦 ${esc(t('use'))}</button></p>
        </article>`).join('')}</div>
        <p class="center" style="margin-top:16px"><a class="btn small vanilla" href="#/shop">🛒 ${esc(t('shop'))}</a></p>`;
    },
  };
  acts['recipe-use'] = (el) => { const r = allRecipes()[+el.dataset.i]; if (r) { play('tap'); HL.startBuild(r.mix); } };
  acts['recipe-del'] = (el) => {
    const r = mine().find((x) => x.n === +el.dataset.n);
    if (!r || !confirm(t('delRecipeAsk', { name: r.name }))) return;
    store.set('recipes', mine().filter((x) => x.n !== r.n));
    play('pop'); HL.route();
  };

  // ---------- shopping ----------
  const counts = {}; // recipe n → tubs
  function shopTotals() {
    const total = new Map();
    for (const r of allRecipes()) for (const x of r.mix) if (counts[r.n]) total.set(x.ing, (total.get(x.ing) || 0) + x.amount * counts[r.n]);
    return [...total.entries()].map(([id, amount]) => ({ i: HL.ing(id), amount })).filter((x) => x.i).sort((a, b) => a.i.n - b.i.n);
  }
  const shopLine = (x) => `${HL.ingName(x.i)}: ${+x.amount.toFixed(1)} ${x.i.unit}`;
  function drawShop() {
    const list = allRecipes(), n = list.reduce((s, r) => s + (counts[r.n] || 0), 0), totals = shopTotals();
    view.innerHTML = `<a class="back" href="#/more">${esc(t('back'))}</a>
      <h1 class="title">🛒 ${esc(t('shop'))}</h1><p class="muted hint">${esc(t('shopHint'))}</p>
      <ul class="card diary">${list.map((r) => `<li><div><b>${HL.num('R', r.n)}${esc(r.label)}</b></div>
        <span class="stepper"><button type="button" data-act="shop-step" data-n="${r.n}" data-dir="-1">−</button><b>× ${counts[r.n] || 0}</b><button type="button" data-act="shop-step" data-n="${r.n}" data-dir="1">+</button></span></li>`).join('')}</ul>
      <h2 class="sec">${esc(n ? t('shopTotal', { n }) : t('shopNone'))}</h2>
      ${n ? `<section class="card"><ul class="contents">${totals.map((x) => `<li><span aria-hidden="true">${esc(x.i.emoji || '🥄')}</span> ${esc(HL.ingName(x.i))} <b>${+x.amount.toFixed(1)} ${x.i.unit}</b></li>`).join('')}</ul>
        <p class="row end"><button type="button" class="btn small ghost" data-act="copy-macros" data-text="${esc(totals.map(shopLine).join('\n'))}">📋 ${esc(t('copyList'))}</button></p></section>` : ''}`;
  }
  routes.shop = { tab: 'more', render: drawShop };
  acts['shop-step'] = (el) => {
    const n = +el.dataset.n;
    counts[n] = Math.max(0, Math.min(30, (counts[n] || 0) + +el.dataset.dir));
    play('tick');
    const y = window.scrollY; drawShop(); window.scrollTo(0, y);
  };

  // ---------- pantry ----------
  const per = (i) => `${+i.per100.kcal} kcal · ${t('mP')} ${+i.per100.protein} · ${t('mC')} ${+i.per100.carbs} · ${t('mF')} ${+i.per100.fat}`;
  function renderPantry() {
    const all = Object.values(HL.pantry()).sort((a, b) => a.n - b.n);
    view.innerHTML = `<a class="back" href="#/more">${esc(t('back'))}</a>
      <h1 class="title">🥫 ${esc(t('pantry'))}</h1><p class="muted hint">${esc(t('pantryHint'))}</p>
      ${SHELVES.map((s) => {
        const items = all.filter((i) => i.shelf === s);
        return items.length ? `<h2 class="sec">${esc(shelfName(s))}</h2><div class="list tight">${items.map((i) => `<a class="card pantry-item${i.hidden ? ' off' : ''}" href="#/pantry/${encodeURIComponent(i.id)}">
          <span class="ing-emoji" aria-hidden="true">${esc(i.emoji || '🥄')}</span>
          <span class="mix-name">${HL.num('I', i.n)}${esc(HL.ingName(i))}${i.confirmed === false ? '<sup>?</sup>' : ''}${i.hidden ? ` <span class="pill">${esc(t('hiddenTag'))}</span>` : ''}
            <small>${esc(per(i))} / 100 ${i.unit}</small></span><span aria-hidden="true">›</span></a>`).join('')}</div>` : '';
      }).join('')}
      <p class="center" style="margin-top:18px"><a class="btn mint" href="#/pantry/new">＋ ${esc(t('addIng'))}</a></p>`;
  }
  function renderIngredient(id) {
    const isNew = id === 'new', seeded = !isNew && !!HL.data.ingredients[id];
    const i = isNew ? { name: { es: '' }, emoji: '🥄', shelf: 'extra', unit: 'g', per100: { kcal: 0, protein: 0, carbs: 0, fat: 0 }, default: 15, step: 5, confirmed: true } : HL.ing(id);
    if (!i) { HL.go('#/pantry'); return; }
    const numField = (key, label, value, stepAttr = 'any') => `<label class="field">${esc(label)}<input type="number" inputmode="decimal" min="0" step="${stepAttr}" id="f-${key}" value="${+value}"></label>`;
    view.innerHTML = `<a class="back" href="#/pantry">${esc(t('back'))}</a>
      <h1 class="title">${isNew ? esc(t('newIng')) : `${HL.num('I', i.n)}${esc(HL.ingName(i))}`}</h1>
      <form class="card form" id="ingForm">
        ${seeded ? '' : `<div class="grid2 wide"><label class="field">${esc(t('fName'))}<input id="f-name" value="${esc(HL.ingName(i))}" maxlength="40" required></label>
          <label class="field">${esc(t('fEmoji'))}<input id="f-emoji" value="${esc(i.emoji || '🥄')}" maxlength="4"></label></div>`}
        <div class="grid2"><label class="field">${esc(t('fShelf'))}<select id="f-shelf">${SHELVES.map((s) => `<option value="${s}"${s === i.shelf ? ' selected' : ''}>${esc(shelfName(s))}</option>`).join('')}</select></label>
          ${seeded ? '' : `<label class="field">${esc(t('fUnit'))}<select id="f-unit"><option${i.unit === 'g' ? ' selected' : ''}>g</option><option${i.unit === 'ml' ? ' selected' : ''}>ml</option></select></label>`}</div>
        <h2>${esc(t('fPer', { u: i.unit }))}</h2>
        <div class="grid2">${numField('kcal', 'kcal', i.per100.kcal)}${numField('protein', `${t('protein')} (g)`, i.per100.protein)}
          ${numField('carbs', `${t('carbs')} (g)`, i.per100.carbs)}${numField('fat', `${t('fat')} (g)`, i.per100.fat)}</div>
        <div class="grid2">${numField('default', t('fDefault', { u: i.unit }), i.default)}${numField('step', t('fStep', { u: i.unit }), i.step)}</div>
        <label class="check"><input type="checkbox" id="f-confirmed"${i.confirmed !== false ? ' checked' : ''}> ${esc(t('fConfirmed'))}</label>
        <label class="check"><input type="checkbox" id="f-hidden"${i.hidden ? ' checked' : ''}> ${esc(t('fHidden'))}</label>
        ${i.source && /^https?:/.test(i.source) ? `<p class="muted small">${esc(t('source'))}: <a href="${esc(i.source)}" target="_blank" rel="noopener">${esc(new URL(i.source).hostname)}</a></p>` : ''}
        <button type="submit" class="btn mint block">${esc(t('save'))}</button>
        ${isNew ? '' : seeded ? (store.get('pantry', {})[id] ? `<button type="button" class="btn small ghost" data-act="ing-reset" data-id="${esc(id)}">${esc(t('resetIng'))}</button>` : '')
          : `<button type="button" class="btn small ghost" data-act="ing-remove" data-id="${esc(id)}">🗑 ${esc(t('del'))}</button>`}
      </form>`;
    $('ingForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const v = (k) => Math.max(0, parseFloat(String($('f-' + k).value).replace(',', '.')) || 0);
      const over = store.get('pantry', {});
      const fields = {
        shelf: $('f-shelf').value, per100: { kcal: v('kcal'), protein: v('protein'), carbs: v('carbs'), fat: v('fat') },
        default: v('default') || 1, step: v('step') || 1, confirmed: $('f-confirmed').checked, hidden: $('f-hidden').checked,
      };
      if (seeded) over[id] = fields;
      else {
        const name = $('f-name').value.trim();
        if (!name) { alert(t('needName')); return; }
        const used = Object.values(HL.pantry()).map((x) => x.n), next = Math.max(store.get('ingSeq', 0), ...used) + 1;
        const key = isNew ? `u-${Date.now().toString(36)}` : id;
        if (isNew) store.set('ingSeq', next);
        over[key] = { ...(over[key] || {}), ...fields, n: isNew ? next : over[key].n, name: { es: name }, emoji: $('f-emoji').value.trim() || '🥄', unit: $('f-unit').value, source: 'label' };
      }
      store.set('pantry', over);
      play('pop'); HL.go('#/pantry');
      setTimeout(() => HL.say('saved', {}, { quiet: true }), 80);
    });
  }
  routes.pantry = { tab: 'more', render: (arg) => (arg ? renderIngredient(arg) : renderPantry()) };
  const dropOverride = (id) => { const over = store.get('pantry', {}); delete over[id]; store.set('pantry', over); play('pop'); HL.go('#/pantry'); };
  acts['ing-reset'] = (el) => dropOverride(el.dataset.id);
  acts['ing-remove'] = (el) => { if (confirm(t('delIngAsk'))) dropOverride(el.dataset.id); };

  // ---------- guides ----------
  routes.guides = {
    tab: 'more',
    render() {
      view.innerHTML = `<a class="back" href="#/more">${esc(t('back'))}</a><h1 class="title">📚 ${esc(t('guides'))}</h1>
        <div class="list tight">${HL.data.guides.map((g) => `<details class="card guide"><summary><span aria-hidden="true">${esc(g.emoji)}</span> ${esc(t(g.title))}</summary>
          <ol>${(g.body[HL.lang] || g.body.es).map((p) => `<li>${esc(p)}</li>`).join('')}</ol></details>`).join('')}</div>`;
    },
  };

  // ---------- settings and backup ----------
  const KEYS = ['tubs', 'log', 'recipes', 'recipeSeq', 'pantry', 'ingSeq', 'settings', 'lastFlavour', 'lang', 'badges'];
  // Ratings made since the last export. The home screen nudges at 5, and again 5 ratings after a "later".
  const NUDGE_EVERY = 5;
  const unsaved = () => { const at = store.get('backupAt', ''); return HL.readLog().filter((e) => e.at > at).length; };
  (HL.homeExtras ||= []).push(() => {
    const n = unsaved();
    if (n < NUDGE_EVERY || n < store.get('backupSnooze', 0)) return '';
    return `<section class="card nudge"><p>💾 ${esc(t('backupNudge', { n }))}</p>
      <div class="row"><button type="button" class="btn small mint" data-act="backup-export">⬇️ ${esc(t('export'))}</button>
        <button type="button" class="btn small ghost" data-act="backup-later">${esc(t('later'))}</button></div></section>`;
  });
  acts['backup-later'] = () => { store.set('backupSnooze', unsaved() + NUDGE_EVERY); play('tap'); HL.route(); };
  function drawSettings() {
    const s = HL.settings(), muted = window.Sound?.muted;
    const row = (label, key, value) => `<li><div><b>${esc(label)}</b></div><span class="stepper"><button type="button" data-act="set-step" data-key="${key}" data-dir="-1">−</button><b>${value}</b><button type="button" data-act="set-step" data-key="${key}" data-dir="1">+</button></span></li>`;
    view.innerHTML = `<a class="back" href="#/more">${esc(t('back'))}</a><h1 class="title">⚙️ ${esc(t('settings'))}</h1>
      <ul class="card diary">${row(t('sTubs'), 'tubs', s.tubs)}${row(t('sFreeze'), 'freezeHours', `${s.freezeHours} h`)}
        <li><div><b>${esc(t('sSound'))}</b></div><button type="button" class="btn small ${muted ? 'ghost' : 'mint'}" data-act="set-sound">${muted ? '🔇' : '🔊'} ${esc(t(muted ? 'off' : 'on'))}</button></li></ul>
      <h2 class="sec">💾 ${esc(t('backup'))}</h2>
      <section class="card"><p class="muted" style="margin-top:0">${esc(t('backupHint'))}</p>
        <p><b>${esc(store.get('backupAt') ? t('lastBackup', { d: HL.dateFmt(store.get('backupAt')) }) : t('neverBackup'))}</b></p>
        <div class="row"><button type="button" class="btn small mint" data-act="backup-export">⬇️ ${esc(t('export'))}</button>
          <label class="btn small ghost">⬆️ ${esc(t('import'))}<input type="file" id="importFile" accept="application/json,.json" hidden></label></div></section>`;
    $('importFile').addEventListener('change', async (e) => {
      const file = e.target.files[0]; if (!file) return;
      let parsed = null;
      try { parsed = JSON.parse(await file.text()); } catch { /* not JSON */ }
      if (parsed?.app !== 'heladero-loco' || typeof parsed.data !== 'object') { play('oops'); alert(t('importBad')); return; }
      if (!confirm(t('importAsk', { n: (parsed.data.log || []).length }))) return;
      for (const k of KEYS) { if (k in parsed.data) store.set(k, parsed.data[k]); else { try { localStorage.removeItem('heladero.' + k); } catch { /* private mode */ } } }
      store.set('backupAt', new Date().toISOString()); // the file just read is the backup
      location.hash = '#/'; location.reload();
    });
  }
  routes.settings = { tab: 'more', render: drawSettings };
  acts['set-step'] = (el) => {
    const s = HL.settings(), key = el.dataset.key, dir = +el.dataset.dir;
    if (key === 'tubs') {
      const lastUsed = HL.tubs().reduce((m, x, i) => (x.state !== 'empty' ? i + 1 : m), 0); // never drop a tub that is in use
      s.tubs = Math.min(12, Math.max(1, lastUsed, s.tubs + dir));
    } else s.freezeHours = Math.min(48, Math.max(1, s.freezeHours + dir));
    store.set('settings', s);
    play('tick'); drawSettings();
  };
  acts['set-sound'] = () => { acts.mute(); drawSettings(); };
  acts['backup-export'] = () => {
    const data = {};
    for (const k of KEYS) { const v = store.get(k); if (v !== undefined) data[k] = v; }
    const blob = new Blob([JSON.stringify({ app: 'heladero-loco', version: HL.VERSION, at: new Date().toISOString(), data }, null, 2)], { type: 'application/json' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `heladero-loco-${new Date().toISOString().slice(0, 10)}.json` });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    store.set('backupAt', new Date().toISOString());
    try { localStorage.removeItem('heladero.backupSnooze'); } catch { /* private mode */ }
    play('pop'); HL.route();
    setTimeout(() => HL.say('exported', {}, { quiet: true }), 80);
  };

  // ---------- the "more" menu ----------
  routes.more = {
    tab: 'more',
    render() {
      const item = (hash, emoji, label) => `<a class="card menu-item" href="${hash}"><span aria-hidden="true">${emoji}</span><b>${esc(t(label))}</b><span aria-hidden="true">›</span></a>`;
      view.innerHTML = `<h1 class="title">${esc(t('tabMore'))}</h1><div class="list tight">
        ${item('#/shop', '🛒', 'shop')}${item('#/pantry', '🥫', 'pantry')}${item('#/guides', '📚', 'guides')}${item('#/settings', '⚙️', 'settings')}</div>`;
    },
  };
})();
