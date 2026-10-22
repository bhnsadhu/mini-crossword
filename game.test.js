import test from 'node:test';
import assert from 'node:assert/strict';
import { CrosswordGame } from './game.js';
import { PUZZLES } from './puzzles.js';

const createGame = () => new CrosswordGame(PUZZLES[0]);
const restore = game => new CrosswordGame(game.puzzle, JSON.parse(JSON.stringify(game.snapshot())));

test('selection ignores blocks and toggles a crossing square between across and down', () => {
  const game = createGame();
  assert.equal(game.selected, 1);
  assert.equal(game.direction, 'across');
  game.selectCell(0);
  assert.equal(game.selected, 1);
  game.selectCell(1);
  assert.equal(game.direction, 'down');
  assert.equal(game.activeEntry.answer, 'BOARD');
  game.selectCell(6);
  assert.equal(game.direction, 'down');
  game.selectCell(6);
  assert.equal(game.activeEntry.answer, 'MONEY');
});

test('arrow keys change direction first, move within the grid, and never wrap rows or enter blocks', () => {
  const game = createGame();
  game.moveArrow('ArrowLeft');
  assert.equal(game.selected, 1);
  game.moveArrow('ArrowRight');
  assert.equal(game.selected, 2);
  game.moveArrow('ArrowDown');
  assert.equal(game.direction, 'down');
  assert.equal(game.selected, 2);
  game.moveArrow('ArrowDown');
  assert.equal(game.selected, 7);
  game.selected = 22;
  game.moveArrow('ArrowDown');
  assert.equal(game.selected, 22);
  game.selected = 9;
  game.direction = 'across';
  game.moveArrow('ArrowRight');
  assert.equal(game.selected, 9);
  game.selected = 3;
  game.moveArrow('ArrowRight');
  assert.equal(game.selected, 3);
});

test('typing an answer normalizes letters, advances through the entry, and then selects the next clue', () => {
  const game = createGame();
  for (const letter of 'bad') game.setLetter(letter);
  assert.equal(game.values.slice(1, 4).join(''), 'BAD');
  assert.equal(game.status, 'playing');
  assert.equal(game.selected, 5);
  assert.equal(game.activeEntry.answer, 'MONEY');
  const before = JSON.stringify(game.snapshot());
  for (const invalid of ['1', ' ', 'AB', '', 'é']) game.setLetter(invalid);
  assert.equal(JSON.stringify(game.snapshot()), before);
});

test('skip-filled typing preserves crossings, revisits earlier blanks, and can be disabled', () => {
  const game = createGame();
  game.selectEntry(game.entries.across[1]);
  game.values[6] = 'O';
  game.values[8] = 'E';
  game.setLetter('M');
  assert.equal(game.selected, 7);
  game.setLetter('N');
  assert.equal(game.selected, 9);
  assert.equal(game.values[6], 'O');
  assert.equal(game.values[8], 'E');
  game.values[5] = '';
  game.setLetter('Y');
  assert.equal(game.selected, 5, 'the remaining earlier blank is filled before leaving the word');
  game.setLetter('M', { skipFilled: false });
  assert.equal(game.selected, 6, 'disabling skip-filled visits already entered squares');
});

test('clue traversal wraps in both directions and skip-filled finds an incomplete entry', () => {
  const game = createGame();
  const last = game.allEntries.at(-1);
  game.nextEntry(-1);
  assert.equal(game.activeEntry, last);
  game.nextEntry();
  assert.equal(game.activeEntry, game.entries.across[0]);
  for (const cell of game.entries.across[1].cells) game.values[cell] = game.solution[cell];
  game.nextEntry(1, true);
  assert.equal(game.activeEntry, game.entries.across[2]);
  assert.equal(game.selected, 10);
});

test('backspace clears the current letter and its annotations, then backs up within the word', () => {
  const game = createGame();
  game.setLetter('B', { pencil: true, autoCheck: true });
  assert.equal(game.selected, 2);
  game.erase();
  assert.equal(game.selected, 1);
  assert.equal(game.values[1], '');
  assert.equal(game.marks[1], '');
  assert.equal(game.pencils[1], false);
  game.erase();
  assert.equal(game.selected, 1, 'backspace does not leave the start of a word');
});

test('a full but wrong grid stays playable, while correcting its final error completes and locks it', () => {
  const game = createGame();
  for (const cell of game.openCells) {
    game.selected = cell;
    game.setLetter('X');
  }
  assert.equal(game.filledCount, game.openCells.length);
  assert.equal(game.isComplete(), false);
  assert.equal(game.status, 'playing');
  for (const cell of game.openCells) {
    game.selected = cell;
    game.setLetter(game.solution[cell]);
  }
  assert.equal(game.isComplete(), true);
  assert.equal(game.status, 'solved');
  const completed = [...game.values];
  game.setLetter('X');
  game.erase();
  assert.deepEqual(game.values, completed);
  game.start();
  assert.equal(game.status, 'solved');
});

test('checking marks only entered letters in the requested scope and records assistance', () => {
  const game = createGame();
  assert.equal(game.check('puzzle'), 0);
  assert.equal(game.assisted, false, 'checking an empty grid provides no help');
  game.values[1] = 'B';
  game.values[2] = 'X';
  game.values[5] = 'X';
  assert.equal(game.check('word'), 1);
  assert.equal(game.marks[1], 'correct');
  assert.equal(game.marks[2], 'incorrect');
  assert.equal(game.marks[3], '');
  assert.equal(game.marks[5], '', 'a word check does not mark other entries');
  assert.equal(game.assisted, true);
  assert.equal(game.check('puzzle'), 2);
  assert.equal(game.marks[5], 'incorrect');
});

test('autocheck evaluates typed letters and replacing an error removes stale markings', () => {
  const game = createGame();
  game.setLetter('X', { autoCheck: true, pencil: true });
  assert.equal(game.marks[1], 'incorrect');
  assert.equal(game.pencils[1], true);
  assert.equal(game.assisted, true);
  game.selected = 1;
  game.setLetter('B');
  assert.equal(game.marks[1], '');
  assert.equal(game.pencils[1], false);
  assert.equal(game.assisted, true, 'assistance is retained after a correction');
});

test('reveal supports square, word, and puzzle scopes and retains revealed markings on check', () => {
  const game = createGame();
  game.pencils[1] = true;
  game.reveal('square');
  assert.equal(game.values[1], 'B');
  assert.equal(game.filledCount, 1);
  assert.equal(game.marks[1], 'revealed');
  assert.equal(game.pencils[1], false);
  game.check('square');
  assert.equal(game.marks[1], 'revealed');
  game.reveal('word');
  assert.equal(game.values.slice(1, 4).join(''), 'BAD');
  assert.equal(game.filledCount, 3);
  assert.equal(game.status, 'playing');
  game.reveal('puzzle');
  assert.equal(game.status, 'solved');
  assert.equal(game.assisted, true);
  assert.ok(game.openCells.every(cell => game.marks[cell] === 'revealed'));
});

test('restoring partial progress preserves state but pauses its timer until resumed', () => {
  const game = createGame();
  game.setLetter('B', { pencil: true, autoCheck: true });
  game.direction = 'down';
  game.elapsedMs = 12654;
  const resumed = restore(game);
  assert.deepEqual(resumed.values, game.values);
  assert.deepEqual(resumed.marks, game.marks);
  assert.deepEqual(resumed.pencils, game.pencils);
  assert.equal(resumed.selected, game.selected);
  assert.equal(resumed.direction, 'down');
  assert.equal(resumed.assisted, true);
  assert.equal(resumed.elapsedMs, 12654);
  assert.equal(resumed.status, 'paused');
  resumed.start();
  assert.equal(resumed.status, 'playing');
});

test('restoration recognizes a solved grid, ignores another puzzle’s save, and sanitizes invalid values', () => {
  const game = createGame();
  game.reveal('puzzle');
  const completed = restore(game);
  assert.equal(completed.status, 'solved');
  assert.equal(completed.isComplete(), true);
  const different = new CrosswordGame(PUZZLES[1], game.snapshot());
  assert.equal(different.status, 'ready');
  assert.equal(different.filledCount, 0);
  assert.equal(different.assisted, false);
  const invalid = new CrosswordGame(PUZZLES[0], {
    puzzleId: PUZZLES[0].id,
    selected: 0,
    values: ['A', 'AB', 'a', '9'],
    marks: ['garbage', 'garbage'],
    elapsedMs: -10,
    direction: 'diagonal',
    status: 'solved',
  });
  assert.equal(invalid.filledCount, 0);
  assert.equal(invalid.values[0], '');
  assert.equal(invalid.selected, 1);
  assert.equal(invalid.direction, 'across');
  assert.equal(invalid.elapsedMs, 0);
  assert.equal(invalid.marks[1], '');
  assert.equal(invalid.status, 'paused', 'a saved status cannot falsely complete an unfinished grid');
});
test('checking a completed unaided puzzle cannot change its assistance status', () => {
  const game = new CrosswordGame(PUZZLES[0]);
  for (const index of game.openCells) game.values[index] = game.solution[index];
  game.status = 'solved';
  assert.equal(game.check('puzzle'), 0);
  assert.equal(game.assisted, false);
});
