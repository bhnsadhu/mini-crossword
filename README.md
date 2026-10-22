# Mini Crossword

A small, fast daily crossword with original puzzles and familiar Mini-style play. Built with browser-native JavaScript and CSS; no runtime dependencies or account required.

```sh
npm run dev     # http://127.0.0.1:5173
npm test        # puzzle and game-engine validation
npm run build  # static output in dist/
```

The game supports mouse, physical keyboard, and on-screen keyboard; Across/Down selection; pencil mode; Check, Reveal, and Autocheck; a pausable timer; local progress; statistics; sharing; and a seven-day archive. Space switches direction, arrows move, Tab / Shift+Tab change clues, and Escape leaves the grid for toolbar access.

Puzzle data lives in `puzzles.js`. The initial seven original puzzles repeat on a deterministic seven-day rotation, using the player's local calendar date. Expand the editorial pack and use a dated schedule before promising a never-repeating daily feed. Progress and records are stored only in the current browser's local storage. Clearing site data clears them.

`vercel.json` deploys the static `dist/` output. Production: https://minicrossword.bhanusadhu.com

This independent project uses original branding, grids, and clues. It is not affiliated with The New York Times or Chainle.

## Puzzle editing

Clues use familiar vocabulary with alternate meanings, concise word associations, occasional cultural references, and signaled wordplay. Each puzzle keeps approachable crossing clues so a harder entry can be inferred. The October 2026 editorial revision replaces all 70 starter clues while retaining the answers and puzzle IDs, so existing saves still work. Difficulty labels were removed because they were not based on solver data.

The reference is Joel Fagliano’s [WNYC interview](https://www.wnycstudios.org/podcasts/all-of-it/articles/puzzle-mania-with-nyts-mini-creator), especially his discussion of ordinary vocabulary, fair crossings, and question marks signaling puns. These are original puzzles. Matching an NYT Mini solve time is a design target, not a measured equivalence; tune the pack using feedback from actual solvers. A dated pack takes effect on October 22, 2026. It replaces the three sparse grids with new puzzles containing 21 open squares and six answers of five letters each. Dates before that release retain the original grids and puzzle IDs, preserving saved progress and statistics.

## Branding

The shared artwork lives in `scripts/generate-brand-assets.mjs`. Run `npm ci` and `npm run assets` to regenerate the SVG logo, PNG sharing image, browser favicon, and phone icons. Generated files are committed, so production builds do not need to render images. `npm test` validates sharing metadata and image dimensions.

Inter is hosted locally. Font sources: [Google Fonts](https://github.com/google/fonts/tree/main/ofl/inter) and [Inter](https://github.com/rsms/inter). The license is in `assets/fonts/OFL.txt`. SVG lettering is converted to paths so logos and sharing images do not depend on a recipient’s installed fonts.
