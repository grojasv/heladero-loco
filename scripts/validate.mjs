// Checks the data files: node scripts/validate.mjs
// Unique numbers, all 3 languages, macros present, recipes that only use known ingredients, short spoken lines.
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (f, d) => (existsSync(join(root, 'data', f)) ? JSON.parse(readFileSync(join(root, 'data', f), 'utf8')) : d);
const LANGS = ['es', 'ca', 'en'];
const errors = [];
const err = (m) => errors.push(m);
const tri = (o, where) => { for (const l of LANGS) if (!o || typeof o[l] !== 'string' || !o[l].trim()) err(`${where}: missing ${l}`); };

const ingredients = read('ingredients.json', {});
const SHELVES = ['base', 'protein', 'fruit', 'stabiliser', 'other', 'extra'];
const seenI = new Set();
for (const [id, i] of Object.entries(ingredients)) {
  const w = `ingredient ${id}`;
  if (!Number.isInteger(i.n) || seenI.has(i.n)) err(`${w}: n missing or repeated`);
  seenI.add(i.n);
  tri(i.name, `${w} name`);
  if (!SHELVES.includes(i.shelf)) err(`${w}: bad shelf ${i.shelf}`);
  if (!['g', 'ml'].includes(i.unit)) err(`${w}: bad unit`);
  for (const k of ['kcal', 'protein', 'carbs', 'fat']) if (typeof i.per100?.[k] !== 'number' || i.per100[k] < 0) err(`${w}: per100.${k}`);
  if (!(i.default > 0) || !(i.step > 0)) err(`${w}: default and step must be positive`);
  if (!i.source) err(`${w}: no source`);
  if (typeof i.confirmed !== 'boolean') err(`${w}: confirmed must be true or false`);
  if (i.shelf === 'protein' && !['whey', 'blend', 'casein'].includes(i.protein?.kind)) err(`${w}: protein.kind`);
  for (const f of i.flavours || []) if (!f.id || !f.name || !/^#[0-9a-f]{6}$/i.test(f.color)) err(`${w}: flavour ${f.id}`);
}

const recipes = read('recipes.json', []);
const seenR = new Set();
for (const r of recipes) {
  const w = `recipe ${r.id}`;
  if (!Number.isInteger(r.n) || seenR.has(r.n)) err(`${w}: n missing or repeated`);
  seenR.add(r.n);
  tri(r.name, `${w} name`);
  if (r.note) tri(r.note, `${w} note`);
  for (const x of r.mix || []) {
    if (!ingredients[x.ing]) err(`${w}: unknown ingredient ${x.ing}`);
    if (!(x.amount > 0)) err(`${w}: amount of ${x.ing}`);
    if (x.flavour && !ingredients[x.ing]?.flavours?.some((f) => f.id === x.flavour)) err(`${w}: unknown flavour ${x.flavour}`);
  }
}

for (const g of read('guides.json', [])) {
  tri(g.title, `guide ${g.id} title`);
  for (const l of LANGS) if (!Array.isArray(g.body?.[l]) || !g.body[l].length) err(`guide ${g.id}: body ${l}`);
}

for (const [key, pool] of Object.entries(read('lines.json', {}))) {
  for (const l of LANGS) {
    if (!Array.isArray(pool[l]) || !pool[l].length) { err(`lines ${key}: missing ${l}`); continue; }
    if (pool[l].length !== pool.es.length) err(`lines ${key}: ${l} has ${pool[l].length} lines, es has ${pool.es.length}`);
    for (const s of pool[l]) {
      if (s.split(/\s+/).length > 12) err(`lines ${key} ${l}: over 12 words: ${s}`);
      if (/\p{Extended_Pictographic}/u.test(s)) err(`lines ${key} ${l}: emoji: ${s}`);
    }
  }
}

if (errors.length) { console.error(errors.join('\n')); console.error(`\n${errors.length} problem(s)`); process.exit(1); }
console.log(`OK: ${Object.keys(ingredients).length} ingredients, ${recipes.length} recipes, ${Object.keys(read('lines.json', {})).length} line pools`);
