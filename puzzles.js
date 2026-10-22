/** Original puzzle pack. The seven puzzles rotate once per local calendar day. */
export const LEGACY_PUZZLES = [
  {
    id: 'small-change',
    title: 'Small Change',
    grid: ['#BAD#', 'MONEY', 'EAGLE', 'TREAT', '#DRY#'],
    clues: {
      across: {
        1: 'Word before faith or blood',
        4: 'What a successful Kickstarter raises',
        6: 'Two strokes better than par',
        7: 'Pick up the check for',
        8: 'Like humor delivered with a straight face',
      },
      down: {
        1: 'Group that can fire a CEO',
        2: 'What a short fuse can lead to',
        3: 'Put off',
        4: 'Fulfilled, as a quota',
        5: 'Even so',
      },
    },
  },
  {
    id: 'take-the-floor',
    title: 'Take the Floor',
    grid: ['#RAM#', 'TIRED', 'EVERY', 'DANCE', '#LAY#'],
    clues: {
      across: {
        1: 'Computer memory that clears when power is lost: Abbr.',
        4: 'Like a joke you have heard one too many times',
        6: 'Word shared by “___ so often” and “___ now and then”',
        7: 'Something a wallflower might sit out',
        8: 'Produce, as an egg',
      },
      down: {
        1: 'Someone you would hate to finish second to',
        2: 'Place with seats surrounding a playing floor',
        3: 'What a defeated opponent might beg for',
        4: 'Name attached to talks worth spreading',
        5: 'It covers gray areas at a salon?',
      },
    },
  },
  {
    id: 'good-vibes',
    title: 'Good Vibes',
    grid: ['TAB##', 'OCEAN', 'SMILE', 'SENSE', '##GOD'],
    clues: {
      across: {
        1: 'Something you might run up or leave open',
        4: 'Where trenches can be miles deep',
        7: 'It might be forced for a group photo',
        8: 'Make ___ of',
        9: 'Role played by Morgan Freeman in “Bruce Almighty”',
      },
      down: {
        1: 'Decide possession with a coin ___',
        2: 'Brand behind many a failed cartoon contraption',
        3: 'Existence itself',
        5: 'Word that adds another thing to the list',
        6: 'Demand, rather than desire',
      },
    },
  },
  {
    id: 'sunny-side',
    title: 'Sunny Side',
    grid: ['BUD##', 'OPERA', 'SOLAR', 'SNAKE', '##YEA'],
    clues: {
      across: {
        1: 'Future bloomer',
        4: 'Where the plot may thicken in Italian',
        7: 'Like power generated on some rooftops',
        8: 'Someone you should not trust with a secret',
        9: 'Vote that keeps a motion moving',
      },
      down: {
        1: 'Person who signs off on your time off',
        2: '“Once ___ a midnight dreary”',
        3: 'What a spinning loading wheel can signal',
        5: 'It gets leaves moving without a breeze',
        6: 'What a rug covers',
      },
    },
  },
  {
    id: 'fresh-sweep',
    title: 'Fresh Sweep',
    grid: ['##TIN', '##ERA', 'SWEEP', 'EAT##', 'ASH##'],
    clues: {
      across: {
        1: 'Copper’s partner in bronze',
        4: 'A chapter in history or a pop star’s career',
        5: 'Win without dropping a game',
        7: 'Absorb, as a loss',
        8: 'What remains after a log burns',
      },
      down: {
        1: 'What gives a law some bite?',
        2: 'What an outrage might draw',
        3: 'Brief break with your eyes closed',
        5: 'A sailor may be at this, literally or figuratively',
        6: '“As I ___ saying ...”',
      },
    },
  },
  {
    id: 'class-act',
    title: 'Class Act',
    grid: ['REF##', 'OWL##', 'TEACH', '##MOO', '##EGG'],
    clues: {
      across: {
        1: 'Caller on the court, for short',
        4: 'Bird associated with late hours and wisdom',
        5: 'School, as a verb',
        8: 'Barnyard low',
        9: 'Something beaten before breakfast, perhaps',
      },
      down: {
        1: 'Turn, as neglected produce',
        2: 'Soundalike of “you” found in a flock',
        3: 'An old one might rekindle a romance',
        6: 'Small player in a large organization',
        7: 'Take more than your share of',
      },
    },
  },
  {
    id: 'bright-spark',
    title: 'Bright Spark',
    grid: ['##YAK', '##ONE', 'STUDY', 'ION##', 'PEG##'],
    clues: {
      across: {
        1: 'Hairy beast whose name can mean “chatter”',
        4: 'Number that is neither prime nor composite',
        5: 'Room where a professor might prepare for class',
        7: 'Particle that has lost its electrical neutrality',
        8: 'Knock someone down a ___',
      },
      down: {
        1: 'Still getting carded, perhaps',
        2: 'Word uniting rock with roll',
        3: 'It can be major or minor',
        5: 'Take it slowly, as a hot drink',
        6: 'What a ballerina might balance on',
      },
    },
  },
];

// Preserve past dates and their saves. Denser grids enter the rotation on this date.
export const PACK_START_DATE = '2026-10-22';
export const PUZZLES = [
  ...LEGACY_PUZZLES.slice(0, 4),
  {
    id: 'house-rules',
    title: 'House Rules',
    grid: ['#ATM#', 'FLOOR', 'ALONE', 'NOTED', '#WHY#'],
    clues: {
      across: {
        1: 'Cash machine, briefly',
        4: 'The lowest price a seller will accept',
        6: 'Without a plus one',
        7: '“Message received”',
        8: 'Question that asks for a motive',
      },
      down: {
        1: 'Permit',
        2: 'One of a comb’s many parts',
        3: 'What talks, according to a saying',
        4: 'Someone who might follow a band around',
        5: 'In the ___ (owing money)',
      },
    },
  },
  {
    id: 'mixed-signals',
    title: 'Mixed Signals',
    grid: ['#NFL#', 'SALES', 'IMAGE', 'REMIX', '#SET#'],
    clues: {
      across: {
        1: 'League with a Super Bowl, briefly',
        4: 'Events that bring prices down',
        6: 'What a publicist helps polish',
        7: 'Track given a new spin?',
        8: 'Collection, or a place to film',
      },
      down: {
        1: 'What a roll call calls for',
        2: 'What a candle loses when you make a wish',
        3: 'On the up and up, casually',
        4: 'Title that may follow “Yes”',
        5: 'Word before appeal or education',
      },
    },
  },
  {
    id: 'second-wind',
    title: 'Second Wind',
    grid: ['#FLU#', 'GLORY', 'DODGE', 'PAGES', '#TED#'],
    clues: {
      across: {
        1: 'Bug that may cancel your plans',
        4: 'What a humble winner might share',
        6: 'Get out of the way of',
        7: 'Leaves that come from a printer?',
        8: 'Name on talks with a red stage logo',
      },
      down: {
        1: 'Parade attraction, or a drink with ice cream',
        2: 'File, as a complaint',
        3: 'Pressed to act',
        4: 'Measure of an economy’s output: Abbr.',
        5: 'Word that can turn a proposal into an engagement',
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
  const pack = key < PACK_START_DATE ? LEGACY_PUZZLES : PUZZLES;
  return pack[((day % pack.length) + pack.length) % pack.length];
}
