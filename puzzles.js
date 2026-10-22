/** Original puzzle pack. The seven puzzles rotate once per local calendar day. */
export const PUZZLES = [
  {
    id: 'small-change',
    title: 'Small Change',
    difficulty: 'Easy',
    grid: ['#BAD#', 'MONEY', 'EAGLE', 'TREAT', '#DRY#'],
    clues: {
      across: {
        1: 'Opposite of good',
        4: 'What a piggy bank holds',
        6: 'Bird pictured on the U.S. Great Seal',
        7: 'A little reward, perhaps something sweet',
        8: 'Ready to fold, as laundry',
      },
      down: {
        1: 'Surface for a game of chess',
        2: 'Feeling that might make you see red',
        3: 'Make something happen later',
        4: 'Was introduced to',
        5: 'Still to come, in “not ___”',
      },
    },
  },
  {
    id: 'take-the-floor',
    title: 'Take the Floor',
    difficulty: 'Medium',
    grid: ['#RAM#', 'TIRED', 'EVERY', 'DANCE', '#LAY#'],
    clues: {
      across: {
        1: 'A male sheep',
        4: 'Ready for a nap',
        6: '___ single one',
        7: 'Move to the music',
        8: 'Put down, as a blanket',
      },
      down: {
        1: 'Competitor you really want to beat',
        2: 'Venue for a basketball game',
        3: 'Compassion shown to someone you could punish',
        4: 'Talk series with the slogan “ideas worth spreading”',
        5: 'Change the color of, as fabric',
      },
    },
  },
  {
    id: 'good-vibes',
    title: 'Good Vibes',
    difficulty: 'Medium',
    grid: ['TAB##', 'OCEAN', 'SMILE', 'SENSE', '##GOD'],
    clues: {
      across: {
        1: 'One of many open in a busy web browser',
        4: 'The Pacific, for one',
        7: 'A grin’s quieter cousin',
        8: 'Smell or touch, for example',
        9: 'Zeus, for one',
      },
      down: {
        1: 'Throw lightly',
        2: 'The very highest point',
        3: 'A living creature or entity',
        5: 'In addition',
        6: 'Require',
      },
    },
  },
  {
    id: 'sunny-side',
    title: 'Sunny Side',
    difficulty: 'Medium',
    grid: ['BUD##', 'OPERA', 'SOLAR', 'SNAKE', '##YEA'],
    clues: {
      across: {
        1: 'A flower before it opens',
        4: 'Drama in which the dialogue is sung',
        7: 'Powered by the sun',
        8: 'Reptile that slithers',
        9: 'A vote in favor',
      },
      down: {
        1: 'Person in charge at work',
        2: '“Once ___ a time…”',
        3: 'A wait before the next train arrives, perhaps',
        5: 'Tool for gathering fallen leaves',
        6: 'Length times width, for a rectangle',
      },
    },
  },
  {
    id: 'fresh-sweep',
    title: 'Fresh Sweep',
    difficulty: 'Easy',
    grid: ['##TIN', '##ERA', 'SWEEP', 'EAT##', 'ASH##'],
    clues: {
      across: {
        1: 'Metal used to coat some food cans',
        4: 'A chapter of history',
        5: 'Clean up with a broom',
        7: 'Dig into dinner',
        8: 'Powder left after a fire',
      },
      down: {
        1: 'What a dentist checks',
        2: 'Anger, in three letters',
        3: 'A quick daytime snooze',
        5: 'The salty water in “sail the seven ___s”',
        6: 'Past tense of “is”',
      },
    },
  },
  {
    id: 'class-act',
    title: 'Class Act',
    difficulty: 'Easy',
    grid: ['REF##', 'OWL##', 'TEACH', '##MOO', '##EGG'],
    clues: {
      across: {
        1: 'Official who blows a whistle, for short',
        4: 'Bird that might ask “Who?”',
        5: 'Help someone learn a new skill',
        8: 'Sound from a cow',
        9: 'What hatches into a chick',
      },
      down: {
        1: 'Spoil, as forgotten fruit',
        2: 'A female sheep',
        3: 'The flickering part of a candle',
        6: 'A tooth on a gear',
        7: 'Keep all to yourself, as the remote',
      },
    },
  },
  {
    id: 'bright-spark',
    title: 'Bright Spark',
    difficulty: 'Easy',
    grid: ['##YAK', '##ONE', 'STUDY', 'ION##', 'PEG##'],
    clues: {
      across: {
        1: 'Shaggy animal of the Himalayas',
        4: 'The loneliest number, in a song title',
        5: 'Prepare for a test',
        7: 'An atom with an electric charge',
        8: 'Small pin that a coat can hang on',
      },
      down: {
        1: 'Still in the early years of life',
        2: 'Word joining “salt” and “pepper”',
        3: 'Small object that opens a lock',
        5: 'A tiny drink',
        6: 'Little digit at the end of a foot',
      },
    },
  },
];

/** Derive standard crossword numbers and flat cell indices from a puzzle grid. */
export function buildEntries(puzzle) {
  const width = puzzle.grid[0].length;
  const height = puzzle.grid.length;
  const letters = puzzle.grid.join('');
  const isOpen = (cell) => cell >= 0 && cell < letters.length && letters[cell] !== '#';
  const startsAcross = (cell) => isOpen(cell) && (cell % width === 0 || !isOpen(cell - 1));
  const startsDown = (cell) => isOpen(cell) && (cell < width || !isOpen(cell - width));
  const numbers = new Map();
  for (let cell = 0; cell < width * height; cell += 1) {
    if (startsAcross(cell) || startsDown(cell)) numbers.set(cell, numbers.size + 1);
  }

  const entries = { across: [], down: [] };
  for (const direction of ['across', 'down']) {
    const isStart = direction === 'across' ? startsAcross : startsDown;
    const step = direction === 'across' ? 1 : width;
    for (let start = 0; start < letters.length; start += 1) {
      if (!isStart(start)) continue;
      const cells = [];
      for (let cell = start; isOpen(cell); cell += step) {
        if (direction === 'across' && Math.floor(cell / width) !== Math.floor(start / width)) break;
        cells.push(cell);
      }
      const number = numbers.get(start);
      entries[direction].push({
        number,
        answer: cells.map((cell) => letters[cell]).join(''),
        clue: puzzle.clues[direction][number],
        cells,
        direction,
      });
    }
  }
  return entries;
}

/** Calendar key in the player's local timezone, independent of UTC rollover. */
export function dateKey(date = new Date()) {
  if (Number.isNaN(date.getTime())) throw new RangeError('Invalid date');
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

/**
 * Deterministic seven-day rotation. UTC is used only for calendar arithmetic so
 * daylight-saving changes cannot skip a puzzle. This is a repeating starter pack.
 */
export function getPuzzleForDate(key = dateKey()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) throw new RangeError('Expected a YYYY-MM-DD date');
  const timestamp = Date.parse(`${key}T00:00:00.000Z`);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== key) {
    throw new RangeError('Invalid calendar date');
  }
  const day = Math.round((timestamp - Date.UTC(2026, 9, 21)) / 86_400_000);
  return PUZZLES[((day % PUZZLES.length) + PUZZLES.length) % PUZZLES.length];
}
