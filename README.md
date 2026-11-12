# 🍦 Heladero Loco

El Heladero Loco, a mad-scientist ice cream maker, helps you build protein ice cream tubs for the Ninja CREAMi: pick the ingredients, see the macros, follow each tub through the freezer and the machine, and rate it so the next batch is better. In ES / CA / EN.

**Live:** https://grojasv.github.io/heladero-loco/

The plan and data formats are in [SPEC.md](SPEC.md), and the project rules in [CLAUDE.md](CLAUDE.md).

## Structure
- `index.html`, `style.css`, `app.js`: the shell, the core and the tubs screen. There is no build step.
- `builder.js`, `spin.js`, `history.js`, `more.js`: the feature screens.
- `mascot.js`: El Heladero Loco (SVG). `sound.js`: effects and voice.
- `data/`: ingredients, recipes, guides and the mascot's lines.
- `scripts/`: `make-icons.mjs` (app icons from the mascot) and `validate.mjs` (data checks).

## Run locally
```bash
python3 -m http.server 8767
```
Then open http://localhost:8767/.
