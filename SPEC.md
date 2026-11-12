# Heladero Loco: spec (v1 draft)

A phone-first app to build protein ice cream tubs for the Ninja CREAMi (NC302EU), see their macros, follow them
through the freezer and the machine, and rate each one so that the next batch is better. El Heladero Loco, a
mad-scientist ice cream maker, is the mascot.

Refined with Guille on 2026-11-12. Draft: not built yet. The source material is a Gemini chat kept in `raw/`
(private, gitignored). The shell is borrowed from `grojasv/gym-coach`.

## Goal
1. **Build a tub and know its macros** before it goes into the freezer. This is most of the value.
2. **Learn which mixes work.** Every eaten tub gets a texture and a taste score; the history ranks the mixes.
3. Keep the rest thin: the freezer wait and the machine step are short and need little input.

Not nutrition or medical advice. Macros are computed from label data, never typed in as totals.

## Decisions

| Topic | Decision |
|---|---|
| Audience | Guille only. Public GitHub Pages site, no accounts. All data stays on the phone. |
| Repo | `grojasv/heladero-loco` → `https://grojasv.github.io/heladero-loco/`. Public. `raw/` stays out of git. |
| Languages | CA / ES / EN, choice remembered. **ES is the source.** An ingredient that Guille adds keeps the name he types. |
| Mascot | **El Heladero Loco:** lab coat, wild hair, goggles, an ice cream cone as a test tube. SVG with poses (idle, mix, freeze, cheer). Tone from the Gemini chat: "¡Maestro del frío!", "¡Al laboratorio!". |
| Tubs | **7 by default**, editable in settings. |
| Portion | One tub is one portion. Macros are shown per whole tub only. |
| Pantry | Seeded from the Gemini chat and the labels, **editable in the app** (add, edit, hide). **No stock quantities in v1.** |
| Builder | A fridge-styled screen: tap an ingredient, set grams or ml with a stepper. No drag and drop. |
| Rating | **Texture 1–5 + taste 1–5**, plus an optional note and a "needed RE-SPIN" tick. |
| Learning | **Ranked history:** past mixes sorted by score, each with "repeat this one". No insights in v1. |
| Copy macros | One line: `Tarrina 3 · 372 kcal · P 49 · C 15 · G 12`. |
| Backup | Export and import everything as one JSON file, in settings. |
| Extra screens | Saved recipes, batch shopping total, guides and fixes. |
| Style | **Retro ice cream lab:** pastel mint, strawberry pink and vanilla cream with a dark ink outline, rounded cartoon type, light and dark. |
| Animation | Soft and playful: ingredients drop into the tub, frost grows while freezing, a sparkle when ready, the tub spins, the mascot reacts. Honour `prefers-reduced-motion`. |
| Sound | Soft synthesised effects (Web Audio, no files): a plop per ingredient, a frost chime on ready, a whirr on spin, a jingle on rating. **The mascot speaks his lines** (Web Speech, as El Titán). On by default; one mute button silences both. Lines under about 12 words, no emoji. |
| Publishing | Guille approved on 2026-11-12: create the public repo, push each release and turn on Pages from slice 1, with the GitHub noreply commit email. |
| Build | All 5 slices in a row, each checked in the browser at phone sizes; stop only at a real blocker. |
| Notifications | None. A reliable alert at 24 h needs a server. The tub shows a countdown and a "ready" state. |
| Later | Stock quantities, insights per protein and per extra, portions, a daily macro total. |

## The tub cycle

The home screen shows the tubs. Each tub is in one state:

| State | What Guille sees | How it moves on |
|---|---|---|
| **Empty** | An empty tub, "Llenar" | Build a mix, or apply a saved recipe or a past mix → **Freezing** |
| **Freezing** | Countdown to `filledAt + 24 h`, frost growing | Time passes → **Ready** (animation) |
| **Ready** | "Lista", the program to use | Spin: choose extras, see final macros, copy → **Spun** |
| **Spun** | "Valorar" | Rate texture and taste → logged, tub goes back to **Empty** |

A tub can be emptied at any state without a rating (a mistake, a spill). "Ready" is a display state computed from the
clock, not stored. The 24 h is a setting.

## Screens
- **Tubs (home):** the tubs in their states, the mascot's line, and a count such as "6 llenas · 2 listas".
- **Builder:** the fridge with ingredients by shelf (base, protein, fruit, stabiliser, other); the tub on the side
  fills as ingredients go in; macros update live. Warnings (never blocking):
  - the mix goes past the tub's fill line (rough check: grams + ml against the tub volume);
  - a whey-only protein with no stabiliser (the separation seen in the Gemini chat).
  "Igual que la tarrina N" and "Guardar receta" are here. "Llenar varias" applies the same mix to several empty tubs.
- **Spin:** program for the mix, the RE-SPIN tip, the extras shelf (nut creams, nuts) with the MIX-IN step, base
  macros + extras = final macros, and the copy button.
- **Rate:** two rows of 5 taps, the RE-SPIN tick, the optional note.
- **History:** mixes ranked by average score, with times made, last date, and "repeat". Below it, the plain log by date.
- **Recipes:** saved mixes with a name and number (`R<n>`). Seeded with the two recipes from the chat.
- **Shopping:** pick the recipes and number of tubs; get the total of each ingredient.
- **Pantry:** the ingredient list (`I<n>`), with add and edit.
- **Guides:** layer separation, crumbly texture, the mix-in tunnel, the no-wash flavour order for a batch.
- **Settings:** number of tubs, freeze hours, export, import. Footer: version and changelog link.

## Data

### `data/ingredients.json`: the seeded pantry
```jsonc
{
  "bebida-soja": {
    "n": 1,                               // stable number, shown as I1; never reused
    "name": { "es": "Bebida de soja sin azúcar", "ca": "…", "en": "…" },
    "shelf": "base",                      // base | protein | fruit | stabiliser | extra | other
    "unit": "ml",                         // ml | g
    "per100": { "kcal": 0, "protein": 0, "carbs": 0, "fat": 0 },
    "default": 280,                       // amount that one tap adds
    "step": 10,                           // stepper size
    "source": "URL or 'label'",           // where the numbers come from
    "confirmed": false,                   // false: shown with a "?" until Guille checks the label
    "protein": { "kind": "whey" }         // proteins only: whey | blend | casein (drives the stabiliser warning)
  }
}
```
Guille's own ingredients and his edits to seeded ones are stored on the phone and laid over this file. A protein's
flavour is a tag on the tub, not a separate ingredient, because the label macros barely change between flavours.

### On the phone (`localStorage`, prefix `heladero.`)
- `tubs`: `[{ slot, state: empty|frozen|spun, mix, flavour, filledAt, extras, spunAt }]`
- `log`: `[{ at, mix, flavour, extras, macros, texture, taste, respin, note }]`, newest first.
- `recipes`: `[{ n, name, mix, flavour }]`
- `pantry`: added and edited ingredients. `settings`: `{ tubs: 7, freezeHours: 24, lang }`.

A `mix` is `[{ ing, amount }]`. Two log entries are the same mix when their ingredients, amounts, flavour and extras
match; the ranked history groups on that.

## What the labels say (looked up 2026-11-12)

| Product | kcal | Protein | Carbs | Fat | Per | Source |
|---|---|---|---|---|---|---|
| BigSupps Only Whey Zero | 390.79 | 73.47 g | 9.21 g | 6.26 g | 100 g | bigsupps.site/products/only-whey-zero |
| BigSupps Total Protein Zero | 383 | 78 g | 7.6 g | 3.9 g | 100 g | bigsupps.site/products/total-protein-zero |

Both tables are the ones shown for the default flavour (Belgian Chocolate); other flavours are not checked.

**Total Protein Zero is not casein.** It is 45% whey concentrate, 25.5% bovine collagen peptides and 19.5% micellar
casein. The Gemini chat called it "Total Casein Zero" and built the "no xanthan" recipe on that. So:
- the app treats it as a **blend**, and the "no stabiliser" warning stays on for it until Guille's ratings say otherwise;
- recipe R1 (no xanthan) is seeded as **untested**.

Still to look up at build time, and marked unconfirmed until then: soy drink (Aldi), banana, Greek yogurt 0%,
xanthan gum, Maizena Potax, peanut cream, hazelnut cream, pistachio cream, peanuts, hazelnuts. The tub volume and
the program names of the NC302EU are also to confirm from the Ninja manual.

## Seeded recipes (from the Gemini chat)
- **R1 Mínima** (untested): 280 ml soy drink, 45 g Total Protein Zero, 50 g banana, a pinch of salt.
- **R2 Whey estándar:** 280 ml soy drink, 45 g Only Whey Zero, 50 g banana, ¼ tsp xanthan gum, a pinch of salt.
- Process for both: blend 30 s, freeze 24 h flat, LITE ICE CREAM, RE-SPIN with 1 tbsp of soy drink if crumbly.

## Shell (shared with gym-coach)
Plain HTML/CSS/JS, no build step, relative paths only.
- **Install:** `manifest.webmanifest` + a network-first `sw.js`.
- **Version:** one `VERSION` in `app.js`, shown in the footer, matching `CHANGELOG.md` (Keep a Changelog, SemVer).
- **Mascot:** `mascot.js` (UMD) + `scripts/make-icons.mjs` for the icons.
- **Checks:** `scripts/validate.mjs` for the data (unique numbers, all 3 languages, macros present).
- **Sizes:** 320×568 and 390×844, light and dark.

## Build slices
1. **Shell:** repo, PWA, languages, version and changelog, the mascot and icons, an empty tubs screen. → 0.1.0
2. **Pantry and builder:** seeded ingredients with label macros, live macros, warnings, fill a tub. → 0.2.0
3. **Freeze and spin:** countdown, ready state, extras, final macros, copy. → 0.3.0
4. **Rate and history:** scores, ranked history, repeat. → 0.4.0
5. **Recipes, shopping, guides, settings with export and import.** → 0.5.0
