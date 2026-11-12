# Changelog

All notable changes to Heladero Loco. Format: [Keep a Changelog](https://keepachangelog.com/), versions: [SemVer](https://semver.org/). New feature = minor, fix or content tweak = patch.

## [0.6.0] — 2026-11-12
### Added
- **What works** in the History tab: the average texture, taste and RE-SPIN share of every tub that had each protein, each flavour, each extra, and with or without a stabiliser. A tub counts whatever the amounts, so small changes to a mix still add up.
- **Backup reminder:** the home screen tells you when 5 ratings have no backup, with the export button right there. Settings shows the date of the last backup.

### Changed
- **Pantry macros now come from ALDI products** (Open Food Facts and FatSecret copies of the labels): soy drink, peanut butter, hazelnut butter, roasted peanuts, roasted hazelnuts and pure cocoa. They keep the "?" until checked against the pack.
- "Crema de pistacho 100%" is now ALDI's **Crema de pistacho y cacahuete**, and "Yogur griego 0%" is now ALDI's **High Protein natural yogurt** (ALDI has no 0% Greek yogurt on record).

## [0.5.1] — 2026-11-12
### Changed
- The overfill warning now fires at the **MAX FILL line, 400 ml**, instead of the full 473 ml of the tub.

## [0.5.0] — 2026-11-12
### Added
- **Recipes tab.** Two starting recipes (R1 Mínima, marked untested, and R2 Whey estándar), plus your own: "Guardar como receta" in the builder. One tap loads a recipe into the first empty tub.
- **Shopping list:** choose how many tubs of each recipe and get the total of every ingredient, with a copy button.
- **Pantry editor:** correct any ingredient from your own label, add new ingredients (for example a peanut and pistachio cream), or hide the ones you don't use.
- **Guides and fixes:** the process step by step, two layers, crumbly texture, how to add extras, a batch without washing the blender, and the freezer.
- **Settings:** number of tubs (7 by default), freezing hours, sound, and a **backup**: export everything to a file and import it back.

## [0.4.0] — 2026-11-12
### Added
- **Rate a tub** after eating it: texture and taste from 1 to 5, whether it needed a RE-SPIN, and an optional note. Saving it empties the tub.
- **History tab with a mix ranking:** every mix you have tried, sorted by its average score, with how many times you made it and its macros.
- **Repeat:** one tap loads a ranked mix into the first empty tub. Your top 3 mixes also show as starting points in the builder.
- **Diary:** every rated tub by date, with its scores and note.

## [0.3.0] — 2026-11-12
### Added
- **The freezer wait.** A freezing tub shows how long is left and when it will be ready. When the time is up it sparkles, chimes and El Heladero Loco tells you.
- **The machine step.** A ready tub shows the program (LIGHT ICE CREAM), the RE-SPIN tip and the EXTRAS step.
- **Extras:** add nut creams or nuts and see the final macros next to the base ones.
- **Copy macros** as one line, for example `Tarrina 3 · 372 kcal · P 49 · C 15 · G 12`.
- You can spin a tub before its time, or empty it, from its own screen.

## [0.2.0] — 2026-11-12
### Added
- **Fill a tub.** Tap an empty tub to open the fridge, tap ingredients in, and set the amounts with − and +.
- **Live macros** for the whole tub (kcal, protein, carbs, fat), computed from label data per 100 g or 100 ml.
- **A pantry of 14 ingredients:** soy drink, the two BigSupps proteins with their flavours, banana, xanthan gum, salt, Greek yogurt, Maizena Potax, cocoa, and the nut creams and nuts. A "?" marks a value that is generic and not from your product's label.
- **Warnings:** when the mix is more than the tub holds (473 ml), and when a protein has no stabiliser and may split into two layers.
- **Identical tubs:** fill several empty tubs with the same mix in one go, or start from another tub's mix.

## [0.1.0] — 2026-11-12
### Added
- **The shell.** An installable app (PWA) in ES / CA / EN, with light and dark looks and this changelog inside the app.
- **El Heladero Loco**, the mad-scientist mascot, with four poses and his own lines, spoken aloud.
- **Soft sounds**, all made in the browser, with one mute button for sounds and voice.
- **The tubs screen:** 7 tubs, each one shown as empty, freezing, ready or to rate.
