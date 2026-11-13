# Heladero Loco: project rules

Phone-first app to build protein ice cream tubs for the Ninja CREAMi NC302EU: ingredients → macros → freezer → machine → rating. El Heladero Loco (a cartoon mad-scientist ice cream maker) is the mascot, with voice and soft sounds. Plain HTML/CSS/JS, no build step, GitHub Pages under `/heladero-loco/` (relative paths only). The plan, decisions and data schemas are in `SPEC.md`. Structure borrowed from `grojasv/gym-coach`.

## Files
- `index.html`, `style.css`: the shell and the retro ice cream lab look (tokens on `:root`, light and dark).
- `app.js`: the core as `window.HL` (storage, languages, data, pantry, macros, tubs, router, mascot lines) and the tubs screen. **`VERSION` here must match `CHANGELOG.md`.**
- Feature screens register themselves on `HL` (`HL.routes`, `HL.acts`, `HL.tabs`): `builder.js` (fill a tub), `spin.js` (freezing, machine, extras), `history.js` (rating, ranked history), `more.js` (recipes, shopping, pantry, guides, settings).
- `fx.js`: effects only (intro, flying ingredients, rolling numbers, reward card, mascot eyes and dance). Never changes data; everything is skipped with `prefers-reduced-motion`. `?intro` in the URL forces the intro.
- `mascot.js`: the mascot as SVG (`Heladero.svg(pose)`, `Heladero.head()`), UMD so `scripts/make-icons.mjs` can reuse it.
- `sound.js`: `Sound.play(name)` (Web Audio, no files) and `Sound.speak(text, lang)` (Web Speech). One mute for both.
- `data/ingredients.json`, `data/recipes.json`, `data/guides.json`, `data/lines.json`: all the content. Schemas are in `SPEC.md`.
- `raw/`: Guille's private source material (a Gemini chat). **Gitignored. Never commit or publish it.**

## Content rules
- **ES is the source language.** CA (natural Catalan) and EN are translations. Every user-facing string has all 3.
- Mascot lines are spoken by text-to-speech: under about 12 words, no emoji, no symbols.
- **Macros are computed from `per100` label data, never typed as totals.** Every ingredient names its `source`; a value not read from the product's own label has `confirmed: false` and shows a "?".
- Ingredients and recipes have stable numbers (`I<n>`, `R<n>`): never reused or renumbered.
- No nutrition or medical claims.
- `node scripts/validate.mjs` must pass before every commit that touches `data/`.

## Shell
- PWA: `manifest.webmanifest` + `sw.js` (network-first). **Bump `CACHE` in `sw.js` when `SHELL` changes.**
- Icons: `node scripts/make-icons.mjs` (needs uv).
- All data on the phone is in `localStorage` under `heladero.*`; settings has export and import.
- Check 320×568 and 390×844, light and dark, after any UI change. Run with `python3 -m http.server 8767`.
- `CHANGELOG.md` (Keep a Changelog + SemVer) is updated in the same commit.
- Commits use the GitHub noreply email (repo-local git config), never a work address.
