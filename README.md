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
