import test from 'node:test';
import assert from 'node:assert/strict';
import { PUZZLES, buildEntries, dateKey, getPuzzleForDate } from './puzzles.js';

test('the starter pack contains seven different original grids', () => {
  assert.equal(PUZZLES.length, 7);
  assert.equal(new Set(PUZZLES.map((puzzle) => puzzle.id)).size, PUZZLES.length);
  assert.equal(new Set(PUZZLES.map((puzzle) => puzzle.grid.join(''))).size, PUZZLES.length);
});

for (const puzzle of PUZZLES) {
  test(`${puzzle.title}: complete cluing, crossings, connected grid, and no short runs`, () => {
    assert.equal(puzzle.grid.length, 5);
    assert.ok(puzzle.grid.every((row) => /^[A-Z#]{5}$/.test(row)));
    const flat = puzzle.grid.join('');
    const entries = buildEntries(puzzle);
    const allEntries = [...entries.across, ...entries.down];
    const coverage = new Map();
    const starts = new Map();
    assert.equal(new Set(allEntries.map((entry) => entry.answer)).size, allEntries.length, 'answers do not repeat inside a puzzle');
    for (const direction of ['across', 'down']) {
      assert.deepEqual(
        Object.keys(puzzle.clues[direction]).map(Number).sort((a, b) => a - b),
        entries[direction].map((entry) => entry.number),
        'every entry has exactly one clue, without orphan clues',
      );
      for (const entry of entries[direction]) {
        assert.equal(entry.direction, direction);
        assert.ok(entry.clue.trim().length > 0);
        assert.ok(entry.cells.length >= 3, 'no one-letter or two-letter runs');
        assert.equal(entry.answer, entry.cells.map((cell) => flat[cell]).join(''));
        assert.equal(entry.answer.length, entry.cells.length);
        assert.ok(!entry.answer.includes('#'));
        for (let i = 1; i < entry.cells.length; i += 1) {
          assert.equal(entry.cells[i] - entry.cells[i - 1], direction === 'across' ? 1 : 5);
          if (direction === 'across') assert.equal(Math.floor(entry.cells[i] / 5), Math.floor(entry.cells[0] / 5));
        }
        const start = entry.cells[0];
        if (starts.has(start)) assert.equal(starts.get(start), entry.number);
        starts.set(start, entry.number);
        for (const cell of entry.cells) {
          coverage.set(cell, [...(coverage.get(cell) ?? []), direction]);
        }
      }
    }
    for (let cell = 0; cell < flat.length; cell += 1) {
      if (flat[cell] === '#') assert.equal(coverage.has(cell), false);
      else assert.deepEqual(coverage.get(cell)?.sort(), ['across', 'down'], 'each white cell has both an across and a down answer');
    }
    assert.deepEqual([...starts.entries()].sort(([a], [b]) => a - b).map(([, number]) => number), Array.from({ length: starts.size }, (_, i) => i + 1), 'numbers increase in reading order');
    const seen = new Set();
    const pending = [flat.search(/[A-Z]/)];
    while (pending.length) {
      const cell = pending.pop();
      if (seen.has(cell)) continue;
      seen.add(cell);
      for (const neighbor of [cell - 5, cell + 5, ...(cell % 5 ? [cell - 1] : []), ...(cell % 5 < 4 ? [cell + 1] : [])]) {
        if (neighbor >= 0 && neighbor < 25 && flat[neighbor] !== '#' && !seen.has(neighbor)) pending.push(neighbor);
      }
    }
    assert.equal(seen.size, flat.replaceAll('#', '').length, 'all white cells belong to one connected grid');
  });
}

test('standard numbering and answer paths are correct for a grid with corner blocks', () => {
  const entries = buildEntries(PUZZLES[0]);
  assert.deepEqual(entries.across.map(({ number, answer }) => [number, answer]), [[1, 'BAD'], [4, 'MONEY'], [6, 'EAGLE'], [7, 'TREAT'], [8, 'DRY']]);
  assert.deepEqual(entries.down.map(({ number, answer }) => [number, answer]), [[1, 'BOARD'], [2, 'ANGER'], [3, 'DELAY'], [4, 'MET'], [5, 'YET']]);
  assert.deepEqual(entries.down[0].cells, [1, 6, 11, 16, 21]);
  assert.deepEqual(entries.across[1].cells, [5, 6, 7, 8, 9]);
});

test('date keys use local calendar components with zero padding', () => {
  assert.equal(dateKey(new Date(2026, 0, 2, 23, 59)), '2026-01-02');
  assert.equal(dateKey(new Date(2026, 9, 21, 0, 1)), '2026-10-21');
  assert.throws(() => dateKey(new Date('invalid')), RangeError);
});

test('daily rotation is stable, repeats weekly, and handles dates before its anchor', () => {
  assert.equal(getPuzzleForDate('2026-10-21'), PUZZLES[0]);
  assert.equal(getPuzzleForDate('2026-10-22'), PUZZLES[1]);
  assert.equal(getPuzzleForDate('2026-10-28'), PUZZLES[0]);
  assert.equal(getPuzzleForDate('2026-10-20'), PUZZLES[6]);
  const week = Array.from({ length: 7 }, (_, day) => getPuzzleForDate(`2026-10-${21 + day}`).id);
  assert.equal(new Set(week).size, 7);
  for (const date of ['2026-03-08', '2026-11-01', '2028-02-29']) assert.ok(PUZZLES.includes(getPuzzleForDate(date)));
  for (const date of ['2026-02-30', '2026-13-01', '2026-1-1', 'not-a-date', '2026-10-21T00:00:00Z']) assert.throws(() => getPuzzleForDate(date), RangeError);
});
